import React from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Button, Card, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { pickImage } from '../services/images';
import { ACHIEVEMENTS } from '../utils/achievements';
import { formatBR } from '../utils/dates';
import { CARDIO_LABELS, WORKOUT_LABELS } from '../utils/labels';

export default function ProfileScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { logout, updateProfile, removeWorkout, removeCardio } = useStore();
  const { me, myStats, myPosition, achievements, data } = useChallenge();
  if (!me) return null;

  const history = [
    ...data.workouts.filter((w) => w.userId === me.id).map((w) => ({ id: w.id, kind: 'w' as const, date: w.date, text: `${WORKOUT_LABELS[w.type]}` })),
    ...data.cardios.filter((c) => c.userId === me.id).map((c) => ({ id: c.id, kind: 'c' as const, date: c.date, text: `${CARDIO_LABELS[c.type]} · ${c.minutes} min` })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);

  return (
    <Screen>
      <View style={{ alignItems: 'center' }}>
        <Pressable onPress={async () => { const p = await pickImage(); if (p) updateProfile({ photo: p }); }} accessibilityLabel="Trocar foto">
          <Avatar name={me.name} photo={me.photo} size={96} />
        </Pressable>
        <Txt size={24} weight="800" style={{ marginTop: 8 }}>{me.name}</Txt>
        <Txt muted size={13}>{me.email.endsWith('.local') ? '' : me.email}</Txt>
      </View>

      {myStats ? (
        <>
          <Row style={{ gap: 10, marginTop: 16 }}>
            <Mini label="Posição" value={`#${myPosition}`} />
            <Mini label="Pontos" value={`${myStats.points}`} />
            <Mini label="Sequência" value={`🔥 ${myStats.streak}`} />
          </Row>
          <Card style={{ marginTop: 12 }}>
            <Txt>🏋️ Treinos: <Txt weight="800">{myStats.workoutsTotal}</Txt></Txt>
            <Txt style={{ marginTop: 4 }}>🏃 Cardios (≥30 min): <Txt weight="800">{myStats.cardioTotal}</Txt></Txt>
            <Txt style={{ marginTop: 4 }}>💧 Dias de água: <Txt weight="800">{myStats.waterDays}</Txt></Txt>
            <Txt style={{ marginTop: 4 }}>🍫 Dias sem doce: <Txt weight="800">{myStats.sweetsDays}</Txt> (maior seq. {myStats.bestSweetsStreak})</Txt>
            <Txt style={{ marginTop: 4 }}>🍺 Dias sem álcool: <Txt weight="800">{myStats.alcoholDays}</Txt> (maior seq. {myStats.bestAlcoholStreak})</Txt>
          </Card>
        </>
      ) : null}

      <SectionTitle right={<Txt color={t.primary} weight="700" onPress={() => nav.navigate('Conquistas')}>Ver todas</Txt>}>Conquistas</SectionTitle>
      <Txt size={30}>{ACHIEVEMENTS.filter((a) => achievements.includes(a.id)).map((a) => a.emoji).join(' ') || '🔒'}</Txt>

      <SectionTitle>Histórico</SectionTitle>
      {history.length === 0 ? <Txt muted>Sem registros ainda.</Txt> : null}
      {history.map((h) => (
        <Card key={h.id} style={{ marginBottom: 6, paddingVertical: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}><Txt>{h.text}</Txt><Txt size={11} muted>{formatBR(h.date)}</Txt></View>
            <Txt color={t.danger} size={13} weight="700" onPress={() => (h.kind === 'w' ? removeWorkout(h.id) : removeCardio(h.id))}>Excluir</Txt>
          </Row>
        </Card>
      ))}

      <SectionTitle>Mais</SectionTitle>
      <View style={{ gap: 8 }}>
        <Button variant="secondary" title="📅 Calendário" onPress={() => nav.navigate('Calendário')} />
        <Button variant="secondary" title="📊 Estatísticas" onPress={() => nav.navigate('Estatísticas')} />
        <Button variant="secondary" title="📸 Atividades" onPress={() => nav.navigate('Atividades')} />
        <Button variant="secondary" title="⚙️ Configurações (tema e notificações)" onPress={() => nav.navigate('Configurações')} />
        <Button variant="ghost" title="Sair" onPress={logout} />
      </View>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
      <Txt size={20} weight="800">{value}</Txt>
      <Txt size={11} muted>{label}</Txt>
    </Card>
  );
}
