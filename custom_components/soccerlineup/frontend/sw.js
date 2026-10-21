/* SoccerLineup offline support.

   Every app file is answered from the copy saved on the device, so the app
   opens straight away even with no signal at the field. Each time the app is
   opened, every app file is also checked against the web copy in the
   background. If any changed, the saved copies are replaced and the page
   shows "A new version of the app is ready".

   Change VERSION only when this file's own logic changes. Edits to the app
   files themselves are picked up automatically. */
"use strict";

var VERSION = "v1";
var CACHE = "soccerlineup-" + VERSION;
var FILES = [
  "index.html", "styles.css", "app.js", "manifest.webmanifest",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"
];

function scopeUrl(path){ return new URL(path, self.registration.scope).href; }

self.addEventListener("install", function(ev){
  ev.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(FILES.map(function(f){ return new Request(scopeUrl(f), {cache: "reload"}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k.indexOf("soccerlineup-") === 0 && k !== CACHE;
      }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* The saved-copy key for a request, or null when it is not an app file. */
function appFileKey(req){
  var url = new URL(req.url);
  url.search = ""; url.hash = "";
  var href = url.href;
  if(href === self.registration.scope){ return scopeUrl("index.html"); }
  var i;
  for(i = 0; i < FILES.length; i++){
    if(scopeUrl(FILES[i]) === href){ return href; }
  }
  return null;
}

function tellPagesAboutUpdate(){
  return self.clients.matchAll({type: "window"}).then(function(list){
    list.forEach(function(client){ client.postMessage({type: "updated"}); });
  });
}

/* One check at a time: the page's own "am I up to date?" question joins the
   check that opening the app already started. */
var refreshing = null;
function refreshOnce(){
  if(!refreshing){
    refreshing = refreshAll().then(function(changed){ refreshing = null; return changed; },
                                   function(){ refreshing = null; return false; });
  }
  return refreshing;
}

/* Check every app file against the web copy; resolves true if any changed. */
function refreshAll(){
  return caches.open(CACHE).then(function(cache){
    return Promise.all(FILES.map(function(f){
      var key = scopeUrl(f);
      return fetch(key, {cache: "no-cache"}).then(function(res){
        if(!res.ok){ return false; }
        return cache.match(key).then(function(old){
          return Promise.all([old ? old.arrayBuffer() : null, res.clone().arrayBuffer()]);
        }).then(function(bufs){
          var changed = bufs[0] !== null && !sameBytes(bufs[0], bufs[1]);
          return cache.put(key, res).then(function(){ return changed; });
        });
      }).catch(function(){ return false; });   /* offline: keep what we have */
    }));
  }).then(function(results){ return results.indexOf(true) >= 0; });
}

function sameBytes(a, b){
  if(a.byteLength !== b.byteLength){ return false; }
  var x = new Uint8Array(a), y = new Uint8Array(b), i;
  for(i = 0; i < x.length; i++){ if(x[i] !== y[i]){ return false; } }
  return true;
}

/* Short fingerprint of a file's contents (FNV-1a). */
function fingerprint(buf){
  var bytes = new Uint8Array(buf), h = 0x811c9dc5, i;
  for(i = 0; i < bytes.length; i++){
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/* The page itself. Browsers keep script and style files in memory and may
   reuse them on a reload without asking this helper, which would leave an
   old version running after an update. So the page is handed out with
   addresses that carry a fingerprint of each file's contents, for example
   app.js?v=1x2y3z: a changed file gets a new address and is fetched fresh. */
function servePage(){
  return caches.open(CACHE).then(function(cache){
    return Promise.all([
      cache.match(scopeUrl("index.html")),
      cache.match(scopeUrl("styles.css")),
      cache.match(scopeUrl("app.js"))
    ]);
  }).then(function(r){
    if(!r[0]){ return fetch(scopeUrl("index.html")); }
    return Promise.all([
      r[0].text(),
      r[1] ? r[1].arrayBuffer() : new ArrayBuffer(0),
      r[2] ? r[2].arrayBuffer() : new ArrayBuffer(0)
    ]).then(function(t){
      var html = t[0]
        .replace('href="styles.css"', 'href="styles.css?v=' + fingerprint(t[1]) + '"')
        .replace('src="app.js"', 'src="app.js?v=' + fingerprint(t[2]) + '"');
      return new Response(html, {headers: {"Content-Type": "text/html; charset=utf-8"}});
    });
  }).catch(function(){ return fetch(scopeUrl("index.html")); });
}

/* The fingerprints the page would get if it opened now. */
function currentStamps(){
  return caches.open(CACHE).then(function(cache){
    return Promise.all([cache.match(scopeUrl("styles.css")), cache.match(scopeUrl("app.js"))]);
  }).then(function(r){
    return Promise.all([r[0] ? r[0].arrayBuffer() : new ArrayBuffer(0), r[1] ? r[1].arrayBuffer() : new ArrayBuffer(0)]);
  }).then(function(b){ return {style: fingerprint(b[0]), script: fingerprint(b[1])}; });
}
function stampOf(address){
  var m = /[?&]v=([^&]+)/.exec(address || "");
  return m ? m[1] : null;
}

/* A page that has finished loading asks whether it is running the newest
   version, sending the fingerprints in its own script and style addresses.
   Asking (rather than only being told when the check finishes) means the
   answer can't arrive before the page is ready to hear it. */
self.addEventListener("message", function(ev){
  var d = ev.data || {};
  if(d.type !== "check" || !ev.source){ return; }
  var mine = {script: stampOf(d.script), style: stampOf(d.style)};
  if(!mine.script){ return; }   /* opened before this helper took charge: nothing to compare */
  ev.waitUntil(refreshOnce().then(currentStamps).then(function(now){
    if(now.script !== mine.script || now.style !== mine.style){
      ev.source.postMessage({type: "updated"});
    }
  }).catch(function(){}));
});

self.addEventListener("fetch", function(ev){
  var req = ev.request;
  if(req.method !== "GET"){ return; }
  var key = appFileKey(req);
  if(!key){ return; }

  if(req.mode === "navigate"){
    ev.respondWith(servePage());
    /* Opening the app is the moment to look for a new version. Every file
       is checked, not only the ones the page asks for, for the same
       in-memory reason described above servePage(). */
    ev.waitUntil(refreshOnce().then(function(changed){
      if(changed){ return tellPagesAboutUpdate(); }
    }));
    return;
  }

  ev.respondWith(caches.open(CACHE).then(function(cache){
    return cache.match(key);
  }).then(function(copy){
    return copy || fetch(req);
  }));
});
