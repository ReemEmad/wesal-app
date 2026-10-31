import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, OutlineButton, RoundButton } from '../../components/Buttons';
import { FormIconTile } from '../../components/FormIconTile';
import { MedicationStatusBadge } from '../../components/MedicationStatusBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useMedications } from '../../context/MedicationsContext';
import { MedicationsStackParamList, RootNavigation } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import {
  durationText,
  isStockLow,
  nextDose,
  scheduleSummary,
  stockDays,
  stockText,
  timesText,
  timingText,
} from '../../utils/medication';
import { toArabicDigits } from '../../utils/arabic';

export default function MedicationDetailsScreen({
  navigation,
  route,
}: NativeStackScreenProps<MedicationsStackParamList, 'MedicationDetails'>) {
  const rootNavigation = useNavigation<RootNavigation>();
  const { getMedication, startEditing, removeMedication, togglePause } = useMedications();
  const med = getMedication(route.params.id);

  if (!med) return null;

  const upcoming = nextDose(med);
  const badge = med.status === 'paused' ? 'paused' : isStockLow(med) ? 'low' : 'active';

  const confirmDelete = () => {
    Alert.alert('حذف الدواء', `هل تريد حذف ${med.name}؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          navigation.goBack();
          removeMedication(med.id);
        },
      },
    ]);
  };

  const edit = () => {
    startEditing(med.id);
    rootNavigation.navigate('MedicationForm');
  };

  const rows = [
    { label: 'المواعيد', value: timesText(med) },
    { label: 'المدة', value: durationText(med.duration) },
    { label: 'المخزون', value: `${stockText(med)} · يكفي ${toArabicDigits(stockDays(med))} يومًا` },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="تفاصيل الدواء"
          subtitle="أدوية سعاد"
          onBack={() => navigation.goBack()}
          leftAction={<RoundButton icon="create-outline" label="تعديل" onPress={edit} color={colors.text} />}
        />

        <View style={styles.card}>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{med.name}</Text>
            <Text style={styles.dosage}>{scheduleSummary(med)}</Text>
            <MedicationStatusBadge kind={badge} />
          </View>
          <FormIconTile form={med.form} width={88} height={92} radius={22} />
        </View>

        <View style={styles.nextDose}>
          <Text style={styles.nextLabel}>الجرعة القادمة</Text>
          {upcoming ? (
            <>
              <Text style={styles.nextValue}>
                {upcoming.dayLabel} {upcoming.time}
              </Text>
              <Text style={styles.nextHint}>
                {timingText(med)} · {upcoming.relative}
              </Text>
            </>
          ) : (
            <Text style={styles.nextValue}>متوقف مؤقتًا</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.infoRow, index > 0 && styles.infoRowDivider]}>
              <Text style={styles.infoValue}>{row.value}</Text>
              <Text style={styles.infoLabel}>{row.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Footer>
        <OutlineButton
          label={med.status === 'active' ? 'إيقاف الدواء مؤقتًا' : 'استئناف الدواء'}
          onPress={() => togglePause(med.id)}
        />
        <OutlineButton label="حذف الدواء" onPress={confirmDelete} textColor={colors.deleteText} />
      </Footer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cardInfo: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  dosage: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  nextDose: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
    gap: spacing.xs,
    alignItems: 'flex-end',
  },
  nextLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  nextValue: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    color: colors.surface,
    textAlign: 'right',
  },
  nextHint: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },
  infoCard: {
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  infoRowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
});
