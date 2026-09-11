(function (global) {
  "use strict";

  if (global.RateGuard) return;

  var CONFIG = {
    windowMs: 20000,
    softLimit: 25,
    hardLimit: 60,
    burstWindowMs: 2000,
    burstLimit: 15,
    riskThreshold: 70,
    penaltySeconds: [15, 45, 120, 300, 900, 1800],
    recidivismCooldownMs: 10 * 60 * 1000,
    maxAgeMs: 6 * 60 * 60 * 1000,
    reloadWindowMs: 8000,
    reloadLimit: 5,
    reloadPenaltySeconds: 20,
    zIndex: 2147483600,
    lockTitle: true,
    blockKeys: true,
    copy: {
      title: "Acesso temporariamente limitado",
      body: "Recebemos muitas solicitações desta sessão em pouco tempo. Para proteger o serviço, o acesso ficará restrito por um curto período.",
      waitLabel: "Liberação em",
      footerHint: "Se você acredita que isso é um erro, aguarde e tente novamente.",
      tier: ["", "Nível 1", "Nível 2", "Nível 3", "Nível 4", "Nível 5", "Nível máximo"]
    },
    onBlock: null,
    onRelease: null
  };

  var TAB_KEY = "gbz_rg_tab_id";
  var RECID_KEY = "gbz_rg_recid";

  var TAB_ID = (function () {
    try {
      var id = sessionStorage.getItem(TAB_KEY);
      if (!id) {
        id =
          Math.random().toString(36).slice(2) +
          Date.now().toString(36);
        sessionStorage.setItem(TAB_KEY, id);
      }
      return id;
    } catch (e) {
      return "t_" + Math.random().toString(36).slice(2);
    }
  })();

  var SESSION_KEY = "gbz_rg_s_" + TAB_ID;

  var state = loadSession();
  var recid = loadRecid();
  var overlay = null;
  var rafId = null;
  var titleTimer = null;
  var originalTitle = document.title;
  var frozenPage = null;

  function blankSession() {
    return { hits: [], blockedUntil: 0 };
  }

  function blankRecid() {
    return { level: 0, lastPunish: 0, createdAt: Date.now() };
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return blankSession();
      var p = JSON.parse(raw);
      if (!p || typeof p !== "object") return blankSession();
      var s = blankSession();
      if (Array.isArray(p.hits)) s.hits = p.hits;
      if (typeof p.blockedUntil === "number") s.blockedUntil = p.blockedUntil;
      return s;
    } catch (e) {
      return blankSession();
    }
  }

  function saveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadRecid() {
    try {
      var raw = sessionStorage.getItem(RECID_KEY);
      if (!raw) return blankRecid();
      var p = JSON.parse(raw);
      if (!p || typeof p !== "object") return blankRecid();
      if (p.createdAt && Date.now() - p.createdAt > CONFIG.maxAgeMs) {
        return blankRecid();
      }
      if (
        p.lastPunish &&
        Date.now() - p.lastPunish > CONFIG.recidivismCooldownMs
      ) {
        p.level = 0;
      }
      var r = blankRecid();
      if (typeof p.level === "number") r.level = p.level;
      if (typeof p.lastPunish === "number") r.lastPunish = p.lastPunish;
      if (typeof p.createdAt === "number") r.createdAt = p.createdAt;
      return r;
    } catch (e) {
      return blankRecid();
    }
  }

  function saveRecid() {
    try {
      sessionStorage.setItem(RECID_KEY, JSON.stringify(recid));
    } catch (e) {}
  }

  function prune(arr, ms) {
    var cut = Date.now() - ms;
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] > cut) out.push(arr[i]);
    }
    return out;
  }

  function computeRisk() {
    var recent = prune(state.hits, CONFIG.windowMs);
    var burst = prune(state.hits, CONFIG.burstWindowMs);
    var score = 0;

    if (recent.length > CONFIG.softLimit) {
      var over = recent.length - CONFIG.softLimit;
      score += Math.min(over * 2, 40);
    }

    if (burst.length > CONFIG.burstLimit) {
      var overB = burst.length - CONFIG.burstLimit;
      score += Math.min(overB * 4, 50);
    }

    if (recent.length >= 5) {
      var span =
        (recent[recent.length - 1] - recent[0]) /
        Math.max(recent.length - 1, 1);
      if (span < 80) score += 25;
      else if (span < 200) score += 12;
    }

    if (recent.length >= CONFIG.hardLimit) score = 100;

    return score > 100 ? 100 : score;
  }

  function register() {
    if (isBlocked()) return false;

    state.hits = prune(state.hits, CONFIG.windowMs);
    state.hits.push(Date.now());

    if (state.hits.length % 5 === 0) saveSession();

    var risk = computeRisk();
    if (risk >= CONFIG.riskThreshold) {
      punishNetwork(risk);
      return false;
    }
    return true;
  }

  function punishNetwork(risk) {
    var now = Date.now();

    recid.level = Math.min(
      recid.level + 1,
      CONFIG.penaltySeconds.length
    );
    recid.lastPunish = now;
    saveRecid();

    var idx = Math.max(0, recid.level - 1);
    if (idx >= CONFIG.penaltySeconds.length) {
      idx = CONFIG.penaltySeconds.length - 1;
    }
    var waitMs = CONFIG.penaltySeconds[idx] * 1000;

    state.blockedUntil = now + waitMs;
    state.hits = [];
    saveSession();

    openOverlay(risk, waitMs);

    if (typeof CONFIG.onBlock === "function") {
      try {
        CONFIG.onBlock({
          level: recid.level,
          waitMs: waitMs,
          blockedUntil: state.blockedUntil,
          risk: risk,
          reason: "network"
        });
      } catch (e) {}
    }
  }

  function punishReload() {
    var now = Date.now();
    var waitMs = CONFIG.reloadPenaltySeconds * 1000;

    if (now + waitMs > state.blockedUntil) {
      state.blockedUntil = now + waitMs;
      saveSession();
    }

    if (!isBlocked()) return;
    openOverlay(0, waitMs);

    if (typeof CONFIG.onBlock === "function") {
      try {
        CONFIG.onBlock({
          level: recid.level,
          waitMs: waitMs,
          blockedUntil: state.blockedUntil,
          risk: 0,
          reason: "reload"
        });
      } catch (e) {}
    }
  }

  function isBlocked() {
    return Date.now() < (state.blockedUntil || 0);
  }

  function injectStyles() {
    if (document.getElementById("rg-styles")) return;
    var s = document.createElement("style");
    s.id = "rg-styles";
    s.textContent =
      ".rg-root,.rg-root *{box-sizing:border-box}" +
      ".rg-root{position:fixed;inset:0;z-index:" +
      CONFIG.zIndex +
      ";display:grid;place-items:center;padding:24px;" +
      "background:radial-gradient(1200px 600px at 50% -10%,rgba(108,92,231,.08),transparent 60%),rgba(8,8,12,.86);" +
      "-webkit-backdrop-filter:blur(14px) saturate(120%);backdrop-filter:blur(14px) saturate(120%);" +
      "font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
      "color:#ececf1;animation:rg-fade 220ms ease-out}" +
      "@keyframes rg-fade{from{opacity:0}to{opacity:1}}" +
      "@keyframes rg-rise{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}" +
      ".rg-card{width:100%;max-width:460px;background:#17171d;border:1px solid #2a2a33;border-radius:14px;" +
      "box-shadow:0 1px 0 rgba(255,255,255,.02) inset,0 20px 60px -20px rgba(0,0,0,.8),0 8px 24px -12px rgba(0,0,0,.6);" +
      "overflow:hidden;animation:rg-rise 320ms cubic-bezier(.2,.8,.2,1)}" +
      ".rg-top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #2a2a33;background:#1d1d24}" +
      ".rg-mark{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:#23232c;border:1px solid #33333d;color:#8577f0}" +
      ".rg-mark svg{width:12px;height:12px;display:block}" +
      ".rg-brand{font-size:12px;font-weight:600;letter-spacing:.02em;color:#9a9aa6}" +
      ".rg-tier{margin-left:auto;font-size:11px;color:#6b6b78;font-variant-numeric:tabular-nums;padding:4px 8px;border:1px solid #2a2a33;border-radius:999px;background:#131319}" +
      ".rg-body{padding:26px 24px 22px}" +
      ".rg-title{font-size:18px;line-height:1.3;font-weight:650;letter-spacing:-.01em;margin:0 0 8px;color:#ececf1}" +
      ".rg-text{font-size:13.5px;line-height:1.6;color:#9a9aa6;margin:0 0 22px}" +
      ".rg-timer{display:flex;align-items:baseline;gap:10px;padding:16px 18px;border:1px solid #2a2a33;border-radius:10px;background:#121218;margin-bottom:14px}" +
      ".rg-timer-label{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b78;font-weight:600;margin-bottom:4px}" +
      ".rg-timer-value{margin-left:auto;font-variant-numeric:tabular-nums;font-feature-settings:'tnum';font-size:30px;font-weight:600;letter-spacing:-.02em;color:#ececf1;line-height:1}" +
      ".rg-timer-unit{font-size:12px;color:#6b6b78;margin-left:2px}" +
      ".rg-prog{position:relative;height:3px;border-radius:2px;background:#202027;overflow:hidden;margin-bottom:18px}" +
      ".rg-prog-fill{position:absolute;inset:0 100% 0 0;background:#6c5ce7;transition:right .25s linear}" +
      ".rg-meta{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11.5px;color:#6b6b78;border-top:1px solid #2a2a33;padding-top:14px}" +
      ".rg-meta-left{display:inline-flex;align-items:center;gap:6px}" +
      ".rg-dot{width:6px;height:6px;border-radius:999px;background:#f0a02a;box-shadow:0 0 0 3px rgba(240,160,42,.14)}" +
      ".rg-timer-value.rg-low{color:#8577f0}" +
      "@media (prefers-reduced-motion:reduce){.rg-root,.rg-card,.rg-prog-fill{animation:none!important;transition:none!important}}" +
      "@media (max-width:420px){.rg-card{max-width:100%;border-radius:12px}.rg-body{padding:22px 18px 18px}.rg-timer-value{font-size:26px}}";
    document.head.appendChild(s);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  function fmt(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    if (s < 60) return { v: String(s), u: "s" };
    if (s < 3600) {
      var m = Math.floor(s / 60);
      var r = s % 60;
      return { v: m + ":" + (r < 10 ? "0" + r : r), u: "" };
    }
    var h = Math.floor(s / 3600);
    var mm = Math.floor((s % 3600) / 60);
    return { v: h + ":" + (mm < 10 ? "0" + mm : mm), u: "" };
  }

  function tierLabel() {
    var t = CONFIG.copy.tier;
    var lvl = recid.level;
    if (lvl < 0) lvl = 0;
    if (lvl >= t.length) lvl = t.length - 1;
    return t[lvl] || "";
  }

  function openOverlay(risk, waitMs) {
    if (overlay) return;
    injectStyles();

    var total = Math.max(state.blockedUntil - Date.now(), 1);

    overlay = document.createElement("div");
    overlay.className = "rg-root";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "rg-title");
    overlay.innerHTML =
      '<div class="rg-card" role="document">' +
        '<div class="rg-top">' +
          '<span class="rg-mark" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M12 2 3 6v6c0 5 3.8 9.3 9 10 5.2-.7 9-5 9-10V6l-9-4Z"/>' +
            "</svg>" +
          "</span>" +
          '<span class="rg-brand">Gbzin Group · Proteção de acesso</span>' +
          '<span class="rg-tier" data-rg-tier>' +
            esc(tierLabel()) +
          "</span>" +
        "</div>" +
        '<div class="rg-body">' +
          '<h2 class="rg-title" id="rg-title">' +
            esc(CONFIG.copy.title) +
          "</h2>" +
          '<p class="rg-text">' +
            esc(CONFIG.copy.body) +
          "</p>" +
          '<div class="rg-timer">' +
            "<div>" +
              '<div class="rg-timer-label">' +
                esc(CONFIG.copy.waitLabel) +
              "</div>" +
            "</div>" +
            '<div class="rg-timer-value" data-rg-time aria-live="polite">' +
              "<span data-rg-time-v>--</span>" +
              '<span class="rg-timer-unit" data-rg-time-u></span>' +
            "</div>" +
          "</div>" +
          '<div class="rg-prog" aria-hidden="true">' +
            '<div class="rg-prog-fill" data-rg-fill></div>' +
          "</div>" +
          '<div class="rg-meta">' +
            '<span class="rg-meta-left">' +
              '<span class="rg-dot" aria-hidden="true"></span>' +
              "<span>" +
                esc(CONFIG.copy.footerHint) +
              "</span>" +
            "</span>" +
          "</div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    freezePage();

    var evts = [
      "click",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "contextmenu",
      "wheel"
    ];
    for (var i = 0; i < evts.length; i++) {
      (function (ev) {
        overlay.addEventListener(
          ev,
          function (e) {
            e.stopPropagation();
            if (ev !== "contextmenu") e.preventDefault();
          },
          ev === "wheel" ? { passive: false, capture: true } : true
        );
      })(evts[i]);
    }

    if (CONFIG.blockKeys) {
      document.addEventListener("keydown", onKeyBlock, true);
    }

    if (CONFIG.lockTitle) {
      var labels = ["· Acesso restrito ·", "• Acesso restrito •"];
      var idx = 0;
      titleTimer = setInterval(function () {
        document.title = labels[idx++ % labels.length];
      }, 1500);
    }

    tick(total);
  }

  function freezePage() {
    var b = document.body;
    if (!b) return;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    frozenPage = {
      overflow: b.style.overflow,
      position: b.style.position,
      top: b.style.top,
      width: b.style.width,
      scrollY: scrollY
    };
    b.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.top = "-" + scrollY + "px";
    b.style.width = "100%";
  }

  function unfreezePage() {
    if (!frozenPage) return;
    var b = document.body;
    b.style.overflow = frozenPage.overflow;
    b.style.position = frozenPage.position;
    b.style.top = frozenPage.top;
    b.style.width = frozenPage.width;
    window.scrollTo(0, frozenPage.scrollY);
    frozenPage = null;
  }

  function onKeyBlock(e) {
    var k = e.key;
    var ctrl = e.ctrlKey || e.metaKey;
    if (
      k === "F5" ||
      k === "F12" ||
      (ctrl && "rRuUsS".indexOf(k) !== -1) ||
      (ctrl && e.shiftKey && "rRiIjJcC".indexOf(k) !== -1)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function tick(total) {
    var timeV = overlay && overlay.querySelector("[data-rg-time-v]");
    var timeU = overlay && overlay.querySelector("[data-rg-time-u]");
    var fill = overlay && overlay.querySelector("[data-rg-fill]");
    if (!timeV || !fill) return;

    function step() {
      var remaining = state.blockedUntil - Date.now();
      if (remaining <= 0) {
        closeOverlay();
        return;
      }
      var t = fmt(remaining);
      timeV.textContent = t.v;
      timeU.textContent = t.u;
      timeV.parentElement.classList.toggle("rg-low", remaining < 5000);
      var pct = Math.min(Math.max(1 - remaining / total, 0), 1);
      fill.style.right = (1 - pct) * 100 + "%";
      rafId = requestAnimationFrame(step);
    }

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  function closeOverlay() {
    if (!overlay) return;
    cancelAnimationFrame(rafId);
    rafId = null;

    if (CONFIG.blockKeys) {
      document.removeEventListener("keydown", onKeyBlock, true);
    }
    if (titleTimer) {
      clearInterval(titleTimer);
      titleTimer = null;
      document.title = originalTitle;
    }

    var el = overlay;
    overlay = null;

    el.style.transition = "opacity 180ms ease";
    el.style.opacity = "0";
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);

    unfreezePage();

    if (typeof CONFIG.onRelease === "function") {
      try {
        CONFIG.onRelease();
      } catch (e) {}
    }
  }

  if (global.fetch) {
    var _fetch = global.fetch;
    global.fetch = function () {
      if (!register()) {
        return Promise.reject(
          new DOMException("Bloqueado por proteção de acesso", "AbortError")
        );
      }
      return _fetch.apply(this, arguments);
    };
  }

  if (global.XMLHttpRequest) {
    var XHR = global.XMLHttpRequest;
    var _open = XHR.prototype.open;
    var _send = XHR.prototype.send;
    XHR.prototype.open = function () {
      this.__rgChecked = false;
      return _open.apply(this, arguments);
    };
    XHR.prototype.send = function () {
      if (!this.__rgChecked) {
        this.__rgChecked = true;
        if (!register()) {
          try {
            this.abort();
          } catch (e) {}
          return;
        }
      }
      return _send.apply(this, arguments);
    };
  }

  (function detectReloadBurst() {
    try {
      var k = "gbz_rg_reload_" + TAB_ID;
      var now = Date.now();
      var arr = [];
      try {
        arr = JSON.parse(sessionStorage.getItem(k) || "[]");
      } catch (e) {
        arr = [];
      }
      var filtered = [];
      for (var i = 0; i < arr.length; i++) {
        if (now - arr[i] < CONFIG.reloadWindowMs) filtered.push(arr[i]);
      }
      filtered.push(now);
      sessionStorage.setItem(k, JSON.stringify(filtered));

      if (filtered.length > CONFIG.reloadLimit) {
        punishReload();
      }
    } catch (e) {}
  })();

  global.RateGuard = {
    track: function () {
      return register();
    },
    blocked: function () {
      return isBlocked();
    },
    punish: function (ms) {
      var now = Date.now();
      recid.level = Math.min(
        recid.level + 1,
        CONFIG.penaltySeconds.length
      );
      recid.lastPunish = now;
      saveRecid();

      var idx = recid.level - 1;
      if (idx < 0) idx = 0;
      if (idx >= CONFIG.penaltySeconds.length) {
        idx = CONFIG.penaltySeconds.length - 1;
      }
      var waitMs = ms || CONFIG.penaltySeconds[idx] * 1000;

      state.blockedUntil = now + waitMs;
      state.hits = [];
      saveSession();

      openOverlay(100, waitMs);
    },
    release: function () {
      state.blockedUntil = 0;
      saveSession();
      closeOverlay();
    },
    reset: function () {
      state = blankSession();
      recid = blankRecid();
      saveSession();
      saveRecid();
      closeOverlay();
      try {
        sessionStorage.removeItem("gbz_rg_reload_" + TAB_ID);
      } catch (e) {}
    },
    stats: function () {
      return {
        tabId: TAB_ID,
        hits: prune(state.hits, CONFIG.windowMs).length,
        burst: prune(state.hits, CONFIG.burstWindowMs).length,
        risk: computeRisk(),
        level: recid.level,
        blocked: isBlocked(),
        blockedFor: Math.max(0, state.blockedUntil - Date.now()),
        nextWaitMs:
          CONFIG.penaltySeconds[
            Math.min(
              Math.max(recid.level - 1, 0),
              CONFIG.penaltySeconds.length - 1
            )
          ] * 1000
      };
    },
    configure: function (opts) {
      if (!opts) return;
      Object.keys(opts).forEach(function (k) {
        if (k === "copy" && opts.copy) {
          Object.keys(opts.copy).forEach(function (ck) {
            CONFIG.copy[ck] = opts.copy[ck];
          });
        } else {
          CONFIG[k] = opts[k];
        }
      });
    }
  };

  if (!global.AntiAbuse) global.AntiAbuse = global.RateGuard;

  function boot() {
    if (isBlocked()) openOverlay(0, Math.max(0, state.blockedUntil - Date.now()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})(window);