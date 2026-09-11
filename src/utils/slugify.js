/* ============================================================
 * UTILS / SLUGIFY.JS
 * ============================================================ */

export function slugify(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function unslugify(slug = '') {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
