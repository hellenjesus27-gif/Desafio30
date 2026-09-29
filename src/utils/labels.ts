import type { CardioType, WorkoutType } from '../types';

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  musculacao: '🏋️ Musculação', funcional: '🤸 Funcional', crossfit: '🔱 Crossfit', pilates: '🧘 Pilates',
  corrida: '🏃 Corrida', natacao: '🏊 Natação', danca: '💃 Dança', esporte: '⚽ Esporte', outro: '✨ Outro',
};
export const CARDIO_LABELS: Record<CardioType, string> = {
  caminhada: '🚶 Caminhada', corrida: '🏃 Corrida', bicicleta: '🚴 Bicicleta', escada: '🪜 Escada',
  transport: '🚋 Transport', eliptico: '🌀 Elíptico', outro: '✨ Outro',
};

export const fmtLiters = (ml: number) => `${(ml / 1000).toFixed(1).replace('.', ',')}`;
