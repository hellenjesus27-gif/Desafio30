import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useTheme } from '../theme';

/** Linha simples. Se invert=true, valores menores ficam no topo (ideal para posição no ranking). */
export function LineChart({ values, height = 110, invert }: { values: number[]; height?: number; invert?: boolean }) {
  const t = useTheme();
  const [w, setW] = React.useState(300);
  if (values.length === 0) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = Math.max(1, max - min);
  const pad = 10;
  const pts = values.map((v, i) => {
    const x = pad + (values.length === 1 ? (w - 2 * pad) / 2 : (i / (values.length - 1)) * (w - 2 * pad));
    const norm = (v - min) / span;
    const y = pad + (invert ? norm : 1 - norm) * (height - 2 * pad);
    return { x, y };
  });
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      <Svg width={w} height={height}>
        <Polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={t.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={t.primary} />)}
      </Svg>
    </View>
  );
}
