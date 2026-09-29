import React, { useState } from 'react';
import { View } from 'react-native';
import { Avatar, Button, Card, Input, Row, Screen, Txt } from '../components/ui';
import { useStore } from '../store';
import { useTheme } from '../theme';
import type { Activity } from '../types';

const EMOJIS: Activity['reactions'][number]['emoji'][] = ['❤️', '🔥', '💪', '👏'];

export default function ActivitiesScreen() {
  const t = useTheme();
  const { activities, users, currentUserId, react, comment } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState('');

  return (
    <Screen>
      <Txt size={26} weight="800">Atividades recentes 📸</Txt>
      {activities.length === 0 ? <Txt muted style={{ marginTop: 12 }}>Nada por aqui ainda. Registre um treino!</Txt> : null}
      {[...activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((a) => {
        const u = users.find((x) => x.id === a.userId);
        return (
          <Card key={a.id} style={{ marginTop: 12 }}>
            <Row>
              <Avatar name={u?.name ?? '?'} photo={u?.photo} size={38} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Txt weight="700">{u?.name}</Txt>
                <Txt size={11} muted>{new Date(a.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</Txt>
              </View>
            </Row>
            <Txt style={{ marginTop: 10 }}>{a.text}</Txt>
            <Row style={{ marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
              {EMOJIS.map((e) => {
                const count = a.reactions.filter((r) => r.emoji === e).length;
                const mine = a.reactions.some((r) => r.emoji === e && r.userId === currentUserId);
                return (
                  <Button key={e} small variant={mine ? 'primary' : 'secondary'} title={`${e}${count ? ' ' + count : ''}`} onPress={() => react(a.id, e)} />
                );
              })}
              <Button small variant="ghost" title={`💬 ${a.comments.length}`} onPress={() => setOpenId(openId === a.id ? null : a.id)} />
            </Row>
            {openId === a.id ? (
              <View style={{ marginTop: 12 }}>
                {a.comments.map((c) => (
                  <View key={c.id} style={{ marginBottom: 8, backgroundColor: t.cardAlt, padding: 10, borderRadius: 10 }}>
                    <Txt size={12} weight="700">{users.find((x) => x.id === c.userId)?.name}</Txt>
                    <Txt>{c.text}</Txt>
                  </View>
                ))}
                <Input value={text} onChangeText={setText} placeholder="Escreva um comentário..." />
                <Button small title="Comentar" onPress={() => { comment(a.id, text); setText(''); }} disabled={!text.trim()} />
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}
