import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { MainNavigation } from '../components/MainNavigation';
import { usePharmacy } from '../components/PharmacyProvider';
import { Banner, Btn, Icon, Sheet, StatusPill, num, s as ui } from '../components/pharmacy/PharmacyUI';
import { PHARMACIES, normalizeSearch, type Pharmacy } from '../constants/pharmacy';
import { colors, fonts, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Pharmacy'>;

function distance(km: number) {
  return km < 1 ? `${num(Math.round(km * 1000))} م` : `${num(km)} كم`;
}

function PharmacyCard({ p, onPress }: { p: Pharmacy; onPress: () => void }) {
  return (
    <Pressable
      testID={`pharmacy-card-${p.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${p.name}، ${p.isOpen ? 'مفتوحة' : 'مغلقة'}، ${distance(p.distanceKm)}، تقييم ${num(p.rating)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, !p.isOpen && styles.cardClosed, pressed && ui.pressed]}
    >
      <Image source={p.image} style={[styles.thumb, !p.isOpen && { opacity: 0.6 }]} />
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, !p.isOpen && { color: colors.textMuted }]}>{p.name}</Text>
        <View style={styles.meta}>
          <Icon name="pin" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{distance(p.distanceKm)}</Text>
          <Icon name="star" size={14} color="#E0A33A" fill="#E0A33A" />
          <Text style={[styles.metaText, { color: '#B97E1C' }]}>{num(p.rating)}</Text>
          {p.isOpen ? (<><Icon name="clock" size={14} color={colors.textMuted} /><Text style={styles.metaText}>{num(p.deliveryMinutes)} دقيقة</Text></>) : null}
        </View>
        <View style={styles.pills}>
          {p.isOpen
            ? <StatusPill tone="open" label={p.is24Hours ? 'مفتوحة ٢٤ ساعة' : 'مفتوحة الآن'} />
            : <StatusPill tone="closed" label={`مغلقة · ${p.hours}`} />}
          {p.isOpen ? <StatusPill tone="info" label="توصيل" /> : null}
        </View>
      </View>
      <View style={styles.chev}><Icon name="chevron" size={16} /></View>
    </Pressable>
  );
}

export default function PharmacyScreen({ navigation }: Props) {
  const { ready, persistenceError, deliveryAddress, setDeliveryAddress } = usePharmacy();
  const [query, setQuery] = useState('');
  const [openOnly, setOpenOnly] = useState(true);
  const [nearest, setNearest] = useState(false);
  const [only24, setOnly24] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [addrError, setAddrError] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = normalizeSearch(query);
    let r = PHARMACIES.filter(p => !q || normalizeSearch(`${p.name} ${p.address}`).includes(q));
    if (openOnly) r = r.filter(p => p.isOpen);
    if (only24) r = r.filter(p => p.is24Hours);
    if (nearest) r = [...r].sort((a, b) => a.distanceKm - b.distanceKm);
    return r;
  }, [query, openOnly, nearest, only24]);

  const reset = () => { setQuery(''); setOpenOnly(false); setNearest(false); setOnly24(false); };
  const openEditor = () => { setDraft(deliveryAddress); setAddrError(null); setEditing(true); };
  const save = () => {
    try { setDeliveryAddress(draft); setEditing(false); Keyboard.dismiss(); }
    catch (e) { setAddrError(e instanceof Error ? e.message : 'تعذر حفظ العنوان.'); }
  };

  const chip = (id: string, label: string, on: boolean, toggle: () => void, icon?: boolean) => (
    <Pressable testID={id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}
      onPress={toggle} style={[styles.chip, on && styles.chipOn]}>
      {icon ? <Icon name="clock" size={15} color={on ? colors.surface : colors.text} /> : null}
      <Text style={[styles.chipText, on && { color: colors.surface }]}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.root} testID="pharmacy-list">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={styles.title}>الصيدليات القريبة</Text>
            <Text style={styles.sub}>اطلب أدوية سعاد من أقرب صيدلية</Text>
          </View>
          <View style={styles.bell} accessibilityElementsHidden importantForAccessibility="no"><Icon name="bell" size={20} /></View>
        </View>

        <View style={styles.address}>
          <View style={styles.pinCircle}><Icon name="pin" size={20} color={colors.surface} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addrLabel}>التوصيل إلى</Text>
            <Text style={styles.addrText} numberOfLines={2}>{ready ? deliveryAddress : 'جارٍ التحميل…'}</Text>
          </View>
          <Pressable testID="pharmacy-address-change" accessibilityRole="button" accessibilityLabel="تغيير عنوان التوصيل"
            disabled={!ready} onPress={openEditor} style={[styles.change, !ready && ui.disabled]}>
            <Text style={styles.changeText}>تغيير</Text>
          </Pressable>
        </View>

        {persistenceError ? <Banner tone="warning">{persistenceError}</Banner> : null}

        <View style={styles.search}>
          <Icon name="search" size={20} />
          <TextInput testID="pharmacy-search" value={query} onChangeText={setQuery} placeholder="ابحث باسم الصيدلية أو المنطقة"
            placeholderTextColor={colors.textFaint} accessibilityLabel="ابحث باسم الصيدلية أو المنطقة" returnKeyType="search"
            style={styles.searchInput} textAlign="right" />
          {query ? <Pressable accessibilityRole="button" accessibilityLabel="مسح البحث" onPress={() => setQuery('')} hitSlop={8}><Icon name="close" size={18} color={colors.textMuted} /></Pressable> : null}
        </View>

        <View style={styles.chips}>
          {chip('pharmacy-open-filter', 'مفتوحة الآن', openOnly, () => setOpenOnly(v => !v), true)}
          {chip('pharmacy-nearest-filter', 'الأقرب', nearest, () => setNearest(v => !v))}
          {chip('pharmacy-24h-filter', '٢٤ ساعة', only24, () => setOnly24(v => !v))}
        </View>

        <Text style={styles.count} accessibilityLiveRegion="polite">
          {list.length ? `${num(list.length)} ${list.length === 1 ? 'صيدلية قريبة' : list.length === 2 ? 'صيدليتان قريبتان' : 'صيدليات قريبة'} منك` : 'لا نتائج'}
        </Text>

        {list.map(p => <PharmacyCard key={p.id} p={p} onPress={() => navigation.navigate('PharmacyDetail', { pharmacyId: p.id })} />)}

        {!list.length ? (
          <View style={styles.empty}>
            <Icon name="search" size={30} color={colors.textFaint} />
            <Text style={ui.strong}>لا توجد صيدلية تطابق البحث</Text>
            <Text style={[ui.label, { textAlign: 'center' }]}>جرّب اسمًا آخر أو أزل بعض الفلاتر.</Text>
            <Btn label="إعادة ضبط البحث والفلاتر" variant="outline" onPress={reset} />
          </View>
        ) : null}

        <Banner>نسخة عرض: الصيدليات والأسعار والتوفر أمثلة توضيحية، وليست صيدليات حقيقية متصلة. لا يتم إرسال أي طلب أو دفع.</Banner>
      </ScrollView>
      <MainNavigation active="pharmacy" onHome={() => navigation.popTo('Home')} onPharmacy={() => undefined}
        onMedications={() => navigation.popTo('Medications')} onClinics={() => navigation.popTo('Clinics')} />

      <Sheet visible={editing} onClose={() => setEditing(false)} title="عنوان التوصيل">
        <TextInput testID="pharmacy-address-input" value={draft} onChangeText={t => { setDraft(t); setAddrError(null); }}
          accessibilityLabel="عنوان التوصيل" autoFocus maxLength={200} multiline placeholder="مثال: المنزل - شارع النيل، القاهرة"
          placeholderTextColor={colors.textFaint} style={[styles.addrInput, !!addrError && { borderColor: colors.danger }]} textAlign="right" />
        {addrError ? <Text accessibilityRole="alert" style={[ui.label, { color: colors.danger }]}>{addrError}</Text> : null}
        <Text style={ui.label}>يُحفظ العنوان على هذا الجهاز فقط لتجربة العرض.</Text>
        <Btn testID="pharmacy-address-save" label="حفظ العنوان" onPress={save} />
        <Btn testID="pharmacy-address-cancel" label="إلغاء" variant="ghost" onPress={() => setEditing(false)} />
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  title: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.text, textAlign: 'right' },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  address: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, overflow: 'hidden' },
  pinCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  addrLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryLight, textAlign: 'right' },
  addrText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.surface, textAlign: 'right' },
  change: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7, minHeight: 36, justifyContent: 'center' },
  changeText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, minHeight: 52 },
  searchInput: { flex: 1, minHeight: 48, fontFamily: fonts.regular, fontSize: 15, color: colors.text, writingDirection: 'rtl' },
  chips: { flexDirection: 'row-reverse', gap: spacing.sm, flexWrap: 'wrap' },
  chip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 16, minHeight: 40, borderRadius: radius.pill, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text },
  count: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, textAlign: 'right', marginTop: spacing.xs },
  card: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadow.soft },
  cardClosed: { backgroundColor: '#FAF7F2', shadowOpacity: 0, elevation: 0 },
  thumb: { width: 52, height: 52, borderRadius: 12 },
  cardBody: { flex: 1, gap: 6 },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, textAlign: 'right' },
  meta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  metaText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, marginLeft: 6 },
  pills: { flexDirection: 'row-reverse', gap: spacing.sm, flexWrap: 'wrap' },
  chev: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg },
  addrInput: { minHeight: 80, borderRadius: radius.md, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.inputBg, padding: spacing.md, fontFamily: fonts.regular, fontSize: 15, color: colors.text, writingDirection: 'rtl', textAlignVertical: 'top' },
});
