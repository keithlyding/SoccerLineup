# SoccerLineup

Plan fair youth soccer lineups, quarter by quarter or half by half: who plays, who sits, and where,
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

## Using it on its own (no Home Assistant)

Open **https://keithlyding.github.io/SoccerLineup/** in any browser. That's
all: nothing to install, no account, and the season stays in that browser.

- **On a phone,** add it to the Home Screen so it opens like an app and
  works with no signal: in Safari tap Share, then **Add to Home Screen**
  (Android: Chrome menu, **Install app**).
- **From a folder:** download the repository and open `index.html`.
  Everything works except offline mode, which needs the web address.

**Backups.** Each browser keeps its own copy of the season, so keep backups:

- On a computer, **Season, Download backup** saves a file. By default a
  backup also downloads every time you save a game.
- On a phone, **Season, Save backup** opens the share sheet: choose
  **Save to Files** (or iCloud Drive, AirDrop, email). After you save a game,
  a **Save backup** button offers the same.
- **Restore from backup** on the Season tab brings a backup back, on the
  same device or a new one. The Season tab shows when the last backup was
  made, and turns orange when that was more than two weeks ago.

Moving to Home Assistant later is one backup and one restore.

## Trends

**Opponent goals by quarter.** On the Plan tab, the Goals card has the
opponent's goals for the quarter (or half) you're viewing, with + and -.
The opponent's total then adds itself up; **Use a total instead** goes back
to typing a single number. The print-outs have room for both teams' goals
each quarter.

**Stats, Trends** (the Stats tab at the top) shows, for the games you pick (filter by opponent, and
tick or untick games):

- the record and goals for and against per game;
- a chart of goals scored and allowed per game in each quarter;
- by formation: quarters played, goals scored and allowed, per quarter;
- by goalkeeper: goals allowed per quarter in goal;
- while each player is on the field: team goals scored and allowed;
- **a closer look at one quarter** (it starts on the quarter with the most
  goals allowed; tap Q1-Q4 to switch): that quarter against the others; each
  game's formation, keeper, score, lineup by line and bench, and how many
  players also played the quarter before; that quarter by formation and by
  keeper; and for each player, goals allowed and scored per game with them on
  the field versus on the bench, and where they played. **Open** takes you to
  that game at that quarter.

Goals allowed by quarter need the opponent's goals recorded by quarter;
games with only a total are left out of those figures, and the page says how
many. A handful of games can swing these numbers a lot, so read them as
hints.

## Game day: the clock and subs

The Plan tab's **Clock and subs** card works on the quarter (or half) you're
viewing.

- **Minutes per quarter** starts from Setup and can be changed for one game
  (a shortened game, or a tournament), before or during it. Changing Setup
  later doesn't overwrite it.
- **Start Q1**, **Pause**, **Resume**, **End Q1**, then **Start Q2**. The clock
  counts up and shows the time left. It keeps time from when it started, so
  locking the phone or switching apps doesn't lose time, and in Home Assistant
  every device sees the same clock. While it runs the phone's screen stays on
  where the phone allows it. If you forget to end a quarter, **Ran 16:40 ·
  change** fixes its length.
- **Subs while the quarter is live** (its clock running or paused): the pitch
  shows who's on the field now, marked LIVE with the time.
  - **Get subs ready, then send them in together:** tap a player on the field
    and choose who goes in from the bench list (or tap a bench player and
    choose who comes out). Each pair waits under **Ready** and is marked on
    the pitch; **Send subs in** makes them all at once at the clock's time.
    The Ready bar stays at the top of the screen while you scroll.
  - **Or drag** a bench player onto a spot to sub right away; drag between
    spots to switch two players' positions.
  - Undo takes a change back. The starting lineup, formation and auto-fill
    are locked while the quarter is live.
- **Subs made without the clock:** **Log a sub made without the clock** (under
  the pitch) asks when it happened. Each sub's time can be changed later.
- **Planned subs:** add one (when, who off, who on), or **Suggest subs** at
  the times you give (7:30 for 15-minute quarters; 10:00 and 20:00 for
  30-minute halves). Suggestions even out playing time across the game:
  players with the fewest minutes come on for those with the most, and the
  keeper stays. During the game a planned sub turns orange when it's due;
  **Sub now** makes it, and **Make all of them now** makes every due one. If
  you played a quarter without the clock, **played as planned** records the
  planned subs at their planned times. Print-outs list each quarter's subs.
- Goals entered while the clock runs keep their time, and the card lists the
  quarter's subs and goals in order.

The pitch on the Plan tab is each quarter's starting lineup. Playing time
counts part of a quarter for coming on or going off partway: 3 minutes of a
15-minute quarter is 0.2 of a quarter. The season's **Mins** column is the
minutes actually played. Positions and Trends count everyone who played in a
quarter, and the closer look at one quarter lists its subs.

## Game types and records

Each game is **League** (the default), **Playoff / tournament** or
**Scrimmage** (the Game type menu next to the date). The record leaves
scrimmages out; playoff and tournament games count in it and also have their
own record. The record is in the top bar on every tab (for example
`3-1-0 · Playoffs 1-0-0`), and the Season tab spells out all three. Trends
leave scrimmages out unless you tick them. Playing time counts every game,
scrimmages included.

## Seasons

When a season is over, **Season, Start a new season** puts its played games
away with the roster and setup as they were, and the new season starts with
the same roster, ready to edit. Planned games that haven't been played stay
in the new season.

On the Stats tab, the **Season** menu shows this season or any past one. A
past season shows its record and format, every player's totals, the roster as
it was (positions and tiers), its games with scores and notes, and the same
Trends and Positions played as the current season. Past seasons can be
renamed or deleted but not edited. **Add it as a past season** adds the
season in a backup file (and any past seasons it had) without changing
anything else: useful for backups from before this feature. Backups include
the past seasons.

**Head coach records.** Setup has a **Head coach** name, kept with each
season (a past season's can be set with its **Head coach** button). Stats,
**Head coach records**, adds up each coach's record over every season, with
playoffs and tournaments, goals for and against, and a season-by-season
list.

## Age groups and formations

Setup has an **Age group** shortcut that fills in the match format. Leagues
differ, so check it against yours; every number stays editable.

| Age group | Players on the field | Periods | Formations |
| --- | --- | --- | --- |
| U9-U10 | 7v7 | 4 quarters of 12 min | 3-2-1, 2-3-1, 2-1-2-1 |
| U11-U12 | 9v9 | 2 halves of 30 min | 3-3-2, 4-1-3, 4-2-2, 3-2-3, 2-3-3, 3-1-3-1, 3-4-1, 4-3-1 |
| U13 and older | 11v11 | 2 halves of 35 min | 4-4-2, 4-3-3, 4-2-3-1, 4-1-4-1, 4-5-1, 3-5-2, 3-4-3, 5-3-2 |

8v8 (2-3-2, 3-3-1, 3-2-2) and 10v10 (4-3-2, 3-4-2, 4-4-1, 3-3-3, 4-2-3,
4-1-3-1), which a few leagues play, are there too. The players-on-field sizes follow
U.S. Soccer's age formats; the game lengths come from one state's
recreational rules. Set **Periods** to 2 for halves or 4 for quarters, and
the app says halves (H1, H2) or quarters (Q1 to Q4) throughout, including on
the print-outs.

Each quarter's or half's formation is picked on the Plan tab.

**Playing short.** When fewer players are available than spots, auto-fill
puts everyone on and leaves a spot open: a forward first, then a
midfielder, then a defender, always keeping at least one player in every
line. The Plan tab then shows "Playing 1 short" with a **Leave open** menu
to pick a different spot; auto-fill keeps that choice for the rest of the
game, and the print-outs say which spot is open.

**Goalkeepers** (Setup): switch at halftime with GK 1 first (the default),
switch at halftime taking turns starting, GK 1 starts and finishes with GK 2
in the middle, or GK 1 the whole game, with GK 2 only when GK 1 is out or
leaves the game.

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
