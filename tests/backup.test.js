// Backups on a phone go through the share sheet (Save to Files, AirDrop,
// Mail), since iPhone Safari may block a download a page starts. A stand-in
// share sheet records what would be shared and can act like the user
// cancelling or the phone refusing. Computers still download.
// Run with: npm test            (Chromium)
//           npm run test:iphone (WebKit)
const fs = require('fs');
const { startServer, browserSetup } = require('./server');

const setup = browserSetup();
let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function openApp(browser, options, server) {
  const context = await browser.newContext({ ...options, acceptDownloads: true });
  await context.addInitScript(() => {
    window.__shared = []; window.__shareMode = 'ok'; window.__canShareFiles = true;
    Navigator.prototype.canShare = function (d) { return !!(d && d.files && d.files.length) && window.__canShareFiles; };
    Navigator.prototype.share = function (d) {
      window.__shared.push(d);
      if (window.__shareMode === 'abort') return Promise.reject(new DOMException('The user closed it', 'AbortError'));
      if (window.__shareMode === 'refused') return Promise.reject(new DOMException('Needs a tap', 'NotAllowedError'));
      return Promise.resolve();
    };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.goto(server.app);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => {
    ['Ava','Bea','Cat','Dee','Eve','Fay','Gia','Hal','Ivy','Jo','Kim'].forEach((n, i) => S.roster.push({ id: S.nextId++, name: n, num: String(i + 1), tier: 2, p1: i === 0 ? 'G' : 'D', p2: 'M', gkOrder: i === 0 ? 1 : 0 }));
    S.cfg.team = 'Panthers'; save(); render();
  });
  return { page, errors };
}

(async () => {
  const server = await startServer(0, '');
  const browser = await setup.type.launch();
  const phoneOptions = setup.iphone ? setup.contextOptions : { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
  const { page, errors } = await openApp(browser, phoneOptions, server);
  const press = sel => (setup.iphone || phoneOptions.hasTouch) ? page.tap(sel) : page.click(sel);
  let downloads = 0; page.on('download', () => { downloads++; });

  assert(await page.evaluate(() => matchMedia('(pointer: coarse)').matches), 'the phone has a touch screen (coarse pointer)');
  await page.evaluate(() => showTab('season'));
  assert((await page.textContent('#backupBtn')) === 'Save backup', 'on a phone the button says "Save backup"');
  assert(/Offer to save a backup every time/.test(await page.textContent('#autoBackupRow')), 'the automatic option offers a backup instead of downloading');

  // saving a game: a "Save backup" button appears instead of a download
  await page.evaluate(() => { showTab('plan'); autoFillAll(); S.current.oppGoals = 1; archiveGame(); });
  await sleep(600);
  assert(downloads === 0, 'saving a game on a phone downloads nothing (Safari may block it)');
  assert(await page.isVisible('#backupToast') && /Game saved/.test(await page.textContent('#backupToast')), 'it offers "Game saved. Save a backup copy?"');
  await press('#backupToast button:has-text("Save backup")');
  await page.waitForFunction(() => window.__shared.length === 1);
  const shared = await page.evaluate(async () => {
    const f = window.__shared[0].files[0];
    return { name: f.name, type: f.type, text: await f.text(), last: S.lastBackupAt, toast: document.getElementById('backupToast').hidden };
  });
  const data = JSON.parse(shared.text);
  assert(/^Panthers-SoccerLineup-backup-\d{4}-\d\d-\d\d\.json$/.test(shared.name) && shared.type === 'application/json', 'the share sheet gets the backup file: ' + shared.name);
  assert(data.games.length === 1 && data.roster.length === 11 && data.backupInfo.app === 'SoccerLineup', 'the file holds the whole season');
  assert(!!shared.last && shared.toast, 'once shared, the last-backup date is recorded and the button goes away');
  await page.evaluate(() => showTab('season'));
  assert(/Last backup from this browser/.test(await page.textContent('#backupStatus')), 'the Season tab shows the new backup date');

  // the user closes the share sheet without saving
  const lastBefore = await page.evaluate(() => S.lastBackupAt);
  await page.evaluate(() => { window.__shareMode = 'abort'; S.lastBackupAt = null; save(); render(); });
  await press('#backupBtn');
  await page.waitForFunction(() => window.__shared.length === 2);
  await sleep(200);
  let st = await page.evaluate(() => ({ last: S.lastBackupAt, toast: document.getElementById('backupToast').hidden }));
  assert(st.last === null && st.toast, 'closing the share sheet records no backup and nags no further');

  // the phone refuses (it wants a fresh tap): the button comes back
  await page.evaluate(() => { window.__shareMode = 'refused'; });
  await press('#backupBtn');
  await page.waitForFunction(() => !document.getElementById('backupToast').hidden);
  assert(/Tap Save backup/.test(await page.textContent('#backupToast')), 'if the phone refuses, a "Save backup" button asks for a fresh tap');
  await page.evaluate(() => { window.__shareMode = 'ok'; });
  await press('#backupToast button:has-text("Save backup")');
  await page.waitForFunction(() => !!S.lastBackupAt);
  assert(true, 'tapping it saves the backup');

  // a phone that can't share files falls back to downloading
  await page.evaluate(() => { window.__canShareFiles = false; render(); });
  assert((await page.textContent('#backupBtn')) === 'Download backup', 'a phone that can\'t share files gets "Download backup"');
  const dl = page.waitForEvent('download');
  await press('#backupBtn');
  assert(/\.json$/.test((await dl).suggestedFilename()), 'and downloads the file instead');

  // restoring the shared file brings the season back
  const file = require('path').join(require('os').tmpdir(), 'soccerlineup-shared-backup.json');
  fs.writeFileSync(file, shared.text);
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  await page.setInputFiles('#importFile', file);
  await page.waitForFunction(() => S.games.length === 1);
  assert(true, 'restoring the shared file brings the season back');

  // a computer (mouse, no touch) still downloads, even where sharing exists
  if (!setup.iphone) {
    const desk = await openApp(browser, { viewport: { width: 1200, height: 900 } }, server);
    await desk.page.evaluate(() => showTab('season'));
    assert((await desk.page.textContent('#backupBtn')) === 'Download backup', 'on a computer the button still says "Download backup"');
    const d2 = desk.page.waitForEvent('download');
    await desk.page.evaluate(() => { showTab('plan'); autoFillAll(); S.current.oppGoals = 0; archiveGame(); });
    assert(/\.json$/.test((await d2).suggestedFilename()) && (await desk.page.evaluate(() => window.__shared.length)) === 0, 'and saving a game downloads the backup as before');
    errors.push(...desk.errors);
  }

  // wording works for any team
  const html = fs.readFileSync(require('path').join(__dirname, '..', 'custom_components/soccerlineup/frontend/index.html'), 'utf8');
  assert(!/\b(her|she)\b/i.test(html.replace(/<!--[\s\S]*?-->/g, '')), 'the page\'s text no longer assumes a girls\' team');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (phone backups, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
