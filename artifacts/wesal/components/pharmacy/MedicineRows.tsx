import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Medicine } from '../../constants/pharmacy';
import { colors, fonts, radius, spacing } from '../../theme';
import { Icon, egp, num, s as ui } from './PharmacyUI';

const MED_IMG = require('../../assets/pharmacy/medicine.png');

export function ScheduleRow({ m, qty, disabled, onToggle, onQty }: {
  m: Medicine; qty: number; disabled: boolean; onToggle: () => void; onQty: (n: number) => void;
}) {
  const on = qty > 0;
  return (
    <View style={[styles.row, on && styles.rowOn]}>
      <Pressable testID={`medicine-select-${m.id}`} accessibilityRole="checkbox" accessibilityState={{ checked: on, disabled }}
        accessibilityLabel={`${m.name}، ${egp(m.price)}`} disabled={disabled} onPress={onToggle} hitSlop={8}
        style={[styles.box, on && styles.boxOn]}>
        {on ? <Icon name="check" size={16} color={colors.surface} width={2.6} /> : null}
      </Pressable>
      <Image source={MED_IMG} style={styles.img} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{m.name}</Text>
        <Text style={ui.label}>{m.description}</Text>
      </View>
      {on ? (
        <View style={styles.stepper}>
          <Pressable testID={`medicine-plus-${m.id}`} accessibilityRole="button" accessibilityLabel={`زيادة كمية ${m.name}`}
            disabled={disabled || qty >= 99} onPress={() => onQty(qty + 1)} style={[styles.plus, (disabled || qty >= 99) && ui.disabled]}>
            <Icon name="plus" size={16} color={colors.surface} width={2.4} />
          </Pressable>
          <Text style={styles.qty} accessibilityLabel={`الكمية ${qty}`}>{num(qty)}</Text>
          <Pressable testID={`medicine-minus-${m.id}`} accessibilityRole="button" accessibilityLabel={`تقليل كمية ${m.name}`}
            disabled={disabled} onPress={() => onQty(qty - 1)} style={[styles.minus, disabled && ui.disabled]}>
            <Icon name="minus" size={16} color={colors.text} width={2.4} />
          </Pressable>
        </View>
      ) : <Text style={styles.price}>{egp(m.price)}</Text>}
    </View>
  );
}

export function ResultRow({ m, qty, disabled, onAdd, onRemove }: { m: Medicine; qty: number; disabled: boolean; onAdd: () => void; onRemove: () => void }) {
  return (
    <View style={[styles.row, m.available ? styles.rowOn : styles.rowOff]}>
      <View style={styles.iconBox}><Icon name="pill" size={20} color={m.available ? colors.primary : colors.textMuted} /></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, !m.available && { color: colors.textMuted }]}>{m.name}</Text>
        <Text style={ui.label}>{m.description}  <Text style={[styles.price, !m.available && { color: colors.textMuted }]}>{egp(m.price)}</Text></Text>
        {qty > 0 ? (
          <View style={styles.selectedQuantity}>
            <Text style={[ui.label, { color: colors.success }]}>في السلة: {num(qty)}</Text>
            <Pressable
              testID={`medicine-minus-${m.id}`}
              accessibilityRole="button"
              accessibilityLabel={`تقليل كمية ${m.name}`}
              disabled={disabled}
              onPress={onRemove}
              style={[styles.minus, disabled && ui.disabled]}
            >
              <Icon name="minus" size={16} color={colors.primary} />
            </Pressable>
          </View>
        ) : null}
      </View>
      {m.available ? (
        <Pressable testID={`medicine-add-${m.id}`} accessibilityRole="button" accessibilityLabel={`إضافة ${m.name} إلى السلة`}
          disabled={disabled || qty >= 99} onPress={onAdd} style={({ pressed }) => [styles.add, (disabled || qty >= 99) && ui.disabled, pressed && ui.pressed]}>
          <Icon name="plus" size={15} color={colors.surface} width={2.4} />
          <Text style={styles.addText}>إضافة</Text>
        </Pressable>
      ) : (
        <View testID={`medicine-add-${m.id}`} accessible accessibilityLabel={`${m.name} غير متوفر`} accessibilityState={{ disabled: true }} style={{ alignItems: 'center', gap: 4 }}>
          <View style={styles.na}><Text style={styles.naText}>غير متوفر</Text></View>
          <Text style={[ui.label, { fontSize: 11 }]}>لا يمكن طلبه</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface },
  rowOn: { backgroundColor: colors.primarySoftBg, borderColor: colors.primaryLight },
  rowOff: { backgroundColor: '#FBFAF8' },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 1.8, borderColor: colors.chipBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  img: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.surface },
  iconBox: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.semiBold, fontSize: 14.5, color: colors.text, textAlign: 'right' },
  price: { fontFamily: fonts.semiBold, fontSize: 13.5, color: colors.primary },
  stepper: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 },
  selectedQuantity: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  plus: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  minus: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, minWidth: 18, textAlign: 'center' },
  add: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 40 },
  addText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.surface },
  na: { backgroundColor: colors.dangerBg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  naText: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger },
});
