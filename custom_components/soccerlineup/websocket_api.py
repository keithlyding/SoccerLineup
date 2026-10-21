"""Websocket commands used by the SoccerLineup app."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, SIGNAL_UPDATED
from .store import Conflict, InvalidSeason, SoccerLineupStore


def _store(hass: HomeAssistant) -> SoccerLineupStore:
    return hass.data[DOMAIN]["store"]


def _who(connection) -> str | None:
    user = getattr(connection, "user", None)
    return user.name if user else None


@callback
def async_register(hass: HomeAssistant) -> None:
    for command in (ws_get, ws_subscribe, ws_save, ws_history, ws_restore, ws_keep_version):
        websocket_api.async_register_command(hass, command)


@websocket_api.websocket_command({vol.Required("type"): "soccerlineup/get"})
@callback
def ws_get(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], _store(hass).snapshot())


@websocket_api.websocket_command({vol.Required("type"): "soccerlineup/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Send the latest version now and again after every change."""

    @callback
    def forward(update: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], update))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATED, forward)
    connection.send_result(msg["id"])
    forward({**_store(hass).snapshot(), "client_id": None})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "soccerlineup/save",
        vol.Required("data"): dict,
        vol.Required("base_rev"): vol.Coerce(int),
        vol.Optional("client_id"): str,
        vol.Optional("force", default=False): bool,
        vol.Optional("checkpoint"): vol.In(["import", "kept this device", "before restore"]),
    }
)
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    try:
        result = await _store(hass).async_save(
            msg["data"],
            msg["base_rev"],
            _who(connection),
            msg.get("client_id"),
            force=msg["force"],
            checkpoint=msg.get("checkpoint"),
        )
    except Conflict:
        connection.send_error(msg["id"], "conflict", "The season was changed on another device.")
        return
    except InvalidSeason as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "soccerlineup/history"})
@callback
def ws_history(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], {"versions": _store(hass).history_list()})


@websocket_api.websocket_command(
    {vol.Required("type"): "soccerlineup/restore", vol.Required("version"): str}
)
@websocket_api.async_response
async def ws_restore(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    try:
        result = await _store(hass).async_restore(msg["version"], _who(connection))
    except KeyError:
        connection.send_error(msg["id"], "not_found", "That version is no longer kept.")
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {vol.Required("type"): "soccerlineup/keep_version", vol.Required("data"): dict}
)
@callback
def ws_keep_version(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Keep a device's version in history without making it the latest one."""
    try:
        _store(hass).keep_version(msg["data"], _who(connection), "not kept")
    except InvalidSeason as err:
        connection.send_error(msg["id"], "invalid", str(err))
        return
    connection.send_result(msg["id"])
