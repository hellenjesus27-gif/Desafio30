import { useMemo } from 'react';
import { useStore } from '../store';
import { todayISO } from '../utils/dates';
import { buildRanking, challengeDayNumber, computeUserStats } from '../utils/scoring';
import { unlockedAchievements } from '../utils/achievements';
import type { RankingFilter } from '../types';

/** Dados derivados do desafio ativo do usuário logado. */
export function useChallenge(filter: RankingFilter = 'geral') {
  const s = useStore();
  const today = todayISO();
  return useMemo(() => {
    const group = s.groups.find((g) => g.id === s.activeGroupId) ?? s.groups.find((g) => g.memberIds.includes(s.currentUserId ?? ''));
    const challenge = group ? s.challenges.find((c) => c.id === group.challengeId) : undefined;
    const me = s.users.find((u) => u.id === s.currentUserId);
    if (!group || !challenge || !me) return { group, challenge, me, today, members: [], ranking: [], myStats: undefined, myPosition: 0, dayNumber: 0, achievements: [] as string[], data: { workouts: [], cardios: [], days: [] } };
    const data = { workouts: s.workouts, cardios: s.cardios, days: s.days };
    const members = group.memberIds.map((id) => s.users.find((u) => u.id === id)).filter(Boolean) as typeof s.users;
    const stats = members.map((m) => computeUserStats(m.id, data, challenge, today));
    const ranking = buildRanking(stats, filter);
    const general = buildRanking(stats, 'geral');
    const myStats = stats.find((x) => x.userId === me.id)!;
    const myPosition = general.find((r) => r.userId === me.id)?.position ?? 0;
    const ended = challenge.status === 'ended';
    const achievements = unlockedAchievements(me.id, myStats, data, challenge, myPosition, ended);
    return { group, challenge, me, today, members, ranking, myStats, myPosition, dayNumber: challengeDayNumber(challenge, today), achievements, data };
  }, [s.groups, s.challenges, s.users, s.workouts, s.cardios, s.days, s.currentUserId, s.activeGroupId, filter, today]);
}
