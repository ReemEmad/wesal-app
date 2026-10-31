import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { usePharmacy } from '../components/PharmacyProvider';
import { ResultRow, ScheduleRow } from '../components/pharmacy/MedicineRows';
import { ConfirmationSheet, OrderHistory, ReviewSheet } from '../components/pharmacy/OrderSheets';
import { PrescriptionPicker } from '../components/pharmacy/Prescription';
import { Banner, Btn, Icon, Sheet, StatusPill, egp, num, s as ui } from '../components/pharmacy/PharmacyUI';
import { MEDICINES, PHARMACIES, cartSummary, normalizeSearch, type DemoOrder } from '../constants/pharmacy';
import { colors, fonts, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PharmacyDetail'>;
const SCHEDULE = MEDICINES.filter(m => m.fromSchedule);

export default function PharmacyDetailScreen({ navigation, route }: Props) {
  const pharmacy = PHARMACIES.find(p => p.id === route.params?.pharmacyId);
  const ph = usePharmacy();
  const [query, setQuery] = useState('');
  const [info, setInfo] = useState<null | 'call' | 'directions'>(null);
  const [review, setReview] = useState(false);
  const [placed, setPlaced] = useState<DemoOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Pharmacy'));

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    return q ? MEDICINES.filter(m => normalizeSearch(m.name).includes(q)) : [];
  }, [query]);

  if (!pharmacy) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', padding: spacing.xl, gap: spacing.lg }]} testID="pharmacy-detail">
        <Banner tone="danger">لم نجد هذه الصيدلية في نسخة العرض. ربما الرابط غير صحيح.</Banner>
        <Btn label="العودة إلى الصيدليات" onPress={() => navigation.navigate('Pharmacy')} />
      </SafeAreaView>
    );
  }

  const cart = ph.getCart(pharmacy.id);
  const summary = cartSummary(cart);
  const rx = !!ph.prescriptionUri;
  const editsOff = !ph.ready || busy;
  const searching = query.trim().length > 0;
  const selectedSchedule = SCHEDULE.filter(m => (cart[m.id] ?? 0) > 0).length;

  const act = (fn: () => void) => {
    setActionError(null);
    try { fn(); } catch (e) { setActionError(e instanceof Error ? e.message : 'تعذر تحديث السلة.'); }
  };

  const blockReason = !ph.ready ? 'جارٍ تحميل التجربة…'
    : !pharmacy.isOpen ? `الصيدلية مغلقة الآن (${pharmacy.hours})`
    : !summary.count && !rx ? 'اختر دواء أو أرفق روشتة' : null;

  const cta = blockReason ?? (summary.count
    ? `اطلب ${num(summary.count)} ${summary.count === 1 ? 'دواء' : 'أدوية'} · ${egp(summary.total)}${rx ? ' + روشتة' : ''}`
    : 'اطلب بالروشتة · السعر بعد المراجعة');

  const confirm = () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setOrderError(null);
    try {
      const order = ph.placeDemoOrder(pharmacy.id);
      setReview(false);
      ph.setPrescriptionUri(null);
      setPlaced(order);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : 'تعذر حفظ الطلب التجريبي.');
    } finally {
      lock.current = false; setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root} testID="pharmacy-detail">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="رجوع إلى قائمة الصيدليات" onPress={goBack} style={styles.back}>
            <Icon name="arrow" size={20} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={styles.title}>{searching ? pharmacy.name : 'تفاصيل الصيدلية'}</Text>
            {searching ? <Text style={ui.label}>ابحث عن الدوا اللي محتاجه</Text> : null}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {!searching ? (
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.crossBox}><Icon name="cross" size={24} /></View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.heroName}>{pharmacy.name}</Text>
                  <StatusPill tone={pharmacy.isOpen ? 'open' : 'closed'} label={pharmacy.isOpen ? (pharmacy.is24Hours ? 'مفتوحة ٢٤ ساعة' : 'مفتوحة الآن') : 'مغلقة الآن'} />
                </View>
              </View>
              <View style={styles.heroLine}><Icon name="pin" size={16} color={colors.surface} /><Text style={styles.heroText}>{pharmacy.address} · {pharmacy.distanceKm < 1 ? `${num(pharmacy.distanceKm * 1000)} م` : `${num(pharmacy.distanceKm)} كم`}</Text></View>
              <View style={styles.heroLine}><Icon name="clock" size={16} color={colors.surface} /><Text style={styles.heroText}>{pharmacy.hours}</Text></View>
              <View style={styles.heroBtns}>
                <View style={{ flex: 1 }}><Btn label="اتصال" icon="phone" variant="light" onPress={() => setInfo('call')} a11y="اتصال، غير متاح في نسخة العرض" /></View>
                <View style={{ flex: 1 }}>
                  <Pressable accessibilityRole="button" accessibilityLabel="الاتجاهات، غير متاحة في نسخة العرض" onPress={() => setInfo('directions')} style={styles.outlineLight}>
                    <Icon name="nav" size={17} color={colors.surface} /><Text style={styles.outlineLightText}>الاتجاهات</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          <View style={[styles.search, searching && styles.searchActive]}>
            <Icon name="search" size={20} />
            <TextInput testID="medicine-search" value={query} onChangeText={setQuery} placeholder="ابحث عن أي دوا في الصيدلية..."
              placeholderTextColor={colors.textFaint} accessibilityLabel="ابحث عن دواء" returnKeyType="search" style={styles.searchInput} textAlign="right" />
            {searching ? (
              <Pressable testID="medicine-clear-search" accessibilityRole="button" accessibilityLabel="مسح البحث" onPress={() => setQuery('')} style={styles.clear}>
                <Icon name="close" size={16} />
              </Pressable>
            ) : null}
          </View>

          {ph.persistenceError ? <Banner tone="warning">{ph.persistenceError}</Banner> : null}
          {!ph.ready ? <Banner>جارٍ تحميل سلة التجربة… التعديل متوقف مؤقتًا.</Banner> : null}
          {!pharmacy.isOpen ? <Banner tone="danger">الصيدلية مغلقة الآن ({pharmacy.hours}). يمكنك تصفح الأدوية، لكن لا يمكن الطلب.</Banner> : null}
          {actionError ? <Banner tone="danger">{actionError}</Banner> : null}

          {searching ? (
            <>
              <View style={styles.sectionHead}>
                <Text style={styles.section}>نتائج البحث</Text>
                <Text style={ui.label} accessibilityLiveRegion="polite">{num(results.length)} نتائج</Text>
              </View>
              <View style={styles.panel}>
                {results.length ? results.map(m => (
                  <ResultRow
                    key={m.id} m={m} qty={cart[m.id] ?? 0} disabled={editsOff}
                    onAdd={() => act(() => ph.addMedicine(pharmacy.id, m.id))}
                    onRemove={() => act(() => ph.setQuantity(pharmacy.id, m.id, (cart[m.id] ?? 0) - 1))}
                  />
                )) : (
                  <View style={{ alignItems: 'center', gap: 6, padding: spacing.lg }}>
                    <Icon name="search" size={26} color={colors.textFaint} />
                    <Text style={ui.strong}>لا يوجد دواء بهذا الاسم</Text>
                    <Btn label="مسح البحث" variant="ghost" onPress={() => setQuery('')} />
                  </View>
                )}
              </View>
              <PrescriptionPicker uri={ph.prescriptionUri} onChange={ph.setPrescriptionUri} disabled={editsOff} />
            </>
          ) : (
            <View style={styles.panel}>
              <View style={styles.sectionHead}>
                <Text style={styles.section}>من جدول أدوية سعاد</Text>
                <Text style={[ui.label, { color: colors.primary }]}>{num(selectedSchedule)} من {num(SCHEDULE.length)} محدد</Text>
              </View>
              {SCHEDULE.map(m => (
                <ScheduleRow key={m.id} m={m} qty={cart[m.id] ?? 0} disabled={editsOff}
                  onToggle={() => act(() => ph.toggleMedicine(pharmacy.id, m.id))}
                  onQty={n => act(() => ph.setQuantity(pharmacy.id, m.id, n))} />
              ))}
              <PrescriptionPicker uri={ph.prescriptionUri} onChange={ph.setPrescriptionUri} disabled={editsOff} compact />
            </View>
          )}

          <OrderHistory orders={ph.orders} />
          <Text style={[ui.label, { textAlign: 'center', fontSize: 11.5 }]}>نسخة عرض: الأسعار والتوفر أمثلة، ولا يتم إرسال طلبات أو دفع حقيقي. لا يقدّم وصال نصيحة طبية.</Text>
        </ScrollView>

        <View style={styles.sticky}>
          {rx && summary.count ? <Text style={[ui.label, { textAlign: 'center', marginBottom: 6 }]}>المبلغ للأصناف المحددة فقط؛ سعر أدوية الروشتة بعد مراجعة الصيدلية.</Text> : null}
          <Btn testID="pharmacy-order" label={cta} disabled={!!blockReason || busy} onPress={() => { setOrderError(null); setReview(true); }} />
        </View>
      </KeyboardAvoidingView>

      <ReviewSheet visible={review} onClose={() => !busy && setReview(false)} onConfirm={confirm} busy={busy}
        pharmacyName={pharmacy.name} address={ph.deliveryAddress} items={summary.items} total={summary.total} rx={rx} error={orderError} />
      <ConfirmationSheet order={placed} onClose={() => setPlaced(null)} />
      <Sheet visible={!!info} onClose={() => setInfo(null)} title={info === 'call' ? 'الاتصال غير متاح' : 'الاتجاهات غير متاحة'}>
        <Text style={ui.body}>
          {info === 'call'
            ? 'هذه صيدلية مثال في نسخة العرض، ولا يوجد رقم هاتف موثّق لها، لذلك لن نتصل بأي جهة.'
            : 'عنوان هذه الصيدلية مثال توضيحي غير موثّق، لذلك لا نفتح الخرائط أو نعرض اتجاهات.'}
        </Text>
        <Btn label="حسنًا" onPress={() => setInfo(null)} />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, width: '100%', maxWidth: 520, alignSelf: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  heroTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  crossBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  heroName: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.surface, textAlign: 'right' },
  heroLine: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  heroText: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.surface, textAlign: 'right' },
  heroBtns: { flexDirection: 'row-reverse', gap: spacing.md, marginTop: spacing.sm },
  outlineLight: { minHeight: 48, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.surface, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outlineLightText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.surface },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, minHeight: 52, borderWidth: 1.5, borderColor: 'transparent' },
  searchActive: { borderColor: colors.primary },
  searchInput: { flex: 1, minHeight: 48, fontFamily: fonts.regular, fontSize: 15, color: colors.text, writingDirection: 'rtl' },
  clear: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' },
  panel: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  section: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, textAlign: 'right' },
  sticky: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm, backgroundColor: colors.background, width: '100%', maxWidth: 520, alignSelf: 'center' },
});
