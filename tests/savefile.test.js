// Backups saved straight to a file (Chrome and Edge on a computer, from an
// https:// address): choose the file once, then each backup replaces it with
// no download. Anything that goes wrong falls back to a download whose name
// has the time in it. The browser's file picker is stood in for here.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (same checks in WebKit)
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
  // a computer: no share sheet, a mouse
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 }, acceptDownloads: true });
  await context.addInitScript(() => {
    try { delete Navigator.prototype.share; delete Navigator.prototype.canShare; } catch (e) {}
    window.__picks = []; window.__files = {}; window.__writes = 0; window.__perm = 'granted'; window.__grant = 'granted'; window.__asked = 0; window.__pickMode = 'ok';
    let n = 0;
    window.showSaveFilePicker = async opts => {
      window.__picks.push(opts.suggestedName);
      if (window.__pickMode === 'abort') throw new DOMException('Closed the dialog', 'AbortError');
      if (window.__pickMode === 'broken') throw new DOMException('Not allowed here', 'SecurityError');
      const name = n++ ? 'Other-' + opts.suggestedName : opts.suggestedName;
      return {
        kind: 'file', name,
        queryPermission: async () => window.__perm,
        requestPermission: async () => { window.__asked++; return window.__grant; },
        createWritable: async () => { let buf = ''; return { write: async t => { buf = t; }, close: async () => { window.__files[name] = buf; window.__writes++; } }; }
      };
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  let downloads = [];
  page.on('download', d => downloads.push(d.suggestedFilename()));
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => {
    ['Ava', 'Bea', 'Cat', 'Dee', 'Eve', 'Fay', 'Gia', 'Hal', 'Ivy', 'Jo'].forEach((n, i) => S.roster.push({ id: S.nextId++, name: n, num: String(i + 1), tier: 2, p1: i ? 'D' : 'G', p2: '', gkOrder: i ? 0 : 1 }));
    S.cfg.team = 'Panthers'; save(); render(); showTab('season');
  });
  const state = () => page.evaluate(() => ({ picks: window.__picks.slice(), writes: window.__writes, files: Object.keys(window.__files), asked: window.__asked,
    btn: document.getElementById('backupBtn').textContent, other: !document.getElementById('backupOtherBtn').hidden, how: document.getElementById('backupHow').textContent,
    status: document.getElementById('backupStatus').textContent }));

  let st = await state();
  assert(st.btn === 'Save backup…' && !st.other && /Choose where to keep the backup file once/.test(st.how), 'on a computer that can save files, the button is "Save backup…" and says it asks once');

  await page.click('#backupBtn');
  await page.waitForFunction(() => window.__writes === 1);
  st = await state();
  const name = st.files[0];
  assert(st.picks.length === 1 && st.picks[0] === 'Panthers-SoccerLineup-backup.json', 'the first backup asks where to save it, suggesting a name with no date (the file gets replaced): ' + st.picks[0]);
  const saved = JSON.parse(await page.evaluate(n => window.__files[n], name));
  assert(saved.roster.length === 10 && saved.backupInfo.app === 'SoccerLineup', 'the whole season is written to that file');
  assert(st.btn === 'Save backup to ' + name && st.other && /Each backup replaces/.test(st.how) && /Last backup from this browser/.test(st.status), 'the button now says "Save backup to ' + name + '"');

  await page.evaluate(() => { S.cfg.team = 'Panthers'; S.roster[0].name = 'Ava B'; save(); });
  await page.click('#backupBtn');
  await page.waitForFunction(() => window.__writes === 2);
  st = await state();
  assert(st.picks.length === 1 && st.files.length === 1 && /Ava B/.test(await page.evaluate(n => window.__files[n], name)), 'the next backup replaces the same file: no dialog, no download');

  // the browser forgot the permission (a new visit): it asks, once
  await page.evaluate(() => { window.__perm = 'prompt'; });
  await page.click('#backupBtn');
  await page.waitForFunction(() => window.__writes === 3);
  st = await state();
  assert(st.asked === 1 && st.picks.length === 1, 'when the browser needs permission again it asks to allow it, without the Save dialog');

  // permission refused: choose a file again
  await page.evaluate(() => { window.__grant = 'denied'; });
  await page.click('#backupBtn');
  await page.waitForFunction(() => window.__writes === 4);
  st = await state();
  assert(st.picks.length === 2 && st.files.length === 2, 'if permission is refused, it asks where to save instead');
  await page.evaluate(() => { window.__perm = 'granted'; });

  // a different file
  await page.click('#backupOtherBtn');
  await page.waitForFunction(() => window.__writes === 5);
  assert((await state()).picks.length === 3, '"Different file…" asks where to save again');

  // closing the dialog does nothing
  await page.evaluate(() => { window.__pickMode = 'abort'; });
  await page.click('#backupOtherBtn');
  await page.waitForTimeout(300);
  st = await state();
  assert(st.writes === 5 && downloads.length === 0, 'closing the Save dialog saves nothing and downloads nothing');

  // anything else goes wrong: an ordinary download, with the time in its name
  await page.evaluate(() => { window.__pickMode = 'broken'; });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#backupOtherBtn')]);
  assert(/^Panthers-SoccerLineup-backup-\d{4}-\d\d-\d\d-\d{4}\.json$/.test(dl.suggestedFilename()), 'if saving to a file fails, it downloads instead, named with the time: ' + dl.suggestedFilename());

  // saving a game with auto-backup on writes the file too
  await page.evaluate(() => { window.__pickMode = 'ok'; showTab('plan'); S.current.opp = 'Wolfe'; autoFillAll(); setOpponentGoals('1'); render(); });
  const before = (await state()).writes;
  await page.click('#archiveBtn');
  await page.waitForFunction(b => window.__writes === b + 1, before);
  assert((await state()).writes === before + 1, 'saving a game writes the backup file (auto-backup)');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (backup to a file, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
