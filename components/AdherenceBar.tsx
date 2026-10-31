import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import { percentText } from '../utils/clinic';

/** Percentage label on the left, bar to its right; the fill grows from the right edge (RTL). */
export function AdherenceBar({
  value,
  color = colors.primary,
  width = 114,
}: {
  value: number;
  color?: string;
  width?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.row} accessibilityLabel={`الالتزام ${percentText(clamped)}`}>
      <Text style={styles.label}>{percentText(clamped)}</Text>
      <View style={[styles.track, { width }]}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.text,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
