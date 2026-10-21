// Season features: goalkeepers by halves, the two-lines limit, "left the
// game", planned games, notes from earlier games against the same opponent,
// and the "Positions played" table.
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
  const dialogs = [];
  page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 12 players, two keepers (GK 1 Ava, GK 2 Hal), 4-1-3
  await page.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M'],['Lu','F','D']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2;
    S.cfg.team = 'Panthers';
    setDefaultFormation('4-1-3');
    save(); render();
  });
  const keeperRow = () => page.evaluate(() => S.current.plan.map((row, q) => {
    const f = qForm(S.current, q), i = f.pos.findIndex(p => p.z === 'G'); return nameOf(row[i], S.current);
  }).join(' '));
  const lineCheck = () => page.evaluate(() => {
    const g = G(), lines = {};
    g.plan.forEach((row, q) => row.forEach((id, i) => {
      const z = qForm(g, q).pos[i].z; if (!id || z === 'G') return;
      (lines[id] = lines[id] || new Set()).add(lineGroup(z));
    }));
    return Math.max(...Object.values(lines).map(s => s.size));
  });

  // ---------- goalkeepers ----------
  assert((await page.evaluate(() => S.cfg.keeperPlan)) === 'halves', 'goalkeepers switch at halftime by default');
  await page.evaluate(() => autoFillAll());
  assert((await keeperRow()) === 'Ava Ava Hal Hal', 'GK 1 keeps the first half and GK 2 the second');
  assert((await lineCheck()) <= 2, 'nobody plays more than two lines (defense, midfield, forward) in a game');
  await page.evaluate(() => { S.current.oppGoals = 1; archiveGame(); });
  await page.evaluate(() => { showTab('plan'); autoFillAll(); });
  assert((await keeperRow()) === 'Ava Ava Hal Hal', 'GK 1 takes the first half again next game');
  await page.evaluate(() => showTab('setup'));
  await page.selectOption('#cfgKeeper', 'turns');
  await page.evaluate(() => { showTab('plan'); autoFillAll(); });
  assert((await keeperRow()) === 'Hal Hal Ava Ava', '"taking turns": the keeper who has started fewer games takes the first half');
  await page.evaluate(() => showTab('setup'));
  await page.selectOption('#cfgKeeper', 'middle');
  await page.evaluate(() => { showTab('plan'); autoFillAll(); });
  assert((await keeperRow()) === 'Ava Hal Hal Ava', 'the other choice: GK 1 starts and finishes, GK 2 the middle');
  await page.evaluate(() => showTab('setup'));
  await page.selectOption('#cfgKeeper', 'halves');
  await page.evaluate(() => showTab('plan'));

  // ---------- the two-lines limit over many games and mixed formations ----------
  const worst = await page.evaluate(() => {
    let most = 0;
    for (let k = 0; k < 6; k++) {
      S.current.formations = ['4-1-3', '3-3-2', '3-2-3', '2-3-3'].map((f, q) => ['4-1-3', '3-3-2', '3-2-3', '2-3-3', '3-1-3-1', '3-4-1'][(k + q) % 6]);
      autoFillAll();
      const g = G(), lines = {};
      g.plan.forEach((row, q) => row.forEach((id, i) => { const z = qForm(g, q).pos[i].z; if (id && z !== 'G') (lines[id] = lines[id] || new Set()).add(lineGroup(z)); }));
      most = Math.max(most, ...Object.values(lines).map(s => s.size));
      S.current.oppGoals = 0; S.current.opp = 'Practice ' + k; archiveGame(); showTab('plan');
    }
    return most;
  });
  assert(worst <= 2, 'over six games with mixed formations, nobody gets a third line (most: ' + worst + ')');

  // ---------- left the game ----------
  await page.evaluate(() => { S.current.formations = defaultFormations(4, '4-1-3'); autoFillAll(); });
  const gia = await page.evaluate(() => S.roster.find(p => p.name === 'Gia').id);
  await page.selectOption('#leftWho', String(gia));
  await page.selectOption('#leftFrom', '2');
  await (setup.iphone ? page.tap('button:has-text("Mark")') : page.click('button:has-text("Mark")'));
  let st = await page.evaluate((id) => ({
    q3: S.current.plan[2].includes(id), q4: S.current.plan[3].includes(id), chip: document.getElementById('leftChips').textContent,
    status: document.getElementById('gameStatus').textContent
  }), gia);
  assert(!st.q3 && !st.q4 && /Gia . left from Q3/.test(st.chip), 'marking "left the game from Q3" takes her off Q3 and Q4');
  assert(/left the game: Gia from Q3/.test(st.status), 'the game status line mentions who left');
  await page.evaluate(() => { ui.q = 2; render(); autoFillQuarter(); ui.q = 3; render(); autoFillQuarter(); });
  st = await page.evaluate((id) => ({
    placed: S.current.plan[2].includes(id) || S.current.plan[3].includes(id),
    bench: document.getElementById('benchStrip').textContent.includes('Gia'),
    full: S.current.plan.map(r => r.filter(x => x).length).join(),
    row: Array.from(document.querySelectorAll('#planSits tr')).find(tr => tr.textContent.includes('Gia')).textContent
  }), gia);
  assert(!st.placed && !st.bench, 'auto-fill and the bench leave her out after she left');
  assert(st.full === '9,9,9,9', 'every quarter is still full');
  assert(/left from Q3/.test(st.row), 'the quarters table notes she left');
  await page.evaluate(() => undoLastChange());
  await page.evaluate(() => undoLastChange());
  await page.evaluate(() => undoLastChange());
  assert((await page.evaluate((id) => leftFrom(S.current, id))) === -1, 'undo takes "left the game" back');
  await page.selectOption('#leftWho', String(gia));
  await page.selectOption('#leftFrom', '2');
  await page.click('button:has-text("Mark")');
  await page.evaluate(() => { ui.q = 2; autoFillQuarter(); ui.q = 3; autoFillQuarter(); });
  const printText = await page.evaluate(() => document.getElementById('printSheet').textContent);
  assert(/LEFT: Gia \(Q3\)/.test(printText), 'the printed sheets show who left');
  const before = await page.evaluate((id) => seasonTotals()[id], gia);
  await page.evaluate(() => { S.current.oppGoals = 2; S.current.opp = 'Wolfe'; S.current.notes = 'Wolfe: watch number 9, very fast'; archiveGame(); });
  const after = await page.evaluate((id) => seasonTotals()[id], gia);
  assert(after.availQ - before.availQ === 2 && after.satQ === before.satQ + (2 - (after.qtrs - before.qtrs)), 'her season totals count only the two quarters before she left');

  // ---------- notes from earlier games against the same opponent ----------
  await page.evaluate(() => showTab('plan'));
  await page.fill('#fOpp', ' wolfe ');
  await page.press('#fOpp', 'Tab');
  st = await page.evaluate(() => ({ hidden: document.getElementById('oppNotes').hidden, text: document.getElementById('oppNotes').textContent }));
  assert(!st.hidden && /earlier games against wolfe/i.test(st.text) && /watch number 9/.test(st.text), 'planning another Wolfe game shows the notes from the last one');
  await page.fill('#fOpp', 'Someone new');
  await page.press('#fOpp', 'Tab');
  assert(await page.evaluate(() => document.getElementById('oppNotes').hidden), 'a new opponent shows no earlier notes');

  // ---------- planned games ----------
  const gamesBefore = await page.evaluate(() => ({ played: playedGames().length, avail: seasonTotals()[S.roster[1].id].availQ }));
  await page.evaluate(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    S.current.date = d.toISOString().slice(0, 10); S.current.opp = 'Schoenrock'; autoFillAll(); archiveGame();
  });
  assert(/Save it as a planned game/.test(dialogs[dialogs.length - 1]), 'saving a game dated after today asks to save it as planned');
  st = await page.evaluate(() => ({ planned: S.games[S.games.length - 1].planned, played: playedGames().length,
    avail: seasonTotals()[S.roster[1].id].availQ, list: document.getElementById('gameList').textContent }));
  assert(st.planned && st.played === gamesBefore.played && st.avail === gamesBefore.avail, 'a planned game doesn\'t count toward season totals');
  assert(/Planned/.test(st.list) && /Mark played/.test(st.list), 'the games list shows it as planned with a Mark played button');
  await page.evaluate(() => editGame(S.games[S.games.length - 1].id));
  assert(/planned game/.test(await page.textContent('#editBanner')), 'opening it says it is a planned game');
  await page.fill('#fOppGoals', '3');
  await page.press('#fOppGoals', 'Tab');
  st = await page.evaluate(() => ({ planned: S.games[S.games.length - 1].planned, played: playedGames().length }));
  assert(!st.planned && st.played === gamesBefore.played + 1, 'entering the opponent\'s score marks it played');
  await page.evaluate(() => { setPlayed(S.games[S.games.length - 1].id, false); stopEditing(); showTab('season'); });
  await page.click('#gameList button:has-text("Mark played")');
  assert((await page.evaluate(() => playedGames().length)) === gamesBefore.played + 1, 'Mark played counts it');

  // an older save: a future-dated game with no score becomes planned
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(KEY));
    const d = new Date(); d.setDate(d.getDate() + 5);
    raw.games.forEach(g => { delete g.planned; });
    raw.games[raw.games.length - 1].date = d.toISOString().slice(0, 10);
    raw.games[raw.games.length - 1].oppGoals = null;
    raw.games[raw.games.length - 1].goals = {};
    localStorage.setItem(KEY, JSON.stringify(raw));
  });
  await page.reload();
  st = await page.evaluate(() => S.games.map(g => !!g.planned));
  assert(st[st.length - 1] === true && st.slice(0, -1).every(x => !x), 'an older save\'s unplayed future game is treated as planned');

  // ---------- positions played ----------
  await page.evaluate(() => {
    const kim = S.roster.find(p => p.name === 'Kim'); kim.p1 = 'D'; kim.p2 = 'D';
    // five played games with Kim at forward (on top of her earlier defense quarters)
    [0, 1, 2, 3, 4].forEach(k => {
      const g = JSON.parse(JSON.stringify(S.games[0]));
      g.id = S.nextGameId++; g.planned = false; g.date = '2026-01-0' + (k + 1);
      g.plan.forEach((row, q) => {
        const f = qForm(g, q), fi = f.pos.findIndex(p => p.z === 'F');
        for (let i = 0; i < row.length; i++) if (row[i] === kim.id) row[i] = 0;
        row[fi] = kim.id;
      });
      S.games.push(g);
    });
    save(); showTab('season');
  });
  st = await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll('#positionStats tr')).find(tr => tr.textContent.startsWith('Kim'));
    return { rows: document.querySelectorAll('#positionStats tbody tr').length, kim: row ? row.textContent : '' };
  });
  assert(st.rows === 12, 'Positions played lists every player');
  assert(/secondary is the same as primary/.test(st.kim) && /plays forward often/.test(st.kim), 'it flags a player who often plays a line her settings don\'t cover: ' + st.kim.slice(0, 120));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!overflow, 'the Season tab has no sideways scrolling at this width');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (season features, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
