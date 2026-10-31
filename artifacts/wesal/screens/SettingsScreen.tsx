import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { useAuth } from '../components/auth';
import { Banner, Icon, s as ui } from '../components/pharmacy/PharmacyUI';
import { useSubscriptions } from '../components/SubscriptionsProvider';
import { planMenuLabel } from '../components/subscriptions/planText';
import { colors, fonts, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0, paddingBottom: 0 }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen({ navigation }: Props) {
  const { user, isDemo } = useAuth();
  const { currentPlanId } = useSubscriptions();
  const back = () => (navigation.canGoBack() ? navigation.goBack() : navigation.popTo('Home'));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root} testID="settings-screen">
      <View style={styles.head}>
        <Pressable testID="settings-back" accessibilityRole="button" accessibilityLabel="رجوع" onPress={back} hitSlop={6}
          style={({ pressed }) => [styles.iconBtn, pressed && ui.pressed]}>
          <View style={{ transform: [{ scaleX: -1 }] }}><Icon name="chevron" size={18} /></View>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>الإعدادات</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>الحساب</Text>
        <View style={styles.card}>
          <Row label="الاسم" value={user?.name ?? 'غير متوفر'} />
          <Row label="رقم الجوال" value={user?.phone ?? 'غير متوفر'} />
          <Row label="البريد الإلكتروني" value={user?.email || 'غير مضاف'} />
          <Row label="نوع الحساب" value={isDemo ? 'حساب تجريبي على هذا الجهاز' : 'حساب وصال'} last />
        </View>

        <Text style={styles.section}>التطبيق</Text>
        <View style={styles.card}>
          <Row label="اللغة" value="العربية" />
          <Pressable testID="settings-subscriptions" accessibilityRole="button" accessibilityLabel={`الاشتراك: ${planMenuLabel(currentPlanId)}`}
            onPress={() => navigation.navigate('Subscriptions')} style={({ pressed }) => [styles.link, pressed && ui.pressed]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>الاشتراك</Text>
              <Text style={styles.rowValue}>{planMenuLabel(currentPlanId)}</Text>
            </View>
            <Icon name="chevron" size={16} />
          </Pressable>
        </View>

        <Banner>نسخة عرض: الأدوية والمتابعات والاشتراك التجريبي تُحفظ على هذا الجهاز فقط، ولا تُرسل لأي طبيب أو صيدلية. اللغة العربية هي لغة التطبيق الوحيدة حاليًا.</Banner>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, width: '100%', maxWidth: 520, alignSelf: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  scroll: { padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  section: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textMuted, textAlign: 'right', marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  row: { gap: 2, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: spacing.md },
  rowLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, textAlign: 'right' },
  link: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, minHeight: 44 },
});
