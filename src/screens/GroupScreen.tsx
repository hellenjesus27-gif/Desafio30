import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Button, Card, Input, Logo, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useStore } from '../store';
import { useTheme } from '../theme';
import { pickImage } from '../services/images';
import { shareInvite } from '../services/share';
import { formatBR, addDays } from '../utils/dates';

export default function GroupScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { createGroup, joinGroup, groups, currentUserId, setActiveGroup } = useStore();
  const { group, challenge, members, me } = useChallenge();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [code, setCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const myGroups = groups.filter((g) => g.memberIds.includes(currentUserId ?? ''));
  const isAdmin = group?.adminId === me?.id;

  const doJoin = () => {
    const err = joinGroup(code);
    if (err) Alert.alert('Ops', err); else setCode('');
  };

  return (
    <Screen>
      <Txt size={26} weight="800">Grupo 👥</Txt>

      {group && challenge ? (
        <>
          <Card style={{ marginTop: 14, alignItems: 'center' }}>
            {group.photo ? <Avatar name={group.name} photo={group.photo} size={84} /> : <Logo size={110} />}
            <Txt size={22} weight="800" style={{ marginTop: 6 }}>{group.name}</Txt>
            <Txt muted size={13}>{formatBR(challenge.startDate)} → {formatBR(addDays(challenge.startDate, challenge.durationDays - 1))} · {challenge.durationDays} dias</Txt>
            <Txt size={12} muted style={{ marginTop: 2 }}>Status: {challenge.status === 'active' ? '🟢 Em andamento' : challenge.status === 'draft' ? '🟡 Não iniciado' : '🏁 Encerrado'}</Txt>
            <View style={{ backgroundColor: t.cardAlt, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, marginTop: 12 }}>
              <Txt size={12} muted weight="700" style={{ textAlign: 'center' }}>CÓDIGO DE CONVITE</Txt>
              <Txt size={24} weight="800" color={t.primary} style={{ letterSpacing: 2, textAlign: 'center' }}>{group.inviteCode}</Txt>
            </View>
            <Button title="📤 Compartilhar convite" onPress={() => shareInvite(group.name, group.inviteCode)} style={{ marginTop: 12, alignSelf: 'stretch' }} />
          </Card>

          <SectionTitle>Participantes ({members.length})</SectionTitle>
          {members.map((m) => (
            <Card key={m.id} style={{ marginBottom: 8 }}>
              <Row>
                <Avatar name={m.name} photo={m.photo} size={40} />
                <Txt weight="700" style={{ flex: 1, marginLeft: 12 }}>{m.name}{m.id === group.adminId ? ' 👑' : ''}{m.id === me?.id ? ' (você)' : ''}</Txt>
              </Row>
            </Card>
          ))}

          <SectionTitle>Regras</SectionTitle>
          <Card>
            <Txt>🏋️ Mínimo de <Txt weight="800">{challenge.rules.workoutsPerWeek} treinos</Txt> por semana ({challenge.rules.points.workout} pts cada; 5º treino +{challenge.rules.points.workoutBonus})</Txt>
            <Txt style={{ marginTop: 6 }}>🏃 <Txt weight="800">{challenge.rules.cardioPerWeek} cardios</Txt> por semana de ao menos {challenge.rules.cardioMinMinutes} min ({challenge.rules.points.cardio} pts)</Txt>
            <Txt style={{ marginTop: 6 }}>💧 <Txt weight="800">{challenge.rules.waterGoalMl / 1000} L</Txt> de água por dia ({challenge.rules.points.water} pts)</Txt>
            <Txt style={{ marginTop: 6 }}>🍫 Zero doces ({challenge.rules.points.noSweets} pts/dia)</Txt>
            <Txt style={{ marginTop: 6 }}>🍺 Zero álcool ({challenge.rules.points.noAlcohol} pts/dia)</Txt>
          </Card>

          {isAdmin ? <Button variant="secondary" title="👑 Painel do administrador" onPress={() => nav.navigate('Admin')} style={{ marginTop: 14 }} /> : null}

          {myGroups.length > 1 ? (
            <>
              <SectionTitle>Meus grupos</SectionTitle>
              {myGroups.map((g) => (
                <Pressable key={g.id} onPress={() => setActiveGroup(g.id)}>
                  <Card style={{ marginBottom: 8, borderColor: g.id === group.id ? t.primary : t.border }}><Txt weight="700">{g.name} {g.id === group.id ? '✓' : ''}</Txt></Card>
                </Pressable>
              ))}
            </>
          ) : null}
        </>
      ) : (
        <Txt muted style={{ marginVertical: 12 }}>Você ainda não está em nenhum grupo. Crie o seu ou entre com um código.</Txt>
      )}

      <SectionTitle>Entrar com código</SectionTitle>
      <Card>
        <Input value={code} onChangeText={setCode} placeholder="Ex.: D30-ABC123" autoCapitalize="characters" autoCorrect={false} />
        <Button title="Entrar no grupo" onPress={doJoin} disabled={!code.trim()} />
      </Card>

      <SectionTitle>Criar grupo</SectionTitle>
      {showCreate ? (
        <Card>
          <Row style={{ marginBottom: 12 }}>
            <Pressable onPress={async () => setPhoto((await pickImage()) ?? photo)}><Avatar name={name || '?'} photo={photo} size={60} /></Pressable>
            <Txt muted size={12} style={{ marginLeft: 12, flex: 1 }}>Toque para escolher a foto do grupo</Txt>
          </Row>
          <Input label="Nome do grupo" value={name} onChangeText={setName} placeholder="Ex.: Amigas em Ação" />
          <Button title="Criar grupo" onPress={() => { createGroup(name, photo); setName(''); setPhoto(undefined); setShowCreate(false); }} disabled={!name.trim()} />
        </Card>
      ) : (
        <Button variant="secondary" title="➕ Criar novo grupo" onPress={() => setShowCreate(true)} />
      )}
    </Screen>
  );
}
