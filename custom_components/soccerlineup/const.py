"""Constants for SoccerLineup."""

from __future__ import annotations

from datetime import timedelta

DOMAIN = "soccerlineup"
VERSION = "1.2.0"
TITLE = "Soccer Lineup"

PANEL_PATH = "soccerlineup"
PANEL_ELEMENT = "soccerlineup-panel"
PANEL_ICON = "mdi:soccer"

URL_FILES = "/soccerlineup_files"   # the app's files, as they are
URL_APP = "/soccerlineup_app"       # the app's page, with addresses that change when the files do

STORAGE_VERSION = 1
STORAGE_KEY = "soccerlineup.data"
HISTORY_KEY = "soccerlineup.history"

SIGNAL_UPDATED = "soccerlineup_updated"

# Earlier versions kept for "Restore an earlier version" on the Season tab.
HISTORY_MAX = 60
HISTORY_EVERY = timedelta(minutes=15)

# A season is normally well under 100 KB; refuse anything absurd.
MAX_BYTES = 5_000_000
