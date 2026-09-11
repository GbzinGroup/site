/* ============================================================
 * CORE / SEO.JS - Meta tags dinamicas
 * ============================================================ */

import { CONFIG } from './config.js';

export function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setOG(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export function setTitle(title) {
  document.title = title ? `${title} | ${CONFIG.SITE.name}` : CONFIG.SITE.name;
}

export function update(data = {}) {
  const {
    title,
    description,
    image,
    url = location.href,
    type = 'website',
    locale = CONFIG.SITE.locale
  } = data;

  if (title) setTitle(title);
  if (description) {
    setMeta('description', description);
    setOG('og:description', description);
    setMeta('twitter:description', description);
  }
  if (image) {
    const img = image.startsWith('http') ? image : `${CONFIG.SITE.url}${image}`;
    setOG('og:image', img);
    setMeta('twitter:image', img);
  }

  setOG('og:title', title || document.title);
  setOG('og:url', url);
  setOG('og:type', type);
  setOG('og:locale', locale.replace('-', '_'));
  setOG('og:site_name', CONFIG.SITE.name);

  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title || document.title);

  setCanonical(url);
}

export function injectJSONLD(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
