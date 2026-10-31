import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DemoOrder } from '../../constants/pharmacy';
import { colors, fonts, radius, spacing } from '../../theme';
import { Banner, Btn, Icon, Sheet, egp, num, s as ui } from './PharmacyUI';

type Item = { medicineId: string; name: string; quantity: number; price: number };

export function ItemsList({ items, total, rx }: { items: Item[]; total: number; rx: boolean }) {
  return (
    <View style={styles.box}>
      {items.map(i => (
        <View key={i.medicineId} style={styles.line}>
          <Text style={[ui.body, { flex: 1 }]}>{i.name} × {num(i.quantity)}</Text>
          <Text style={ui.body}>{egp(i.price * i.quantity)}</Text>
        </View>
      ))}
      {rx ? <View style={styles.line}><Text style={[ui.body, { flex: 1 }]}>أدوية الروشتة المرفقة</Text><Text style={[ui.label]}>السعر بعد مراجعة الصيدلية</Text></View> : null}
      <View style={[styles.line, styles.totalLine]}>
        <Text style={[ui.strong, { flex: 1 }]}>{rx ? (items.length ? 'إجمالي الأصناف المحددة فقط' : 'الإجمالي') : 'الإجمالي'}</Text>
        <Text style={ui.strong}>{items.length ? egp(total) : 'يُحدد بعد المراجعة'}</Text>
      </View>
    </View>
  );
}

export function ReviewSheet({ visible, onClose, onConfirm, busy, pharmacyName, address, items, total, rx, error }: {
  visible: boolean; onClose: () => void; onConfirm: () => void; busy: boolean; pharmacyName: string; address: string;
  items: Item[]; total: number; rx: boolean; error: string | null;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title="مراجعة طلب تجريبي">
      <Banner tone="warning">هذا طلب تجريبي فقط: لن يُرسل لأي صيدلية، ولن يُخصم أي مبلغ.</Banner>
      <Text style={ui.label}>الصيدلية</Text><Text style={ui.strong}>{pharmacyName}</Text>
      <Text style={ui.label}>عنوان التوصيل</Text><Text style={ui.body}>{address}</Text>
      <ItemsList items={items} total={total} rx={rx} />
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Btn testID="pharmacy-order-confirm" label={busy ? 'جارٍ الحفظ…' : 'تأكيد الطلب التجريبي'} disabled={busy} onPress={onConfirm} />
      <Btn label="رجوع للتعديل" variant="ghost" onPress={onClose} />
    </Sheet>
  );
}

export function ConfirmationSheet({ order, onClose }: { order: DemoOrder | null; onClose: () => void }) {
  return (
    <Sheet visible={!!order} onClose={onClose} title="تم حفظ الطلب التجريبي">
      {order ? (
        <>
          <View style={styles.ok}><Icon name="check" size={30} color={colors.success} width={2.6} /></View>
          <Text style={[ui.label, { textAlign: 'center' }]}>رمز العرض</Text>
          <Text style={styles.code} selectable>{order.id}</Text>
          <Banner>حُفظ هذا الطلب على جهازك فقط. لم يُرسل لأي صيدلية ولم يتم أي دفع أو توصيل.</Banner>
          <ItemsList items={order.items} total={order.total} rx={order.prescriptionAttached} />
          <Btn testID="pharmacy-order-close" label="تم" onPress={onClose} />
        </>
      ) : null}
    </Sheet>
  );
}

export function OrderHistory({ orders }: { orders: DemoOrder[] }) {
  const [open, setOpen] = useState(false);
  if (!orders.length) return null;
  const last = orders[0];
  return (
    <View style={styles.history}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel="الطلبات التجريبية السابقة"
        onPress={() => setOpen(o => !o)} style={styles.histHead}>
        <View style={{ flex: 1 }}>
          <Text style={ui.strong}>آخر طلب تجريبي</Text>
          <Text style={ui.label}>{last.pharmacyName} · {last.id}</Text>
        </View>
        <View style={{ transform: [{ rotate: open ? '90deg' : '-90deg' }] }}><Icon name="chevron" size={16} /></View>
      </Pressable>
      {open ? orders.map(o => (
        <View key={o.id} style={styles.histItem}>
          <Text style={ui.body}>{o.pharmacyName} · {new Date(o.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
          <Text style={ui.label}>
            {o.items.length ? `${num(o.items.reduce((n, i) => n + i.quantity, 0))} قطعة · ${egp(o.total)}` : 'بالروشتة فقط'}
            {o.prescriptionAttached ? ' · روشتة مرفقة (السعر بعد المراجعة)' : ''}
          </Text>
          <Text style={[ui.label, { fontSize: 11 }]}>{o.id}</Text>
        </View>
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  line: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm },
  ok: { alignSelf: 'center', width: 60, height: 60, borderRadius: 30, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
  code: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.primary, textAlign: 'center', letterSpacing: 1 },
  history: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  histHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
  histItem: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.sm, gap: 2 },
});
