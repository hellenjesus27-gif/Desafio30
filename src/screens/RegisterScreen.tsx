import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Button, Card, Chip, Input, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { CARDIO_LABELS, WORKOUT_LABELS, fmtLiters } from '../utils/labels';
import { pickImage } from '../services/images';
import type { CardioType, WorkoutType } from '../types';
import { Image } from 'react-native';

const WATER_BUTTONS = [250, 500, 750, 1000];

export default function RegisterScreen() {
  const t = useTheme();
  const { challenge, me, myStats, data, today } = useChallenge();
  const { addWorkout, addCardio, addWater, resetWater, setHabit } = useStore();
  const [wType, setWType] = useState<WorkoutType>('musculacao');
  const [cType, setCType] = useState<CardioType>('caminhada');
  const [minutes, setMinutes] = useState('30');
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

  if (!challenge || !me || !myStats) {
    return <Screen><Txt size={20} weight="800">Registrar</Txt><Txt muted style={{ marginTop: 8 }}>Entre em um grupo para registrar suas atividades.</Txt></Screen>;
  }
  const r = challenge.rules;
  const log = data.days.find((d) => d.userId === me.id && d.date === today);
  const water = log?.waterMl ?? 0;
  const waterDone = water >= r.waterGoalMl;

  const saveWorkout = () => {
    addWorkout(wType, today);
    const n = myStats.workoutsThisWeek + 1;
    Alert.alert(n >= r.workoutBonusAt ? '⭐ Bônus!' : 'Treino registrado ✅', `Treinos da semana: ${n}/${r.workoutsPerWeek}${n >= r.workoutBonusAt ? ' — meta + bônus' : ''}`);
  };
  const saveCardio = () => {
    const m = parseInt(minutes, 10);
    if (!m || m <= 0) return Alert.alert('Duração inválida', 'Informe a duração em minutos.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return Alert.alert('Horário inválido', 'Use o formato HH:MM.');
    addCardio({ type: cType, minutes: m, date: today, time, note: note.trim() || undefined, photo });
    setNote(''); setPhoto(undefined);
    Alert.alert(m >= r.cardioMinMinutes ? 'Cardio registrado ✅' : 'Cardio registrado', m >= r.cardioMinMinutes ? `+${r.points.cardio} pontos` : `Menos de ${r.cardioMinMinutes} min não pontua.`);
  };

  return (
    <Screen>
      <Txt size={26} weight="800">Registrar</Txt>
      <Txt muted>Tudo em um só lugar · hoje</Txt>

      <SectionTitle>🏋️ Treino</SectionTitle>
      <Card>
        <Txt muted size={13} style={{ marginBottom: 8 }}>Semana: {myStats.workoutsThisWeek}/{r.workoutsPerWeek}{myStats.workoutStatus === 'bonus' ? ' ⭐' : ''}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
          {(Object.keys(WORKOUT_LABELS) as WorkoutType[]).map((k) => <Chip key={k} label={WORKOUT_LABELS[k]} active={wType === k} onPress={() => setWType(k)} />)}
        </View>
        <Button title="Registrar treino" onPress={saveWorkout} style={{ marginTop: 14 }} />
      </Card>

      <SectionTitle>🏃 Cardio</SectionTitle>
      <Card>
        <Txt muted size={13} style={{ marginBottom: 8 }}>Semana: {myStats.cardioThisWeek}/{r.cardioPerWeek} (mín. {r.cardioMinMinutes} min)</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginBottom: 12 }}>
          {(Object.keys(CARDIO_LABELS) as CardioType[]).map((k) => <Chip key={k} label={CARDIO_LABELS[k]} active={cType === k} onPress={() => setCType(k)} />)}
        </View>
        <Row style={{ gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Duração (min)" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" /></View>
          <View style={{ flex: 1 }}><Input label="Horário" value={time} onChangeText={setTime} placeholder="07:30" /></View>
        </Row>
        <Input label="Observação (opcional)" value={note} onChangeText={setNote} placeholder="Como foi?" />
        <Row style={{ gap: 10, marginBottom: 12 }}>
          <Button small variant="secondary" title={photo ? '📷 Trocar foto' : '📷 Foto (opcional)'} onPress={async () => setPhoto((await pickImage()) ?? photo)} />
          {photo ? <Image source={{ uri: photo }} style={{ width: 40, height: 40, borderRadius: 8 }} /> : null}
        </Row>
        <Button title="Registrar cardio" onPress={saveCardio} />
      </Card>

      <SectionTitle>💧 Água</SectionTitle>
      <Card>
        <Txt size={26} weight="800" color={waterDone ? t.success : t.text}>💧 {fmtLiters(water)} L / {fmtLiters(r.waterGoalMl)} L</Txt>
        {waterDone ? <Txt color={t.success} weight="800" style={{ marginTop: 4 }}>💧 META CONCLUÍDA!</Txt> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {WATER_BUTTONS.map((ml) => (
            <Button key={ml} small variant="secondary" title={ml >= 1000 ? `+${ml / 1000} L` : `+${ml} ml`} onPress={() => addWater(ml, today)} />
          ))}
        </View>
        <Row style={{ gap: 8, marginTop: 10 }}>
          <Button small variant="ghost" title="↩︎ Desfazer 250 ml" onPress={() => addWater(-250, today)} />
          <Button small variant="ghost" title="Zerar" onPress={() => resetWater(today)} />
        </Row>
      </Card>

      <SectionTitle>🍫 Zero doce</SectionTitle>
      <Habit value={log?.noSweets} streak={myStats.sweetsStreak} best={myStats.bestSweetsStreak} unit="sem doce" onSet={(v) => setHabit('noSweets', v, today)} />
      <SectionTitle>🍺 Zero álcool</SectionTitle>
      <Habit value={log?.noAlcohol} streak={myStats.alcoholStreak} best={myStats.bestAlcoholStreak} unit="sem álcool" onSet={(v) => setHabit('noAlcohol', v, today)} />
    </Screen>
  );
}

function Habit({ value, streak, best, unit, onSet }: { value: boolean | null | undefined; streak: number; best: number; unit: string; onSet: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <Card>
      <Txt weight="800" size={18}>🔥 {streak} {streak === 1 ? 'dia' : 'dias'} {unit}</Txt>
      <Txt muted size={13}>Maior sequência: {best}</Txt>
      <Row style={{ gap: 10, marginTop: 12 }}>
        <Pressable onPress={() => onSet(true)} style={{ flex: 1 }}>
          <View style={{ padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: value === true ? t.success : t.cardAlt }}>
            <Txt weight="800" color={value === true ? '#fff' : t.text}>✅ Cumpri</Txt>
          </View>
        </Pressable>
        <Pressable onPress={() => onSet(false)} style={{ flex: 1 }}>
          <View style={{ padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: value === false ? t.danger : t.cardAlt }}>
            <Txt weight="800" color={value === false ? '#fff' : t.text}>❌ Não cumpri</Txt>
          </View>
        </Pressable>
      </Row>
    </Card>
  );
}
