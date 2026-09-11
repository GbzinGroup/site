(function (global) {
  "use strict";

  if (global.AdBlockGuard) return;

  var CONFIG = {
    probeDelayMs: 0,
    recheckMs: 2000,
    zIndex: 2147483600,
    blockTitle: true,
    lockBody: true,

    adScript:
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    netProbe: "https://www.gstatic.com/generate_204",

    baitClasses:
      "ad-banner ad-container adsbox doubleclick ad-placement sponsored-content text-ad ad-slot pub_300x250 pub_300x250m pub_728x90 text-ad-links",

    copy: {
      brand: "Gbzin Group",
      badge: "Acesso bloqueado",
      title: "Desative o bloqueador de anúncios para continuar",
      body: "Este site é mantido por anúncios. Para acessar o conteúdo, desative o bloqueador e aguarde — a página será liberada automaticamente.",
      stepsTitle: "Como desativar",
      steps: [
        "Abra as extensões do seu navegador (ícone de quebra-cabeça)",
        "Encontre o bloqueador: uBlock, AdBlock, AdGuard, Brave Shields ou similar",
        "Clique em 'Pausar neste site' ou adicione gbzin.group à lista de exceções",
        "A página será liberada automaticamente em poucos segundos"
      ],
      waiting: "Verificando...",
      footer: "Sem anúncios, os serviços gratuitos da Gbzin Group não podem continuar.",
      manual: "Verificar novamente"
    },

    onBlock: null,
    onUnblock: null
  };

  var state = {
    blocked: false,
    released: false,
    overlay: null,
    recheckTimer: null,
    titleTimer: null,
    originalTitle: document.title,
    originalBodyOverflow: null,
    hadContent: false,
    probeRunning: false
  };

  function injectStyles() {
    if (document.getElementById("abg4-styles")) return;
    var s = document.createElement("style");
    s.id = "abg4-styles";
    s.textContent =
      "html.abg4-lock,html.abg4-lock body{overflow:hidden!important;height:100%!important}" +
      ".abg4-root,.abg4-root *{box-sizing:border-box}" +
      ".abg4-root{position:fixed;inset:0;z-index:" +
      CONFIG.zIndex +
      ";display:grid;place-items:center;padding:24px;" +
      "background:radial-gradient(1200px 600px at 50% -10%,rgba(108,92,231,.1),transparent 60%),rgba(8,8,12,.96);" +
      "-webkit-backdrop-filter:blur(20px) saturate(140%);backdrop-filter:blur(20px) saturate(140%);" +
      "font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;" +
      "color:#ececf1}" +
      ".abg4-card{width:100%;max-width:540px;background:#17171d;border:1px solid #2a2a33;border-radius:14px;" +
      "box-shadow:0 1px 0 rgba(255,255,255,.02) inset,0 30px 80px -20px rgba(0,0,0,.9),0 8px 24px -12px rgba(0,0,0,.7);" +
      "overflow:hidden}" +
      ".abg4-top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #2a2a33;background:#1d1d24}" +
      ".abg4-mark{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:#23232c;border:1px solid #33333d;color:#8577f0;flex-shrink:0}" +
      ".abg4-mark svg{width:12px;height:12px;display:block}" +
      ".abg4-brand{font-size:12px;font-weight:600;letter-spacing:.02em;color:#9a9aa6}" +
      ".abg4-pill{margin-left:auto;font-size:11px;color:#ff8080;padding:4px 8px;border:1px solid rgba(255,90,90,.3);border-radius:999px;background:rgba(255,90,90,.08);font-weight:600}" +
      ".abg4-body{padding:28px 24px 22px}" +
      ".abg4-title{font-size:20px;line-height:1.3;font-weight:650;letter-spacing:-.01em;margin:0 0 10px;color:#ececf1}" +
      ".abg4-text{font-size:13.5px;line-height:1.6;color:#9a9aa6;margin:0 0 20px}" +
      ".abg4-box{padding:16px 18px;border:1px solid #2a2a33;border-radius:10px;background:#121218;margin-bottom:18px}" +
      ".abg4-box-title{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:#6b6b78;font-weight:600;margin-bottom:10px}" +
      ".abg4-steps{margin:0;padding:0 0 0 18px;font-size:13px;line-height:1.7;color:#c4c4ce}" +
      ".abg4-steps li{margin-bottom:6px}" +
      ".abg4-actions{display:flex;gap:8px}" +
      ".abg4-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 18px;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;border:1px solid #2a2a33;background:#1d1d24;color:#c4c4ce;transition:transform .12s ease,background .15s ease,border-color .15s ease;font-family:inherit}" +
      ".abg4-btn:hover{background:#23232c;border-color:#33333d}" +
      ".abg4-btn:active{transform:scale(.98)}" +
      ".abg4-btn[disabled]{opacity:.7;cursor:wait}" +
      ".abg4-meta{display:flex;align-items:center;gap:8px;font-size:11.5px;color:#6b6b78;border-top:1px solid #2a2a33;padding-top:14px;margin-top:20px}" +
      ".abg4-dot{width:6px;height:6px;border-radius:999px;background:#ff5c5c;box-shadow:0 0 0 3px rgba(255,92,92,.14);flex-shrink:0;animation:abg4-pulse 1.6s ease-in-out infinite}" +
      "@keyframes abg4-pulse{0%,100%{opacity:1}50%{opacity:.4}}" +
      "@media (max-width:480px){.abg4-card{border-radius:12px}.abg4-body{padding:22px 18px 18px}.abg4-actions{flex-direction:column}}" +
      ".abg4-steps code{background:#23232c;border:1px solid #2a2a33;border-radius:4px;padding:1px 5px;font-size:12px;color:#8577f0}";
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

  function probeCosmetic() {
    return new Promise(function (resolve) {
      try {
        var el = document.createElement("div");
        el.className = CONFIG.baitClasses;
        el.innerHTML = "&nbsp;";
        el.setAttribute("data-abg4-bait", "1");
        el.style.cssText =
          "position:fixed!important;left:-99999px!important;top:-99999px!important;" +
          "width:12px!important;height:12px!important;pointer-events:none!important;";
        document.body.appendChild(el);

        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            var cs = window.getComputedStyle(el);
            var hidden = false;

            if (!cs) hidden = false;
            else if (cs.display === "none") hidden = true;
            else if (cs.visibility === "hidden" || cs.visibility === "collapse") hidden = true;
            else if (parseFloat(cs.opacity) === 0) hidden = true;
            else if (el.offsetWidth === 0 && el.offsetHeight === 0) hidden = true;

            if (el.parentNode) el.parentNode.removeChild(el);
            resolve(hidden);
          });
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  function probeNetwork() {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        resolve(false);
      }, 2500);

      try {
        fetch(CONFIG.netProbe + "?t=" + Date.now(), {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          credentials: "omit"
        })
          .then(function () {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve(true);
          })
          .catch(function () {
            if (done) return;
            done = true;
            clearTimeout(timer);
            resolve(false);
          });
      } catch (e) {
        clearTimeout(timer);
        if (!done) {
          done = true;
          resolve(false);
        }
      }
    });
  }

  function probeAdScript() {
    return new Promise(function (resolve) {
      var done = false;
      var s = document.createElement("script");
      s.async = true;
      s.src = CONFIG.adScript + "?abg4=" + Math.random().toString(36).slice(2);

      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        if (s.parentNode) s.parentNode.removeChild(s);
        resolve(false);
      }, 2500);

      s.onload = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (s.parentNode) s.parentNode.removeChild(s);
        resolve(true);
      };
      s.onerror = function () {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (s.parentNode) s.parentNode.removeChild(s);
        resolve(false);
      };

      try {
        document.head.appendChild(s);
      } catch (e) {
        clearTimeout(timer);
        if (!done) {
          done = true;
          resolve(false);
        }
      }
    });
  }

  function probe() {
    if (state.probeRunning) return Promise.resolve(null);
    state.probeRunning = true;

    return Promise.all([probeCosmetic(), probeNetwork(), probeAdScript()])
      .then(function (r) {
        state.probeRunning = false;
        var cosmeticHidden = r[0];
        var networkOk = r[1];
        var adScriptOk = r[2];

        var blocked = false;

        if (cosmeticHidden) {
          blocked = true;
        } else if (!adScriptOk) {
          blocked = true;
        } else if (!networkOk && !adScriptOk) {
          blocked = true;
        }

        return {
          blocked: blocked,
          cosmetic: cosmeticHidden,
          network: networkOk,
          adScript: adScriptOk
        };
      })
      .catch(function () {
        state.probeRunning = false;
        return { blocked: false, cosmetic: false, network: false, adScript: false };
      });
  }

  function hideContent() {
    if (state.hadContent) return;
    state.hadContent = true;

    var nodes = document.body.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType !== 1) continue;
      if (n.classList && n.classList.contains("abg4-root")) continue;
      if (n.tagName === "SCRIPT" || n.tagName === "STYLE") continue;
      if (n.id === "abg4-preload") continue;
      n.style.visibility = "hidden";
    }
  }

  function showContent() {
    var nodes = document.body.childNodes;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.nodeType !== 1) continue;
      if (n.classList && n.classList.contains("abg4-root")) continue;
      if (n.tagName === "SCRIPT" || n.tagName === "STYLE") continue;
      n.style.visibility = "";
    }
    state.hadContent = false;
  }

  function lockPage() {
    if (!CONFIG.lockBody) return;
    state.originalBodyOverflow = document.documentElement.style.overflow || "";
    document.documentElement.classList.add("abg4-lock");
  }

  function unlockPage() {
    document.documentElement.classList.remove("abg4-lock");
    if (state.originalBodyOverflow !== null) {
      document.documentElement.style.overflow = state.originalBodyOverflow;
      state.originalBodyOverflow = null;
    }
  }

  function blockKeys(e) {
    if (!state.blocked) return;
    var k = e.key;
    var ctrl = e.ctrlKey || e.metaKey;
    if (
      k === "F5" ||
      k === "F12" ||
      k === "F11" ||
      (ctrl && "rRuUsS".indexOf(k) !== -1) ||
      (ctrl && e.shiftKey && "rRiIjJcC".indexOf(k) !== -1)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }

  function renderOverlay() {
    if (state.overlay) return;
    injectStyles();

    var root = document.createElement("div");
    root.className = "abg4-root";
    root.setAttribute("role", "alertdialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "abg4-title");

    var stepsHtml = "";
    for (var i = 0; i < CONFIG.copy.steps.length; i++) {
      var step = esc(CONFIG.copy.steps[i]).replace(
        /gbzin\.group/g,
        "<code>gbzin.group</code>"
      );
      stepsHtml += "<li>" + step + "</li>";
    }

    root.innerHTML =
      '<div class="abg4-card" role="document">' +
        '<div class="abg4-top">' +
          '<span class="abg4-mark" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="4" y="10" width="16" height="11" rx="2"/>' +
              '<path d="M8 10V7a4 4 0 0 1 8 0v3"/>' +
            "</svg>" +
          "</span>" +
          '<span class="abg4-brand">' +
            esc(CONFIG.copy.brand) +
            " · Suporte ao projeto" +
          "</span>" +
          '<span class="abg4-pill">' + esc(CONFIG.copy.badge) + "</span>" +
        "</div>" +
        '<div class="abg4-body">' +
          '<h2 class="abg4-title" id="abg4-title">' +
            esc(CONFIG.copy.title) +
          "</h2>" +
          '<p class="abg4-text">' + esc(CONFIG.copy.body) + "</p>" +
          '<div class="abg4-box">' +
            '<div class="abg4-box-title">' +
              esc(CONFIG.copy.stepsTitle) +
            "</div>" +
            '<ol class="abg4-steps">' + stepsHtml + "</ol>" +
          "</div>" +
          '<div class="abg4-actions">' +
            '<button type="button" class="abg4-btn" data-abg4-recheck>' +
              esc(CONFIG.copy.manual) +
            "</button>" +
          "</div>" +
          '<div class="abg4-meta">' +
            '<span class="abg4-dot" aria-hidden="true"></span>' +
            "<span>" + esc(CONFIG.copy.footer) + "</span>" +
          "</div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(root);
    state.overlay = root;

    var recheckBtn = root.querySelector("[data-abg4-recheck]");
    if (recheckBtn) {
      recheckBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        recheckBtn.disabled = true;
        recheckBtn.textContent = CONFIG.copy.waiting;
        runProbe(true).then(function () {
          if (state.overlay) {
            var b = state.overlay.querySelector("[data-abg4-recheck]");
            if (b) {
              b.disabled = false;
              b.textContent = CONFIG.copy.manual;
            }
          }
        });
      });
    }
  }

  function hideOverlay() {
    if (!state.overlay) return;
    var el = state.overlay;
    state.overlay = null;

    if (state.titleTimer) {
      clearInterval(state.titleTimer);
      state.titleTimer = null;
      document.title = state.originalTitle;
    }

    el.style.transition = "opacity 180ms ease";
    el.style.opacity = "0";
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  function startTitleLock() {
    if (!CONFIG.blockTitle) return;
    if (state.titleTimer) return;
    var labels = ["⛔ Bloqueador ativo", "⛔ Desative para continuar"];
    var idx = 0;
    state.titleTimer = setInterval(function () {
      document.title = labels[idx++ % labels.length];
    }, 1500);
  }

  function startRecheck() {
    if (state.recheckTimer) return;
    state.recheckTimer = setInterval(function () {
      if (!state.blocked) return;
      if (document.hidden) return;
      probe().then(function (r) {
        if (!r) return;
        if (!r.blocked) {
          unblock(r);
        }
      });
    }, CONFIG.recheckMs);
  }

  function stopRecheck() {
    if (state.recheckTimer) {
      clearInterval(state.recheckTimer);
      state.recheckTimer = null;
    }
  }

  function block(result) {
    if (state.blocked) return;
    state.blocked = true;

    hideContent();
    lockPage();
    renderOverlay();
    startTitleLock();
    startRecheck();

    document.addEventListener("keydown", blockKeys, true);

    if (typeof CONFIG.onBlock === "function") {
      try {
        CONFIG.onBlock(result);
      } catch (e) {}
    }
  }

  function unblock(result) {
    if (!state.blocked) return;
    state.blocked = false;
    state.released = true;

    stopRecheck();
    hideOverlay();
    unlockPage();
    showContent();

    document.removeEventListener("keydown", blockKeys, true);

    if (typeof CONFIG.onUnblock === "function") {
      try {
        CONFIG.onUnblock(result);
      } catch (e) {}
    }
  }

  function runProbe(force) {
    if (!force && state.blocked) return Promise.resolve();
    return probe().then(function (r) {
      if (!r) return;
      if (r.blocked) {
        block(r);
      } else if (state.blocked) {
        unblock(r);
      }
      return r;
    });
  }

  global.AdBlockGuard = {
    start: function () {
      return runProbe(true);
    },
    check: function () {
      return runProbe(true);
    },
    blocked: function () {
      return state.blocked;
    },
    released: function () {
      return state.released;
    },
    forceBlock: function () {
      block({ cosmetic: true, network: false, adScript: false });
    },
    forceUnblock: function () {
      unblock({ cosmetic: false, network: true, adScript: true });
    },
    diagnose: function () {
      return {
        blocked: state.blocked,
        released: state.released,
        overlayOpen: !!state.overlay,
        recheckRunning: !!state.recheckTimer,
        probeRunning: state.probeRunning
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

  function boot() {
    runProbe(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})(window);