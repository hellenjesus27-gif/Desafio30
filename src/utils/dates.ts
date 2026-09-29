export type ISODate = string;

const MS_DAY = 86400000;

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISO(now);
}

/** Número de dias (UTC) de uma data ISO — evita problemas de fuso/horário de verão. */
export function dayNumber(date: ISODate): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / MS_DAY);
}

export function addDays(date: ISODate, n: number): ISODate {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/** Índice do dia dentro do desafio (0 = primeiro dia). */
export function dayIndex(start: ISODate, date: ISODate): number {
  return dayNumber(date) - dayNumber(start);
}

/** Semana do desafio (0-based): dias 0-6 = semana 0, etc. */
export function weekIndex(start: ISODate, date: ISODate): number {
  return Math.floor(dayIndex(start, date) / 7);
}

export function formatBR(date: ISODate): string {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
}

export function weekdayShort(date: ISODate): string {
  const [y, m, d] = date.split('-').map(Number);
  return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}
