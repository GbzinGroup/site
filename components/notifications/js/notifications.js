/* ============================================================
 * NOTIFICATIONS.JS - Sistema de notificacoes em componentes
 * Uso: window.Notifications.init()
 * ============================================================ */

(function (global) {
  'use strict';

  const DATA_URL = '/components/notifications/data/notifications.json';
  const STORAGE_KEY = 'gbzin_notif_dismissed';
  const SESSION_KEY = 'gbzin_notif_session';

  let container = null;
  let bannerContainer = null;
  let cache = null;
  let shown = new Set();

  /* ============================================================
   * HELPERS
   * ============================================================ */
  function getDismissed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function setDismissed(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }

  function wasDismissed(id) {
    return getDismissed().includes(id);
  }

  function markDismissed(id) {
    const ids = getDismissed();
    if (!ids.includes(id)) {
      ids.push(id);
      setDismissed(ids);
    }
  }

  function getSessionShown() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || []; }
    catch { return []; }
  }

  function markSessionShown(id) {
    const ids = getSessionShown();
    if (!ids.includes(id)) {
      ids.push(id);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids));
    }
  }

  function inSession(id) {
    return getSessionShown().includes(id);
  }

  function matchesPage(paginas) {
    if (!paginas || !paginas.length) return true;
    if (paginas.includes('*')) return true;
    const path = location.pathname;
    return paginas.some(p => path === p || path.startsWith(p));
  }

  function isActive(n) {
    if (n.ativo === false) return false;
    const now = Date.now();
    if (n.inicio && new Date(n.inicio).getTime() > now) return false;
    if (n.fim && new Date(n.fim).getTime() < now) return false;
    return true;
  }

  function createEl(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function escapeHTML(str = '') {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* ============================================================
   * CONTAINERS
   * ============================================================ */
  function ensureContainer() {
    if (container) return container;
    container = document.querySelector('.notif-container');
    if (!container) {
      container = createEl('div', { class: 'notif-container', role: 'region', 'aria-live': 'polite', 'aria-label': 'Notificacoes' });
      document.body.appendChild(container);
    }
    return container;
  }

  function ensureBannerContainer() {
    if (bannerContainer) return bannerContainer;
    bannerContainer = document.querySelector('.notif-banner-container');
    if (!bannerContainer) {
      bannerContainer = createEl('div', { class: 'notif-banner-container', role: 'region', 'aria-label': 'Avisos' });
      document.body.appendChild(bannerContainer);
    }
    return bannerContainer;
  }

  /* ============================================================
   * CARD DE NOTIFICACAO (canto)
   * ============================================================ */
  function buildCard(n, { onClose } = {}) {
    const closeBtn = n.dismissivel !== false ? createEl('button', {
      class: 'notif-close',
      'aria-label': 'Fechar',
      onclick: () => { close(); onClose?.(); }
    }, createEl('i', { class: 'fas fa-times' })) : null;

    const cta = n.cta ? createEl('a', {
      class: 'notif-cta',
      href: n.cta.href,
      target: n.cta.externo ? '_blank' : null,
      rel: n.cta.externo ? 'noopener' : null
    }, n.cta.texto, createEl('i', { class: 'fas fa-arrow-right' })) : null;

    const progress = n.duracao > 0 ? createEl('div', { class: 'notif-progress' }) : null;

    const el = createEl('div', {
      class: `notif notif-${n.cor || 'accent'}`,
      role: 'alert',
      'data-id': n.id
    },
      createEl('div', { class: 'notif-icon' }, createEl('i', { class: `fas ${n.icone || 'fa-bell'}` })),
      createEl('div', { class: 'notif-content' },
        createEl('h3', { class: 'notif-title' }, escapeHTML(n.titulo)),
        createEl('p', { class: 'notif-message' }, escapeHTML(n.mensagem)),
        cta
      ),
      closeBtn,
      progress
    );

    let timer;
    const close = () => {
      clearTimeout(timer);
      el.classList.add('notif-hiding');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    };

    if (n.duracao > 0 && progress) {
      progress.style.width = '100%';
      requestAnimationFrame(() => {
        progress.style.transition = `width ${n.duracao}ms linear`;
        progress.style.width = '0%';
      });
      timer = setTimeout(close, n.duracao);
    }

    return { el, close };
  }

  /* ============================================================
   * BANNER (topo da pagina)
   * ============================================================ */
  function buildBanner(n) {
    const cta = n.cta ? createEl('a', {
      class: 'notif-banner-cta',
      href: n.cta.href,
      target: n.cta.externo ? '_blank' : null,
      rel: n.cta.externo ? 'noopener' : null
    }, n.cta.texto) : null;

    const el = createEl('div', {
      class: `notif-banner notif-banner-${n.cor || 'accent'}`,
      role: 'alert'
    },
      createEl('i', { class: `fas ${n.icone || 'fa-bell'} notif-banner-icon` }),
      createEl('span', {}, escapeHTML(n.mensagem)),
      cta,
      n.dismissivel !== false
        ? createEl('button', {
            class: 'notif-banner-close',
            'aria-label': 'Fechar',
            onclick: close
          }, createEl('i', { class: 'fas fa-times' }))
        : null
    );

    function close() {
      el.classList.remove('notif-visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      markDismissed(n.id);
    }

    return { el, close };
  }

  /* ============================================================
   * POPUP (centralizado)
   * ============================================================ */
  function buildPopup(n, { onClose } = {}) {
    const cta = n.cta ? createEl('a', {
      class: 'btn btn-primary',
      href: n.cta.href,
      target: n.cta.externo ? '_blank' : null,
      rel: n.cta.externo ? 'noopener' : null
    }, createEl('i', { class: `fas ${n.icone || 'fa-bell'}` }), ' ', n.cta.texto) : null;

    const popup = createEl('div', { class: 'notif-popup', role: 'dialog', 'aria-modal': 'true' },
      createEl('button', {
        class: 'notif-popup-close',
        'aria-label': 'Fechar',
        onclick: () => close()
      }, createEl('i', { class: 'fas fa-times' })),
      createEl('div', { class: `notif-popup-icon notif-${n.cor || 'accent'}` },
        createEl('i', { class: `fas ${n.icone || 'fa-bell'}` })),
      createEl('h2', { class: 'notif-popup-title' }, escapeHTML(n.titulo)),
      createEl('p', { class: 'notif-popup-message' }, escapeHTML(n.mensagem)),
      createEl('div', { class: 'notif-popup-actions' },
        createEl('button', { class: 'btn btn-secondary', onclick: () => close() }, 'Fechar'),
        cta
      )
    );

    const overlay = createEl('div', {
      class: 'notif-popup-overlay',
      onclick: (e) => { if (e.target === overlay) close(); }
    }, popup);

    function close() {
      overlay.classList.remove('notif-visible');
      setTimeout(() => overlay.remove(), 300);
      document.body.style.overflow = '';
      markDismissed(n.id);
      onClose?.();
    }

    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    return { el: overlay, close };
  }

  /* ============================================================
   * SHOW — dispara a notificacao conforme o tipo
   * ============================================================ */
  function show(n, { force = false } = {}) {
    if (!force && !isActive(n)) return;
    if (!force && !matchesPage(n.paginas)) return;
    if (!force && n.uma_vez && wasDismissed(n.id)) return;
    if (!force && inSession(n.id)) return;

    markSessionShown(n.id);
    shown.add(n.id);

    let handle;

    switch (n.tipo) {
      case 'cookie':
      case 'live':
        handle = buildPopup(n);
        document.body.appendChild(handle.el);
        requestAnimationFrame(() => handle.el.classList.add('notif-visible'));
        document.body.style.overflow = 'hidden';
        break;

      case 'security':
      case 'maintenance':
      case 'update':
        handle = buildBanner(n);
        ensureBannerContainer().appendChild(handle.el);
        requestAnimationFrame(() => handle.el.classList.add('notif-visible'));
        break;

      case 'promo':
      case 'status':
      case 'news':
      case 'welcome':
      case 'review':
      default:
        handle = buildCard(n, { onClose: () => { if (n.uma_vez) markDismissed(n.id); } });
        ensureContainer().appendChild(handle.el);
        requestAnimationFrame(() => handle.el.classList.add('notif-visible'));
        break;
    }

    if (n.dismissivel !== false && n.tipo !== 'cookie') {
      // Marca como dispensada se o usuario fechou
      handle.el.addEventListener('click', (e) => {
        if (e.target.closest('.notif-close, .notif-banner-close, .notif-popup-close')) {
          markDismissed(n.id);
        }
      });
    }
  }

  /* ============================================================
   * CARREGAR JSON
   * ============================================================ */
  async function carregar() {
    if (cache) return cache;
    try {
      const r = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!r.ok) throw new Error('Falha ao carregar notificacoes');
      const data = await r.json();
      cache = data.notificacoes || [];
      return cache;
    } catch (e) {
      console.warn('[notifications] Nao foi possivel carregar:', e);
      cache = [];
      return cache;
    }
  }

  /* ============================================================
   * INIT — chamar no carregamento da pagina
   * ============================================================ */
  async function init({ max = 3, delay = 800 } = {}) {
    const todas = await carregar();
    const validas = todas
      .filter(n => isActive(n) && matchesPage(n.paginas))
      .filter(n => !inSession(n.id))
      .filter(n => !(n.uma_vez && wasDismissed(n.id)))
      .sort((a, b) => (b.prioridade || 0) - (a.prioridade || 0))
      .slice(0, max);

    validas.forEach((n, i) => {
      setTimeout(() => show(n), delay + i * 400);
    });

    return validas;
  }

  /* ============================================================
   * API PUBLICA
   * ============================================================ */
  global.Notifications = {
    init,
    show,
    carregar,
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
  };

  /* Auto-init se data-auto estiver presente */
  if (document.currentScript?.dataset?.auto !== undefined) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }
  }

})(window);
