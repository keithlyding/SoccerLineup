// A small web server for the tests. It serves the repository under
// /SoccerLineup/, the same address shape GitHub Pages uses.
// `extra` is appended to app.js so a test can pretend a new version was published.
const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

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
  return new Promise(resolve => server.listen(port || 0, '127.0.0.1', () => resolve({
    port: server.address().port,
    base: 'http://127.0.0.1:' + server.address().port + '/SoccerLineup/',
    stop: () => new Promise(r => { sockets.forEach(s => s.destroy()); server.close(() => r()); })
  })));
}

// `--iphone` runs in WebKit (Safari's engine) with an iPhone's screen and touch.
function browserSetup() {
  const pw = require('playwright');
  const iphone = process.argv.includes('--iphone');
  /* TEST_ENGINE=chromium runs the iPhone screen and touch in Chromium,
     for a computer that does not have WebKit installed */
  const engine = process.env.TEST_ENGINE || (iphone ? 'webkit' : 'chromium');
  return {
    iphone,
    label: (iphone ? 'iPhone, ' : 'desktop, ') + (engine === 'webkit' ? 'WebKit' : 'Chromium'),
    type: pw[engine],
    contextOptions: iphone ? { ...pw.devices['iPhone 13'], acceptDownloads: true } : { viewport: { width: 1200, height: 1000 }, acceptDownloads: true }
  };
}

module.exports = { startServer, browserSetup, root };
