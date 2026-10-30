import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

export type MedicationBadgeKind = 'active' | 'low' | 'paused';

const CONFIG: Record<
  MedicationBadgeKind,
  { label: string; background: string; foreground: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  active: { label: 'قيد الاستخدام', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  low: { label: 'المخزون منخفض', background: colors.stockLowBg, foreground: colors.stockLow, icon: 'time-outline' },
  paused: { label: 'متوقف مؤقتًا', background: colors.primarySoftBg, foreground: colors.textMuted, icon: 'pause-circle-outline' },
};

export function MedicationStatusBadge({ kind }: { kind: MedicationBadgeKind }) {
  const config = CONFIG[kind];
  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Text style={[styles.label, { color: config.foreground }]}>{config.label}</Text>
      <Ionicons name={config.icon} size={15} color={config.foreground} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
});
