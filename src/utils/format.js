/* ============================================================
 * UTILS / FORMAT.JS - Formatadores
 * ============================================================ */

export function data(iso, opts = {}) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...opts
  });
}

export function dataCurta(iso) {
  return data(iso, { month: 'short' });
}

export function hora(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function moeda(valor, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda
  }).format(valor);
}

export function numero(valor, decimais = 0) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais
  }).format(valor);
}

export function compacto(valor) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(valor);
}

export function bytes(b) {
  if (b === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

export function tempoRelativo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = 60_000, hr = 60 * min, day = 24 * hr, week = 7 * day, month = 30 * day, year = 365 * day;

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (diff < min) return 'agora';
  if (diff < hr) return rtf.format(-Math.floor(diff / min), 'minute');
  if (diff < day) return rtf.format(-Math.floor(diff / hr), 'hour');
  if (diff < week) return rtf.format(-Math.floor(diff / day), 'day');
  if (diff < month) return rtf.format(-Math.floor(diff / week), 'week');
  if (diff < year) return rtf.format(-Math.floor(diff / month), 'month');
  return rtf.format(-Math.floor(diff / year), 'year');
}

export function truncar(texto, max = 100) {
  if (!texto || texto.length <= max) return texto;
  return texto.slice(0, max).trimEnd() + '…';
}

export function iniciais(nome = '') {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
}

export function telefone(v) {
  const d = String(v).replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v;
}

export function cpf(v) {
  const d = String(v).replace(/\D/g, '');
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function cnpj(v) {
  const d = String(v).replace(/\D/g, '');
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function cep(v) {
  const d = String(v).replace(/\D/g, '');
  return d.replace(/(\d{5})(\d{3})/, '$1-$2');
}
