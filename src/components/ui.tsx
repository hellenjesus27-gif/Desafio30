import React from 'react';
import {
  ActivityIndicator, Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, space, useTheme } from '../theme';

/** Container de tela: respeita Safe Area (notch / Dynamic Island / barra de gestos) e rola. */
export function Screen({
  children, scroll = true, padded = true, style,
}: { children: React.ReactNode; scroll?: boolean; padded?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + space.md, paddingHorizontal: padded ? space.lg : 0 };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: t.bg }, pad, style]}>{children}</View>;
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[pad, { paddingBottom: space.xl * 2 }, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center' }}>{children}</View>
    </ScrollView>
  );
}

export function Txt({
  children, size = 15, weight = '400', color, muted, style, numberOfLines, onPress,
}: { onPress?: () => void; children: React.ReactNode; size?: number; weight?: '400' | '500' | '600' | '700' | '800'; color?: string; muted?: boolean; style?: StyleProp<any>; numberOfLines?: number }) {
  const t = useTheme();
  return (
    <Text onPress={onPress} numberOfLines={numberOfLines} style={[{ fontSize: size, fontWeight: weight, color: color ?? (muted ? t.textMuted : t.text) }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const t = useTheme();
  const base: ViewStyle = { backgroundColor: t.card, borderRadius: radius.md, padding: space.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border };
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed && { opacity: 0.85 }]}>{children}</Pressable>;
  return <View style={[base, style]}>{children}</View>;
}

export function Button({
  title, onPress, variant = 'primary', loading, disabled, style, small,
}: { title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : variant === 'danger' ? t.danger : variant === 'secondary' ? t.cardAlt : 'transparent';
  const fg = variant === 'primary' ? t.primaryText : variant === 'danger' ? '#fff' : t.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        { backgroundColor: bg, borderRadius: radius.pill, paddingVertical: small ? 8 : 14, paddingHorizontal: small ? 14 : 20, alignItems: 'center', justifyContent: 'center', minHeight: small ? 36 : 48, opacity: disabled ? 0.5 : pressed ? 0.85 : 1, borderWidth: variant === 'ghost' ? 1 : 0, borderColor: t.border },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={{ color: fg, fontWeight: '700', fontSize: small ? 13 : 15 }}>{title}</Text>}
    </Pressable>
  );
}

export function Input(props: TextInputProps & { label?: string }) {
  const t = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: space.md }}>
      {label ? <Txt size={13} muted weight="600" style={{ marginBottom: 6 }}>{label}</Txt> : null}
      <TextInput
        placeholderTextColor={t.textMuted}
        {...rest}
        style={[{ backgroundColor: t.cardAlt, color: t.text, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border }, style]}
      />
    </View>
  );
}

export function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  const t = useTheme();
  if (photo) return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: t.primaryText, fontWeight: '800', fontSize: size * 0.42 }}>{name.trim().charAt(0).toUpperCase() || '?'}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, marginRight: 8, backgroundColor: active ? t.primary : t.cardAlt, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border }}>
      <Text style={{ color: active ? t.primaryText : t.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: t.cardAlt, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? t.primary, borderRadius: 4 }} />
    </View>
  );
}

export function Badge({ text, tone }: { text: string; tone: 'success' | 'danger' | 'gold' | 'muted' }) {
  const t = useTheme();
  const c = tone === 'success' ? t.success : tone === 'danger' ? t.danger : tone === 'gold' ? t.gold : t.textMuted;
  return (
    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: c + '22' }}>
      <Text style={{ color: c, fontSize: 11, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md }}>
      <Txt size={18} weight="800">{children}</Txt>
      {right}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

/** Logo original (sem distorcer: mantém proporção 1:1). */
export function Logo({ size = 120 }: { size?: number }) {
  return <Image source={require('../../assets/logo.png')} style={{ width: size, height: size }} resizeMode="contain" accessibilityLabel="Logo" />;
}

/** Selo de status do mínimo semanal. */
export function MinStatusBadge({ status, count, min, bonusAt }: { status: 'below' | 'met' | 'bonus'; count: number; min: number; bonusAt: number }) {
  if (status === 'bonus') return <Badge tone="gold" text={`⭐ ${count}/${bonusAt} Meta + bônus`} />;
  if (status === 'met') return <Badge tone="success" text={`🟢 ${count}/${min} Meta cumprida`} />;
  return <Badge tone="danger" text={`🔴 ${count}/${min} Mínimo semanal não cumprido`} />;
}

/** Gráfico de barras simples (sem dependências pesadas). */
export function BarChart({ data, height = 110, color, suffix = '' }: { data: { label: string; value: number }[]; height?: number; color?: string; suffix?: string }) {
  const t = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: height + 34, gap: 4 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Text style={{ color: t.textMuted, fontSize: 9, marginBottom: 2 }}>{d.value > 0 ? `${d.value}${suffix}` : ''}</Text>
          <View style={{ width: '70%', maxWidth: 28, height: Math.max(3, (d.value / max) * height), backgroundColor: color ?? t.primary, borderRadius: 4, opacity: d.value > 0 ? 1 : 0.25 }} />
          <Text style={{ color: t.textMuted, fontSize: 9, marginTop: 4 }} numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}
