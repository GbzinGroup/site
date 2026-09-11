/* ============================================================
 * CORE / LOGGER.JS - Logger estruturado
 * ============================================================ */

import { CONFIG } from './config.js';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = {
  debug: 'color:#888',
  info: 'color:#0984e3',
  warn: 'color:#fdcb6e',
  error: 'color:#d63031;font-weight:bold'
};

const currentLevel = CONFIG.DEBUG.verbose ? LEVELS.debug : LEVELS.info;

function log(level, ...args) {
  if (!CONFIG.DEBUG.logger) return;
  if (LEVELS[level] < currentLevel) return;

  const prefix = `%c[${CONFIG.SITE.name}:${level.toUpperCase()}]`;
  console[level === 'debug' ? 'log' : level](prefix, COLORS[level], ...args);
}

export const logger = {
  debug: (...a) => log('debug', ...a),
  info: (...a) => log('info', ...a),
  warn: (...a) => log('warn', ...a),
  error: (...a) => log('error', ...a)
};

export default logger;
