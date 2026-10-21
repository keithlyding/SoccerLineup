// Offline tests for SoccerLineup. Serves the app from a small local web
// server (the way GitHub Pages will), then turns the server off to prove the
// app still opens, then serves a changed file to prove updates are noticed.
// Run with: npm test            (desktop, Chromium)
//           npm run test:iphone (iPhone screen and touch, WebKit = Safari's engine)
const { startServer, browserSetup } = require('./server');

const setup = browserSetup();

let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}

(async () => {
  let server = await startServer(0, '');
  const base = server.app;
  const browser = await setup.type.launch();
  const context = await browser.newContext(setup.contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto(base);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  assert(controlled, 'the offline helper takes charge of the page');
  const stamped = await page.evaluate(() => [document.querySelector('script[src^="app.js"]').getAttribute('src'), document.querySelector('link[href^="styles.css"]').getAttribute('href')]);
  assert(/^app\.js\?v=\w+$/.test(stamped[0]) && /^styles\.css\?v=\w+$/.test(stamped[1]), 'script and styles are stamped with a content fingerprint: ' + stamped.join(' '));

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel=manifest]');
    const m = await (await fetch(link.href)).json();
    const icons = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, link.href))).ok));
    return { name: m.name, display: m.display, start: m.start_url, icons };
  });
  assert(manifest.name === 'SoccerLineup' && manifest.display === 'standalone' && manifest.start === './', 'manifest makes it an installable app');
  assert(manifest.icons.length === 3 && manifest.icons.every(Boolean), 'all manifest icons load');

  const cached = await page.evaluate(async () => {
    const keys = await caches.keys();
    const c = await caches.open(keys[0]);
    return (await c.keys()).map(r => r.url.split('/frontend/')[1]).sort();
  });
  assert(cached.join(',') === ['app.js','icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/icon.svg','index.html','manifest.webmanifest','styles.css'].sort().join(','), 'every app file is saved on the device');

  // save some data, then take the server away
  await page.evaluate(() => { S.cfg.team = 'Offline FC'; save(); });
  await server.stop();
  await page.reload();
  const offline = await page.evaluate(() => ({ team: document.getElementById('brandTop').textContent, tabs: document.querySelectorAll('nav button').length, css: getComputedStyle(document.body).backgroundColor }));
  assert(offline.team === 'Offline FC' && offline.tabs === 3, 'with no connection the app still opens with its data');
  assert(offline.css === 'rgb(251, 250, 246)', 'with no connection the styles still load');
  const fresh = await context.newPage();
  await fresh.goto(base);
  assert((await fresh.evaluate(() => document.getElementById('brandTop').textContent)) === 'Offline FC', 'opening the address fresh with no connection works too');
  await fresh.close();

  // publish a "new version" and check the page is told about it
  server = await startServer(server.port, '\nwindow.__newVersion = true;\n');
  assert(await page.evaluate(() => document.getElementById('updateToast').hidden), 'no update notice before anything changes');
  await page.reload();
  try {
    await page.waitForSelector('#updateToast:not([hidden])', { timeout: 10000 });
  } catch (e) {
    // say what the offline helper saw, so a failure can be traced
    const seen = await page.evaluate(async () => {
      const keys = await caches.keys(), c = await caches.open(keys[0]);
      const saved = await c.match(new URL('app.js', location.href).href);
      return { controlled: !!navigator.serviceWorker.controller,
               savedHasNewVersion: saved ? (await saved.text()).includes('__newVersion') : 'no saved copy',
               scriptAddress: (document.querySelector('script[src^="app.js"]') || {}).src };
    }).catch(err => 'could not inspect: ' + err.message);
    throw new Error('FAILED: no update notice. Offline helper state: ' + JSON.stringify(seen));
  }
  assert(true, 'a changed app file shows "A new version of the app is ready"');
  await page.click('#updateToast button');
  await page.waitForLoadState('load');
  const running = await page.evaluate(() => window.__newVersion === true);
  assert(running, 'after Reload the page is running the new version');
  await page.waitForTimeout(500);
  assert(await page.evaluate(() => document.getElementById('updateToast').hidden), 'no second notice once up to date');

  assert(errors.length === 0, 'no errors in the page' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  await server.stop();
  console.log('\n' + passed + ' checks passed (offline, ' + setup.label + ')');
})().catch(e => { console.error(e.message || e); process.exit(1); });
