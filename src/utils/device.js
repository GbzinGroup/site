/* ============================================================
 * UTILS / DEVICE.JS - Deteccao de dispositivo
 * ============================================================ */

export const isMobile = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
export const isAndroid = () => /Android/i.test(navigator.userAgent);
export const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
export const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const isFirefox = () => /Firefox/i.test(navigator.userAgent);

export const prefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const prefersReducedData = () =>
  window.matchMedia?.('(prefers-reduced-data: reduce)').matches ?? false;

export const isOnline = () => navigator.onLine;

export function onOnline(cb) {
  window.addEventListener('online', cb);
  return () => window.removeEventListener('online', cb);
}

export function onOffline(cb) {
  window.addEventListener('offline', cb);
  return () => window.removeEventListener('offline', cb);
}

export const connection = () => {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return c ? { type: c.effectiveType, downlink: c.downlink, saveData: c.saveData } : null;
};
