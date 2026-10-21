"""SoccerLineup for Home Assistant: plan fair soccer lineups quarter by quarter.

The app in frontend/ is the same one that runs on its own in a browser.
Here it opens from the sidebar inside a frame, and keeps the season on the
Home Assistant server through the commands in websocket_api.py.
"""

from __future__ import annotations

import hashlib
import pathlib

from aiohttp import web

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import HomeAssistantView, StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from . import websocket_api
from .const import DOMAIN, PANEL_ELEMENT, PANEL_ICON, PANEL_PATH, TITLE, URL_APP, URL_FILES
from .store import SoccerLineupStore

FRONTEND = pathlib.Path(__file__).parent / "frontend"
# Files whose contents decide the version stamp in the app's addresses.
STAMPED = ("index.html", "app.js", "styles.css", "soccerlineup-panel.js")


def _build_page() -> tuple[str, str]:
    """The app page with a base address and version-stamped script and styles.

    Browsers may keep app.js and styles.css in memory and reuse them after
    an update; a stamp that changes with the files' contents prevents that.
    """
    sha = hashlib.sha1()
    for name in STAMPED:
        sha.update((FRONTEND / name).read_bytes())
    stamp = sha.hexdigest()[:12]
    html = (FRONTEND / "index.html").read_text(encoding="utf-8")
    html = html.replace("<head>", f'<head>\n<base href="{URL_FILES}/">', 1)
    html = html.replace('href="styles.css"', f'href="styles.css?v={stamp}"', 1)
    html = html.replace('src="app.js"', f'src="app.js?v={stamp}"', 1)
    return stamp, html


class SoccerLineupAppView(HomeAssistantView):
    """Serves the app page. It holds no data: the season comes over the signed-in websocket."""

    url = URL_APP
    name = "soccerlineup:app"
    requires_auth = False

    def __init__(self, html: str) -> None:
        self._html = html

    async def get(self, request: web.Request) -> web.Response:
        return web.Response(
            text=self._html, content_type="text/html", headers={"Cache-Control": "no-store"}
        )


async def _async_register_once(hass: HomeAssistant) -> str:
    """HTTP routes and websocket commands can't be removed, so add them once."""
    if (stamp := hass.data.get(f"{DOMAIN}_stamp")) is not None:
        return stamp
    stamp, html = await hass.async_add_executor_job(_build_page)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(URL_FILES, str(FRONTEND), False)]
    )
    hass.http.register_view(SoccerLineupAppView(html))
    websocket_api.async_register(hass)
    hass.data[f"{DOMAIN}_stamp"] = stamp
    return stamp


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    store = SoccerLineupStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = {"store": store}
    stamp = await _async_register_once(hass)
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title=TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{URL_FILES}/soccerlineup-panel.js?v={stamp}",
        require_admin=False,
        config={"app_url": f"{URL_APP}?ha=1&v={stamp}"},
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if (store := hass.data.get(DOMAIN, {}).get("store")) is not None:
        await store.async_flush()
    frontend.async_remove_panel(hass, PANEL_PATH)
    hass.data.pop(DOMAIN, None)
    return True
