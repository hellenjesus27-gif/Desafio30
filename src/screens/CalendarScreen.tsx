import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Card, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useTheme } from '../theme';
import { addDays, dayIndex, formatBR, weekdayShort } from '../utils/dates';
import { dayPoints, dayStatus } from '../utils/scoring';
import { CARDIO_LABELS, WORKOUT_LABELS, fmtLiters } from '../utils/labels';

export default function CalendarScreen() {
  const t = useTheme();
  const { challenge, me, data, today } = useChallenge();
  const [selected, setSelected] = useState<string>(today);
  if (!challenge || !me) return <Screen><Txt muted>Entre em um grupo para ver o calendário.</Txt></Screen>;

  const r = challenge.rules;
  const dates = Array.from({ length: challenge.durationDays }, (_, i) => addDays(challenge.startDate, i));
  const color = (d: string) => {
    if (d > today) return t.cardAlt;
    const s = dayStatus(d, data, me.id, r);
    return s === 'full' ? t.success : s === 'partial' ? t.warning : t.danger;
  };

  const log = data.days.find((d) => d.userId === me.id && d.date === selected);
  const ws = data.workouts.filter((w) => w.userId === me.id && w.date === selected);
  const cs = data.cardios.filter((c) => c.userId === me.id && c.date === selected);
  const p = dayPoints(log, r);
  const total = ws.length * r.points.workout + cs.filter((c) => c.minutes >= r.cardioMinMinutes).length * r.points.cardio + p.total;

  return (
    <Screen>
      <Txt size={26} weight="800">Calendário 📅</Txt>
      <Row style={{ gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
        <Txt size={12}>🟢 Tudo cumprido</Txt><Txt size={12}>🟡 Parcial</Txt><Txt size={12}>🔴 Não cumprido</Txt>
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, marginHorizontal: -4 }}>
        {dates.map((d) => (
          <Pressable key={d} onPress={() => setSelected(d)} style={{ width: `${100 / 7}%`, padding: 4 }} accessibilityLabel={`Dia ${dayIndex(challenge.startDate, d) + 1}`}>
            <View style={{ aspectRatio: 1, borderRadius: 12, backgroundColor: color(d), alignItems: 'center', justifyContent: 'center', borderWidth: selected === d ? 3 : 0, borderColor: t.text, opacity: d > today ? 0.5 : 1 }}>
              <Txt size={15} weight="800" color={d > today ? t.textMuted : '#0b0b0b'}>{dayIndex(challenge.startDate, d) + 1}</Txt>
              <Txt size={9} color={d > today ? t.textMuted : '#0b0b0b'}>{weekdayShort(d)}</Txt>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionTitle>{formatBR(selected)} · Dia {dayIndex(challenge.startDate, selected) + 1}</SectionTitle>
      <Card>
        <Txt>🏋️ Treino: {ws.length ? ws.map((w) => WORKOUT_LABELS[w.type]).join(', ') : '—'}</Txt>
        <Txt style={{ marginTop: 6 }}>🏃 Cardio: {cs.length ? cs.map((c) => `${CARDIO_LABELS[c.type]} ${c.minutes}min`).join(', ') : '—'}</Txt>
        <Txt style={{ marginTop: 6 }}>💧 Água: {fmtLiters(log?.waterMl ?? 0)} L {log && log.waterMl >= r.waterGoalMl ? '✅' : ''}</Txt>
        <Txt style={{ marginTop: 6 }}>🍫 Doce: {log?.noSweets === true ? '✅ Cumpriu' : log?.noSweets === false ? '❌ Não cumpriu' : '— sem registro'}</Txt>
        <Txt style={{ marginTop: 6 }}>🍺 Álcool: {log?.noAlcohol === true ? '✅ Cumpriu' : log?.noAlcohol === false ? '❌ Não cumpriu' : '— sem registro'}</Txt>
        <Txt weight="800" size={18} color={t.primary} style={{ marginTop: 10 }}>⭐ {total} pontos no dia</Txt>
      </Card>
    </Screen>
  );
}
