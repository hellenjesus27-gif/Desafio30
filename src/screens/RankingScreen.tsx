import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Badge, Card, Chip, MinStatusBadge, Row, Screen, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useTheme } from '../theme';
import type { RankingFilter } from '../types';

const FILTERS: { key: RankingFilter; label: string }[] = [
  { key: 'geral', label: 'Geral' }, { key: 'semana', label: 'Semana' }, { key: 'hoje', label: 'Hoje' },
  { key: 'treinos', label: 'Treinos' }, { key: 'cardio', label: 'Cardio' }, { key: 'agua', label: 'Água' }, { key: 'disciplina', label: 'Disciplina' },
];
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function RankingScreen() {
  const t = useTheme();
  const [filter, setFilter] = useState<RankingFilter>('geral');
  const { ranking, members, me, challenge } = useChallenge(filter);

  if (!challenge) return <Screen><Txt size={26} weight="800">Ranking</Txt><Txt muted style={{ marginTop: 8 }}>Entre em um grupo para ver o ranking.</Txt></Screen>;
  const r = challenge.rules;
  const mine = ranking.find((x) => x.userId === me?.id);

  return (
    <Screen>
      <Txt size={26} weight="800">Ranking 🏆</Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
        {FILTERS.map((f) => <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
      </ScrollView>

      {mine ? (
        <Card style={{ backgroundColor: t.primary, marginBottom: 12 }}>
          <Txt weight="800" color={t.primaryText}>VOCÊ — #{mine.position}</Txt>
          <Txt size={26} weight="800" color={t.primaryText}>{mine.value} pontos</Txt>
        </Card>
      ) : null}

      {ranking.map((row) => {
        const u = members.find((m) => m.id === row.userId);
        if (!u) return null;
        const isMe = u.id === me?.id;
        return (
          <Card key={u.id} style={{ marginBottom: 10, borderColor: isMe ? t.primary : t.border, borderWidth: isMe ? 2 : 1 }}>
            <Row>
              <Txt size={row.position <= 3 ? 30 : 18} weight="800" style={{ width: 46, textAlign: 'center' }}>{MEDAL[row.position] ?? `${row.position}º`}</Txt>
              <Avatar name={u.name} photo={u.photo} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Txt weight="800" size={16}>{u.name}{isMe ? ' (você)' : ''}</Txt>
                <Txt muted size={12}>🔥 {row.streak} dias de sequência</Txt>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Txt size={22} weight="800" color={t.primary}>{row.value}</Txt>
                <Txt muted size={11}>pontos</Txt>
              </View>
            </Row>
            <Row style={{ marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
              <Txt size={12} muted>🏋️ {row.workoutsTotal}</Txt>
              <Txt size={12} muted>🏃 {row.cardioTotal}</Txt>
              <Txt size={12} muted>💧 {row.waterDays}d</Txt>
              <Txt size={12} muted>🍫 {row.sweetsStreak}d</Txt>
              <Txt size={12} muted>🍺 {row.alcoholStreak}d</Txt>
            </Row>
            <Row style={{ marginTop: 8, flexWrap: 'wrap', gap: 6 }}>
              <MinStatusBadge status={row.workoutStatus} count={row.workoutsThisWeek} min={r.workoutsPerWeek} bonusAt={r.workoutBonusAt} />
              <Badge tone={row.cardioMet ? 'success' : 'danger'} text={row.cardioMet ? `🟢 Cardio ${row.cardioThisWeek}/${r.cardioPerWeek}` : `🔴 Cardio ${row.cardioThisWeek}/${r.cardioPerWeek}`} />
              {row.failedWeeks > 0 ? <Badge tone="danger" text={`⚠️ ${row.failedWeeks} sem. sem mínimo`} /> : null}
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
