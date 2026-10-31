import { Ionicons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, OutlineButton, PrimaryButton } from '../../components/Buttons';
import { useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { firstName } from '../../utils/clinic';
import { nextDose, timingText } from '../../utils/medication';

// Form, DoseSchedule, DurationStock, Review and this screen.
const WIZARD_DEPTH = 5;

export default function MedicationAddedScreen({
  navigation,
  route,
}: NativeStackScreenProps<ClinicStackParamList, 'MedicationAdded'>) {
  const { patientId, medicationId } = route.params;
  const { getPatient } = useClinic();
  const patient = getPatient(patientId);
  const med = patient?.medications.find((item) => item.id === medicationId);
  const upcoming = med ? nextDose(med) : null;
  const owner = patient ? firstName(patient.name) : 'المريض';

  const back = () => navigation.dispatch(StackActions.pop(WIZARD_DEPTH));

  const viewMedications = () => {
    back();
    navigation.navigate('PatientMedications', { patientId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/illustrations/success-medication.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.title}>تمت إضافة الدواء</Text>
        <Text style={styles.body}>
          أضفنا {med?.name ?? 'الدواء'} إلى أدوية {owner}، وسنذكّره بكل جرعة في موعدها.
        </Text>

        {med && upcoming ? (
          <View style={styles.card}>
            <View style={styles.cardTexts}>
              <Text style={styles.cardLabel}>الجرعة القادمة</Text>
              <Text style={styles.cardValue}>
                {upcoming.dayLabel} {upcoming.time} · {timingText(med)}
              </Text>
            </View>
            <Ionicons name="time-outline" size={26} color={colors.primary} />
          </View>
        ) : null}
      </View>

      <Footer>
        <PrimaryButton label="عرض الدواء" onPress={viewMedications} />
        <OutlineButton label="رجوع" onPress={back} />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  illustration: {
    width: 260,
    height: 260,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  cardValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
});
