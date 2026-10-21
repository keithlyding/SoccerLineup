"""The season, kept on the Home Assistant server.

The app's whole state (team, roster, saved games, the game being planned)
is stored as one document with a revision number. Each save names the
revision it was based on, so two devices can't silently overwrite each
other: a save based on an old revision is refused as a conflict and the app
asks which version to keep.

Earlier versions are kept in a separate history: one at most every
HISTORY_EVERY, one whenever the number of saved games changes, and always
the version being replaced by a restore, an imported backup file or a
"keep this device's version" choice.
"""

from __future__ import annotations

import json
import logging
import secrets
from typing import Any

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    HISTORY_EVERY,
    HISTORY_KEY,
    HISTORY_MAX,
    MAX_BYTES,
    SIGNAL_UPDATED,
    STORAGE_KEY,
    STORAGE_VERSION,
)

_LOGGER = logging.getLogger(__name__)


class Conflict(Exception):
    """The save was based on a revision that is no longer the latest."""


class InvalidSeason(ValueError):
    """The data is not a SoccerLineup season."""


def validate(data: Any) -> int:
    """Raise InvalidSeason unless data looks like a season; return its size in bytes."""
    if not isinstance(data, dict):
        raise InvalidSeason("A season must be an object")
    if not isinstance(data.get("cfg"), dict) or not isinstance(data.get("roster"), list):
        raise InvalidSeason("That isn't a SoccerLineup season")
    if not isinstance(data.get("games", []), list):
        raise InvalidSeason("That isn't a SoccerLineup season")
    size = len(json.dumps(data, separators=(",", ":")))
    if size > MAX_BYTES:
        raise InvalidSeason("That season is too large")
    return size


def _games(data: dict[str, Any] | None) -> int:
    if not isinstance(data, dict):
        return 0
    games = data.get("games")
    return len(games) if isinstance(games, list) else 0


class SoccerLineupStore:
    """Holds the season in memory and writes it to .storage."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._history_store: Store = Store(hass, STORAGE_VERSION, HISTORY_KEY)
        self.data: dict[str, Any] | None = None
        self.rev = 0
        self.saved_at: str | None = None
        self.saved_by: str | None = None
        self.history: list[dict[str, Any]] = []

    async def async_load(self) -> None:
        stored = await self._store.async_load() or {}
        self.data = stored.get("data")
        self.rev = int(stored.get("rev") or 0)
        self.saved_at = stored.get("saved_at")
        self.saved_by = stored.get("saved_by")
        history = await self._history_store.async_load() or {}
        self.history = [v for v in history.get("versions", []) if isinstance(v, dict) and "data" in v]
        for version in self.history:
            version.setdefault("id", secrets.token_hex(6))

    def snapshot(self) -> dict[str, Any]:
        """The latest version, as sent to the app."""
        return {
            "rev": self.rev,
            "data": self.data,
            "saved_at": self.saved_at,
            "saved_by": self.saved_by,
        }

    def history_list(self) -> list[dict[str, Any]]:
        """Earlier versions, newest first, without their data."""
        return [
            {k: v.get(k) for k in ("id", "rev", "saved_at", "saved_by", "games", "reason")}
            for v in reversed(self.history)
        ]

    def history_version(self, version_id: str) -> dict[str, Any] | None:
        for version in self.history:
            if version["id"] == version_id:
                return version
        return None

    async def async_save(
        self,
        data: dict[str, Any],
        base_rev: int,
        user: str | None,
        client_id: str | None = None,
        *,
        force: bool = False,
        checkpoint: str | None = None,
    ) -> dict[str, Any]:
        """Store a new version. Raises Conflict when base_rev is out of date and force is off."""
        validate(data)
        if not force and base_rev != self.rev:
            raise Conflict
        if self.data is not None and (force or checkpoint):
            # keep what is being replaced, whatever the timing
            self._record_current(checkpoint or "replaced")
        previous_games = _games(self.data)
        self.data = data
        self.rev += 1
        self.saved_at = dt_util.utcnow().isoformat(timespec="seconds")
        self.saved_by = user
        if self._history_due(previous_games):
            self._record_current("saved")
        self._store.async_delay_save(self._to_disk, 1.0)
        self._announce(client_id)
        return {"rev": self.rev, "saved_at": self.saved_at}

    async def async_restore(self, version_id: str, user: str | None) -> dict[str, Any]:
        """Make an earlier version the latest one. Raises KeyError if it isn't kept."""
        version = self.history_version(version_id)
        if version is None:
            raise KeyError(version_id)
        return await self.async_save(
            json.loads(json.dumps(version["data"])), self.rev, user, force=True, checkpoint="before restore"
        )

    def keep_version(self, data: dict[str, Any], user: str | None, reason: str) -> None:
        """File a version in history without making it the latest one.

        Used when a device's unsent changes lose to another device's: they
        stay restorable instead of vanishing.
        """
        validate(data)
        self._append(None, dt_util.utcnow().isoformat(timespec="seconds"), user, data, reason)

    async def async_flush(self) -> None:
        """Write anything still waiting (used when the integration is unloaded)."""
        await self._store.async_save(self._to_disk())
        await self._history_store.async_save(self._history_to_disk())

    # ---------- internals ----------
    def _history_due(self, previous_games: int) -> bool:
        if not self.history:
            return True
        last = self.history[-1]
        if _games(self.data) != previous_games:
            return True
        last_time = dt_util.parse_datetime(last.get("saved_at") or "")
        now = dt_util.parse_datetime(self.saved_at or "")
        if last_time is None or now is None:
            return True
        return now - last_time >= HISTORY_EVERY

    def _record_current(self, reason: str) -> None:
        if self.data is None:
            return
        if any(v.get("rev") == self.rev for v in self.history[-3:]):
            return
        self._append(self.rev, self.saved_at, self.saved_by, self.data, reason)

    def _append(self, rev: int | None, saved_at: str | None, user: str | None, data: dict[str, Any], reason: str) -> None:
        self.history.append(
            {
                "id": secrets.token_hex(6),
                "rev": rev,
                "saved_at": saved_at,
                "saved_by": user,
                "games": _games(data),
                "reason": reason,
                "data": json.loads(json.dumps(data)),
            }
        )
        del self.history[:-HISTORY_MAX]
        self._history_store.async_delay_save(self._history_to_disk, 5.0)

    @callback
    def _to_disk(self) -> dict[str, Any]:
        return self.snapshot()

    @callback
    def _history_to_disk(self) -> dict[str, Any]:
        return {"versions": self.history}

    @callback
    def _announce(self, client_id: str | None) -> None:
        """Tell every open app (the dispatcher keeps the season off the event bus and out of the recorder)."""
        async_dispatcher_send(self.hass, SIGNAL_UPDATED, {**self.snapshot(), "client_id": client_id})
