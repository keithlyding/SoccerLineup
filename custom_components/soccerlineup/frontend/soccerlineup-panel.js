/* SoccerLineup panel for Home Assistant.

   Home Assistant puts this element in the sidebar page and hands it `hass`
   (the signed-in connection), `narrow` (phone-sized layout) and `panel`.
   The element shows the app in a frame and leaves this page's connection on
   window.soccerLineupBridge, where the app picks it up to load and save the
   season on the server. The app's own code stays the same as the version
   that runs on its own in a browser. */
(function () {
  "use strict";
  var KEY = "soccerLineupBridge";

  function bridge() {
    if (!window[KEY]) {
      window[KEY] = {
        hass: null,
        narrow: false,
        listeners: [],
        toggleMenu: function () {},
        onChange: function (fn) {
          var list = this.listeners;
          list.push(fn);
          return function () {
            var i = list.indexOf(fn);
            if (i >= 0) { list.splice(i, 1); }
          };
        },
        changed: function () {
          this.listeners.slice().forEach(function (fn) {
            try { fn(); } catch (e) { /* a closed frame's listener */ }
          });
        }
      };
    }
    return window[KEY];
  }

  class SoccerLineupPanel extends HTMLElement {
    set hass(value) {
      this._hass = value;
      var b = bridge();
      b.hass = value;
      b.changed();
      this._build();
    }
    get hass() { return this._hass; }

    set narrow(value) {
      this._narrow = !!value;
      var b = bridge();
      b.narrow = this._narrow;
      b.changed();
    }
    get narrow() { return this._narrow; }

    set panel(value) { this._panel = value; this._build(); }
    get panel() { return this._panel; }

    connectedCallback() { this._connected = true; this._build(); }
    disconnectedCallback() { this._connected = false; }

    _build() {
      if (this._built || !this._connected || !this._hass || !this._panel) { return; }
      this._built = true;
      var self = this;
      bridge().toggleMenu = function () {
        self.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }));
      };
      var root = this.attachShadow({ mode: "open" });
      /* The frame doesn't get the phone's notch and home-bar spacing, so this page adds it. */
      root.innerHTML =
        "<style>" +
        ":host{display:block;height:100%;box-sizing:border-box;background:#13201B;" +
        "padding:env(safe-area-inset-top) env(safe-area-inset-right) 0 env(safe-area-inset-left)}" +
        "iframe{display:block;border:0;width:100%;height:100%;background:#FBFAF6}" +
        "</style><iframe title=\"Soccer Lineup\"></iframe>";
      root.querySelector("iframe").src = (this._panel.config && this._panel.config.app_url) || "/soccerlineup_app?ha=1";
    }
  }

  if (!customElements.get("soccerlineup-panel")) {
    customElements.define("soccerlineup-panel", SoccerLineupPanel);
  }
})();
