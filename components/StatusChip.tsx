import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius } from '../theme';
import { BadgeStyle } from '../utils/clinic';

export function StatusChip({ badge, label }: { badge: BadgeStyle; label?: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: badge.background }]}>
      <Ionicons name={badge.icon} size={16} color={badge.foreground} />
      <Text style={[styles.label, { color: badge.foreground }]}>{label ?? badge.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});
