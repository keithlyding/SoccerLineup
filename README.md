# SoccerLineup

Plan fair soccer lineups quarter by quarter: who plays, who sits, and where,
with a different formation each quarter if you want. Everything is stored on
the device you use it on. Nothing is sent anywhere.

## Using it

- **On the web:** once GitHub Pages is on (see below), open
  `https://keithlyding.github.io/SoccerLineup/`.
- **From a folder:** download the repository and open `index.html`. Every
  feature works except offline mode, which needs the web address.

### Put it on your phone's Home Screen

- **iPhone or iPad:** open the web address in Safari, tap Share, then
  **Add to Home Screen**. It then opens full screen like an app and works with
  no signal.
- **Android:** open the web address in Chrome, tap the menu, then
  **Add to Home screen** or **Install app**.

### Moving your data to a new place

Saved games live in the browser that saved them. The web address, the Home
Screen app and a file opened from a folder count as different places, so
your games do not follow you automatically:

1. In the place that has your games, go to **Season** and tap **Download backup**.
2. In the new place, go to **Season**, tap **Restore from backup**, and pick that file.

On iPhone, do the restore from inside the Home Screen app itself, since it may
keep its own storage separate from Safari.

### Backups

**Season** has "Download a backup every time I save a game", which is on by
default. It also shows when the last backup was made, and turns orange when
that was more than two weeks ago.

## Formations

Setup picks how many players are on the field and the default formation.
Each quarter's formation is picked on the Plan tab.

To add a formation, add one line near the top of `app.js`, next to the
others:

```js
addFormation("4-2-2");
```

The name lists the outfield lines from the back. Use 2 to 4 lines with 1 to
4 players each. The keeper is added for you. The formations written out in
full at the top of `app.js` are hand-placed and stay exactly as they are.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page layout |
| `styles.css` | The look |
| `app.js` | Everything the app does |
| `sw.js` | Offline mode: keeps a copy of the app on the device and notices updates |
| `manifest.webmanifest`, `icons/` | What lets phones install it as an app |
| `tests/` | Automated checks that run on every push |

## Tests

Every push runs the tests on GitHub (the **Actions** tab), once as a desktop
browser and once as an iPhone (WebKit, the engine Safari uses, with an
iPhone's screen size and touch). To run them on a computer with Node.js
installed:

```sh
npm install
npx playwright install chromium webkit
npm test              # desktop
npm run test:iphone   # iPhone
```
