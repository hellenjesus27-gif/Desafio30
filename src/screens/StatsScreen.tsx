import React, { useMemo } from 'react';
import { BarChart } from '../components/ui';
import { Card, Screen, SectionTitle, Txt } from '../components/ui';
import { LineChart } from '../components/LineChart';
import { useChallenge } from '../hooks/useChallenge';
import { addDays, dayIndex, weekIndex } from '../utils/dates';
import { buildRanking, computeUserStats } from '../utils/scoring';

export default function StatsScreen() {
  const { challenge, me, data, today, members, dayNumber } = useChallenge();

  const calc = useMemo(() => {
    if (!challenge || !me) return null;
    const r = challenge.rules;
    const start = challenge.startDate;
    const lastDay = Math.max(0, dayIndex(start, today));
    const dates = Array.from({ length: Math.min(lastDay, challenge.durationDays - 1) + 1 }, (_, i) => addDays(start, i));
    const weeks = Math.floor((dates.length - 1) / 7) + 1;
    const wLabels = Array.from({ length: weeks }, (_, i) => `S${i + 1}`);
    const workoutsPerWeek = wLabels.map((label, w) => ({ label, value: data.workouts.filter((x) => x.userId === me.id && weekIndex(start, x.date) === w).length }));
    const cardioPerWeek = wLabels.map((label, w) => ({ label, value: data.cardios.filter((x) => x.userId === me.id && x.minutes >= r.cardioMinMinutes && weekIndex(start, x.date) === w).length }));
    const water = dates.map((d, i) => ({ label: String(i + 1), value: Math.round(((data.days.find((x) => x.userId === me.id && x.date === d)?.waterMl ?? 0) / 100)) / 10 }));

    // pontuação acumulada e posição por dia
    const cumulative: number[] = [];
    const positions: number[] = [];
    const streaks: { label: string; value: number }[] = [];
    for (const d of dates) {
      const sub = {
        workouts: data.workouts.filter((x) => x.date <= d),
        cardios: data.cardios.filter((x) => x.date <= d),
        days: data.days.filter((x) => x.date <= d),
      };
      const stats = members.map((m) => computeUserStats(m.id, sub, challenge, d));
      const rank = buildRanking(stats, 'geral');
      const mine = rank.find((x) => x.userId === me.id);
      cumulative.push(mine?.points ?? 0);
      positions.push(mine?.position ?? members.length);
      streaks.push({ label: String(dates.indexOf(d) + 1), value: mine?.streak ?? 0 });
    }
    const daily = dates.map((d, i) => ({ label: String(i + 1), value: (i === 0 ? cumulative[0] : cumulative[i] - cumulative[i - 1]) }));
    return { workoutsPerWeek, cardioPerWeek, water, cumulative, positions, streaks, daily };
  }, [challenge, me, data, today, members]);

  if (!challenge || !me || !calc) return <Screen><Txt muted>Entre em um grupo para ver estatísticas.</Txt></Screen>;

  return (
    <Screen>
      <Txt size={26} weight="800">Estatísticas 📊</Txt>
      <Txt muted>Dia {dayNumber} de {challenge.durationDays}</Txt>

      <SectionTitle>🏋️ Treinos por semana</SectionTitle>
      <Card><BarChart data={calc.workoutsPerWeek} /></Card>
      <SectionTitle>🏃 Cardios por semana</SectionTitle>
      <Card><BarChart data={calc.cardioPerWeek} /></Card>
      <SectionTitle>💧 Água por dia (L)</SectionTitle>
      <Card><BarChart data={calc.water} /></Card>
      <SectionTitle>🔥 Sequência (dias com tudo cumprido)</SectionTitle>
      <Card><BarChart data={calc.streaks} /></Card>
      <SectionTitle>⭐ Pontos por dia</SectionTitle>
      <Card><BarChart data={calc.daily} /></Card>
      <SectionTitle>📈 Pontuação acumulada</SectionTitle>
      <Card><LineChart values={calc.cumulative} /></Card>
      <SectionTitle>🏆 Evolução no ranking</SectionTitle>
      <Card>
        <LineChart values={calc.positions} invert />
        <Txt size={12} muted style={{ marginTop: 6 }}>Topo do gráfico = 1º lugar · Hoje: #{calc.positions[calc.positions.length - 1]}</Txt>
      </Card>
    </Screen>
  );
}
