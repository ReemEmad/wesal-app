import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  textColor?: string;
};

export function PrimaryButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles.primary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={styles.primaryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({ label, onPress, disabled, textColor = colors.primary }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles.outline, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={[styles.outlineLabel, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function RoundButton({
  icon,
  onPress,
  label,
  size = 44,
  color = colors.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  size?: number;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.round, { width: size, height: size, borderRadius: size / 2 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={color} />
    </TouchableOpacity>
  );
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.surface,
  },
  outline: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.45,
  },
  round: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
});
