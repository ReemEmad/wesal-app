import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { FormIconTile } from '../../components/FormIconTile';
import { MedicationBadgeKind, MedicationStatusBadge } from '../../components/MedicationStatusBadge';
import { Medication, useMedications } from '../../context/MedicationsContext';
import { MedicationsStackParamList, RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { hasDoseToday, isExpired, isStockLow, scheduleSummary, stockDays, timesText } from '../../utils/medication';

type FilterKey = 'all' | 'today' | 'soon' | 'expired';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'today', label: 'اليوم' },
  { key: 'soon', label: 'تنتهي قريبًا' },
  { key: 'expired', label: 'منتهية' },
];

function matchesFilter(med: Medication, filter: FilterKey): boolean {
  switch (filter) {
    case 'today':
      return hasDoseToday(med);
    case 'soon':
      return med.status === 'active' && (isStockLow(med) || stockDays(med) <= 7);
    case 'expired':
      return isExpired(med);
    default:
      return true;
  }
}

function activeCountText(count: number): string {
  if (count === 0) return 'لا توجد أدوية نشطة';
  if (count === 1) return 'دواء نشط واحد';
  if (count === 2) return 'دواءان نشطان';
  if (count <= 10) return `${toArabicDigits(count)} أدوية نشطة`;
  return `${toArabicDigits(count)} دواءً نشطًا`;
}

function badgeKind(med: Medication): MedicationBadgeKind {
  if (med.status === 'paused') return 'paused';
  return isStockLow(med) ? 'low' : 'active';
}

export default function MedicationsListScreen({
  navigation,
}: NativeStackScreenProps<MedicationsStackParamList, 'MedicationsList'>) {
  const rootNavigation = useNavigation<RootNavigation>();
  const { medications } = useMedications();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const visible = useMemo(
    () =>
      medications.filter(
        (med) => matchesFilter(med, filter) && (query.trim() === '' || med.name.includes(query.trim()))
      ),
    [medications, filter, query]
  );

  const activeCount = medications.filter((med) => med.status === 'active').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.header}>
        <RoundButton
          icon={searching ? 'close' : 'search'}
          label="بحث"
          color={colors.text}
          onPress={() => {
            setSearching((value) => !value);
            setQuery('');
          }}
        />
        <View style={styles.titles}>
          <Text style={styles.title}>الأدوية</Text>
          <Text style={styles.subtitle}>أدوية سعاد · {activeCountText(activeCount)}</Text>
        </View>
      </View>

      {searching ? (
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث عن دواء"
          placeholderTextColor={colors.textFaint}
          textAlign="right"
          autoFocus
        />
      ) : null}

      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Chip key={item.key} label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? <Text style={styles.empty}>لا توجد أدوية في هذه القائمة</Text> : null}
        {visible.map((med) => (
          <TouchableOpacity
            key={med.id}
            style={styles.card}
            onPress={() => navigation.navigate('MedicationDetails', { id: med.id })}
            accessibilityRole="button"
          >
            <View style={styles.info}>
              <Text style={styles.name}>{med.name}</Text>
              <Text style={styles.dosage}>{scheduleSummary(med)}</Text>
              <View style={styles.meta}>
                <MedicationStatusBadge kind={badgeKind(med)} />
                <View style={styles.time}>
                  <Text style={styles.timeText}>{timesText(med)}</Text>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                </View>
              </View>
            </View>
            <FormIconTile form={med.form} width={40} height={44} radius={10} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Footer>
        <PrimaryButton label="إضافة دواء" onPress={() => rootNavigation.navigate('AddMethod')} />
      </Footer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titles: {
    alignItems: 'flex-end',
    gap: 2,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  search: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  filters: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  dosage: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
