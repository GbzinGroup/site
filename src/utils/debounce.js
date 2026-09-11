/* ============================================================
 * UTILS / DEBOUNCE.JS
 * ============================================================ */

export function debounce(fn, delay = 300) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  debounced.flush = (...args) => { clearTimeout(timer); fn(...args); };
  return debounced;
}

export function throttle(fn, limit = 100) {
  let inThrottle = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (inThrottle) return;
    inThrottle = true;
    fn(...lastArgs);
    setTimeout(() => { inThrottle = false; }, limit);
  };
}

export function rafThrottle(fn) {
  let scheduled = false;
  return (...args) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      fn(...args);
      scheduled = false;
    });
  };
}
