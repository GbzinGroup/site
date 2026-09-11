/* ============================================================
 * CORE / CONFIG.JS - Configuracoes globais do site
 * ============================================================ */

export const CONFIG = Object.freeze({
  SITE: {
    name: 'Gbzin Group',
    tagline: 'Plataforma Digital',
    url: 'https://gbzin.com.br',
    locale: 'pt-BR',
    email: 'contato@gbzin.com.br',
    discord: 'https://discord.gg/seuconvite'
  },

  THEME: {
    default: 'dark',
    storageKey: 'gbzin_theme',
    available: ['dark', 'light', 'auto']
  },

  STORAGE: {
    prefix: 'gbzin_',
    cookieConsentKey: 'gbzin_cookie_consent'
  },

  ANALYTICS: {
    enabled: false,
    ga4Id: 'G-XXXXXXXXXX',
    trackPageViews: true,
    trackOutbound: true
  },

  PWA: {
    enabled: true,
    serviceWorker: '/service-worker.js'
  },

  FEATURES: {
    cookieBanner: true,
    backToTop: true,
    scrollReveal: true,
    searchGlobal: false,
    lazyImages: true
  },

  DEBUG: {
    logger: true,
    verbose: false
  }
});

export default CONFIG;
