// Goalkeeper "GK 1 the whole game", 10v10, and playing short.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (iPhone screen and touch, WebKit)
const { startServer, browserSetup } = require('./server');

const setup = browserSetup();
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
  page.on('dialog', d => d.accept());
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 12 players, GK 1 Ava, GK 2 Hal, 9v9 in quarters
  await page.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M'],['Lu','F','D']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2;
    setDefaultFormation('4-1-3'); save(); render();
  });
  const keepers = () => page.evaluate(() => S.current.plan.map((row, q) => {
    const f = qForm(S.current, q); return nameOf(row[f.pos.findIndex(p => p.z === 'G')], S.current);
  }).join(' '));
  const id = name => page.evaluate(n => S.roster.find(p => p.name === n).id, name);

  // ---------- GK 1 the whole game ----------
  await page.evaluate(() => showTab('setup'));
  await page.selectOption('#cfgKeeper', 'whole');
  await page.evaluate(() => { showTab('plan'); autoFillAll(); });
  assert((await keepers()) === 'Ava Ava Ava Ava', '"GK 1 the whole game": Ava keeps goal all four quarters even with a GK 2');
  const ava = await id('Ava');
  await page.selectOption('#leftWho', String(ava));
  await page.selectOption('#leftFrom', '2');
  await page.click('button:has-text("Mark")');
  await page.evaluate(() => autoFillAll());
  assert((await keepers()) === 'Ava Ava Hal Hal', 'if GK 1 leaves the game, GK 2 takes over from then on');
  await page.evaluate(() => { clearLeft(S.roster[0].id); S.current.out[S.roster[0].id] = true; autoFillAll(); });
  assert((await keepers()) === 'Hal Hal Hal Hal', 'if GK 1 is out, GK 2 keeps the whole game');
  await page.evaluate(() => { delete S.current.out[S.roster[0].id]; save(); render(); });

  // ---------- playing short ----------
  // 8 of 12 available for 9 spots: one short
  await page.evaluate(() => {
    ['Bea', 'Cat', 'Dee', 'Eve'].forEach(n => { S.current.out[S.roster.find(p => p.name === n).id] = true; });
    ui.q = 0; autoFillAll(); render();
  });
  let st = await page.evaluate(() => ({
    filled: S.current.plan.map(r => r.filter(x => x).length).join(),
    open: S.current.plan.map((r, q) => qForm(S.current, q).pos.filter((p, i) => !r[i]).map(p => p.k).join('+')).join(','),
    keeperIn: S.current.plan.every((r, q) => r[qForm(S.current, q).pos.findIndex(p => p.z === 'G')]),
    warn: document.getElementById('planWarn').textContent, row: document.getElementById('shortRow').hidden,
    text: document.getElementById('shortText').textContent, status: document.getElementById('gameStatus').textContent
  }));
  assert(st.filled === '8,8,8,8' && st.keeperIn, 'one short: auto-fill puts all 8 on every quarter, keeper included');
  assert(/^(LF|RF)(,(LF|RF)){3}$/.test(st.open), 'it leaves a forward open first (4-1-3 keeps its lone midfielder): ' + st.open);
  assert(st.warn === '', 'no "8 of 9 filled" warning when everyone available is playing');
  assert(!st.row && /Playing 1 short this quarter \((LF|RF) open\)/.test(st.text), 'the plan says "Playing 1 short this quarter" and which spot is open');
  assert(/Playing 1 short\./.test(st.status), 'the game status line says playing 1 short');

  // the coach picks a different spot
  const before = await page.evaluate(() => S.current.plan[0].filter(x => x).sort().join());
  await page.selectOption('#shortSpot', 'LB');
  st = await page.evaluate(() => {
    const f = qForm(S.current, 0), r = S.current.plan[0];
    return { lbEmpty: !r[f.pos.findIndex(p => p.k === 'LB')], players: r.filter(x => x).sort().join(), open: f.pos.filter((p, i) => !r[i]).map(p => p.k).join() };
  });
  assert(st.lbEmpty && st.open === 'LB' && st.players === before, 'choosing "leave LB open" moves that player into the open spot; same 8 on the field');
  await page.evaluate(() => { ui.q = 2; render(); autoFillQuarter(); });
  st = await page.evaluate(() => { const f = qForm(S.current, 2), r = S.current.plan[2]; return f.pos.filter((p, i) => !r[i]).map(p => p.k).join(); });
  assert(st === 'LB', 'auto-fill keeps the chosen spot open for the rest of the game');
  await page.evaluate(() => undoLastChange());

  const printText = await page.evaluate(() => document.getElementById('printSheet').textContent);
  assert(/Playing 1 short: (LF|RF|LB) open/.test(printText), 'the print-outs say which spot is open');

  // two short
  await page.evaluate(() => { S.current.out[S.roster.find(p => p.name === 'Fay').id] = true; S.current.leaveOpen = {}; autoFillAll(); render(); });
  st = await page.evaluate(() => S.current.plan.map((r, q) => qForm(S.current, q).pos.filter((p, i) => !r[i]).map(p => p.k).sort().join('+')).join(','));
  assert(st.split(',').every(x => x === 'LF+RF'), 'two short in 4-1-3: both outside forwards open, the striker stays: ' + st);
  st = await page.evaluate(() => { setQuarterFormation('3-1-3-1'); autoFillQuarter(); const f = qForm(S.current, ui.q), r = S.current.plan[ui.q];
    return f.pos.filter((p, i) => !r[i]).map(p => p.k).join('+'); });
  assert(!/ST/.test(st) && st.split('+').length === 2, 'in 3-1-3-1 the lone striker is kept; two others are left open: ' + st);

  // a real gap (someone available but not placed) still warns
  await page.evaluate(() => { const r = S.current.plan[0]; const f = qForm(S.current, 0); r[f.pos.findIndex(p => p.k === 'SW')] = 0; save(); render(); });
  assert(/Q1: 6 of 9 filled/.test(await page.textContent('#planWarn')), 'an unfilled spot with a player on the bench still warns');

  // ---------- 10v10 ----------
  await page.evaluate(() => { showTab('setup'); });
  await page.selectOption('#cfgSize', '10');
  st = await page.evaluate(() => ({ forms: Array.from(document.querySelectorAll('#cfgFormation option')).map(o => o.value).join(), cur: S.current.onField }));
  assert(st.cur === 10 && st.forms === '4-3-2,3-4-2,4-4-1,3-3-3,4-2-3,4-1-3-1', '10v10 offers 4-3-2, 3-4-2, 4-4-1, 3-3-3, 4-2-3 and 4-1-3-1');
  st = await page.evaluate(() => {
    S.current.out = {}; const out = [];
    formationsFor(10).forEach(f => { ui.q = 0; setQuarterFormation(f); autoFillQuarter();
      const r = S.current.plan[0], fm = qForm(S.current, 0); out.push(f + ':' + new Set(r.filter(x => x)).size + ':' + (r[fm.pos.findIndex(p => p.z === 'G')] ? 'GK' : '-')); });
    return out;
  });
  assert(st.every(x => /:10:GK$/.test(x)), 'each 10v10 formation fills all 10 spots with a keeper');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (goalkeeper, playing short, 10v10, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
