// Game day: the clock for each period, subs made during a period with their
// time, planned subs ("Sub now", suggestions, "played as planned"), minutes
// played from the subs, a game's own period length, and shutouts counting in
// every period.
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
  page.on('dialog', d => { dialogs.push(d.message()); d.type() === 'prompt' ? d.accept(d.defaultValue()) : d.accept(); });
  await page.clock.install({ time: new Date('2026-11-07T09:00:00') });
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const press = sel => setup.iphone ? page.tap(sel) : page.click(sel);

  await page.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M'],['Lu','F','D']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2; S.cfg.team = 'Panthers';
    setDefaultFormation('4-1-3'); S.current.opp = 'Wolfe'; autoFillAll(); ui.q = 0; save(); render();
  });

  // ---------- this game's period length ----------
  assert(await page.inputValue('#fQlen') === '15', 'the game\'s minutes per quarter start from Setup (15)');
  await page.fill('#fQlen', '12'); await page.press('#fQlen', 'Tab');
  await page.evaluate(() => { showTab('setup'); document.getElementById('cfgTeam').value = 'Panthers FC'; saveCfg(); showTab('plan'); });
  let st = await page.evaluate(() => ({ qlen: S.current.qlen, cfg: S.cfg.minutes, left: document.getElementById('clockLeft') ? 1 : 0, shown: document.querySelector('#liveCard .clockrow').textContent }));
  assert(st.qlen === 12 && st.cfg === 15 && /12:00 left/.test(st.shown), 'a different length for this game only (12 min) stays when Setup is edited: ' + st.shown);
  await page.fill('#fQlen', '15'); await page.press('#fQlen', 'Tab');

  // ---------- the clock ----------
  await press('#liveCard button:has-text("Start Q1")');
  await page.clock.fastForward('03:00');
  st = await page.evaluate(() => ({ time: document.getElementById('clockTime').textContent, left: document.getElementById('clockLeft').textContent, running: clockRunning(S.current) }));
  assert(st.running && st.time === '3:00' && st.left === '12:00 left', 'Start Q1 runs the clock: 3:00, 12:00 left');

  // a goal while the clock runs keeps its time
  const scorer = await page.evaluate(() => { const g = S.current, f = qForm(g, 0); return g.plan[0][f.pos.findIndex(p => p.z === 'F')]; });
  await page.evaluate(id => bumpGoal(id, 0, 1), scorer);
  st = await page.evaluate(() => ({ times: S.current.goalTimes, line: document.querySelector('#liveCard .timeline').textContent }));
  assert(st.times.length === 1 && st.times[0].t === 180 && /3:00\s*⚽/.test(st.line), 'a goal entered at 3:00 shows in the timeline with its time');

  // a sub: tap a field player, then a bench player
  const chips = () => page.evaluate(() => ({ field: Array.from(document.querySelectorAll('#liveCard .livefield button')).map(b => [b.querySelector('.n').textContent, b.lastChild.textContent]), bench: Array.from(document.querySelectorAll('#liveCard .livebench button')).map(b => b.textContent) }));
  const before = await chips();
  await press('#liveCard .livefield button:nth-child(2)');
  assert(/now tap who comes on/.test(await page.textContent('#liveCard')), 'choosing a field player asks for who comes on');
  await press('#liveCard .livebench button:nth-child(1)');
  st = await page.evaluate(() => ({ subs: S.current.subs, line: document.querySelector('#liveCard .timeline').textContent }));
  const after = await chips(), offName = before.field[1][1], onName = before.bench[0];
  assert(st.subs.length === 1 && st.subs[0].t === 180 && st.subs[0].q === 0, 'the sub is kept at 3:00 in Q1');
  assert(after.field[1][0] === before.field[1][0] && after.field[1][1] === onName && new RegExp(onName + ' on for ' + offName).test(st.line),
    'the player coming on takes the same spot, and the timeline says "' + onName + ' on for ' + offName + '"');

  // pause and resume
  await page.clock.fastForward('04:30');
  await press('#liveCard button:has-text("Pause")');
  await page.clock.fastForward('01:00');
  assert(await page.evaluate(() => clockElapsed(S.current, 0)) === 450, 'Pause stops the clock at 7:30');
  await press('#liveCard button:has-text("Resume")');
  await page.clock.fastForward('07:30');
  await press('#liveCard button:has-text("End Q1")');
  st = await page.evaluate(id => ({ secs: S.current.periodSecs[0], sec: periodSeconds(S.current, 0), off: S.current.subs[0].off, on: S.current.subs[0].on, share: gameQtrs(S.current) }), scorer);
  assert(st.secs === 900, 'End Q1 records how long it ran (15:00): ' + st.secs);
  assert(st.sec[st.off] === 180 && st.sec[st.on] === 720 && Object.keys(st.sec).length === 10, 'Q1 minutes: 3:00 for the player who came off, 12:00 for the one who came on, 15:00 for the rest');
  assert(st.share[st.off] >= 0.2 && Math.abs(st.share[st.off] % 1 - 0.2) < 0.01, 'playing time counts part of a quarter: 0.2 of Q1 for 3 minutes');
  assert(await page.isVisible('#liveCard button:has-text("Start Q2")'), 'after Q1 ends, Start Q2 is offered');

  // ---------- planned subs for Q2 ----------
  await page.evaluate(() => { ui.q = 1; render(); });
  const spreadBefore = await page.evaluate(() => { const m = gameQtrs(S.current, true), v = presentRoster(S.current).map(p => m[p.id] || 0); return Math.max(...v) - Math.min(...v); });
  await page.fill('#psMarks', '7:30');
  await press('#liveCard button:has-text("Suggest subs for Q2")');
  st = await page.evaluate(() => {
    const g = S.current, f = qForm(g, 1), start = g.plan[1], m = gameQtrs(g, true), v = presentRoster(g).map(p => m[p.id] || 0);
    return { plan: g.subPlan.map(s => ({ ...s, offSlot: f.pos[start.indexOf(s.off)].z, onStarts: start.indexOf(s.on) >= 0 })), spread: Math.max(...v) - Math.min(...v),
             rows: document.querySelectorAll('#plannedSubs .plansub').length };
  });
  assert(st.plan.length >= 1 && st.plan.every(s => s.q === 1 && s.t === 450 && s.offSlot !== 'G' && !s.onStarts) && st.rows === st.plan.length,
    'Suggest subs plans ' + st.plan.length + ' change(s) at 7:30 in Q2: bench players on, never the keeper off');
  assert(st.spread <= spreadBefore, 'the suggestions even out playing time (spread ' + spreadBefore.toFixed(1) + ' -> ' + st.spread.toFixed(1) + ' quarters)');
  // add one by hand
  const manual = await page.evaluate(() => { const g = S.current, row = lineupAt(g, 1, 600, true), f = qForm(g, 1);
    const off = row.find((id, k) => id && f.pos[k].z !== 'G'), on = presentRoster(g).find(p => row.indexOf(p.id) < 0); return { off, on: on.id }; });
  await page.fill('#psTime', '10:00');
  await page.selectOption('#psOff', String(manual.off));
  await page.selectOption('#psOn', String(manual.on));
  await press('#liveCard button:has-text("Add")');
  assert(await page.evaluate(m => S.current.subPlan.some(s => s.t === 600 && s.off === m.off && s.on === m.on), manual), 'a sub can be planned by hand: at 10:00, who off and who on');
  assert(/Subs:.*7:30/.test(await page.evaluate(() => document.getElementById('printSheet').textContent)), 'print-outs list the planned subs for the quarter');

  // play Q2: planned subs come due
  await press('#liveCard button:has-text("Start Q2")');
  await page.clock.fastForward('07:31');
  st = await page.evaluate(() => ({ due: document.querySelectorAll('#plannedSubs .plansub.due').length, banner: document.getElementById('subDueText').textContent, hidden: document.getElementById('subDue').hidden, all: !document.getElementById('subDueAll').hidden }));
  assert(st.due >= 1 && !st.hidden && /^Subs? due:/.test(st.banner) && st.all === (st.due > 1), 'at 7:30 the planned subs are marked due: ' + st.banner);
  if (shots) await page.locator('#liveCard').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + 'clock.png') });
  await press('#plannedSubs .plansub.due button:has-text("Sub now")');
  st = await page.evaluate(() => ({ subs: S.current.subs.filter(s => s.q === 1), done: S.current.subPlan.filter(s => s.done).length }));
  assert(st.subs.length === 1 && st.subs[0].t === 451 && st.done === 1, '"Sub now" makes the planned sub at the clock\'s time (7:31)');
  await page.evaluate(() => undoLastChange());
  st = await page.evaluate(() => ({ subs: S.current.subs.filter(s => s.q === 1).length, done: S.current.subPlan.filter(s => s.done).length }));
  assert(st.subs === 0 && st.done === 0, 'Undo takes the sub back and it is planned again');
  const dueCount = await page.evaluate(() => pendingPlanned(S.current, 1).filter(p => p.t <= clockElapsed(S.current, 1)).length);
  if (dueCount > 1) {
    await page.clock.fastForward('00:01');
    await press('#subDueAll');
    st = await page.evaluate(() => ({ subs: S.current.subs.filter(s => s.q === 1).length, field: lineupAt(S.current, 1).filter(Boolean).length }));
    assert(st.subs === dueCount && st.field === 9, '"Make all of them now" makes all ' + dueCount + ' due subs, still 9 on the field');
    await page.evaluate(() => undoLastChange());
    assert(await page.evaluate(() => S.current.subs.filter(s => s.q === 1).length) === 0, 'one Undo takes all of them back');
  }
  await press('#liveCard button:has-text("End Q2")');

  // ---------- Q3 without the clock: played as planned ----------
  await page.evaluate(() => { ui.q = 2; ui.ps = {}; render(); });
  await press('#liveCard button:has-text("Suggest subs for Q3")');
  const planned3 = await page.evaluate(() => S.current.subPlan.filter(s => s.q === 2).length);
  await press('#liveCard button:has-text("Q3 was played as planned")');
  st = await page.evaluate(() => ({ subs: S.current.subs.filter(s => s.q === 2).map(s => s.t), pending: pendingPlanned(S.current, 2).length }));
  assert(planned3 >= 1 && st.subs.length === planned3 && st.subs.every(t => t === 450) && st.pending === 0, '"played as planned" makes Q3\'s ' + planned3 + ' planned sub(s) at their planned time');

  // ---------- Q4: a sub logged afterwards asks when ----------
  await page.evaluate(() => { ui.q = 3; render(); });
  dialogs.length = 0;
  await press('#liveCard .livefield button:nth-child(3)');
  await press('#liveCard .livebench button:nth-child(1)');
  st = await page.evaluate(() => S.current.subs.filter(s => s.q === 3));
  assert(dialogs.some(m => /When was .* coming on for/.test(m)) && st.length === 1 && st[0].t === 450, 'with no clock for Q4, a sub asks when (default 7:30)');
  await page.evaluate(() => { window.prompt = () => '9:15'; setSubTime(S.current.subs.findIndex(s => s.q === 3)); });
  assert(await page.evaluate(() => S.current.subs.find(s => s.q === 3).t) === 555, 'a sub\'s time can be changed (9:15)');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!overflow, 'no sideways scrolling on the Plan tab with the clock card');

  // ---------- saved: season minutes come from the subs ----------
  const expectMins = await page.evaluate(() => { const s = gameSeconds(S.current), out = {}; S.roster.forEach(p => { out[p.name] = Math.round((s[p.id] || 0) / 60); }); return out; });
  await page.evaluate(() => { setOpponentGoals('0'); archiveGame(); showTab('season'); });
  const rows = await page.$$eval('#seasonTable tbody tr', trs => trs.map(tr => Array.from(tr.cells).map(c => c.textContent)));
  assert(rows.length === 12 && rows.every(r => Number(r[7]) === expectMins[r[0]]), 'season minutes are the minutes actually played, from the subs');
  assert(rows.some(r => /\.\d/.test(r[2])), 'quarters played can be part quarters (e.g. ' + (rows.find(r => /\.\d/.test(r[2])) || [])[2] + ')');
  st = await page.evaluate(() => ({ clock: S.games[0].clock.q, q2: S.games[0].periodSecs[1] }));
  assert(st.clock === -1 && (st.q2 === 451 || st.q2 === 452), 'saving the game stops its clock; Q2 ran ' + st.q2 + 's');

  // ---------- a total of 0 counts as 0 in every quarter ----------
  st = await page.evaluate(() => { showTab('stats'); return { inQ: [0, 1, 2, 3].map(q => oppGoalsIn(S.games[0], q)).join(), text: document.getElementById('trends').textContent }; });
  assert(st.inQ === '0,0,0,0' && !/come from/.test(st.text), 'a shutout entered as a total counts as 0 allowed in every quarter in Trends');
  st = await page.evaluate(() => { setTrendQ(2); return document.querySelector('#trends .qgames').textContent; });
  assert(/Subs\s*7:30 \w+ for \w+/.test(st), 'the closer look lists a quarter\'s subs under its starting lineup');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (game day, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
