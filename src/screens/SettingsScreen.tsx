import React from 'react';
import { Pressable, Switch, View } from 'react-native';
import { Card, Chip, Row, Screen, SectionTitle, Txt } from '../components/ui';
import { useStore, ThemePref } from '../store';
import { useTheme } from '../theme';
import { useChallenge } from '../hooks/useChallenge';
import { buildReminderTexts, scheduleDailyReminders } from '../services/notifications';
import type { NotificationPrefs } from '../types';

const ITEMS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'water', label: '💧 Lembrete de água' }, { key: 'workout', label: '🏋️ Lembrete de treino' },
  { key: 'cardio', label: '🏃 Lembrete de cardio' }, { key: 'sweets', label: '🍫 Registrar doce' },
  { key: 'alcohol', label: '🍺 Registrar álcool' }, { key: 'dailyClose', label: '📊 Fechamento diário' },
];
const THEMES: { key: ThemePref; label: string }[] = [
  { key: 'system', label: '📱 Automático' }, { key: 'light', label: '☀️ Claro' }, { key: 'dark', label: '🌙 Escuro' },
];

export default function SettingsScreen() {
  const t = useTheme();
  const { themePref, setTheme, notif, setNotif } = useStore();
  const { challenge, myStats, data, me, today } = useChallenge();

  const toggle = async (k: keyof NotificationPrefs, v: boolean) => {
    const next = { ...notif, [k]: v };
    setNotif({ [k]: v });
    if (challenge && myStats && me) {
      const water = data.days.find((d) => d.userId === me.id && d.date === today)?.waterMl ?? 0;
      await scheduleDailyReminders(next, buildReminderTexts(myStats, water, challenge.rules)).catch(() => {});
    }
  };

  return (
    <Screen>
      <Txt size={26} weight="800">Configurações ⚙️</Txt>
      <SectionTitle>Aparência</SectionTitle>
      <Row style={{ flexWrap: 'wrap', rowGap: 8 }}>
        {THEMES.map((x) => <Chip key={x.key} label={x.label} active={themePref === x.key} onPress={() => setTheme(x.key)} />)}
      </Row>

      <SectionTitle>Notificações</SectionTitle>
      <Card>
        {ITEMS.map((i, idx) => (
          <Pressable key={i.key} onPress={() => toggle(i.key, !notif[i.key])}>
            <Row style={{ justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: idx ? 0.5 : 0, borderColor: t.border }}>
              <Txt>{i.label}</Txt>
              <Switch value={notif[i.key]} onValueChange={(v) => toggle(i.key, v)} trackColor={{ true: t.primary, false: t.border }} />
            </Row>
          </Pressable>
        ))}
      </Card>
      <View style={{ marginTop: 10 }}><Txt size={12} muted>Os lembretes são agendados no aparelho. Push remoto exige configuração extra (veja o README).</Txt></View>
    </Screen>
  );
}
