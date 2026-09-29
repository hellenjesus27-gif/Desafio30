import type { Activity, Challenge, Cardio, DayLog, Group, User, Workout, WorkoutType } from '../types';
import { DEFAULT_RULES } from '../utils/scoring';
import { addDays } from '../utils/dates';

/** Gerador pseudo-aleatório determinístico (dados de demonstração estáveis). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const DEMO_USER_ID = 'u-hellen';

export function buildSeed(today: string) {
  const start = addDays(today, -11); // hoje = dia 12
  const users: User[] = [
    { id: DEMO_USER_ID, name: 'Hellen', email: 'demo@desafio30.app', isAdmin: true },
    { id: 'u-camila', name: 'Camila', email: 'camila@demo.app' },
    { id: 'u-giu', name: 'Giuli', email: 'giuli@demo.app' },
    { id: 'u-rafa', name: 'Rafa', email: 'rafa@demo.app' },
    { id: 'u-bia', name: 'Bia', email: 'bia@demo.app' },
  ];
  const challenge: Challenge = {
    id: 'c1', groupId: 'g1', name: 'Desafio 30', startDate: start, durationDays: 30,
    status: 'active', rules: DEFAULT_RULES,
  };
  const group: Group = {
    id: 'g1', name: 'Turma do Desafio', inviteCode: 'D30-TURMA', adminId: DEMO_USER_ID,
    memberIds: users.map((u) => u.id), challengeId: 'c1',
  };

  const workouts: Workout[] = [];
  const cardios: Cardio[] = [];
  const days: DayLog[] = [];
  const types: WorkoutType[] = ['musculacao', 'funcional', 'corrida', 'pilates', 'crossfit'];
  // consistência por usuário (chance de cumprir cada hábito)
  const profile: Record<string, { w: number; c: number; water: number; s: number; a: number }> = {
    [DEMO_USER_ID]: { w: 0.62, c: 0.35, water: 0.75, s: 0.85, a: 0.9 },
    'u-camila': { w: 0.75, c: 0.45, water: 0.85, s: 0.9, a: 0.95 },
    'u-giu': { w: 0.55, c: 0.3, water: 0.7, s: 0.7, a: 0.85 },
    'u-rafa': { w: 0.45, c: 0.25, water: 0.5, s: 0.6, a: 0.5 },
    'u-bia': { w: 0.65, c: 0.4, water: 0.8, s: 0.8, a: 0.9 },
  };
  users.forEach((u, ui) => {
    const r = rng(101 + ui * 17);
    const p = profile[u.id];
    for (let i = 0; i <= 11; i++) {
      const date = addDays(start, i);
      const isToday = date === today;
      if (r() < p.w) {
        workouts.push({ id: `w-${u.id}-${i}`, userId: u.id, date, type: types[Math.floor(r() * types.length)], minutes: 45 + Math.floor(r() * 30) });
      }
      if (r() < p.c) {
        cardios.push({ id: `c-${u.id}-${i}`, userId: u.id, date, time: '07:00', type: 'caminhada', minutes: 30 + Math.floor(r() * 25) });
      }
      const water = r() < p.water ? 3000 + Math.floor(r() * 3) * 250 : 1500 + Math.floor(r() * 5) * 250;
      days.push({
        userId: u.id, date,
        waterMl: isToday ? (u.id === DEMO_USER_ID ? 2400 : Math.min(water, 2500)) : water,
        noSweets: isToday && u.id !== DEMO_USER_ID ? null : r() < p.s,
        noAlcohol: isToday && u.id !== DEMO_USER_ID ? null : r() < p.a,
      });
    }
  });
  // Hellen: hoje com doce/álcool cumpridos
  const hd = days.find((d) => d.userId === DEMO_USER_ID && d.date === today);
  if (hd) { hd.noSweets = true; hd.noAlcohol = true; }

  const now = new Date().toISOString();
  const activities: Activity[] = [
    { id: 'a1', userId: 'u-camila', text: 'Camila completou 5 treinos essa semana 🔥', createdAt: now, reactions: [{ userId: DEMO_USER_ID, emoji: '🔥' }], comments: [] },
    { id: 'a2', userId: 'u-bia', text: 'Bia bateu a meta de 3 L de água 💧', createdAt: now, reactions: [], comments: [] },
    { id: 'a3', userId: 'u-rafa', text: 'Rafa fez 40 min de corrida 🏃', createdAt: now, reactions: [], comments: [] },
  ];
  return { users, challenge, group, workouts, cardios, days, activities };
}
