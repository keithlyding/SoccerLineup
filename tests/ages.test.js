// Older age groups: the Setup age presets, 11v11 and its formations, and
// games played in halves (labels, auto-fill, goalkeepers, print-outs).
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
  let answer = true; const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); answer ? d.accept() : d.dismiss(); });
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 16 players, two keepers
  await page.evaluate(() => {
    const pos = [['G','D'],['D','G'],['D','M'],['D',''],['D','M'],['D','MD'],['MD','D'],['M','F'],['M',''],['MA','F'],['M','D'],['F','MA'],['F',''],['F','M'],['MA','M'],['D','F']];
    pos.forEach((x, i) => S.roster.push({ id: S.nextId++, name: 'P' + (i + 1), num: String(i + 1), tier: (i % 3) + 1, p1: x[0], p2: x[1], gkOrder: i < 2 ? i + 1 : 0 }));
    S.cfg.team = 'Older'; save(); render(); showTab('setup');
  });

  // ---------- U13 and older ----------
  await page.selectOption('#cfgAge', 'u13');
  let st = await page.evaluate(() => ({ n: S.cfg.onField, p: S.cfg.quarters, m: S.cfg.minutes, g: [S.current.onField, S.current.nq, S.current.qlen, S.current.formation].join(),
    sizes: Array.from(document.querySelectorAll('#cfgSize option')).map(o => o.value).join(), forms: Array.from(document.querySelectorAll('#cfgFormation option')).map(o => o.value).join(),
    ageReset: document.getElementById('cfgAge').value }));
  assert(st.n === 11 && st.p === 2 && st.m === 35, 'U13 and older fills in 11v11, two halves of 35 minutes');
  assert(st.g === '11,2,35,4-4-2', 'the game being planned switches too, starting in 4-4-2');
  assert(st.sizes === '11,10,9,8,7', 'players on field offers 11, 10, 9, 8 and 7');
  assert(st.forms === '4-4-2,4-3-3,4-2-3-1,4-1-4-1,4-5-1,3-5-2,3-4-3,5-3-2', '11v11 formations: ' + st.forms);
  assert(st.ageReset === '', 'the age menu is a shortcut; the numbers below stay editable');

  await page.evaluate(() => { showTab('plan'); autoFillAll(); });
  st = await page.evaluate(() => {
    const g = S.current, gk = g.plan.map((row, q) => { const f = qForm(g, q); return nameOf(row[f.pos.findIndex(p => p.z === 'G')], g); });
    const lines = {};
    g.plan.forEach((row, q) => row.forEach((id, i) => { const z = qForm(g, q).pos[i].z; if (id && z !== 'G') (lines[id] = lines[id] || new Set()).add(lineGroup(z)); }));
    const played = gameQtrs(g);
    return { tabs: Array.from(document.querySelectorAll('#qtabs button')).map(b => b.firstChild.textContent).join(),
      title: document.getElementById('pitchTitle').textContent, status: document.getElementById('gameStatus').textContent,
      full: g.plan.map(r => new Set(r.filter(x => x)).size).join(), gk: gk.join(),
      maxLines: Math.max(...Object.values(lines).map(s => s.size)),
      plays: Object.values(played).sort().join(''), sitsTitle: document.getElementById('planSits').textContent,
      playedTitle: document.getElementById('playedTitle').textContent, leftOpts: Array.from(document.querySelectorAll('#leftFrom option')).map(o => o.textContent).join() };
  });
  assert(st.tabs === 'H1,H2' && st.title === 'Half 1', 'a game in halves shows H1 and H2, "Half 1"');
  assert(/5 sit each half/.test(st.status), 'the status line counts halves: ' + st.status.slice(0, 60));
  assert(st.full === '11,11', 'auto-fill puts 11 different players on for each half');
  assert(st.gk === 'P1,P2', 'GK 1 keeps the first half and GK 2 the second');
  assert(st.maxLines <= 2, 'nobody plays more than two lines');
  assert(/^[12]+$/.test(st.plays), 'with 16 players, everyone plays one or two halves');
  assert(/Halves\s*playing/.test(st.sitsTitle) && st.playedTitle === 'Halves played', 'the playing-time table talks about halves');
  assert(st.leftOpts === 'from H2', '"left the game" offers "from H2"');

  const print = await page.evaluate(() => ({
    pages: document.querySelectorAll('#printSheet .print-page').length,
    titles: Array.from(document.querySelectorAll('#printSheet .pquarter-title')).map(e => e.textContent).join(),
    text: document.getElementById('printSheet').textContent }));
  assert(print.pages === 2 && print.titles === 'H1,H2', 'print-outs: one page per half, titled H1 and H2');
  assert(/Sitting this half/.test(print.text) && /H1 goals/.test(print.text) && /Halves sitting/.test(print.text), 'the printed pages say halves');

  // every 11v11 formation fills and keeps a keeper
  const forms = await page.evaluate(() => {
    const out = [];
    formationsFor(11).forEach(f => {
      ui.q = 0; setQuarterFormation(f); autoFillQuarter();
      const g = S.current, fm = qForm(g, 0), row = g.plan[0];
      out.push(f + ':' + new Set(row.filter(x => x)).size + ':' + (row[fm.pos.findIndex(p => p.z === 'G')] ? 'GK' : 'none'));
    });
    return out;
  });
  assert(forms.every(x => /:11:GK$/.test(x)), 'each 11v11 formation fills all 11 spots with a keeper: ' + forms.join(' '));
  if (shots) {
    await page.evaluate(() => { ui.q = 0; setQuarterFormation('3-5-2'); autoFillQuarter(); });
    await page.locator('#pitchSvg').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + '352.png') });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!overflow, 'no sideways scrolling with 11 on the field');

  // a game in halves saves and counts like any other
  await page.evaluate(() => { S.current.oppGoals = 1; archiveGame(); });
  st = await page.evaluate(() => { const t = seasonTotals()[S.roster[5].id]; return { avail: t.availQ, games: playedGames().length }; });
  assert(st.games === 1 && st.avail === 2, 'a saved game in halves counts two halves per player');

  // ---------- switching age group with a game planned asks first ----------
  await page.evaluate(() => { showTab('plan'); autoFillAll(); showTab('setup'); });
  answer = false;
  await page.selectOption('#cfgAge', 'u12');
  st = await page.evaluate(() => [S.cfg.onField, S.current.onField, S.current.plan[0].filter(x => x).length].join());
  assert(/clears the game you're planning/.test(dialogs[dialogs.length - 1]) && st === '11,11,11', 'with a game planned it asks first, and Cancel changes nothing');
  answer = true;
  await page.selectOption('#cfgAge', 'u12');
  st = await page.evaluate(() => [S.cfg.onField, S.cfg.quarters, S.cfg.minutes, S.current.onField, S.current.nq, S.current.formation].join());
  assert(st === '9,2,30,9,2,3-3-2', 'U11-U12 fills in 9v9, two halves of 30 minutes');

  await page.selectOption('#cfgAge', 'u10');
  await page.evaluate(() => showTab('plan'));
  st = await page.evaluate(() => ({ cfg: [S.cfg.onField, S.cfg.quarters, S.cfg.minutes].join(), tabs: Array.from(document.querySelectorAll('#qtabs button')).map(b => b.firstChild.textContent).join(), title: document.getElementById('pitchTitle').textContent }));
  assert(st.cfg === '7,4,12' && st.tabs === 'Q1,Q2,Q3,Q4' && st.title === 'Quarter 1', 'U9-U10 fills in 7v7, four quarters of 12 minutes, labelled Q1 to Q4');

  // the saved 11v11 game still opens as 11v11 in halves
  await page.evaluate(() => editGame(S.games[0].id));
  st = await page.evaluate(() => ({ slots: document.querySelectorAll('#pitchSvg .slotbox').length, tabs: Array.from(document.querySelectorAll('#qtabs button')).map(b => b.firstChild.textContent).join() }));
  assert(st.slots === 11 && st.tabs === 'H1,H2', 'the saved 11v11 game still opens as 11v11 in halves');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (older ages, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
