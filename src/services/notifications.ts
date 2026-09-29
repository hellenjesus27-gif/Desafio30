import { Platform } from 'react-native';
import type { NotificationPrefs, UserStats } from '../types';
import type { Rules } from '../types';

/**
 * Lembretes locais (expo-notifications). Em produção, para push remoto, configure o
 * Expo Push / FCM / APNs (ver README).
 */
export interface Reminder { key: keyof NotificationPrefs; hour: number; minute: number; title: string; body: string }

export function buildReminderTexts(stats: UserStats | undefined, waterMl: number, rules: Rules) {
  const missing = Math.max(0, rules.waterGoalMl - waterMl);
  return {
    water: missing > 0 ? `💧 Faltam ${missing} ml para sua meta.` : '💧 Meta de água concluída! Parabéns.',
    cardio: stats && stats.cardioThisWeek < rules.cardioPerWeek
      ? `🏃 Falta${rules.cardioPerWeek - stats.cardioThisWeek > 1 ? 'm' : ''} ${rules.cardioPerWeek - stats.cardioThisWeek} cardio${rules.cardioPerWeek - stats.cardioThisWeek > 1 ? 's' : ''} para sua meta semanal.`
      : '🏃 Meta de cardio da semana cumprida!',
    workout: stats && stats.workoutsThisWeek >= rules.workoutsPerWeek && stats.workoutsThisWeek < rules.workoutBonusAt
      ? `🏋️ Você já fez ${stats.workoutsThisWeek} treinos. Que tal buscar o bônus?`
      : `🏋️ Hora do treino! ${stats?.workoutsThisWeek ?? 0}/${rules.workoutsPerWeek} na semana.`,
    sweets: '🍫 Não esqueça de registrar seu dia sem doce.',
    alcohol: '🍺 Não esqueça de registrar seu dia sem álcool.',
    dailyClose: '📊 Feche seu dia: confira seus registros e pontos.',
  };
}

export async function scheduleDailyReminders(prefs: NotificationPrefs, texts: ReturnType<typeof buildReminderTexts>) {
  if (Platform.OS === 'web') return; // notificações locais não existem no navegador
  const Notifications = await import('expo-notifications');
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const plan: Reminder[] = [
    { key: 'water', hour: 15, minute: 0, title: 'Desafio 30', body: texts.water },
    { key: 'workout', hour: 17, minute: 30, title: 'Desafio 30', body: texts.workout },
    { key: 'cardio', hour: 18, minute: 30, title: 'Desafio 30', body: texts.cardio },
    { key: 'sweets', hour: 20, minute: 0, title: 'Desafio 30', body: texts.sweets },
    { key: 'alcohol', hour: 20, minute: 15, title: 'Desafio 30', body: texts.alcohol },
    { key: 'dailyClose', hour: 21, minute: 30, title: 'Desafio 30', body: texts.dailyClose },
  ];
  for (const r of plan) {
    if (!prefs[r.key]) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute },
    });
  }
}
