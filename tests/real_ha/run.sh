#!/usr/bin/env bash
# Starts a real Home Assistant (core and its web frontend) with SoccerLineup
# installed, signs in with a browser and checks the integration end to end.
# Needs the Python packages homeassistant and home-assistant-frontend (for
# example: pip install pytest-homeassistant-custom-component home-assistant-frontend)
# and Node with Playwright's Chromium (npm install; npx playwright install chromium).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HASS="${HASS:-hass}"
CONF="$(mktemp -d)"
mkdir -p "$CONF/custom_components" "$CONF/.storage"
ln -s "$ROOT/custom_components/soccerlineup" "$CONF/custom_components/soccerlineup"
cp "$ROOT/tests/real_ha/configuration.yaml" "$CONF/"

# Skip Home Assistant's first-run screens and add SoccerLineup, as the
# "Add integration" button would.
cat > "$CONF/.storage/onboarding" <<'JSON'
{"version": 4, "minor_version": 1, "key": "onboarding", "data": {"done": ["user", "core_config", "analytics", "integration"]}}
JSON
cat > "$CONF/.storage/core.config_entries" <<'JSON'
{"version": 1, "minor_version": 1, "key": "core.config_entries", "data": {"entries": [
 {"entry_id": "01JSOCCERLINEUPTESTENTRY0", "version": 1, "domain": "soccerlineup", "title": "Soccer Lineup",
  "data": {}, "options": {}, "pref_disable_new_entities": false, "pref_disable_polling": false,
  "source": "user", "unique_id": null, "disabled_by": null}]}}
JSON
"$HASS" --script auth -c "$CONF" add coach coachpass123

"$HASS" -c "$CONF" --skip-pip > "$CONF/home-assistant.log" 2>&1 &
HA_PID=$!
trap 'kill "$HA_PID" 2>/dev/null || true; wait "$HA_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 90); do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8124/manifest.json | grep -q 200; then break; fi
  sleep 2
done
if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8124/manifest.json | grep -q 200; then
  echo "Home Assistant did not start:"; tail -50 "$CONF/home-assistant.log"; exit 1
fi
if grep -E "ERROR.*soccerlineup|Error setting up entry Soccer Lineup" "$CONF/home-assistant.log"; then
  echo "SoccerLineup failed to load"; exit 1
fi

node "$ROOT/tests/real_ha/real_ha.test.js"
