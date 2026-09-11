/* ============================================================
 * CORE / EVENTS.JS - Event bus (pub/sub)
 * ============================================================ */

const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => off(event, handler);
}

export function off(event, handler) {
  listeners.get(event)?.delete(handler);
}

export function emit(event, detail = {}) {
  listeners.get(event)?.forEach(fn => {
    try { fn(detail); }
    catch (e) { console.error(`[events] Erro em "${event}":`, e); }
  });

  // Também dispara evento de DOM para desacoplar
  window.dispatchEvent(new CustomEvent(`gbzin:${event}`, { detail }));
}

export function once(event, handler) {
  const unsub = on(event, (data) => {
    unsub();
    handler(data);
  });
  return unsub;
}

export const EVENTS = Object.freeze({
  THEME_CHANGED: 'theme:changed',
  COOKIES_ACCEPTED: 'cookies:accepted',
  COOKIES_REJECTED: 'cookies:rejected',
  NAV_OPENED: 'nav:opened',
  NAV_CLOSED: 'nav:closed',
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  SEARCH_OPEN: 'search:open',
  SEARCH_QUERY: 'search:query',
  NEWSLETTER_OK: 'newsletter:ok',
  NEWSLETTER_ERROR: 'newsletter:error',
  FORM_SUBMITTED: 'form:submitted',
  FORM_SUCCESS: 'form:success',
  FORM_ERROR: 'form:error'
});
