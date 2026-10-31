import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fonts, shadow, spacing } from '../theme';

/** White rounded card with a right-aligned title and an optional link on the left. */
export function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {actionLabel ? (
          <TouchableOpacity onPress={onAction} accessibilityRole="button">
            <Text style={styles.action}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    gap: spacing.lg,
    ...shadow.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  action: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  body: {
    gap: spacing.md,
  },
});
