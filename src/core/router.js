/* ============================================================
 * CORE / ROUTER.JS - SPA router minimalista (history API)
 * ============================================================ */

import { emit } from './events.js';
import { logger } from './logger.js';

const routes = [];
let current = null;

export function add(path, handler) {
  const pattern = path.replace(/:[^/]+/g, '([^/]+)');
  const regex = new RegExp(`^${pattern}$`);
  routes.push({ path, regex, handler });
}

export function navigate(path, { replace = false } = {}) {
  if (replace) history.replaceState({}, '', path);
  else history.pushState({}, '', path);
  resolve();
}

export function resolve() {
  const path = location.pathname;
  for (const route of routes) {
    const match = path.match(route.regex);
    if (match) {
      current = route;
      try {
        route.handler({ params: match.slice(1), path });
        emit('router:navigated', { path });
      } catch (e) {
        logger.error('Erro na rota', path, e);
      }
      return;
    }
  }
  emit('router:notfound', { path });
}

export function start() {
  window.addEventListener('popstate', resolve);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-router]');
    if (!a) return;
    if (a.target || a.host !== location.host) return;
    e.preventDefault();
    navigate(a.getAttribute('href'));
  });
  resolve();
  logger.info('Router iniciado');
}

export function getCurrent() { return current; }
