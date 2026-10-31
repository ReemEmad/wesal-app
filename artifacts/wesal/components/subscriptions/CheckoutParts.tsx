import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, s as ui, type IconName } from '../pharmacy/PharmacyUI';
import { colors, fonts, radius, shadow, spacing } from '../../theme';

export function Row({ label, value, onChange, changeTestID, disabled }: { label: string; value: string; onChange?: () => void; changeTestID?: string; disabled?: boolean }) {
  return (
    <View style={st.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={st.rowLabel}>{label}</Text>
        <Text style={st.rowValue}>{value}</Text>
      </View>
      {onChange ? (
        <Pressable testID={changeTestID} accessibilityRole="button" accessibilityLabel={`تغيير ${label}`} disabled={disabled}
          onPress={onChange} hitSlop={6} style={({ pressed }) => [st.change, disabled && ui.disabled, pressed && st.pressed]}>
          <Text style={st.changeText}>تغيير</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Point({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={st.point}>
      <View style={st.pointIcon}><Icon name={icon} size={15} /></View>
      <Text style={[ui.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

/** Static masked illustration. Holds and collects no card data. */
export function DemoCard() {
  return (
    <View style={st.demoCard} accessible accessibilityLabel="بطاقة تجريبية مخفية الأرقام تنتهي بـ ٤٢٤٢، للعرض فقط">
      <View style={st.demoTop}>
        <Text style={st.demoBrand}>وصال</Text>
        <View style={st.demoTag}><Text style={st.demoTagText}>بطاقة تجريبية</Text></View>
      </View>
      <View style={st.chip} />
      <Text style={st.demoNum}>{'•••• •••• •••• ٤٢٤٢'}</Text>
      <View style={st.demoTop}>
        <Text style={st.demoMeta}>للعرض فقط</Text>
        <Text style={st.demoMeta}>لن يتم خصم أي مبلغ</Text>
      </View>
    </View>
  );
}

export function PayOption({ title, sub, selected, disabled, onPress, testID }: { title: string; sub: string; selected: boolean; disabled?: boolean; onPress: () => void; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="radio" accessibilityState={{ selected, disabled: !!disabled }} accessibilityLabel={`${title}، ${sub}`}
      disabled={disabled} onPress={onPress} style={({ pressed }) => [st.opt, selected && st.optOn, disabled && st.optOff, pressed && !disabled && st.pressed]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[st.rowValue, disabled && { color: colors.textMuted }]}>{title}</Text>
        <Text style={st.rowLabel}>{sub}</Text>
      </View>
      <View style={[st.radio, selected && { borderColor: colors.primary }]}>{selected ? <View style={st.radioDot} /> : null}</View>
    </Pressable>
  );
}

export function Processing({ planName }: { planName: string }) {
  return (
    <View style={st.processing} accessibilityLiveRegion="polite" accessibilityLabel="جارٍ حفظ الخطة التجريبية">
      <View style={st.procIcon}><ActivityIndicator size="large" color={colors.primary} /></View>
      <Text accessibilityRole="header" style={st.procTitle}>جارٍ حفظ خطة {planName}</Text>
      <Text style={[ui.label, { textAlign: 'center' }]}>نحفظ اختيارك على هذا الجهاز. لا تتم أي عملية دفع.</Text>
    </View>
  );
}

export const st = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow.soft },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: spacing.md },
  rowLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, textAlign: 'right' },
  change: { minHeight: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.chipBorder, justifyContent: 'center' },
  changeText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  point: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.sm },
  pointIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  demoCard: { backgroundColor: colors.primary, borderRadius: 20, padding: spacing.xl, gap: spacing.lg, ...shadow.selected },
  demoTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  demoBrand: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.surface },
  demoTag: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  demoTagText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.surface },
  chip: { width: 40, height: 28, borderRadius: 6, backgroundColor: colors.cameraAccent, alignSelf: 'flex-end' },
  demoNum: { fontFamily: fonts.semiBold, fontSize: 19, letterSpacing: 2, color: colors.surface, textAlign: 'center', writingDirection: 'ltr' },
  demoMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryLight },
  opt: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1.5, borderColor: 'transparent' },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoftBg },
  optOff: { backgroundColor: colors.inputBg, borderColor: colors.divider },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.chipBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  processing: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl * 2 },
  procIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' },
  procTitle: { fontFamily: fonts.semiBold, fontSize: 19, color: colors.text, textAlign: 'center' },
});
