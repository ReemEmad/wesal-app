import React, { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';

export type IconName =
  | 'search' | 'pin' | 'clock' | 'star' | 'chevron' | 'plus' | 'minus' | 'check' | 'phone' | 'nav'
  | 'doc' | 'close' | 'arrow' | 'pill' | 'bell' | 'cross' | 'truck' | 'home' | 'clinic';

const PATHS: Record<IconName, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  star: 'M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.8 6.6 19.6l1.1-6L3.2 9.4l6.1-.8z',
  chevron: 'M14.5 6l-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  phone: 'M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z',
  nav: 'M20 4L3 11l7 2.5L12.5 21z',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
  close: 'M6 6l12 12M18 6L6 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  pill: 'M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7zM8.5 8.5l7 7',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20.5a2 2 0 0 0 4 0',
  cross: 'M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6z',
  truck: 'M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7M6 18.5a1.5 1.5 0 1 0 0-3M17 18.5a1.5 1.5 0 1 0 0-3',
  home: 'M4 10.5L12 4l8 6.5V20h-5.5v-5.5h-5V20H4z',
  clinic: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M8 12h8',
};

export function Icon({ name, size = 20, color = colors.primary, fill, width = 1.8 }: { name: IconName; size?: number; color?: string; fill?: string; width?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d={PATHS[name]} stroke={color} strokeWidth={width} fill={fill ?? 'none'} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Dot({ color }: { color: string }) {
  return <Svg width={8} height={8}><Circle cx={4} cy={4} r={3.5} fill={color} /></Svg>;
}

export const egp = (n: number) => `${toArabicDigits(n)} ج.م`;
export const num = (n: number | string) => toArabicDigits(n);

export function StatusPill({ tone, label }: { tone: 'open' | 'closed' | 'info'; label: string }) {
  const map = {
    open: [colors.successBg, colors.success],
    closed: [colors.dangerBg, colors.danger],
    info: [colors.primarySoftBg, colors.primary],
  }[tone];
  return (
    <View style={[s.pill, { backgroundColor: map[0] }]}>
      {tone === 'info' ? <Icon name="truck" size={14} color={map[1]} /> : <Dot color={map[1]} />}
      <Text style={[s.pillText, { color: map[1] }]}>{label}</Text>
    </View>
  );
}

export function Banner({ tone = 'calm', children, testID }: PropsWithChildren<{ tone?: 'calm' | 'danger' | 'warning'; testID?: string }>) {
  const bg = { calm: colors.primarySoftBg, danger: colors.dangerBg, warning: colors.warningBg }[tone];
  const fg = { calm: colors.primary, danger: colors.danger, warning: colors.warning }[tone];
  return (
    <View testID={testID} style={[s.banner, { backgroundColor: bg }]} accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Text style={[s.bannerText, { color: tone === 'calm' ? colors.text : fg }]}>{children}</Text>
    </View>
  );
}

export function Btn({ label, onPress, variant = 'primary', disabled, testID, icon, a11y }: {
  label: string; onPress: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'light'; disabled?: boolean; testID?: string; icon?: IconName; a11y?: string;
}) {
  const fg = variant === 'primary' ? colors.surface : colors.primary;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, s[`btn_${variant}`], disabled && s.disabled, pressed && s.pressed]}
    >
      {icon ? <Icon name={icon} size={17} color={fg} /> : null}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Bottom sheet-style modal with keyboard avoidance and safe area. */
export function Sheet({ visible, onClose, title, children }: PropsWithChildren<{ visible: boolean; onClose: () => void; title: string }>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="إغلاق" accessibilityRole="button" />
        <SafeAreaView edges={['bottom']} style={s.sheet}>
          <View style={s.grab} />
          <Text accessibilityRole="header" style={s.sheetTitle}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.lg }}>
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const s = StyleSheet.create({
  pill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-end' },
  pillText: { fontFamily: fonts.regular, fontSize: 12 },
  banner: { borderRadius: 14, padding: spacing.md },
  bannerText: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  btn: { minHeight: 48, borderRadius: radius.pill, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  btn_primary: { backgroundColor: colors.primary },
  btn_outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.inputBg },
  btn_ghost: { backgroundColor: 'transparent' },
  btn_light: { backgroundColor: colors.surface },
  btnText: { fontFamily: fonts.semiBold, fontSize: 15 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(36,26,54,0.38)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, maxHeight: '88%', width: '100%', maxWidth: 520, alignSelf: 'center' },
  grab: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.chipBorder, alignSelf: 'center', marginBottom: spacing.md },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text, textAlign: 'right', marginBottom: spacing.md },
  label: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: colors.text, textAlign: 'right', writingDirection: 'rtl' },
  strong: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, textAlign: 'right' },
});
