"""SoccerLineup on a real Home Assistant (pytest-homeassistant-custom-component)."""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util

from custom_components.soccerlineup.const import DOMAIN, HISTORY_KEY, PANEL_PATH, STORAGE_KEY, URL_APP


def season(team="Panthers", games=0):
    return {
        "schemaVersion": 7,
        "cfg": {"team": team, "quarters": 4, "minutes": 15, "onField": 9, "formation": "3-3-2"},
        "roster": [{"id": 1, "name": "Ava", "num": "1", "tier": 1, "p1": "G", "p2": "D", "gkOrder": 1}],
        "games": [{"id": i + 1, "opp": "Team %d" % i} for i in range(games)],
        "current": {"id": 0, "opp": ""},
        "nextId": 2,
        "nextGameId": games + 1,
    }


async def setup(hass: HomeAssistant):
    await async_setup_component(hass, "http", {})
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    return result["result"]


async def test_one_click_setup_adds_sidebar_panel(hass: HomeAssistant):
    entry = await setup(hass)
    assert entry.title == "Soccer Lineup"
    panels = hass.data["frontend_panels"]
    assert PANEL_PATH in panels
    panel = panels[PANEL_PATH]
    assert panel.sidebar_title == "Soccer Lineup"
    assert panel.sidebar_icon == "mdi:soccer"
    assert panel.require_admin is False
    custom = panel.config["_panel_custom"]
    assert custom["name"] == "soccerlineup-panel"
    assert custom["module_url"].startswith("/soccerlineup_files/soccerlineup-panel.js?v=")
    assert panel.config["app_url"].startswith(URL_APP + "?ha=1&v=")

    # only one can be added
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def test_app_page_and_files_are_served(hass: HomeAssistant, hass_client_no_auth):
    await setup(hass)
    client = await hass_client_no_auth()
    page = await client.get(URL_APP + "?ha=1")
    assert page.status == 200
    html = await page.text()
    assert '<base href="/soccerlineup_files/">' in html
    assert 'src="app.js?v=' in html and 'href="styles.css?v=' in html
    assert page.headers["Cache-Control"] == "no-store"
    for name in ("app.js", "styles.css", "soccerlineup-panel.js", "icons/icon.svg"):
        res = await client.get("/soccerlineup_files/" + name)
        assert res.status == 200, name


async def test_save_get_and_live_updates(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    phone = await hass_ws_client(hass)
    laptop = await hass_ws_client(hass)

    await phone.send_json_auto_id({"type": "soccerlineup/get"})
    res = await phone.receive_json()
    assert res["success"] and res["result"]["rev"] == 0 and res["result"]["data"] is None

    await phone.send_json_auto_id({"type": "soccerlineup/subscribe"})
    sub_id = (await phone.receive_json())["id"]
    first = await phone.receive_json()
    assert first["id"] == sub_id and first["type"] == "event" and first["event"]["rev"] == 0

    await laptop.send_json_auto_id({"type": "soccerlineup/save", "data": season(), "base_rev": 0, "client_id": "laptop"})
    res = await laptop.receive_json()
    assert res["success"] and res["result"]["rev"] == 1

    update = await phone.receive_json()
    assert update["type"] == "event"
    assert update["event"]["rev"] == 1
    assert update["event"]["client_id"] == "laptop"
    assert update["event"]["data"]["cfg"]["team"] == "Panthers"
    assert update["event"]["saved_by"]   # the signed-in user's name


async def test_stale_save_is_a_conflict_and_force_keeps_the_other_version(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("A"), "base_rev": 0})
    assert (await ws.receive_json())["result"]["rev"] == 1
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("B"), "base_rev": 1})
    assert (await ws.receive_json())["result"]["rev"] == 2

    # a device that was offline since rev 1
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("C"), "base_rev": 1})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "conflict"

    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("C"), "base_rev": 1, "force": True, "checkpoint": "kept this device"})
    res = await ws.receive_json()
    assert res["success"] and res["result"]["rev"] == 3

    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    versions = (await ws.receive_json())["result"]["versions"]
    # the version that was overwritten is kept, newest first
    assert versions[0]["rev"] == 2 and versions[0]["reason"] == "kept this device", versions


async def test_starting_a_new_season_keeps_the_old_one_as_a_version(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("Fall"), "base_rev": 0})
    assert (await ws.receive_json())["result"]["rev"] == 1
    # an ordinary edit soon after isn't kept as a version on its own
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("Fall edited"), "base_rev": 1})
    assert (await ws.receive_json())["result"]["rev"] == 2
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("Spring"), "base_rev": 2, "checkpoint": "new season"})
    res = await ws.receive_json()
    assert res["success"] and res["result"]["rev"] == 3, res
    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    versions = (await ws.receive_json())["result"]["versions"]
    assert versions[0]["rev"] == 2 and versions[0]["reason"] == "new season", versions


async def test_bad_data_is_refused(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": {"hello": 1}, "base_rev": 0})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "invalid"
    await ws.send_json_auto_id({"type": "soccerlineup/get"})
    assert (await ws.receive_json())["result"]["rev"] == 0


async def test_history_timing_and_restore(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    start = dt_util.utcnow()

    async def save(team, games, base, at):
        with patch("homeassistant.util.dt.utcnow", return_value=at):
            await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season(team, games), "base_rev": base})
            res = await ws.receive_json()
        assert res["success"], res
        return res["result"]["rev"]

    await save("v1", 0, 0, start)                              # first version: kept
    await save("v2", 0, 1, start + timedelta(minutes=5))       # 5 min later, same games: not kept
    await save("v3", 1, 2, start + timedelta(minutes=6))       # a game was saved: kept
    await save("v4", 1, 3, start + timedelta(minutes=30))      # 15+ min later: kept

    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    versions = (await ws.receive_json())["result"]["versions"]
    assert [v["rev"] for v in versions] == [4, 3, 1]
    assert versions[1]["games"] == 1

    first = next(v for v in versions if v["rev"] == 1)
    await ws.send_json_auto_id({"type": "soccerlineup/restore", "version": first["id"]})
    res = await ws.receive_json()
    assert res["success"] and res["result"]["rev"] == 5
    await ws.send_json_auto_id({"type": "soccerlineup/get"})
    now = (await ws.receive_json())["result"]
    assert now["data"]["cfg"]["team"] == "v1" and now["rev"] == 5

    await ws.send_json_auto_id({"type": "soccerlineup/restore", "version": "nope"})
    res = await ws.receive_json()
    assert not res["success"] and res["error"]["code"] == "not_found"

    # the version that was live before the restore is still kept (once, not twice)
    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    versions = (await ws.receive_json())["result"]["versions"]
    assert [v["rev"] for v in versions].count(4) == 1


async def test_a_losing_version_can_be_kept_without_going_live(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("Live"), "base_rev": 0})
    assert (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": "soccerlineup/keep_version", "data": season("Phone", 2)})
    assert (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": "soccerlineup/get"})
    assert (await ws.receive_json())["result"]["data"]["cfg"]["team"] == "Live"
    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    newest = (await ws.receive_json())["result"]["versions"][0]
    assert newest["reason"] == "not kept" and newest["rev"] is None and newest["games"] == 2
    await ws.send_json_auto_id({"type": "soccerlineup/restore", "version": newest["id"]})
    assert (await ws.receive_json())["result"]["rev"] == 2
    await ws.send_json_auto_id({"type": "soccerlineup/get"})
    assert (await ws.receive_json())["result"]["data"]["cfg"]["team"] == "Phone"
    await ws.send_json_auto_id({"type": "soccerlineup/keep_version", "data": {"bad": True}})
    assert (await ws.receive_json())["error"]["code"] == "invalid"


async def test_history_is_capped(hass: HomeAssistant, hass_ws_client):
    await setup(hass)
    ws = await hass_ws_client(hass)
    for i in range(70):
        await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season(games=i), "base_rev": i})
        assert (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": "soccerlineup/history"})
    versions = (await ws.receive_json())["result"]["versions"]
    assert len(versions) == 60 and versions[0]["rev"] == 70


async def test_season_survives_a_restart(hass: HomeAssistant, hass_ws_client, hass_storage):
    entry = await setup(hass)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "soccerlineup/save", "data": season("Saved"), "base_rev": 0})
    assert (await ws.receive_json())["success"]

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_PATH not in hass.data["frontend_panels"]
    assert hass_storage[STORAGE_KEY]["data"]["rev"] == 1
    assert hass_storage[STORAGE_KEY]["data"]["data"]["cfg"]["team"] == "Saved"
    assert hass_storage[HISTORY_KEY]["data"]["versions"][0]["rev"] == 1

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    await ws.send_json_auto_id({"type": "soccerlineup/get"})
    res = (await ws.receive_json())["result"]
    assert res["rev"] == 1 and res["data"]["cfg"]["team"] == "Saved"
    assert PANEL_PATH in hass.data["frontend_panels"]
