/* ============================================================
 * CORE / HTTP.JS - Wrapper de fetch com retry, timeout e JSON
 * ============================================================ */

export class HttpError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.response = response;
  }
}

export async function http(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 15000,
    retries = 0,
    retryDelay = 500,
    json = true
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const finalHeaders = {
    Accept: 'application/json',
    ...(body && json ? { 'Content-Type': 'application/json' } : {}),
    ...headers
  };

  const finalBody =
    body && json && typeof body !== 'string' ? JSON.stringify(body) : body;

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!res.ok) {
      if (retries > 0 && res.status >= 500) {
        await new Promise(r => setTimeout(r, retryDelay));
        return http(url, { ...options, retries: retries - 1, retryDelay: retryDelay * 2 });
      }

      const data = json ? await res.json().catch(() => null) : await res.text();
      throw new HttpError(
        data?.erro || data?.message || `HTTP ${res.status}`,
        res.status,
        data
      );
    }

    return json ? res.json() : res.text();
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') {
      throw new HttpError('Tempo esgotado', 408);
    }
    throw e;
  }
}

export const get = (url, opts) => http(url, { ...opts, method: 'GET' });
export const post = (url, body, opts) => http(url, { ...opts, method: 'POST', body });
export const put = (url, body, opts) => http(url, { ...opts, method: 'PUT', body });
export const del = (url, opts) => http(url, { ...opts, method: 'DELETE' });
