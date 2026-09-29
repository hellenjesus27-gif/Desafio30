import type {
  Challenge, DayLog, ISODate, MinStatus, Rules, UserData, UserStats, RankingFilter,
} from '../types';
import { addDays, dayIndex, weekIndex } from './dates';

export const DEFAULT_RULES: Rules = {
  workoutsPerWeek: 4,
  workoutBonusAt: 5,
  cardioPerWeek: 3,
  cardioMinMinutes: 30,
  waterGoalMl: 3000,
  points: { workout: 10, workoutBonus: 5, cardio: 5, water: 5, noSweets: 5, noAlcohol: 5 },
};

/** Status do mínimo semanal de treino. */
export function workoutStatus(count: number, rules: Rules): MinStatus {
  if (count >= rules.workoutBonusAt) return 'bonus';
  if (count >= rules.workoutsPerWeek) return 'met';
  return 'below';
}

/** Pontos de treino de UMA semana: 10 por treino + bônus (uma vez) ao atingir o 5º. */
export function weekWorkoutPoints(count: number, rules: Rules): number {
  const bonus = count >= rules.workoutBonusAt ? rules.points.workoutBonus : 0;
  return count * rules.points.workout + bonus;
}

function groupWeeks<T extends { date: ISODate }>(items: T[], start: ISODate): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const it of items) {
    const w = weekIndex(start, it.date);
    if (w < 0) continue;
    if (!map.has(w)) map.set(w, []);
    map.get(w)!.push(it);
  }
  return map;
}

export function dayPoints(
  log: DayLog | undefined, rules: Rules,
): { water: number; sweets: number; alcohol: number; total: number } {
  const water = log && log.waterMl >= rules.waterGoalMl ? rules.points.water : 0;
  const sweets = log?.noSweets === true ? rules.points.noSweets : 0;
  const alcohol = log?.noAlcohol === true ? rules.points.noAlcohol : 0;
  return { water, sweets, alcohol, total: water + sweets + alcohol };
}

/** Sequência atual e maior sequência de um campo booleano. Hoje sem registro não quebra a sequência. */
export function streaks(
  days: DayLog[], field: 'noSweets' | 'noAlcohol', today: ISODate,
): { current: number; best: number } {
  const map = new Map(days.map((d) => [d.date, d[field]]));
  const dates = [...map.keys()].sort();
  let best = 0;
  let run = 0;
  let prev: ISODate | null = null;
  for (const d of dates) {
    if (map.get(d) === true) {
      run = prev && addDays(prev, 1) === d && run > 0 ? run + 1 : 1;
      prev = d;
      best = Math.max(best, run);
    } else {
      run = 0;
      prev = null;
    }
  }
  let current = 0;
  let cursor = today;
  if (map.get(cursor) === undefined || map.get(cursor) === null) cursor = addDays(cursor, -1);
  while (map.get(cursor) === true) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}

/** Dias seguidos com TUDO cumprido (água + doce + álcool). */
export function perfectStreak(days: DayLog[], rules: Rules, today: ISODate): number {
  const ok = (d?: DayLog) =>
    !!d && d.waterMl >= rules.waterGoalMl && d.noSweets === true && d.noAlcohol === true;
  const map = new Map(days.map((d) => [d.date, d]));
  let cursor = today;
  if (!map.has(cursor) || !ok(map.get(cursor))) {
    // hoje ainda pode estar incompleto: começa de ontem
    if (!ok(map.get(cursor))) cursor = addDays(cursor, -1);
  }
  let n = 0;
  while (ok(map.get(cursor))) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function computeUserStats(
  userId: string, data: UserData, challenge: Pick<Challenge, 'startDate' | 'rules'>, today: ISODate,
): UserStats {
  const { rules, startDate } = challenge;
  const workouts = data.workouts.filter((w) => w.userId === userId);
  const cardios = data.cardios.filter((c) => c.userId === userId);
  const days = data.days.filter((d) => d.userId === userId);

  const wWeeks = groupWeeks(workouts, startDate);
  let workoutPoints = 0;
  wWeeks.forEach((list) => (workoutPoints += weekWorkoutPoints(list.length, rules)));

  const validCardios = cardios.filter((c) => c.minutes >= rules.cardioMinMinutes);
  const cardioPoints = validCardios.length * rules.points.cardio;

  let waterDays = 0, sweetsDays = 0, alcoholDays = 0, disciplinePoints = 0, waterPoints = 0;
  for (const d of days) {
    const p = dayPoints(d, rules);
    if (p.water) waterDays++;
    if (d.noSweets === true) sweetsDays++;
    if (d.noAlcohol === true) alcoholDays++;
    waterPoints += p.water;
    disciplinePoints += p.sweets + p.alcohol;
  }

  const currentWeek = weekIndex(startDate, today);
  const workoutsThisWeek = (wWeeks.get(currentWeek) ?? []).length;
  const cardioThisWeek = (groupWeeks(validCardios, startDate).get(currentWeek) ?? []).length;

  let weekPoints = weekWorkoutPoints(workoutsThisWeek, rules) + cardioThisWeek * rules.points.cardio;
  for (const d of days) {
    if (weekIndex(startDate, d.date) === currentWeek) {
      const p = dayPoints(d, rules);
      weekPoints += p.total;
    }
  }

  const todayWorkouts = workouts.filter((w) => w.date === today).length;
  const todayCardios = validCardios.filter((c) => c.date === today).length;
  const todayPoints =
    todayWorkouts * rules.points.workout +
    todayCardios * rules.points.cardio +
    dayPoints(days.find((d) => d.date === today), rules).total;

  const sw = streaks(days, 'noSweets', today);
  const al = streaks(days, 'noAlcohol', today);

  let failedWeeks = 0;
  for (let w = 0; w < currentWeek; w++) {
    if ((wWeeks.get(w) ?? []).length < rules.workoutsPerWeek) failedWeeks++;
  }

  return {
    userId,
    points: workoutPoints + cardioPoints + waterPoints + disciplinePoints,
    weekPoints,
    todayPoints,
    workoutsTotal: workouts.length,
    workoutPoints,
    cardioTotal: validCardios.length,
    cardioPoints,
    waterDays,
    waterPoints,
    sweetsDays,
    alcoholDays,
    disciplinePoints,
    sweetsStreak: sw.current,
    alcoholStreak: al.current,
    bestSweetsStreak: sw.best,
    bestAlcoholStreak: al.best,
    streak: perfectStreak(days, rules, today),
    workoutsThisWeek,
    cardioThisWeek,
    workoutStatus: workoutStatus(workoutsThisWeek, rules),
    cardioMet: cardioThisWeek >= rules.cardioPerWeek,
    failedWeeks,
  };
}

export function sortKey(s: UserStats, f: RankingFilter): number {
  switch (f) {
    case 'geral': return s.points;
    case 'semana': return s.weekPoints;
    case 'hoje': return s.todayPoints;
    case 'treinos': return s.workoutPoints;
    case 'cardio': return s.cardioPoints;
    case 'agua': return s.waterPoints;
    case 'disciplina': return s.disciplinePoints;
  }
}

/** Ranking ordenado (desempate: pontos gerais, depois nome). Posições empatadas compartilham o mesmo número. */
export function buildRanking(
  stats: UserStats[], filter: RankingFilter,
): (UserStats & { position: number; value: number })[] {
  const sorted = [...stats].sort(
    (a, b) => sortKey(b, filter) - sortKey(a, filter) || b.points - a.points || a.userId.localeCompare(b.userId),
  );
  let pos = 0;
  let lastVal: number | null = null;
  return sorted.map((s, i) => {
    const value = sortKey(s, filter);
    if (value !== lastVal) { pos = i + 1; lastVal = value; }
    return { ...s, position: pos, value };
  });
}

/** Status geral de um dia para o calendário. */
export function dayStatus(
  date: ISODate, data: UserData, userId: string, rules: Rules,
): 'full' | 'partial' | 'none' {
  const log = data.days.find((d) => d.userId === userId && d.date === date);
  const trained = data.workouts.some((w) => w.userId === userId && w.date === date);
  const cardio = data.cardios.some((c) => c.userId === userId && c.date === date && c.minutes >= rules.cardioMinMinutes);
  const water = !!log && log.waterMl >= rules.waterGoalMl;
  const sweets = log?.noSweets === true;
  const alcohol = log?.noAlcohol === true;
  // Treino/cardio são metas semanais: o dia fica "cheio" com os 3 hábitos diários.
  const daily = [water, sweets, alcohol].filter(Boolean).length;
  if (daily === 3) return 'full';
  if (daily > 0 || trained || cardio) return 'partial';
  return 'none';
}

export function challengeDayNumber(c: Pick<Challenge, 'startDate' | 'durationDays'>, today: ISODate): number {
  return Math.min(Math.max(dayIndex(c.startDate, today) + 1, 0), c.durationDays);
}
