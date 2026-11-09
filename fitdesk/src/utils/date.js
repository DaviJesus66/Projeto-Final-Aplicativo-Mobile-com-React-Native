export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const pad = (n) => String(n).padStart(2, '0');

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isFuture(date) {
  return startOfDay(date) > startOfDay(new Date());
}

export function formatDate(value) {
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Hoje conta como o 1º dia: "últimos 7 dias" = hoje e os 6 anteriores.
export function isWithinLastDays(value, days) {
  const limit = startOfDay(new Date());
  limit.setDate(limit.getDate() - (days - 1));
  return startOfDay(value) >= limit;
}

export function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
