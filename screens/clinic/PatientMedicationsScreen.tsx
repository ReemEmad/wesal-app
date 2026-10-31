import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdherenceBar } from '../../components/AdherenceBar';
import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusChip } from '../../components/StatusChip';
import { ClinicMedication, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { BadgeStyle, firstName, percentText } from '../../utils/clinic';
import { doseText, frequencyText, isExpired, timesText, timingText } from '../../utils/medication';
import { MissingPatient } from '../../components/MissingPatient';
import { useStartPrescription } from '../../hooks/useStartPrescription';

type FilterKey = 'all' | 'active' | 'expired';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشطة' },
  { key: 'expired', label: 'منتهية' },
];

const LOW_ADHERENCE = 80;

const BADGES: Record<'inUse' | 'low' | 'ended', BadgeStyle> = {
  inUse: { label: 'قيد الاستخدام', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  low: { label: 'التزام منخفض', background: colors.stockLowBg, foreground: colors.stockLow, icon: 'time-outline' },
  ended: { label: 'منتهي', background: colors.dangerBg, foreground: colors.danger, icon: 'information-circle-outline' },
};

function isActive(med: ClinicMedication): boolean {
  return med.status === 'active' && !isExpired(med);
}

function badgeFor(med: ClinicMedication): BadgeStyle {
  if (isExpired(med)) return BADGES.ended;
  return med.adherence < LOW_ADHERENCE ? BADGES.low : BADGES.inUse;
}

function activeCountText(count: number): string {
  if (count === 0) return 'لا توجد أدوية نشطة';
  if (count === 1) return 'دواء نشط واحد';
  if (count === 2) return 'دواءان نشطان';
  if (count <= 10) return `${toArabicDigits(count)} أدوية نشطة`;
  return `${toArabicDigits(count)} دواءً نشطًا`;
}

export default function PatientMedicationsScreen({
  navigation,
  route,
}: NativeStackScreenProps<ClinicStackParamList, 'PatientMedications'>) {
  const { getPatient } = useClinic();
  const startPrescription = useStartPrescription();
  const patient = getPatient(route.params.patientId);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const medications = useMemo(() => patient?.medications ?? [], [patient]);
  const active = useMemo(() => medications.filter(isActive), [medications]);
  const visible = useMemo(
    () =>
      medications.filter((med) => {
        if (filter === 'active' && !isActive(med)) return false;
        if (filter === 'expired' && !isExpired(med)) return false;
        return query.trim() === '' || med.name.includes(query.trim());
      }),
    [medications, filter, query]
  );

  if (!patient) return <MissingPatient onBack={() => navigation.goBack()} />;

  const average = active.length ? active.reduce((sum, med) => sum + med.adherence, 0) / active.length : 0;

  const newPrescription = () => {
    startPrescription(patient);
    navigation.navigate('MedicationForm');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ScreenHeader
          title={`أدوية ${firstName(patient.name)}`}
          subtitle={`${activeCountText(active.length)} · الالتزام ${percentText(average)}`}
          onBack={() => navigation.goBack()}
          leftAction={
            <RoundButton
              icon={searching ? 'close' : 'search'}
              label="بحث"
              size={52}
              color={colors.text}
              onPress={() => {
                setSearching((value) => !value);
                setQuery('');
              }}
            />
          }
        />
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
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? <Text style={styles.empty}>لا توجد أدوية في هذه القائمة</Text> : null}
        {visible.map((med) => {
          const lowOrEnded = isExpired(med) || med.adherence < LOW_ADHERENCE;
          return (
            <View key={med.id} style={styles.card}>
              <View style={styles.topRow}>
                <StatusChip badge={badgeFor(med)} />
                <View style={styles.titleBlock}>
                  <View style={styles.texts}>
                    <Text style={styles.name}>{med.name}</Text>
                    <Text style={styles.dose}>
                      {doseText(med)} {timingText(med)} · {frequencyText(med)}
                    </Text>
                  </View>
                  <View style={styles.tile}>
                    <MaterialCommunityIcons name="pill" size={24} color={colors.primary} />
                  </View>
                </View>
              </View>
              <View style={styles.bottomRow}>
                <AdherenceBar
                  value={med.adherence}
                  width={90}
                  color={lowOrEnded && !isExpired(med) ? colors.adherenceLow : colors.primary}
                />
                <View style={styles.times}>
                  <Text style={styles.timesText}>{timesText(med)}</Text>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Footer>
        <PrimaryButton label="وصفة جديدة" onPress={newPrescription} />
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  search: {
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
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  texts: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  dose: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timesText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
