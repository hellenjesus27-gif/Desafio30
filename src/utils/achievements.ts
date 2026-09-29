import type { Challenge, UserData, UserStats } from '../types';
import { weekIndex } from './dates';

export interface AchievementDef { id: string; emoji: string; title: string; desc: string }

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first', emoji: '🏆', title: 'Primeiro treino', desc: 'Registre seu primeiro treino' },
  { id: 'streak7', emoji: '🔥', title: '7 dias seguidos', desc: '7 dias com todos os hábitos diários' },
  { id: 'water7', emoji: '💧', title: '7 dias de água', desc: 'Bata 3 L em 7 dias' },
  { id: 'sweets10', emoji: '🍫', title: '10 dias sem doce', desc: 'Sequência de 10 dias sem doce' },
  { id: 'alcohol10', emoji: '🍺', title: '10 dias sem álcool', desc: 'Sequência de 10 dias sem álcool' },
  { id: 'week5', emoji: '🏋️', title: '5 treinos na semana', desc: 'Faça 5 treinos em uma semana' },
  { id: 'w20', emoji: '💪', title: '20 treinos', desc: 'Acumule 20 treinos' },
  { id: 'leader', emoji: '👑', title: 'Líder do ranking', desc: 'Fique em 1º lugar' },
  { id: 'complete', emoji: '🎖️', title: 'Desafio completo', desc: 'Termine todos os dias do desafio' },
];

export function unlockedAchievements(
  userId: string, stats: UserStats, data: UserData, challenge: Challenge, position: number, ended: boolean,
): string[] {
  const out: string[] = [];
  const workouts = data.workouts.filter((w) => w.userId === userId);
  if (workouts.length >= 1) out.push('first');
  if (stats.streak >= 7) out.push('streak7');
  if (stats.waterDays >= 7) out.push('water7');
  if (stats.bestSweetsStreak >= 10) out.push('sweets10');
  if (stats.bestAlcoholStreak >= 10) out.push('alcohol10');
  // 5 treinos em qualquer semana
  const perWeek = new Map<number, number>();
  for (const w of workouts) {
    const wk = weekIndex(challenge.startDate, w.date);
    perWeek.set(wk, (perWeek.get(wk) ?? 0) + 1);
  }
  if ([...perWeek.values()].some((n) => n >= challenge.rules.workoutBonusAt)) out.push('week5');
  if (workouts.length >= 20) out.push('w20');
  if (position === 1 && stats.points > 0) out.push('leader');
  if (ended && stats.failedWeeks === 0) out.push('complete');
  return out;
}
