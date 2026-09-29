import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Avatar, Button, Card, Input, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useStore } from '../store';
import { useTheme } from '../theme';
import type { Rules } from '../types';
import { DEFAULT_RULES } from '../utils/scoring';
import { formatBR } from '../utils/dates';

export default function AdminScreen() {
  const t = useTheme();
  const { challenge, group, members, me, data } = useChallenge();
  const { updateRules, updateChallenge, setChallengeStatus, addMember, removeMember } = useStore();
  const [newName, setNewName] = useState('');
  const [rules, setRules] = useState<Rules | null>(challenge?.rules ?? null);
  const [duration, setDuration] = useState(String(challenge?.durationDays ?? 30));
  const [title, setTitle] = useState(challenge?.name ?? '');

  if (!challenge || !group || group.adminId !== me?.id || !rules) {
    return <Screen><Txt size={22} weight="800">Acesso restrito 👑</Txt><Txt muted>Apenas o administrador do grupo vê esta tela.</Txt></Screen>;
  }

  const num = (v: string, fallback: number) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 0 ? n : fallback; };
  const setPts = (k: keyof Rules['points'], v: string) => setRules({ ...rules, points: { ...rules.points, [k]: num(v, 0) } });

  const save = () => {
    const d = Math.max(1, num(duration, 30));
    updateRules(challenge.id, rules);
    updateChallenge(challenge.id, { durationDays: d, name: title.trim() || challenge.name });
    Alert.alert('Salvo ✅', 'Regras e pontuação atualizadas.');
  };

  const confirm = (msg: string, fn: () => void) => Alert.alert('Confirmar', msg, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', onPress: fn }]);

  return (
    <Screen>
      <Txt size={26} weight="800">Painel do admin 👑</Txt>

      <SectionTitle>Desafio</SectionTitle>
      <Card>
        <Input label="Nome do desafio" value={title} onChangeText={setTitle} />
        <Input label="Duração (dias)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
        <Txt muted size={13}>Início: {formatBR(challenge.startDate)} · Status: {challenge.status === 'active' ? 'Em andamento' : challenge.status === 'draft' ? 'Não iniciado' : 'Encerrado'}</Txt>
        <Row style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <Button small title="▶️ Iniciar" onPress={() => confirm('Iniciar o desafio hoje?', () => setChallengeStatus(challenge.id, 'active'))} disabled={challenge.status === 'active'} />
          <Button small variant="danger" title="🏁 Encerrar" onPress={() => confirm('Encerrar o desafio para todos?', () => setChallengeStatus(challenge.id, 'ended'))} disabled={challenge.status === 'ended'} />
        </Row>
      </Card>

      <SectionTitle>Regras</SectionTitle>
      <Card>
        <Row style={{ gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Treinos/semana" value={String(rules.workoutsPerWeek)} keyboardType="number-pad" onChangeText={(v) => setRules({ ...rules, workoutsPerWeek: num(v, 0) })} /></View>
          <View style={{ flex: 1 }}><Input label="Treino bônus (nº)" value={String(rules.workoutBonusAt)} keyboardType="number-pad" onChangeText={(v) => setRules({ ...rules, workoutBonusAt: num(v, 0) })} /></View>
        </Row>
        <Row style={{ gap: 10 }}>
          <View style={{ flex: 1 }}><Input label="Cardios/semana" value={String(rules.cardioPerWeek)} keyboardType="number-pad" onChangeText={(v) => setRules({ ...rules, cardioPerWeek: num(v, 0) })} /></View>
          <View style={{ flex: 1 }}><Input label="Cardio mín. (min)" value={String(rules.cardioMinMinutes)} keyboardType="number-pad" onChangeText={(v) => setRules({ ...rules, cardioMinMinutes: num(v, 0) })} /></View>
        </Row>
        <Input label="Meta de água (ml)" value={String(rules.waterGoalMl)} keyboardType="number-pad" onChangeText={(v) => setRules({ ...rules, waterGoalMl: num(v, 0) })} />
      </Card>

      <SectionTitle>Pontuação</SectionTitle>
      <Card>
        {([['workout', '🏋️ Treino'], ['workoutBonus', '⭐ Bônus do 5º treino'], ['cardio', '🏃 Cardio'], ['water', '💧 Água'], ['noSweets', '🍫 Zero doce'], ['noAlcohol', '🍺 Zero álcool']] as const).map(([k, label]) => (
          <Input key={k} label={label} value={String(rules.points[k])} keyboardType="number-pad" onChangeText={(v) => setPts(k, v)} />
        ))}
        <Row style={{ gap: 8 }}>
          <Button title="Salvar alterações" onPress={save} style={{ flex: 1 }} />
          <Button variant="ghost" title="Padrão" onPress={() => setRules(DEFAULT_RULES)} />
        </Row>
      </Card>

      <SectionTitle>Participantes</SectionTitle>
      {members.map((m) => (
        <Card key={m.id} style={{ marginBottom: 8 }}>
          <Row>
            <Avatar name={m.name} photo={m.photo} size={36} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Txt weight="700">{m.name}</Txt>
              <Txt size={11} muted>{data.workouts.filter((w) => w.userId === m.id).length} treinos · {data.cardios.filter((c) => c.userId === m.id).length} cardios</Txt>
            </View>
            {m.id !== group.adminId ? <Txt color={t.danger} weight="700" onPress={() => confirm(`Remover ${m.name}?`, () => removeMember(group.id, m.id))}>Remover</Txt> : <Txt>👑</Txt>}
          </Row>
        </Card>
      ))}
      <Card>
        <Input label="Adicionar participante" value={newName} onChangeText={setNewName} placeholder="Nome" />
        <Button small title="Adicionar" onPress={() => { addMember(group.id, newName); setNewName(''); }} disabled={!newName.trim()} />
      </Card>
    </Screen>
  );
}
