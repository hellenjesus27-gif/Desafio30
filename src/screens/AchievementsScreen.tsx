import React from 'react';
import { View } from 'react-native';
import { Card, Screen, Txt } from '../components/ui';
import { useChallenge } from '../hooks/useChallenge';
import { useTheme } from '../theme';
import { ACHIEVEMENTS } from '../utils/achievements';

export default function AchievementsScreen() {
  const t = useTheme();
  const { achievements } = useChallenge();
  return (
    <Screen>
      <Txt size={26} weight="800">Minhas conquistas 🏅</Txt>
      <Txt muted style={{ marginBottom: 14 }}>{achievements.length} de {ACHIEVEMENTS.length} desbloqueadas</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ACHIEVEMENTS.map((a) => {
          const on = achievements.includes(a.id);
          return (
            <Card key={a.id} style={{ flexGrow: 1, flexBasis: '46%', minWidth: 140, opacity: on ? 1 : 0.45, borderColor: on ? t.primary : t.border }}>
              <Txt size={34} style={{ textAlign: 'center' }}>{on ? a.emoji : '🔒'}</Txt>
              <Txt weight="800" style={{ textAlign: 'center', marginTop: 4 }}>{a.title}</Txt>
              <Txt size={12} muted style={{ textAlign: 'center', marginTop: 2 }}>{a.desc}</Txt>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
