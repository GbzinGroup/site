/* ============================================================
 * UTILS / VALIDATE.JS - Validacoes
 * ============================================================ */

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

export const isURL = (v) => {
  try { new URL(v); return true; } catch { return false; }
};

export const isPhoneBR = (v) => {
  const d = String(v).replace(/\D/g, '');
  return d.length === 10 || d.length === 11;
};

export const isCEP = (v) => /^\d{5}-?\d{3}$/.test(String(v).trim());

export const isCPF = (v) => {
  const cpf = String(v).replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  const calc = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * (base.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calc(cpf.slice(0, 9));
  const d2 = calc(cpf.slice(0, 10));
  return d1 === parseInt(cpf[9]) && d2 === parseInt(cpf[10]);
};

export const isCNPJ = (v) => {
  const cnpj = String(v).replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calc = (base, pesos) => {
    const sum = base.split('').reduce((acc, d, i) => acc + parseInt(d) * pesos[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calc(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
  const d2 = calc(cnpj.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  return d1 === parseInt(cnpj[12]) && d2 === parseInt(cnpj[13]);
};

export const isStrongPassword = (v) => {
  const s = String(v);
  return s.length >= 8 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s);
};

export function passwordStrength(v) {
  const s = String(v);
  let score = 0;
  if (s.length >= 8) score++;
  if (s.length >= 12) score++;
  if (/[a-z]/.test(s)) score++;
  if (/[A-Z]/.test(s)) score++;
  if (/\d/.test(s)) score++;
  if (/[^a-zA-Z0-9]/.test(s)) score++;

  const labels = ['Muito fraca', 'Fraca', 'Razoavel', 'Boa', 'Forte', 'Muito forte', 'Excelente'];
  return {
    score,
    max: 6,
    percent: Math.round((score / 6) * 100),
    label: labels[score]
  };
}

export const isEmpty = (v) => v == null || String(v).trim() === '';

export function validate(data, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const checks = Array.isArray(rule) ? rule : [rule];

    for (const check of checks) {
      const err = typeof check === 'function'
        ? check(value, data)
        : (check.test && !check.test(value) ? check.message : null);

      if (err) { errors[field] = err; break; }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
