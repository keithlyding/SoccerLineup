// Opponent goals by period, and the Season tab's Trends with its filters.
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
  page.on('dialog', d => d.accept());
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M'],['Lu','F','D']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2; S.cfg.team = 'Panthers';
    setDefaultFormation('4-1-3'); save(); render();
  });
  const press = sel => setup.iphone ? page.tap(sel) : page.click(sel);
  // a goal for whoever plays the striker spot in quarter q
  const scoreIn = q => page.evaluate(q => { const g = S.current, f = qForm(g, q); const id = g.plan[q][f.pos.findIndex(p => p.k === 'ST' || p.z === 'F')]; bumpGoal(id, q, 1); }, q);

  // ---------- game 1 vs Wolfe: opponent goals by quarter ----------
  await page.evaluate(() => { S.current.opp = 'Wolfe'; S.current.date = '2026-09-01'; autoFillAll(); ui.q = 0; render(); });
  assert(/Wolfe goals in Q1/.test(await page.textContent('#oppQRow')), 'the Goals card has "Wolfe goals in Q1" with buttons');
  await press('#oppQRow button[aria-label="One more opponent goal"]');
  let st = await page.evaluate(() => ({ q: S.current.oppGoalsQ.join(), total: S.current.oppGoals, ro: document.getElementById('fOppGoals').readOnly, shown: document.getElementById('oppQValue').textContent }));
  assert(st.q === '1,0,0,0' && st.total === 1 && st.ro && st.shown === '1', 'tapping + records a Q1 goal; the total becomes the sum and is read-only');
  await page.evaluate(() => { ui.q = 2; render(); });
  await press('#oppQRow button[aria-label="One more opponent goal"]');
  await press('#oppQRow button[aria-label="One more opponent goal"]');
  await press('#oppQRow button[aria-label="One fewer opponent goal"]');
  await scoreIn(0); await scoreIn(0); await scoreIn(1); await scoreIn(3);
  st = await page.evaluate(() => ({ q: S.current.oppGoalsQ.join(), total: document.getElementById('fOppGoals').value }));
  assert(st.q === '1,0,1,0' && st.total === '2', 'more and fewer work per quarter: Q3 ends at 1, total 2');
  const printText = await page.evaluate(() => document.getElementById('printSheet').textContent);
  assert(/Q1 goals: us ____\s+them ____/.test(printText), 'print-outs have room for both teams\' goals each quarter');
  await page.evaluate(() => archiveGame());

  // ---------- game 2 vs Schoenrock: only a total ----------
  await page.evaluate(() => { showTab('plan'); S.current.opp = 'Schoenrock'; S.current.date = '2026-09-08'; autoFillAll(); render(); });
  await scoreIn(1);
  await page.fill('#fOppGoals', '3');
  await page.press('#fOppGoals', 'Tab');
  await page.evaluate(() => archiveGame());

  // ---------- game 3 vs Wolfe, saved as planned, then recorded ----------
  await page.evaluate(() => {
    showTab('plan'); const d = new Date(); d.setDate(d.getDate() + 2);
    S.current.opp = 'Wolfe'; S.current.date = d.toISOString().slice(0, 10); setQuarterFormation('3-3-2', true); autoFillAll(); archiveGame();
    editGame(S.games[2].id); ui.q = 3; render();
  });
  assert(await page.evaluate(() => S.games[2].planned), 'the third game is saved as planned');
  await press('#oppQRow button[aria-label="One more opponent goal"]');
  await scoreIn(2); await scoreIn(2);
  st = await page.evaluate(() => ({ planned: S.games[2].planned, q: S.games[2].oppGoalsQ.join() }));
  assert(!st.planned && st.q === '0,0,0,1', 'recording an opponent goal by quarter marks a planned game played');
  await page.evaluate(() => stopEditing());

  // ---------- trends ----------
  await page.evaluate(() => showTab('season'));
  const read = () => page.evaluate(() => ({
    sum: (document.querySelector('#trends .trendsum') || {}).textContent || '',
    bars: Array.from(document.querySelectorAll('#trends .bar')).map(b => b.classList[1] + ':' + b.querySelector('text').textContent),
    titles: Array.from(document.querySelectorAll('#trends .bar title')).map(t => t.textContent),
    text: document.getElementById('trends').textContent,
    forms: Array.from(document.querySelectorAll('#trends h3')).map(h => h.textContent)
  }));
  st = await read();
  assert(/3 games: 2-1-0/.test(st.sum) && /Scored 7 \(2\.3 a game\)/.test(st.sum) && /allowed 6 \(2\.0 a game\)/.test(st.sum),
    'summary: 3 games, 2-1-0, scored 7, allowed 6: ' + st.sum);
  // scored per game by quarter: Q1 2/3, Q2 2/3, Q3 2/3, Q4 1/3; allowed from the 2 games recorded by quarter: Q1 .5, Q2 0, Q3 .5, Q4 .5
  assert(st.bars.join(' ') === 'for:0.7 against:0.5 for:0.7 against:0.0 for:0.7 against:0.5 for:0.3 against:0.5',
    'the chart shows scored and allowed per game in each quarter: ' + st.bars.join(' '));
  assert(st.titles[0] === 'Q1: Scored 0.7 per game', 'each bar has a hover description');
  assert(/come from 2 of 3 games/.test(st.text), 'it says goals allowed by quarter come from 2 of 3 games');
  assert(st.forms.join('|') === 'By formation|By goalkeeper|While each player is on the field', 'tables by formation, by goalkeeper, and on the field');
  const fRow = (await page.evaluate(() => Array.from(document.querySelectorAll('#trends .scrollx')[0].querySelectorAll('tbody tr')).map(r => Array.from(r.cells).map(c => c.textContent).join('|'))));
  // allowed per quarter divides by the quarters with opponent goals recorded (4 of 4-1-3's 8)
  assert(fRow.includes('4-1-3|8|5|2|0.6|0.5') && fRow.includes('3-3-2|4|2|1|0.5|0.3'),
    'by formation: 4-1-3 scored 5 in 8 quarters, allowed 2 in the 4 recorded; 3-3-2 scored 2, allowed 1 in 4: ' + fRow.join(' / '));
  if (shots) await page.locator('#trends').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + 'trends.png') });

  // filter by opponent
  await page.selectOption('#trends select', 'Wolfe');
  st = await read();
  assert(/2 games: 2-0-0/.test(st.sum) && /Scored 6/.test(st.sum) && !/come from/.test(st.text), 'opponent Wolfe: 2 games, both recorded by quarter');
  const picks = await page.$$eval('#trends .gamepick', ps => ps.map(p => p.textContent.trim()));
  assert(picks.length === 2 && picks.every(p => /Wolfe/.test(p)), 'the game list shows only Wolfe games');
  await page.locator('#trends .gamepick input').first().uncheck();
  st = await read();
  assert(/1 game: 1-0-0/.test(st.sum), 'unticking a game leaves it out');
  await page.click('#trends button:has-text("None")');
  assert(/No games selected/.test((await read()).text), '"None" clears the selection');
  await page.click('#trends button:has-text("All")');
  await page.selectOption('#trends select', '');
  assert(/3 games/.test((await read()).sum), '"All" and "All opponents" bring every game back');

  // back to a total
  await page.evaluate(() => { editGame(S.games[0].id); });
  await page.click('#oppQRow button:has-text("Use a total instead")');
  st = await page.evaluate(() => ({ q: S.games[0].oppGoalsQ, total: S.games[0].oppGoals, ro: document.getElementById('fOppGoals').readOnly }));
  assert(st.q === undefined && st.total === 2 && !st.ro, '"Use a total instead" keeps the total and makes it editable again');

  const overflow = await page.evaluate(() => { showTab('season'); return document.documentElement.scrollWidth > window.innerWidth; });
  assert(!overflow, 'no sideways scrolling on the Season tab');
  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (trends, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
