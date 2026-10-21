# SoccerLineup

Plan fair soccer lineups quarter by quarter: who plays, who sits, and where,
with a different formation each quarter if you want. The season is kept on
your own Home Assistant server, or in your own browser; nothing goes to
anyone else's servers.

## Two ways to use it

**In Home Assistant (recommended).** Soccer Lineup gets its own item in the
Home Assistant sidebar. The season is kept on your Home Assistant server, so:

- your computer and your phone (in the Home Assistant app) see the same
  season, and a change on one shows up on the other within a second;
- every change is saved on the server, and earlier versions can be restored
  from the Season tab;
- Home Assistant's own backups include the season;
- if the connection drops while the app is open, it keeps working, and the
  changes are sent when the connection is back. If two devices changed the
  season meanwhile, it asks which version to keep, and the other one stays
  under Earlier versions.

It needs a connection to Home Assistant to open (from away, through
Tailscale or however you reach Home Assistant today).

**On its own in a browser.** Open the app from a web address (GitHub Pages)
or from a downloaded folder. The season stays in that one browser. From a
web address it also works with no signal at all, and can be added to a
phone's Home Screen. Backups are files you download and restore.

## Install in Home Assistant

1. In HACS, open the three-dot menu, choose **Custom repositories**, add
   `https://github.com/keithlyding/SoccerLineup` with the category
   **Integration**.
2. Install **SoccerLineup**, then restart Home Assistant.
3. Go to **Settings, Devices & services, Add integration**, search for
   **SoccerLineup** and add it. **Soccer Lineup** appears in the sidebar.
4. Bring your season over: in the old app, Season, **Download backup**. In
   Home Assistant, open Soccer Lineup, Season, **Restore from backup**, and
   pick that file. Do this once, on a computer.

Requires Home Assistant 2024.7 or newer. Everyone who can sign in to your
Home Assistant can open and change the lineups.

On a phone, the **&#9776;** button at the top left opens Home Assistant's
sidebar.

## Using it on its own

- **On the web:** turn on GitHub Pages (Settings, Pages, Deploy from a
  branch, `main`, `/ (root)`), then open
  `https://keithlyding.github.io/SoccerLineup/`.
- **From a folder:** download the repository and open `index.html`. Every
  feature works except offline mode, which needs the web address.
- **On a phone's Home Screen:** open the web address in Safari, tap Share,
  then **Add to Home Screen** (Android: Chrome menu, **Install app**).

Saved games stay in the browser that saved them, so use **Download backup**
and **Restore from backup** on the Season tab to move them. The Season tab
can download a backup every time a game is saved, and shows when the last
one was made.

## Formations

Setup picks how many players are on the field and the default formation.
Each quarter's formation is picked on the Plan tab.

To add a formation, add one line near the top of
`custom_components/soccerlineup/frontend/app.js`, next to the others:

```js
addFormation("4-2-2");
```

The name lists the outfield lines from the back. Use 2 to 4 lines with 1 to
4 players each. The keeper is added for you. The formations written out in
full at the top of `app.js` are hand-placed and stay exactly as they are.

## Files

| File | What it is |
| --- | --- |
| `custom_components/soccerlineup/frontend/` | The app: `index.html` (layout), `styles.css` (look), `app.js` (everything it does), `sw.js` (offline mode), `manifest.webmanifest` and `icons/` (Home Screen install), `soccerlineup-panel.js` (shows the app in Home Assistant) |
| `custom_components/soccerlineup/*.py` | The Home Assistant integration: keeps the season on the server (`store.py`), the commands the app uses (`websocket_api.py`), the sidebar item (`__init__.py`) |
| `index.html` | Forwards to the app, for GitHub Pages and for opening the downloaded folder |
| `tests/` | Automated checks that run on every push |

The app is inside the integration's folder because HACS installs only that
folder.

## Tests

Every push runs these on GitHub (the **Actions** tab):

- the app in a desktop browser and as an iPhone (WebKit, the engine Safari
  uses, with an iPhone's screen size and touch), on its own and inside a
  stand-in Home Assistant with a laptop and a phone open at once;
- the integration on Home Assistant itself (`pytest`);
- a real Home Assistant started from scratch, signed in to with a browser;
- Home Assistant's and HACS's own checks of the integration.

To run them on a computer with Node.js and Python 3.13:

```sh
npm install
npx playwright install chromium webkit
npm test              # desktop
npm run test:iphone   # iPhone
pip install pytest-homeassistant-custom-component home-assistant-frontend
pytest                # the integration on Home Assistant
npm run test:real-ha  # a real Home Assistant
```

## License

MIT, the same as Lyding Strike. See [LICENSE](LICENSE).
