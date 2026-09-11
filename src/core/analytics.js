/* ============================================================
 * CORE / ANALYTICS.JS - GA4 + eventos customizados
 * ============================================================ */

import { CONFIG } from './config.js';
import { logger } from './logger.js';

let initialized = false;

export function init() {
  if (!CONFIG.ANALYTICS.enabled || initialized) return;
  if (typeof window.gtag !== 'function') {
    logger.warn('gtag nao encontrado, analytics desativado');
    return;
  }

  initialized = true;

  if (CONFIG.ANALYTICS.trackPageViews) {
    trackPageView();
  }

  if (CONFIG.ANALYTICS.trackOutbound) {
    trackOutboundLinks();
  }

  logger.info('Analytics inicializado');
}

export function trackPageView(path = location.pathname) {
  if (!initialized) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: location.href,
    page_title: document.title
  });
}

export function trackEvent(name, params = {}) {
  if (!initialized) return;
  window.gtag('event', name, params);
}

export function trackClick(el, category, label) {
  if (!initialized) return;
  trackEvent('click', {
    event_category: category,
    event_label: label || el?.textContent?.trim()?.slice(0, 100) || ''
  });
}

function trackOutboundLinks() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) {
      trackEvent('outbound_click', {
        event_category: 'outbound',
        event_label: url.href
      });
    }
  });
}

export default { init, trackPageView, trackEvent, trackClick };
