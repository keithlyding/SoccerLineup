// SoccerLineup inside Home Assistant: a laptop and a phone open at once on
// one shared server. Uses the real panel (soccerlineup-panel.js) and the real
// app; the server is a stand-in that follows the same rules as the Python
// one in custom_components/soccerlineup/store.py (tested against real Home
// Assistant in tests/test_integration.py), and can take a device offline.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (iPhone screen and touch, WebKit)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { startServer, browserSetup } = require('./server');

const setup = browserSetup();
let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
let explain = null;   // set once the devices exist: describes their sync state on a timeout
async function until(fn, what, ms = 8000) {
  const end = Date.now() + ms;
  for (;;) {
    try { if (await fn()) return; } catch (e) { /* not ready yet */ }
    if (Date.now() > end) {
      const state = explain ? await explain().catch(e => 'could not read: ' + e.message) : '';
      throw new Error('FAILED: timed out waiting for ' + what + (state ? '. State: ' + state : ''));
    }
    await sleep(100);
  }
}

// ---------- the stand-in Home Assistant server ----------
const HAS = { rev: 0, data: null, saved_at: null, saved_by: null, history: [], devices: new Map(), nextId: 1 };
function snapshot() { return { rev: HAS.rev, data: HAS.data, saved_at: HAS.saved_at, saved_by: HAS.saved_by }; }
function record(rev, data, who, reason) {
  HAS.history.push({ id: 'v' + (HAS.nextId++), rev, saved_at: new Date().toISOString(), saved_by: who,
    games: (data.games || []).length, reason, data: JSON.parse(JSON.stringify(data)) });
}
function announce(clientId) {
  const ev = { ...snapshot(), client_id: clientId || null };
  for (const dev of HAS.devices.values()) {
    if (dev.offline) continue;
    for (const id of dev.subs) setTimeout(() => dev.page.evaluate(([i, e]) => window.deliver(i, e), [id, ev]).catch(() => {}), 0);
  }
}
function handle(dev, msg) {
  switch (msg.type) {
    case 'offline': dev.offline = true; return { result: null };
    case 'online': dev.offline = false; return { result: null };
    case 'unsubscribe': dev.subs.delete(msg.sub_id); return { result: null };
    case 'soccerlineup/subscribe': {
      dev.subs.add(msg.sub_id);
      const ev = { ...snapshot(), client_id: null };
      // eventDelay: the first update after (re)connecting arrives late, like on a slow network
      setTimeout(() => dev.page.evaluate(([i, e]) => window.deliver(i, e), [msg.sub_id, ev]).catch(() => {}), dev.eventDelay || 0);
      return { result: null };
    }
    case 'soccerlineup/get': return { result: snapshot() };
    case 'soccerlineup/save': {
      if (!msg.data || typeof msg.data.cfg !== 'object' || !Array.isArray(msg.data.roster)) return { error: { code: 'invalid', message: 'bad' } };
      if (!msg.force && msg.base_rev !== HAS.rev) return { error: { code: 'conflict', message: 'The season was changed on another device.' } };
      if (HAS.data && (msg.force || msg.checkpoint)) record(HAS.rev, HAS.data, HAS.saved_by, msg.checkpoint || 'replaced');
      HAS.data = msg.data; HAS.rev++; HAS.saved_at = new Date().toISOString(); HAS.saved_by = dev.who;
      announce(msg.client_id);
      return { result: { rev: HAS.rev, saved_at: HAS.saved_at } };
    }
    case 'soccerlineup/history':
      return { result: { versions: HAS.history.slice().reverse().map(({ data, ...rest }) => rest) } };
    case 'soccerlineup/keep_version':
      record(null, msg.data, dev.who, 'not kept');
      // keepDelay: a slow reply, so other messages arrive while the app waits for it
      return dev.keepDelay ? new Promise(r => setTimeout(() => r({ result: null }), dev.keepDelay)) : { result: null };
    case 'soccerlineup/restore': {
      const v = HAS.history.find(x => x.id === msg.version);
      if (!v) return { error: { code: 'not_found', message: 'That version is no longer kept.' } };
      record(HAS.rev, HAS.data, HAS.saved_by, 'before restore');
      HAS.data = JSON.parse(JSON.stringify(v.data)); HAS.rev++; HAS.saved_at = new Date().toISOString(); HAS.saved_by = dev.who;
      announce(null);
      return { result: { rev: HAS.rev } };
    }
  }
  return { error: { code: 'unknown_command', message: msg.type } };
}

(async () => {
  const server = await startServer(0, '');
  const browser = await setup.type.launch();
  const errors = [];

  async function openDevice(who, narrow, options) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const dev = { who, page, subs: new Set(), offline: false };
    HAS.devices.set(who, dev);
    page.on('pageerror', e => errors.push(who + ': ' + e.message));
    await page.exposeFunction('fakeHA', async raw => JSON.stringify(await handle(dev, JSON.parse(raw))));
    await page.goto(server.base + 'tests/fake_ha.html?who=' + who + (narrow ? '&narrow=1' : ''));
    let frame = null;
    await until(async () => {
      frame = page.frames().find(f => f.url().includes('/frontend/index.html'));
      return frame && await frame.evaluate(() => typeof S === 'object' && !!HA);
    }, who + "'s app to start in Home Assistant mode");
    dev.frame = frame;
    return dev;
  }
  const status = dev => dev.frame.evaluate(() => document.getElementById('syncState').textContent);
  const opp = dev => dev.frame.evaluate(() => S.current.opp);

  const phoneOptions = setup.iphone ? setup.contextOptions : { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };
  const laptop = await openDevice('Laptop', false, { viewport: { width: 1200, height: 900 }, acceptDownloads: true });
  const frameBox = await laptop.page.locator('soccerlineup-panel iframe').boundingBox();
  assert(frameBox && frameBox.height >= 890, 'the app fills the window\'s height even when the page gives the panel none (' + Math.round(frameBox.height) + ' px)');
  await until(async () => HAS.rev === 1, 'the first version to reach the server');
  assert((await status(laptop)) === 'Saved on Home Assistant', 'the laptop shows "Saved on Home Assistant"');

  // ---------- restore a backup file into Home Assistant ----------
  const backup = await laptop.frame.evaluate(() => {
    [['Ava','G','D'],['Bea','D','M'],['Cat','D',''],['Dee','M','D'],['Eve','M','F'],['Fay','F','M'],
     ['Gia','F',''],['Hal','D','G'],['Ivy','M',''],['Jo','F','M'],['Kim','D','M']].forEach((n, i) => {
      S.roster.push({ id: S.nextId++, name: n[0], num: String(i + 1), tier: (i % 3) + 1, p1: n[1], p2: n[2], gkOrder: 0 });
    });
    S.roster[0].gkOrder = 1; S.roster[7].gkOrder = 2; S.cfg.team = 'Panthers';
    const copy = JSON.stringify(S);
    freshState();
    return copy;
  });
  const file = path.join(os.tmpdir(), 'soccerlineup-ha-backup.json');
  fs.writeFileSync(file, backup);
  const dialogs = [];
  laptop.page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
  const revBefore = HAS.rev;
  await laptop.frame.setInputFiles('#importFile', file);
  await until(async () => HAS.rev > revBefore && HAS.data.roster.length === 11, 'the restored backup to reach the server');
  assert(/replace the season on Home Assistant for every device/.test(dialogs[0]), 'restoring a file warns it replaces the season for every device');
  assert(HAS.history.some(v => v.reason === 'import'), 'the season before the restore is kept in history');

  // ---------- a second device sees it, and changes flow both ways ----------
  const phoneDialogs = [];
  const phone = await openDevice('Phone', true, phoneOptions);
  explain = async () => JSON.stringify({
    server: { rev: HAS.rev, opp: HAS.data && HAS.data.current.opp },
    phone: await phone.frame.evaluate(() => ({ rev: sync.rev, pending: sync.pending, inFlight: sync.inFlight, resolving: sync.resolving,
      skipped: !!sync.skipped, status: sync.status, opp: S.current.opp })),
    laptop: await laptop.frame.evaluate(() => ({ rev: sync.rev, pending: sync.pending, status: sync.status, opp: S.current.opp })),
    phoneDialogs: phoneDialogs.length
  });
  await until(async () => (await phone.frame.evaluate(() => S.roster.length)) === 11, 'the phone to load the season');
  assert((await phone.frame.evaluate(() => S.cfg.team)) === 'Panthers', 'the phone shows the same season as the laptop');

  await phone.frame.fill('#fOpp', 'Wolves');
  await phone.frame.press('#fOpp', 'Tab');
  await until(async () => (await opp(laptop)) === 'Wolves', 'the phone\'s change to reach the laptop');
  assert(true, 'a change on the phone shows up on the laptop');

  let downloads = 0; laptop.page.on('download', () => { downloads++; });
  await laptop.frame.evaluate(() => { autoFillAll(); S.current.oppGoals = 2; archiveGame(); });
  await until(async () => (await phone.frame.evaluate(() => S.games.length)) === 1, 'the saved game to reach the phone');
  assert(downloads === 0, 'saving a game in Home Assistant downloads no file (the server keeps it)');
  assert((await phone.frame.evaluate(() => S.games[0].plan.map(r => r.filter(x => x).length).join())) === '9,9,9,9', 'the phone gets the full lineups of the saved game');

  // ---------- the Home Assistant menu button ----------
  assert(await laptop.frame.isHidden('#haMenu'), 'no menu button on a wide screen (the sidebar is visible)');
  assert(await phone.frame.isVisible('#haMenu'), 'a menu button on the phone, where the sidebar is hidden');
  await (setup.iphone ? phone.frame.tap('#haMenu') : phone.frame.click('#haMenu'));
  assert((await phone.page.evaluate(() => window.menuToggles)) === 1, 'the menu button opens Home Assistant\'s sidebar');

  // ---------- offline, then back: nothing else changed ----------
  await phone.page.evaluate(() => goOffline());
  await phone.frame.evaluate(() => setGameField('opp', 'Offline edit'));
  await sleep(600);
  assert((await status(phone)) === 'Offline — changes will be sent', 'offline, the phone says its changes will be sent');
  assert(HAS.data.current.opp !== 'Offline edit', 'offline changes stay on the phone until it reconnects');
  phone.page.on('dialog', d => { phoneDialogs.push(d.message()); d.accept(); });
  await phone.page.evaluate(() => goOnline());
  await until(async () => HAS.data.current.opp === 'Offline edit', 'the offline change to be sent');
  await until(async () => (await opp(laptop)) === 'Offline edit', 'the laptop to get the offline change');
  assert(phoneDialogs.length === 0 && (await status(phone)) === 'Saved on Home Assistant', 'back online, the change is sent without asking');

  // ---------- both changed while one was offline: keep this device's ----------
  await phone.page.evaluate(() => goOffline());
  await phone.frame.evaluate(() => setGameField('opp', 'Phone version'));
  await laptop.frame.evaluate(() => setGameField('opp', 'Laptop version'));
  await until(async () => HAS.data.current.opp === 'Laptop version', 'the laptop\'s change to be saved');
  const phoneDev = HAS.devices.get('Phone');
  phoneDev.eventDelay = 250;   // the reconnect update arrives after the phone has already saved
  await phone.page.evaluate(() => goOnline());
  await until(async () => phoneDialogs.length >= 1, 'the phone to ask which version to keep');
  assert(/also changed on another device by Laptop/.test(phoneDialogs[0]), 'the phone asks which version to keep, naming the other device\'s user');
  await until(async () => HAS.data.current.opp === 'Phone version', 'the phone\'s version to win');
  await until(async () => (await opp(laptop)) === 'Phone version', 'the laptop to switch to the phone\'s version');
  assert(HAS.history.some(v => v.reason === 'kept this device' && v.data.current.opp === 'Laptop version'), 'OK keeps this device\'s version; the other one stays in history');
  await sleep(700);
  assert(phoneDialogs.length === 1, 'the phone asked only once');
  assert((await opp(phone)) === 'Phone version', 'a late, out-of-date update doesn\'t put the old version back on the phone');

  // ---------- both changed: use the other version ----------
  phone.page.removeAllListeners('dialog');
  phone.page.on('dialog', d => { phoneDialogs.push(d.message()); d.dismiss(); });
  await phone.page.evaluate(() => goOffline());
  await phone.frame.evaluate(() => setGameField('opp', 'Phone again'));
  await laptop.frame.evaluate(() => setGameField('opp', 'Laptop again'));
  await until(async () => HAS.data.current.opp === 'Laptop again', 'the laptop\'s second change to be saved');
  phoneDev.keepDelay = 600;    // filing this device's version is slow, and the reconnect update lands meanwhile
  await phone.page.evaluate(() => goOnline());
  await until(async () => phoneDialogs.length >= 2, 'the phone to ask again');
  await until(async () => (await opp(phone)) === 'Laptop again', 'the phone to switch to the laptop\'s version');
  assert(HAS.data.current.opp === 'Laptop again', 'Cancel uses the other version');
  assert(HAS.history.some(v => v.reason === 'not kept' && v.data.current.opp === 'Phone again'), 'the phone\'s version that wasn\'t kept stays in history');
  await sleep(900);
  assert(phoneDialogs.length === 2, 'the phone asked only once that time too');
  phoneDev.eventDelay = 0; phoneDev.keepDelay = 0;

  // ---------- restore an earlier version from the Season tab ----------
  await laptop.frame.evaluate(() => showTab('season'));
  assert(await laptop.frame.isHidden('#autoBackupRow'), 'in Home Assistant the "download a backup every time" option is not shown');
  const statusText = await laptop.frame.textContent('#backupStatus');
  assert(/kept on your Home Assistant server/.test(statusText), 'the Season tab says the season is kept on Home Assistant');
  await laptop.frame.click('#haHistoryBtn');
  await laptop.frame.waitForSelector('.histrow');
  const rows = await laptop.frame.$$eval('.histrow', rs => rs.map(r => r.textContent));
  assert(rows.some(t => /Phone/.test(t) && /changes that weren.t kept/.test(t)), 'the history lists the phone\'s version that wasn\'t kept');
  const target = HAS.history.find(v => v.reason === 'not kept');
  const before = dialogs.length;
  await laptop.frame.click('.histrow:has-text("weren’t kept") button, .histrow:has-text("weren\'t kept") button');
  await until(async () => dialogs.length === before + 1, 'the restore question');
  await until(async () => (await opp(laptop)) === 'Phone again' && (await opp(phone)) === 'Phone again', 'both devices to show the restored version');
  assert(HAS.data.current.opp === target.data.current.opp, 'restoring an earlier version updates every device');

  // ---------- a reload opens straight from this device's copy ----------
  await phone.page.reload();
  let frame = null;
  await until(async () => {
    frame = phone.page.frames().find(f => f.url().includes('/frontend/index.html'));
    return frame && await frame.evaluate(() => typeof S === 'object' && S.roster.length === 11);
  }, 'the phone to reopen with the season');
  phone.frame = frame;
  assert((await opp(phone)) === 'Phone again', 'reopening the phone shows the latest season');

  assert(errors.length === 0, 'no errors in either device' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (Home Assistant, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
