import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../theme';
import { RoundButton } from './Buttons';

const TOTAL_STEPS = 4;

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  leftAction,
  step,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  leftAction?: ReactNode;
  step?: number;
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.side}>{leftAction}</View>
        <View style={styles.titleRow}>
          <View style={styles.titles}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <RoundButton icon="arrow-forward" onPress={onBack} label="رجوع" size={52} />
        </View>
      </View>

      {step ? (
        <View style={styles.progress}>
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <View
              key={index}
              style={[styles.segment, index >= TOTAL_STEPS - step && styles.segmentActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 44,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: {
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  progress: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
});
