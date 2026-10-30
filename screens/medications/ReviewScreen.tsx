import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { OutlineButton, PrimaryButton } from '../../components/Buttons';
import { WizardScreen } from '../../components/WizardScreen';
import { useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { doseText, durationText, stockText, timesText, timingText } from '../../utils/medication';

export default function ReviewScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Review'>) {
  const { draft, saveDraft } = useMedications();

  const rows = [
    { label: 'اسم الدواء', value: draft.name },
    { label: 'الجرعة', value: doseText(draft) },
    { label: 'المواعيد', value: timesText(draft) },
    { label: 'مع الأكل', value: timingText(draft) },
    { label: 'المدة', value: durationText(draft.duration) },
    { label: 'المخزون', value: stockText(draft) },
  ];

  const save = () => {
    const id = saveDraft();
    navigation.navigate('Added', { id });
  };

  return (
    <WizardScreen
      title="مراجعة وتأكيد"
      subtitle="الخطوة ٤ من ٤"
      step={4}
      onBack={() => navigation.goBack()}
      footer={
        <>
          <PrimaryButton label="حفظ الدواء" onPress={save} />
          <OutlineButton label="تعديل البيانات" onPress={() => navigation.popTo('MedicationForm')} />
        </>
      }
    >
      <View style={styles.card}>
        {rows.map((row, index) => (
          <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
            <Text style={styles.value}>{row.value}</Text>
            <Text style={styles.label}>{row.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>سنرسل تذكيرًا لسعاد في موعد كل جرعة، وننبّهك إذا لم تُسجَّل الجرعة.</Text>
        <Ionicons name="information-circle-outline" size={24} color={colors.info} />
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 20,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textMuted,
  },
  value: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.infoBg,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.info,
    textAlign: 'right',
  },
});
