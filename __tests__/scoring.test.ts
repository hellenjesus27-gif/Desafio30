import { DEFAULT_RULES, buildRanking, computeUserStats, streaks, weekWorkoutPoints, workoutStatus } from '../src/utils/scoring';
import type { UserData } from '../src/types';

const R = DEFAULT_RULES;
const START = '2026-09-01';
const W = (id: string, date: string) => ({ id, userId: 'u1', date, type: 'musculacao' as const });

describe('pontuação', () => {
  test('4 treinos = 40 pts, meta cumprida', () => {
    expect(weekWorkoutPoints(4, R)).toBe(40);
    expect(workoutStatus(4, R)).toBe('met');
  });
  test('5 treinos = 55 pts (bônus), 6 treinos = 65 (bônus só uma vez)', () => {
    expect(weekWorkoutPoints(5, R)).toBe(55);
    expect(workoutStatus(5, R)).toBe('bonus');
    expect(weekWorkoutPoints(6, R)).toBe(65);
  });
  test('3 treinos = abaixo do mínimo', () => {
    expect(workoutStatus(3, R)).toBe('below');
  });
  test('cardio < 30 min não pontua', () => {
    const data: UserData = {
      workouts: [], days: [],
      cardios: [
        { id: 'a', userId: 'u1', date: '2026-09-02', time: '07:00', type: 'corrida', minutes: 29 },
        { id: 'b', userId: 'u1', date: '2026-09-02', time: '18:00', type: 'corrida', minutes: 30 },
      ],
    };
    const s = computeUserStats('u1', data, { startDate: START, rules: R }, '2026-09-03');
    expect(s.cardioPoints).toBe(5);
    expect(s.cardioThisWeek).toBe(1);
  });
  test('água só pontua com 3 L', () => {
    const data: UserData = {
      workouts: [], cardios: [],
      days: [
        { userId: 'u1', date: '2026-09-01', waterMl: 2999, noSweets: null, noAlcohol: null },
        { userId: 'u1', date: '2026-09-02', waterMl: 3000, noSweets: true, noAlcohol: false },
      ],
    };
    const s = computeUserStats('u1', data, { startDate: START, rules: R }, '2026-09-02');
    expect(s.points).toBe(5 + 5);
    expect(s.waterDays).toBe(1);
  });
  test('sequências: atual e maior', () => {
    const mk = (date: string, v: boolean | null) => ({ userId: 'u1', date, waterMl: 0, noSweets: v, noAlcohol: null });
    const days = [mk('2026-09-01', true), mk('2026-09-02', true), mk('2026-09-03', true),
      mk('2026-09-04', false), mk('2026-09-05', true), mk('2026-09-06', true)];
    expect(streaks(days, 'noSweets', '2026-09-06')).toEqual({ current: 2, best: 3 });
    // hoje sem registro não quebra a sequência
    expect(streaks(days, 'noSweets', '2026-09-07')).toEqual({ current: 2, best: 3 });
    // dia pulado quebra
    expect(streaks(days, 'noSweets', '2026-09-08').current).toBe(0);
  });
  test('semana anterior sem mínimo conta como falha', () => {
    const data: UserData = {
      cardios: [], days: [],
      workouts: [W('1', '2026-09-01'), W('2', '2026-09-02'), W('3', '2026-09-03')],
    };
    const s = computeUserStats('u1', data, { startDate: START, rules: R }, '2026-09-09');
    expect(s.failedWeeks).toBe(1);
    expect(s.workoutsThisWeek).toBe(0);
  });
  test('ranking com empate compartilha posição', () => {
    const base = computeUserStats('u1', { workouts: [], cardios: [], days: [] }, { startDate: START, rules: R }, START);
    const a = { ...base, userId: 'a', points: 50 };
    const b = { ...base, userId: 'b', points: 50 };
    const c = { ...base, userId: 'c', points: 10 };
    const r = buildRanking([c, a, b], 'geral');
    expect(r.map((x) => x.position)).toEqual([1, 1, 3]);
  });
});
