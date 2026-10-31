// Seasons: "Start a new season" puts the played games away with the roster
// and setup, past seasons stay viewable on the Stats tab (players, roster,
// games, trends, positions), and can be renamed, deleted, or added from a
// backup file.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (iPhone screen and touch, WebKit)
const path = require('path');
const { startServer, browserSetup } = require('./server');

const setup = browserSetup();
const shots = process.env.SHOTS_DIR || '';
let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}

(async () => {
  const server = await startServer(0, '');
  const browser = await setup.type.launch();
  const page = await (await browser.newContext(setup.contextOptions)).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const dialogs = [];
  let promptAnswer = null;
  page.on('dialog', d => {
    dialogs.push(d.message());
    if (d.type() === 'prompt') d.accept(promptAnswer !== null ? promptAnswer : d.defaultValue()); else d.accept();
  });
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const press = sel => setup.iphone ? page.tap(sel) : page.click(sel);

  // a season: three played games in the fall and one planned for later
  await page.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M'],['Lu','F','D']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2; S.cfg.team = 'Panthers';
    setDefaultFormation('4-1-3');
    [['2026-09-12', 'Wolfe', 3, 1], ['2026-09-19', 'Schoenrock', 0, 2], ['2026-10-03', 'Wolfe', 2, 0]].forEach(x => {
      S.current.date = x[0]; S.current.opp = x[1]; autoFillAll();
      const f = qForm(S.current, 0), st = S.current.plan[0][f.pos.findIndex(p => p.k === 'ST')];
      for (let k = 0; k < x[2]; k++) bumpGoal(st, 0, 1);
      setOpponentGoals(String(x[3])); S.current.notes = 'Notes for ' + x[1] + ' ' + x[0];
      archiveGame();
    });
    const d = new Date(); d.setDate(d.getDate() + 30);
    S.current.date = d.toISOString().slice(0, 10); S.current.opp = 'Future FC'; autoFillAll(); archiveGame();
    showTab('season');
  });
  let st = await page.evaluate(() => ({ played: playedGames().length, planned: S.games.filter(g => g.planned).length }));
  assert(st.played === 3 && st.planned === 1, 'a season of 3 played games and 1 planned');

  // ---------- game types and records ----------
  await page.evaluate(() => {
    // a playoff win and a scrimmage loss, then a head coach
    [['2026-10-10', 'Tigers', 'playoff', 2, 1], ['2026-10-11', 'Practice FC', 'scrimmage', 0, 4]].forEach(x => {
      showTab('plan'); S.current.date = x[0]; S.current.opp = x[1]; autoFillAll();
      const f = qForm(S.current, 0), st = S.current.plan[0][f.pos.findIndex(p => p.k === 'ST')];
      for (let k = 0; k < x[3]; k++) bumpGoal(st, 0, 1);
      setOpponentGoals(String(x[4]));
      document.getElementById('fKind').value = x[2]; setGameKind(x[2]);
      archiveGame();
    });
    showTab('setup'); document.getElementById('cfgCoach').value = 'Keith'; saveCfg(); showTab('season');
  });
  st = await page.evaluate(() => ({ meta: document.getElementById('seasonMeta').textContent, brand: document.getElementById('brandSub').textContent,
    tags: Array.from(document.querySelectorAll('#gameList .tag.kind')).map(t => t.textContent) }));
  assert(/^Record: 3-1-0 \(W-L-T\)\. Playoffs and tournaments: 1-0-0\. Scrimmages \(not counted\): 0-1-0/.test(st.meta),
    'the record leaves the scrimmage out (3-1-0), with playoffs and tournaments on their own (1-0-0): ' + st.meta.slice(0, 90));
  assert(st.brand === '3-1-0 \u00b7 Playoffs 1-0-0', 'the record is posted in the top bar on every tab: ' + st.brand);
  assert(st.tags.join() === 'Playoff / tournament,Scrimmage', 'the games list tags playoff and scrimmage games');
  st = await page.evaluate(() => { showTab('stats'); return { sum: document.querySelector('#trends .trendsum').textContent, kinds: Array.from(document.querySelectorAll('#trends .trendfilters .gamepick')).map(l => l.textContent.trim() + ':' + l.querySelector('input').checked) }; });
  assert(/^4 games: 3-1-0/.test(st.sum) && st.kinds.join() === 'League:true,Playoff / tournament:true,Scrimmage:false', 'Trends leaves scrimmages out unless ticked: ' + st.kinds.join());
  await page.evaluate(() => setTrendKind('scrimmage', true));
  assert(/^5 games: 3-1-0/.test(await page.textContent('#trends .trendsum')), 'ticking Scrimmage adds its goals to Trends, still not to the record');
  await page.evaluate(() => setTrendKind('scrimmage', false));
  st = await page.evaluate(() => ({ played: playedGames().length, planned: S.games.filter(g => g.planned).length }));
  assert(st.played === 5, 'five played games in all');
  await page.evaluate(() => showTab('setup'));
  assert(await page.evaluate(() => !!document.querySelector('#setup button[onclick="startNewSeason()"]') && !document.querySelector('#season button[onclick="startNewSeason()"]')), '"Start a new season" is on the Setup tab, not the Season tab');

  // ---------- start a new season ----------
  dialogs.length = 0;
  await press('button:has-text("Start a new season")');
  st = await page.evaluate(() => ({ seasons: S.seasons.map(s => s.name + ':' + s.games.length + ':' + s.from + '>' + s.to), games: S.games.map(g => g.opp), roster: S.roster.length, tab: ui.tab }));
  assert(dialogs.some(m => /Name for the season/.test(m)) && st.seasons.join() === 'Fall 2026:5:2026-09-12>2026-10-11',
    'it asks for a name (suggesting "Fall 2026") and puts the 5 played games away: ' + st.seasons.join());
  assert(st.games.join() === 'Future FC' && st.roster === 12, 'the planned game and the roster stay for the new season');
  assert(st.tab === 'setup' && dialogs.some(m => /get the roster ready/.test(m)), 'it goes to Setup to get the roster ready');

  // the new season starts empty
  await page.evaluate(() => showTab('season'));
  assert(/Record: 0-0-0/.test(await page.textContent('#seasonMeta')), 'the Season tab starts the new season at 0-0-0');

  // change the roster for the new season: the past season keeps its own
  await page.evaluate(() => { delPlayer(S.roster.find(p => p.name === 'Lu').id); S.roster.push({ id: S.nextId++, name: 'Max', num: '30', tier: 2, p1: 'F', p2: 'M', gkOrder: 0 }); S.roster.find(p => p.name === 'Kim').p1 = 'F'; save(); render(); });

  // ---------- look back at it on Stats ----------
  await press('#tab-stats');
  const opts = await page.$$eval('#seasonPick option', os => os.map(o => o.textContent));
  assert(opts.join('|') === 'This season (0 games)|Fall 2026 (3-1-0)', 'Stats has a Season menu: this season and Fall 2026 (3-1-0)');
  await page.selectOption('#seasonPick', { label: 'Fall 2026 (3-1-0)' });
  st = await page.evaluate(() => ({
    sum: document.querySelector('#pastSeason .trendsum').textContent,
    players: Array.from(document.querySelectorAll('#pastSeason .scrollx')[0].querySelectorAll('tbody tr')).map(r => r.cells[0].textContent),
    roster: Array.from(document.querySelectorAll('#pastSeason .scrollx')[1].querySelectorAll('tbody tr')).map(r => r.cells[0].textContent + ' ' + r.cells[2].textContent),
    games: Array.from(document.querySelectorAll('#pastSeason .scrollx')[2].querySelectorAll('tbody tr')).map(r => r.textContent),
    trends: document.querySelector('#trends .trendsum').textContent,
    positions: document.querySelectorAll('#positionStats tbody tr').length,
    open: document.querySelectorAll('#trends .qgame button').length,
    actions: !document.getElementById('seasonActions').hidden
  }));
  assert(/Fall 2026.*Panthers \(head coach Keith\), 9v9, 4 × 15 min.*2026-09-12 to 2026-10-11.*Record: 3-1-0 \(W-L-T\)\. Playoffs and tournaments: 1-0-0.*Scored 7, allowed 4/.test(st.sum), 'Fall 2026\'s summary: team, coach, format, dates, records and goals: ' + st.sum);
  assert(st.players.length === 12 && st.players.some(n => /^Lu/.test(n)) && !st.players.some(n => /^Max/.test(n)), 'its players are the ones who played then (Lu yes, Max no)');
  assert(st.roster.some(r => r === 'Kim Defense') && st.roster.length === 12, 'its roster shows positions as they were then (Kim: Defense)');
  assert(st.games.length === 5 && /Notes for Schoenrock/.test(st.games.join()), 'its games are listed with scores, notes and game types');
  assert(/4 games: 3-1-0/.test(st.trends) && st.positions === 12, 'Trends and Positions played show Fall 2026');
  assert(st.open === 0 && st.actions, 'a past season can\'t be edited from here (no Open buttons), and has Rename and Delete');
  if (shots) await page.locator('#stats').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + 'past-season.png') });

  // trend filters work inside a past season
  await page.click('#trends button:has-text("None")');
  assert(/No games selected/.test(await page.textContent('#trends')), 'the game filter works in a past season');
  await page.click('#trends button:has-text("All")');

  // rename
  promptAnswer = 'Fall 2026 U10';
  await press('#seasonActions button:has-text("Rename")');
  promptAnswer = null;
  assert(await page.evaluate(() => S.seasons[0].name) === 'Fall 2026 U10', 'Rename changes the season\'s name');

  // back to this season
  await page.selectOption('#seasonPick', '0');
  st = await page.evaluate(() => ({ past: document.getElementById('pastSeason').hidden, trends: document.getElementById('trends').textContent }));
  assert(st.past && /Save played games to see trends/.test(st.trends), '"This season" shows the new season\'s (empty) stats');

  // ---------- kept after reloading ----------
  await page.reload();
  assert(await page.evaluate(() => S.seasons.length === 1 && S.seasons[0].games.length === 5 && S.seasons[0].roster.length === 12), 'past seasons are kept after reopening the app');

  // ---------- add seasons from a backup file ----------
  const backup = await page.evaluate(() => {
    const b = JSON.parse(JSON.stringify(S));
    b.games = JSON.parse(JSON.stringify(S.seasons[0].games)).map((g, i) => ({ ...g, date: '2025-04-0' + (i + 1), opp: 'Spring ' + g.opp }));
    b.seasons = [{ id: 7, name: 'Fall 2024', from: '2024-09-01', to: '2024-10-30', cfg: b.cfg, roster: b.roster, games: JSON.parse(JSON.stringify(S.seasons[0].games)).slice(0, 1) }];
    return JSON.stringify(b);
  });
  const before = await page.evaluate(() => JSON.stringify({ roster: S.roster, games: S.games, cfg: S.cfg, current: S.current }));
  dialogs.length = 0;
  await page.setInputFiles('#seasonFile', { name: 'old.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
  await page.waitForFunction(() => S.seasons.length === 3);
  st = await page.evaluate(() => ({ names: S.seasons.map(s => s.name + ':' + s.games.length), ids: S.seasons.map(s => s.id), now: JSON.stringify({ roster: S.roster, games: S.games, cfg: S.cfg, current: S.current }), pick: ui.season }));
  assert(st.names.join() === 'Fall 2026 U10:5,Fall 2024:1,Spring 2025:5' && new Set(st.ids).size === 3,
    'a backup file adds its own past seasons and its season (named "Spring 2025") as past seasons: ' + st.names.join());
  assert(st.now === before, 'adding seasons from a file changes nothing else');
  const optsNow = await page.$$eval('#seasonPick option', os => os.map(o => o.textContent));
  assert(optsNow[0].startsWith('This season') && optsNow.length === 4, 'the menu lists all three past seasons, newest first: ' + optsNow.join(' | '));

  // ---------- head coach records across seasons ----------
  await page.evaluate(() => { showTab('stats'); });
  st = await page.evaluate(() => ({ coaches: Array.from(document.querySelectorAll('#coachRecords table')[0].querySelectorAll('tbody tr')).map(r => Array.from(r.cells).map(c => c.textContent).join('|')),
    seasons: Array.from(document.querySelectorAll('#coachRecords table')[1].querySelectorAll('tbody tr')).map(r => Array.from(r.cells).map(c => c.textContent).join('|')) }));
  // Fall 2024 is one game of Fall 2026 (a 3-1 win); Spring 2025 and Fall 2026 U10 are 3-1-0 each
  assert(st.coaches.join(' / ') === 'Keith|3|7-2-0|2-0-0|17|9', 'Keith\'s record over all three seasons: 7-2-0, playoffs 2-0-0: ' + st.coaches.join(' / '));
  assert(st.seasons.length === 3 && st.seasons[0].startsWith('Fall 2024|Keith|1-0-0'), 'each season is listed with its coach and record: ' + st.seasons.join(' / '));
  await page.selectOption('#seasonPick', { label: (await page.$$eval('#seasonPick option', os => os.map(o => o.textContent))).find(o => o.startsWith('Spring 2025')) });
  promptAnswer = 'Assistant Sam';
  await press('#seasonActions button:has-text("Head coach")');
  promptAnswer = null;
  st = await page.evaluate(() => Array.from(document.querySelectorAll('#coachRecords table')[0].querySelectorAll('tbody tr')).map(r => r.cells[0].textContent + ' ' + r.cells[1].textContent + ' ' + r.cells[2].textContent));
  assert(st.join(' / ') === 'Keith 2 4-1-0 / Assistant Sam 1 3-1-0', 'a past season\'s head coach can be set, and each coach gets their own cumulative record: ' + st.join(' / '));

  // ---------- delete ----------
  await page.evaluate(() => showTab('stats'));
  await page.selectOption('#seasonPick', { label: optsNow.find(o => o.startsWith('Fall 2024')) });
  dialogs.length = 0;
  await press('#seasonActions button:has-text("Delete")');
  assert(dialogs.some(m => /for good/.test(m)) && await page.evaluate(() => S.seasons.map(s => s.name).join()) === 'Fall 2026 U10,Spring 2025', 'Delete removes a past season after asking');

  // ---------- a full backup carries the past seasons ----------
  const full = await page.evaluate(() => backupText(new Date().toISOString()));
  assert(JSON.parse(full).seasons.length === 2, 'backups include the past seasons');

  const overflow = await page.evaluate(() => { showTab('stats'); pickSeason(S.seasons[0].id); return document.documentElement.scrollWidth > window.innerWidth; });
  assert(!overflow, 'no sideways scrolling on the Stats tab with a past season');
  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (seasons, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
