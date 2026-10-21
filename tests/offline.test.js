// Offline tests for SoccerLineup. Serves the app from a small local web
// server (the way GitHub Pages will), then turns the server off to prove the
// app still opens, then serves a changed file to prove updates are noticed.
// Run with: npm test
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

let passed = 0;
function assert(cond, msg) {
  if (!cond) { throw new Error('FAILED: ' + msg); }
  passed++; console.log('ok  ' + msg);
}

// Serves the repo under /SoccerLineup/ like GitHub Pages. `extra` is appended
// to app.js so a test can pretend a new version was published.
function startServer(port, extra) {
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    let url = decodeURIComponent(req.url.split('?')[0]);
    if (!url.startsWith('/SoccerLineup/')) { res.writeHead(404); return res.end(); }
    url = url.slice('/SoccerLineup/'.length) || 'index.html';
    const file = path.join(root, url);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    let body = fs.readFileSync(file);
    if (url === 'app.js' && extra) { body = Buffer.concat([body, Buffer.from(extra)]); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
    res.end(body);
  });
  server.on('connection', s => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({
    port: server.address().port,
    stop: () => new Promise(r => { sockets.forEach(s => s.destroy()); server.close(() => r()); })
  })));
}

(async () => {
  let server = await startServer(0, '');
  const base = 'http://127.0.0.1:' + server.port + '/SoccerLineup/';
  const browser = await chromium.launch();
  const context = await browser.newContext();
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
    return (await c.keys()).map(r => r.url.split('/SoccerLineup/')[1]).sort();
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
  await page.waitForSelector('#updateToast:not([hidden])', { timeout: 10000 });
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
  console.log('\n' + passed + ' checks passed (offline)');
})().catch(e => { console.error(e.message || e); process.exit(1); });
