import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
} from 'react-native';

import { tokens } from '../constants/tokens';
import { WesalText } from './WesalText';

type WesalButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: (event: GestureResponderEvent) => void;
  testID: string;
  variant?: 'primary' | 'link' | 'outline' | 'soft';
  disabled?: boolean;
  loading?: boolean;
};

export function WesalButton({
  label,
  accessibilityLabel,
  onPress,
  testID,
  variant = 'primary',
  disabled = false,
  loading = false,
}: WesalButtonProps) {
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isPrimary && pressed && styles.primaryPressed,
        !isPrimary && pressed && styles.secondaryPressed,
        inactive && styles.inactive,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? tokens.colors.white : tokens.colors.primary} />
      ) : (
        <WesalText
          variant={variant === 'link' ? 'link' : 'button'}
          style={!isPrimary && styles.secondaryLabel}
        >
          {label}
        </WesalText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    minHeight: 48,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.primary,
  },
  primaryPressed: {
    backgroundColor: tokens.colors.primaryPressed,
  },
  outline: {
    minHeight: 48,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.white,
  },
  soft: {
    minHeight: 48,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.decorative,
  },
  secondaryPressed: {
    opacity: 0.65,
  },
  secondaryLabel: {
    color: tokens.colors.primary,
  },
  link: {
    minHeight: 40,
    marginTop: tokens.space.small,
  },
  inactive: {
    opacity: 0.55,
  },
});
