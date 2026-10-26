// Feature tests for SoccerLineup. Serves the app the way GitHub Pages will
// and drives it the way a coach would.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (iPhone screen and touch, WebKit = Safari's engine)
const path = require('path');
const fs = require('fs');
const { startServer, browserSetup, root, APP_DIR } = require('./server');

const setup = browserSetup();
const shots = process.env.SHOTS_DIR || '';
const tag = setup.iphone ? 'iphone-' : '';

let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}

(async () => {
  const server = await startServer(0, '');
  const browser = await setup.type.launch();
  const context = await browser.newContext(setup.contextOptions);
  // These checks cover the download path; the phone share-sheet path has
  // its own test (tests/backup.test.js), so take sharing away here.
  await context.addInitScript(() => { try { delete Navigator.prototype.share; delete Navigator.prototype.canShare; } catch (e) {} });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  // the repository's front page forwards to the app
  await page.goto(server.base);
  await page.waitForURL(/\/frontend\/index\.html$/);
  assert(true, 'the front page forwards to the app');
  await page.goto(server.app);
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();

  // ---------- every formation fits on the pitch without overlapping ----------
  const layout = await page.evaluate(() => {
    const problems = [], names = Object.keys(FORMATIONS);
    names.forEach(name => {
      const f = FORMATIONS[name];
      if (f.pos.length !== f.n) problems.push(name + ': n=' + f.n + ' but ' + f.pos.length + ' positions');
      if (f.pos.filter(p => p.z === 'G').length !== 1) problems.push(name + ': needs exactly one keeper');
      const keys = f.pos.map(p => p.k);
      if (new Set(keys).size !== keys.length) problems.push(name + ': repeated position name');
      // screen boxes are 68x32 and printed name plates (with goal box) 95x34, both centred on the spot
      const boxes = [[68, 32, 0], [95, 34, 0]];
      boxes.forEach(([w, h, dx]) => {
        f.pos.forEach((a, i) => {
          const ax = a.x + dx;
          if (ax - w / 2 < 0 || ax + w / 2 > 320 || a.y - h / 2 < 0 || a.y + h / 2 > 400) problems.push(name + ' ' + a.k + ' off the pitch (' + w + 'w)');
          f.pos.forEach((b, j) => {
            if (j <= i) return;
            if (Math.abs(a.x - b.x) < w && Math.abs(a.y - b.y) < h) problems.push(name + ' ' + a.k + '/' + b.k + ' overlap (' + w + 'w)');
          });
        });
      });
    });
    return { names, problems };
  });
  assert(layout.problems.length === 0, 'all ' + layout.names.length + ' formations fit without overlap' + (layout.problems.length ? ': ' + layout.problems.join('; ') : ''));

  // ---------- roster of 11, two keepers ----------
  const names = [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],
    ['Fay','F','M'],['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M']];
  await page.evaluate((names) => {
    names.forEach((n, i) => {
      document.getElementById('newName').value = n[0];
      document.getElementById('newNum').value = String(i + 1);
      addPlayer();
      const p = S.roster[S.roster.length - 1];
      p.p1 = n[1]; p.p2 = n[2]; p.tier = (i % 3) + 1;
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2;
    save(); render();
  }, names);

  let st = await page.evaluate(() => ({ formations: S.current.formations.slice(), brand: document.getElementById('brandSub').textContent }));
  assert(st.formations.length === 4 && st.formations.every(f => f === '3-3-2'), 'new game starts with four quarters of 3-3-2');
  assert(st.brand.indexOf('9v9') === 0, 'header shows 9v9');

  await page.evaluate(() => autoFillAll());
  st = await page.evaluate(() => S.current.plan.map(r => r.filter(x => x > 0).length));
  assert(st.every(n => n === 9), 'auto-fill puts 9 on the field every quarter');

  // ---------- change one quarter's formation ----------
  await page.evaluate(() => { ui.q = 1; render(); });
  const before = await page.evaluate(() => S.current.plan[1].slice());
  const opts = await page.$$eval('#qFormation option', os => os.map(o => o.value));
  assert(opts.join(',') === '3-3-2,4-1-3,4-2-2,3-2-3,2-3-3,3-1-3-1,3-4-1,4-3-1', 'quarter menu lists the 9v9 formations: ' + opts.join(','));
  await page.selectOption('#qFormation', '4-1-3');
  st = await page.evaluate(() => ({
    formations: S.current.formations.slice(), row: S.current.plan[1].slice(),
    gkKeeps: canKeep(P(S.current.plan[1][0], S.current)),
    tabs: Array.from(document.querySelectorAll('#qtabs .qf')).map(e => e.textContent),
    allBtnHidden: document.getElementById('allFormBtn').hidden,
    slotLabels: Array.from(document.querySelectorAll('#pitchSvg .slotpos')).map(e => e.textContent).join(' '),
    changes: document.getElementById('prevChanges').textContent
  }));
  assert(st.formations.join(',') === '3-3-2,4-1-3,3-3-2,3-3-2', 'only quarter 2 changed formation');
  assert(st.row.slice().sort().join() === before.slice().sort().join(), 'the same nine players stay on the field');
  assert(st.gkKeeps, 'a keeper is still in goal');
  assert(st.tabs.join(',') === '3-3-2,4-1-3,3-3-2,3-3-2', 'quarter tabs show each formation');
  assert(st.allBtnHidden === false, '"All quarters" button shows when quarters differ');
  assert(st.slotLabels === 'GK SW LB RB STP CM LF ST RF', 'pitch draws the 4-1-3 positions');
  assert(st.changes.indexOf('Formation change') >= 0 && st.changes.indexOf('Moved position') < 0, 'previous-quarter panel shows the formation change instead of every move');
  if (shots) await page.screenshot({ path: path.join(shots, tag + 'plan.png') });

  await page.evaluate(() => autoFillQuarter());
  st = await page.evaluate(() => ({ n: S.current.plan[1].filter(x => x > 0).length, f: S.current.formations[1] }));
  assert(st.n === 9 && st.f === '4-1-3', 'auto-fill of quarter 2 keeps 4-1-3');

  // tap a sitting player, then a spot: the way it is used on a phone
  const press = sel => { const l = typeof sel === 'string' ? page.locator(sel) : sel; return setup.iphone ? l.tap() : l.click(); };
  await page.evaluate(() => { const r = curRow(); r[4] = 0; save(); render(); });
  const benchName = await page.evaluate(() => {
    const row = curRow();
    return presentRoster(G()).filter(p => row.indexOf(p.id) < 0).sort((a, b) => a.name.localeCompare(b.name))[0].name;
  });
  // phones show the sitting players above the pitch, wide screens beside it
  await press(page.locator('#benchStrip .chip, #benchLeft .chip').filter({ visible: true }).first());
  await press('#pitchSvg rect.slotbox[data-slot="4"]');
  st = await page.evaluate(() => nameOf(curRow()[4], G()));
  assert(st === benchName, (setup.iphone ? 'tapping' : 'clicking') + ' a sitting player then an empty spot puts her there');
  await press('#pitchSvg rect.slotbox[data-slot="4"]');
  await press('#pitchSvg rect.slotbox[data-slot="5"]');
  st = await page.evaluate(() => nameOf(curRow()[5], G()));
  assert(st === benchName, (setup.iphone ? 'tapping' : 'clicking') + ' two spots swaps those players');
  await page.evaluate(() => { undoLastChange(); undoLastChange(); });   // the swap, then the placement

  await page.evaluate(() => { undoLastChange(); undoLastChange(); });
  st = await page.evaluate(() => ({ f: S.current.formations.slice(), changes: document.getElementById('prevChanges').textContent }));
  assert(st.f.join(',') === '3-3-2,3-3-2,3-3-2,3-3-2', 'undo restores the formation');
  assert(st.changes.indexOf('Formation change') < 0, 'same formation again: no formation-change line');

  await page.selectOption('#qFormation', '3-2-3');
  await page.click('#allFormBtn');
  st = await page.evaluate(() => ({ f: S.current.formations.slice(), full: S.current.plan.map(r => r.filter(x => x > 0).length), hidden: document.getElementById('allFormBtn').hidden }));
  assert(st.f.every(f => f === '3-2-3') && st.full.every(n => n === 9), '"All quarters" copies 3-2-3 everywhere and keeps lineups full');
  assert(st.hidden === true, '"All quarters" hides once every quarter matches');

  await page.evaluate(() => { ui.q = 0; setQuarterFormation('2-3-3'); });
  const printSubs = await page.$$eval('#printSheet .psheet-head .sub', es => es.map(e => e.textContent));
  assert(printSubs[0].indexOf('2-3-3') > 0 && printSubs[1].indexOf('3-2-3') > 0, 'each printed page names its quarter\'s formation');

  // ---------- saving a game downloads a backup ----------
  let dl = page.waitForEvent('download');
  await page.evaluate(() => { S.current.oppGoals = 1; archiveGame(); });
  dl = await dl;
  const backup = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert(/SoccerLineup-backup-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()), 'saving a game downloads ' + dl.suggestedFilename());
  assert(backup.games.length === 1 && backup.games[0].formations.join(',') === '2-3-3,3-2-3,3-2-3,3-2-3', 'the backup holds the saved game and its formations');
  st = await page.evaluate(() => ({ fresh: S.current.formations.slice(), status: document.getElementById('backupStatus').textContent, cls: document.getElementById('backupStatus').className, box: document.getElementById('cfgAutoBackup').checked }));
  assert(st.fresh.every(f => f === '3-3-2'), 'the next game starts from the default formation');
  assert(st.status.indexOf('Last backup from this browser') === 0 && st.cls === 'hint' && st.box, 'Season tab shows when the last backup was made');

  await page.evaluate(() => { S.lastBackupAt = new Date(Date.now() - 20 * 86400000).toISOString(); render(); });
  st = await page.evaluate(() => ({ status: document.getElementById('backupStatus').textContent, cls: document.getElementById('backupStatus').className }));
  assert(st.cls === 'warn' && st.status.indexOf('20 days ago') > 0, 'a backup older than two weeks is flagged');

  await page.uncheck('#cfgAutoBackup');
  let downloads = 0; page.on('download', () => { downloads++; });
  await page.evaluate(() => { autoFillAll(); S.current.oppGoals = 0; archiveGame(); });
  await page.waitForTimeout(500);
  assert(downloads === 0 && (await page.evaluate(() => S.games.length)) === 2, 'with auto-backup off, saving downloads nothing');
  await page.check('#cfgAutoBackup');

  // restoring the downloaded backup brings the first game back
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  const dialogs = [];
  const onDialog = d => { dialogs.push(d.message()); d.accept(); };
  page.on('dialog', onDialog);            // first the "replace your data?" question, then the result
  await page.setInputFiles('#importFile', await dl.path());
  for (let t = 0; t < 50 && dialogs.length < 2; t++) { await page.waitForTimeout(100); }
  page.off('dialog', onDialog);
  const alertMsg = dialogs[1] || '(no result message)';
  assert(/1 saved game/.test(alertMsg), 'restoring the backup brings back the saved game: ' + alertMsg);

  // ---------- players on field ----------
  await page.evaluate(() => { showTab('setup'); });
  await page.selectOption('#cfgFormation', '4-1-3');
  st = await page.evaluate(() => ({ cfg: S.cfg.formation, cur: S.current.formations.slice(), saved: S.games[0].formations.slice() }));
  assert(st.cfg === '4-1-3' && st.cur.every(f => f === '4-1-3') && st.saved[0] === '2-3-3', 'default formation applies to the empty game, not saved games');

  const sizeOpts = await page.$$eval('#cfgSize option', os => os.map(o => o.value));
  assert(sizeOpts.join(',') === '11,9,8,7', 'players-on-field menu offers 11, 9, 8 and 7');
  await page.selectOption('#cfgSize', '8');
  st = await page.evaluate(() => Array.from(document.querySelectorAll('#cfgFormation option')).map(o => o.value).join(','));
  assert(st === '2-3-2,3-3-1,3-2-2', '8v8 formations: ' + st);
  await page.selectOption('#cfgSize', '7');
  st = await page.evaluate(() => ({ cfg: S.cfg.onField, f: S.cfg.formation, rows: S.current.plan.map(r => r.length), opts: Array.from(document.querySelectorAll('#cfgFormation option')).map(o => o.value).join(',') }));
  assert(st.cfg === 7 && st.f === '3-2-1' && st.rows.every(n => n === 7), '7v7 resets the game to seven-wide quarters');
  assert(st.opts === '3-2-1,2-3-1,2-1-2-1', '7v7 formations: ' + st.opts);
  await page.evaluate(() => { showTab('plan'); ui.q = 2; render(); });
  await page.selectOption('#qFormation', '2-1-2-1');
  await page.evaluate(() => autoFillAll());
  st = await page.evaluate(() => ({ full: S.current.plan.map(r => r.filter(x => x > 0).length), labels: Array.from(document.querySelectorAll('#pitchSvg .slotpos')).map(e => e.textContent).join(' ') }));
  assert(st.full.every(n => n === 7), '7v7 auto-fill fills seven every quarter');
  assert(st.labels === 'GK LB RB DM LAM RAM ST', 'a built formation draws its positions: ' + st.labels);

  await page.evaluate(() => { editGame(S.games[0].id); });
  st = await page.evaluate(() => ({ slots: document.querySelectorAll('#pitchSvg .slotbox').length, opts: document.querySelectorAll('#qFormation option').length }));
  assert(st.slots === 9 && st.opts === 8, 'an old 9v9 game still edits as 9v9 while Setup is 7v7');
  await page.evaluate(() => { clearQuarter(); });
  assert((await page.evaluate(() => G().plan[0].length)) === 9, 'clearing a quarter of that game keeps nine spots');
  await page.evaluate(() => { undoLastChange(); stopEditing(); });

  // ---------- older saves without per-quarter formations ----------
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem(KEY));
    delete raw.current.formations; delete raw.cfg.autoBackup;
    raw.games.forEach(g => { delete g.formations; });
    localStorage.setItem(KEY, JSON.stringify(raw));
  });
  await page.reload();
  st = await page.evaluate(() => ({ cur: S.current.formations.slice(), saved: S.games[0].formations.slice(), savedForm: S.games[0].formation, auto: S.cfg.autoBackup }));
  assert(st.cur.length === 4 && st.saved.every(f => f === st.savedForm), 'older saves get one formation per quarter');
  assert(st.auto === true, 'older saves get auto-backup turned on');

  if (shots) { await page.evaluate(() => { showTab('season'); }); await page.screenshot({ path: path.join(shots, tag + 'season.png'), fullPage: true }); }
  if (!setup.iphone) await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { showTab('plan'); ui.q = 1; render(); });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  assert(!overflow, 'no sideways scrolling at phone width');
  if (shots) await page.screenshot({ path: path.join(shots, tag + 'phone.png') });

  // a laptop can still open index.html straight from a folder
  if (!setup.iphone) {
    const local = await context.newPage();
    await local.goto('file://' + path.join(root, 'index.html'));
    await local.waitForURL(/\/frontend\/index\.html$/);
    const ok = await local.evaluate(() => typeof S === 'object' && document.querySelectorAll('#qtabs button').length > 0);
    assert(ok, 'index.html opened straight from a folder still works');
    await local.close();
  }

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (app, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
