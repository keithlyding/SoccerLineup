// Signs in to a real Home Assistant started by run.sh and checks SoccerLineup
// end to end: the sidebar item, the app in Home Assistant mode, a laptop and a
// phone kept in sync by the real server, and the phone's menu button.
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8124';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}
async function until(fn, what, ms = 20000) {
  const end = Date.now() + ms;
  for (;;) {
    try { const v = await fn(); if (v) return v; } catch (e) { /* not ready */ }
    if (Date.now() > end) throw new Error('FAILED: timed out waiting for ' + what);
    await sleep(200);
  }
}
const appFrame = page => page.frames().find(f => f.url().includes('/soccerlineup_app'));

async function signIn(browser, options, label) {
  const page = await (await browser.newContext(options)).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(label + ': ' + e.message));
  await page.goto(BASE + '/soccerlineup');
  await page.locator('input[name="username"]').fill('coach');
  await page.locator('input[name="password"]').fill('coachpass123');
  await page.locator('input[name="password"]').press('Enter');
  await page.waitForURL(/\/soccerlineup/, { timeout: 30000 });
  const frame = await until(async () => {
    const f = appFrame(page);
    return f && await f.evaluate(() => typeof S === 'object' && !!HA && sync.status === 'saved') && f;
  }, label + "'s app to open in Home Assistant mode");
  return { page, frame, errors };
}

(async () => {
  const browser = await chromium.launch();
  const laptop = await signIn(browser, { viewport: { width: 1280, height: 860 } }, 'laptop');
  assert(true, 'signing in to Home Assistant opens Soccer Lineup');
  assert((await laptop.frame.textContent('#syncState')) === 'Saved on Home Assistant', 'the app keeps the season on the Home Assistant server');
  assert((await laptop.page.locator('ha-sidebar a[href="/soccerlineup"]').count()) > 0, 'Soccer Lineup is in the sidebar');
  const box = await laptop.page.locator('soccerlineup-panel iframe').boundingBox();
  assert(box && box.height >= 850 && box.width >= 1000, 'the app fills the page beside the sidebar');
  assert(await laptop.frame.isHidden('#haMenu'), 'no menu button on a wide screen');

  await laptop.frame.evaluate(() => { S.cfg.team = 'Real HA FC'; setGameField('opp', 'Wolves'); });

  const phone = await signIn(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, 'phone');
  assert((await phone.frame.evaluate(() => S.cfg.team + ' / ' + S.current.opp)) === 'Real HA FC / Wolves', 'a phone signed in to the same Home Assistant gets the season');
  assert(await phone.frame.isVisible('#haMenu'), 'the phone shows a menu button');
  await phone.frame.tap('#haMenu');
  await until(() => phone.page.evaluate(() => {
    const main = document.querySelector('home-assistant').shadowRoot.querySelector('home-assistant-main');
    return main.shadowRoot.querySelector('ha-drawer').open;
  }), 'the sidebar to open');
  assert(true, 'the menu button opens Home Assistant\'s sidebar');
  await phone.page.keyboard.press('Escape');

  await phone.frame.evaluate(() => setGameField('opp', 'Changed on phone'));
  await until(() => laptop.frame.evaluate(() => S.current.opp === 'Changed on phone'), 'the laptop to get the phone\'s change');
  assert(true, 'a change on the phone reaches the laptop live');

  await phone.page.reload();
  await until(async () => {
    const f = appFrame(phone.page);
    return f && await f.evaluate(() => typeof S === 'object' && S.current.opp === 'Changed on phone');
  }, 'the phone to reopen with the season');
  assert(true, 'reopening on the phone shows the saved season');

  // Home Assistant's own pages raise this one in headless Chromium as well
  // (its profile page does too), so it isn't SoccerLineup's.
  const errors = laptop.errors.concat(phone.errors).filter(m => !/Malformed extension type/.test(m));
  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log('\n' + passed + ' checks passed (real Home Assistant)');
})().catch(e => { console.error(e.message || e); process.exit(1); });
