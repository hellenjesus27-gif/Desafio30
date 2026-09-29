import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Badge, Button, Card, Logo, MinStatusBadge, ProgressBar, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useTheme } from '../theme';
import { fmtLiters } from '../utils/labels';
import { dayPoints } from '../utils/scoring';
import { useStore } from '../store';

export default function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { challenge, me, myStats, myPosition, dayNumber, data, today, ranking } = useChallenge();
  const activities = useStore((s) => s.activities);
  const users = useStore((s) => s.users);

  if (!challenge || !me || !myStats) {
    return (
      <Screen>
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Logo size={160} />
          <Txt size={22} weight="800" style={{ marginTop: 8 }}>Olá, {me?.name ?? ''}! 👋</Txt>
          <Txt muted style={{ textAlign: 'center', marginVertical: 12 }}>Crie um grupo ou entre com o código de convite para começar o Desafio 30.</Txt>
          <Button title="Criar ou entrar em um grupo" onPress={() => nav.navigate('Grupo')} />
        </View>
      </Screen>
    );
  }

  const r = challenge.rules;
  const log = data.days.find((d) => d.userId === me.id && d.date === today);
  const water = log?.waterMl ?? 0;
  const todayWorkouts = data.workouts.filter((w) => w.userId === me.id && w.date === today).length;
  const pts = dayPoints(log, r);
  const recent = activities.slice(0, 3);
  const habit = (v: boolean | null | undefined) => (v === true ? '✅' : v === false ? '❌' : '➖');

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Txt size={24} weight="800">Olá, {me.name}! 👋</Txt>
          <Txt muted>DESAFIO 30 · Dia {dayNumber} de {challenge.durationDays}</Txt>
        </View>
        <Avatar name={me.name} photo={me.photo} size={46} />
      </Row>
      <View style={{ marginTop: 10 }}><ProgressBar value={dayNumber} max={challenge.durationDays} /></View>

      <Card style={{ marginTop: 16, backgroundColor: t.cardAlt }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Txt muted size={12} weight="700">SUA POSIÇÃO</Txt>
            <Txt size={34} weight="800" color={t.primary}>🏆 #{myPosition}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt size={22} weight="800">⭐ {myStats.points} pontos</Txt>
            <Txt muted>🔥 {myStats.streak} {myStats.streak === 1 ? 'dia' : 'dias'} de sequência</Txt>
          </View>
        </Row>
        <Txt muted size={12} style={{ marginTop: 8 }}>Hoje você fez {myStats.todayPoints} pts · {ranking.length} participantes</Txt>
      </Card>

      <SectionTitle>Hoje</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Stat title="🏋️ Treino" value={`${todayWorkouts}/1`} sub={`Semana ${myStats.workoutsThisWeek}/${r.workoutsPerWeek}`} onPress={() => nav.navigate('Registrar')} />
        <Stat title="🏃 Cardio" value={`${myStats.cardioThisWeek}/${r.cardioPerWeek}`} sub="na semana" onPress={() => nav.navigate('Registrar')} />
        <Stat title="💧 Água" value={`${fmtLiters(water)} / ${fmtLiters(r.waterGoalMl)} L`} sub={water >= r.waterGoalMl ? 'META CONCLUÍDA!' : `faltam ${r.waterGoalMl - water} ml`} onPress={() => nav.navigate('Registrar')} />
        <Stat title="🍫 Zero doce" value={habit(log?.noSweets)} sub={`🔥 ${myStats.sweetsStreak} dias`} onPress={() => nav.navigate('Registrar')} />
        <Stat title="🍺 Zero álcool" value={habit(log?.noAlcohol)} sub={`🔥 ${myStats.alcoholStreak} dias`} onPress={() => nav.navigate('Registrar')} />
        <Stat title="⭐ Pontos hoje" value={`${myStats.todayPoints}`} sub={`hábitos: ${pts.total}`} />
      </View>

      <SectionTitle>Meta da semana</SectionTitle>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt weight="700">Treinos da semana</Txt>
          <MinStatusBadge status={myStats.workoutStatus} count={myStats.workoutsThisWeek} min={r.workoutsPerWeek} bonusAt={r.workoutBonusAt} />
        </Row>
        <View style={{ marginTop: 10 }}><ProgressBar value={myStats.workoutsThisWeek} max={r.workoutBonusAt} color={myStats.workoutStatus === 'below' ? t.danger : myStats.workoutStatus === 'met' ? t.success : t.gold} /></View>
        <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
          <Txt weight="700">Cardio (mín. {r.cardioMinMinutes} min)</Txt>
          <Badge tone={myStats.cardioMet ? 'success' : 'danger'} text={`${myStats.cardioThisWeek}/${r.cardioPerWeek} ${myStats.cardioMet ? '✅' : ''}`} />
        </Row>
        <View style={{ marginTop: 10 }}><ProgressBar value={myStats.cardioThisWeek} max={r.cardioPerWeek} color={myStats.cardioMet ? t.success : t.warning} /></View>
      </Card>

      <SectionTitle right={<Txt color={t.primary} weight="700" onPress={() => nav.navigate('Atividades')}>Ver tudo</Txt>}>Atividades recentes</SectionTitle>
      {recent.map((a) => {
        const u = users.find((x) => x.id === a.userId);
        return (
          <Card key={a.id} style={{ marginBottom: 8 }} onPress={() => nav.navigate('Atividades')}>
            <Row>
              <Avatar name={u?.name ?? '?'} photo={u?.photo} size={32} />
              <Txt style={{ flex: 1, marginLeft: 10 }}>{a.text}</Txt>
            </Row>
          </Card>
        );
      })}

      <SectionTitle>Atalhos</SectionTitle>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        <Button small variant="secondary" title="📅 Calendário" onPress={() => nav.navigate('Calendário')} />
        <Button small variant="secondary" title="🏅 Conquistas" onPress={() => nav.navigate('Conquistas')} />
        <Button small variant="secondary" title="📊 Estatísticas" onPress={() => nav.navigate('Estatísticas')} />
      </Row>
    </Screen>
  );
}

function Stat({ title, value, sub, onPress }: { title: string; value: string; sub?: string; onPress?: () => void }) {
  return (
    <Card onPress={onPress} style={{ flexGrow: 1, flexBasis: '46%', minWidth: 140 }}>
      <Txt size={13} muted weight="700">{title}</Txt>
      <Txt size={22} weight="800" style={{ marginTop: 4 }}>{value}</Txt>
      {sub ? <Txt size={12} muted style={{ marginTop: 2 }}>{sub}</Txt> : null}
    </Card>
  );
}
