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
  assert(st.forms.join('|') === 'By formation|By goalkeeper|While each player is on the field|A closer look at one quarter', 'tables by formation, by goalkeeper, on the field, and a closer look at one quarter');
  const fRow = (await page.evaluate(() => Array.from(document.querySelectorAll('#trends .scrollx')[0].querySelectorAll('tbody tr')).map(r => Array.from(r.cells).map(c => c.textContent).join('|'))));
  // allowed per quarter divides by the quarters with opponent goals recorded (4 of 4-1-3's 8)
  assert(fRow.includes('4-1-3|8|5|2|0.6|0.5') && fRow.includes('3-3-2|4|2|1|0.5|0.3'),
    'by formation: 4-1-3 scored 5 in 8 quarters, allowed 2 in the 4 recorded; 3-3-2 scored 2, allowed 1 in 4: ' + fRow.join(' / '));
  if (shots) await page.locator('#trends').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + 'trends.png') });

  // ---------- a closer look at one quarter ----------
  const look = () => page.evaluate(() => ({
    tab: (document.querySelector('#trends .qlookpick [aria-selected="true"]') || {}).textContent,
    sum: document.querySelectorAll('#trends .trendsum')[1].textContent,
    games: Array.from(document.querySelectorAll('#trends .qgame')).map(x => x.querySelector('.qhead').textContent),
    lines: Array.from(document.querySelectorAll('#trends .qgame')).map(x => Array.from(x.querySelectorAll('.qline')).map(l => l.textContent)),
    h4: Array.from(document.querySelectorAll('#trends h4')).map(h => h.textContent),
    players: Array.from(document.querySelectorAll('#trends table.qplayers tbody tr')).map(r => Array.from(r.cells).map(c => c.textContent))
  }));
  let lk = await look();
  // Q1, Q3 and Q4 each allowed 1; the first of those is chosen to start
  assert(lk.tab === 'Q1', 'the closer look starts on the quarter with the most goals allowed: ' + lk.tab);
  await press('#trends .qlookpick button:nth-child(3)');
  lk = await look();
  assert(lk.tab === 'Q3' && /Q3 in 3 games: scored 2 \(0\.7 a game\), allowed 1 \(0\.5 a game, from the 2 recorded by quarter\)/.test(lk.sum),
    'picking Q3: 3 games, scored 2, allowed 1 from the 2 recorded: ' + lk.sum);
  // the other quarters: scored 5 in 9, allowed 2 in 6
  assert(/The other quarters: 0\.6 scored, 0\.3 allowed a game each/.test(lk.sum), 'it compares with the other quarters: ' + lk.sum);
  assert(lk.h4.join('|') === 'Game by game|Q3 by formation|Q3 by goalkeeper|Q3, each player: on the field or on the bench', 'sections: ' + lk.h4.join('|'));
  const expect = await page.evaluate(() => {
    const q = 2, out = { heads: [], players: {} };
    const games = S.games.filter(g => !g.planned).slice().sort((a, b) => a.date.localeCompare(b.date));
    games.forEach(g => {
      const f = FORMATIONS[g.formations && g.formations[q] || g.formation], row = g.plan[q], prev = g.plan[q - 1];
      const gk = row[f.pos.findIndex(p => p.z === 'G')];
      const field = row.filter((id, j) => id && f.pos[j].z !== 'G');
      const ga = Array.isArray(g.oppGoalsQ) ? g.oppGoalsQ[q] : null;
      let gf = 0; Object.keys(g.goals).forEach(id => { gf += g.goals[id][q] || 0; });
      out.heads.push({ opp: g.opp, gk: S.roster.find(p => p.id === gk).name, gf, ga, stayed: field.filter(id => prev.indexOf(id) >= 0).length, of: field.length,
        bench: S.roster.filter(p => row.indexOf(p.id) < 0).length });
      S.roster.forEach(p => {
        const s = out.players[p.name] = out.players[p.name] || { on: 0, off: 0, onGa: 0, onGaN: 0 };
        if (row.indexOf(p.id) >= 0) { s.on++; if (ga !== null) { s.onGa += ga; s.onGaN++; } } else { s.off++; }
      });
    });
    return out;
  });
  assert(lk.games.length === 3 && expect.heads.every((e, i) => lk.games[i].includes(e.opp) && lk.games[i].includes('GK ' + e.gk) &&
      lk.games[i].includes('Q3: us ' + e.gf + ', them ' + (e.ga === null ? '?' : e.ga)) && lk.games[i].includes(e.stayed + ' of ' + e.of + ' also played Q2')),
    'each game shows its opponent, keeper, Q3 score and how many also played Q2: ' + lk.games.join(' / '));
  assert(/3-3-2/.test(lk.games[2]) && /4-1-3/.test(lk.games[0]), 'each game shows the formation it used in Q3');
  assert(lk.lines[0][0].startsWith('Defense') && lk.lines[0].some(l => l.startsWith('Forwards')) &&
      expect.heads.every((e, i) => e.bench === 0 ? !lk.lines[i].some(l => l.startsWith('Bench')) : lk.lines[i].some(l => l.startsWith('Bench') && l.split(',').length === e.bench)),
    'lineups by line with spot names, and who sat: ' + lk.lines[0].join(' / '));
  assert(lk.players.length === 12 && lk.players.every(r => { const e = expect.players[r[0]];
      return Number(r[1]) === e.on && Number(r[2]) === e.off && r[4] === (e.onGaN ? (Math.round(e.onGa / e.onGaN * 10) / 10).toFixed(1) : '—'); }),
    'each player: Q3s on the field and on the bench, and goals allowed a game while on');
  assert(lk.players.some(r => /^(GK|D|M|F)/.test(r[3])), 'it shows where each player played in Q3');
  if (shots) await page.locator('#trends').screenshot({ path: path.join(shots, (setup.iphone ? 'iphone-' : '') + 'trends-q3.png') });
  // Open goes to that game on Q3
  await press('#trends .qgame:first-child button');
  st = await page.evaluate(() => ({ edit: ui.editId === S.games[0].id, q: ui.q }));
  assert(st.edit && st.q === 2, '"Open" opens that game on the Plan tab at Q3');
  await page.evaluate(() => { stopEditing(); showTab('season'); });

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
