import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

/** Header for tab root screens: titles on the right, optional action (e.g. a RoundButton) on the left. */
export function TabHeader({
  title,
  subtitle,
  leftAction,
}: {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>{leftAction}</View>
      <View style={styles.titles}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 44,
  },
  titles: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
