import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, OutlineButton, PrimaryButton } from '../../components/Buttons';
import { useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { firstName, formatDayMonth, formatTime } from '../../utils/clinic';

type Props = NativeStackScreenProps<ClinicStackParamList, 'SessionSaved'>;

function notesCountText(count: number): string {
  if (count === 0) return 'لا ملاحظات';
  if (count === 1) return 'ملاحظة واحدة';
  if (count === 2) return 'ملاحظتان';
  return `${toArabicDigits(count)} ${count <= 10 ? 'ملاحظات' : 'ملاحظة'}`;
}

export default function SessionSavedScreen({ navigation, route }: Props) {
  const { summary, getAppointment, getPatient } = useClinic();

  const appointment = getAppointment(route.params.appointmentId);
  const patientId = summary?.patientId ?? appointment?.patientId;
  const patient = patientId ? getPatient(patientId) : undefined;
  const name = summary?.patientName ?? patient?.name;

  const relatives = patient?.gender === 'male' ? 'لأقاربه' : 'لأقاربها';
  const hasPrescription = (summary?.prescriptions.length ?? 0) > 0;
  const body = name
    ? `${hasPrescription ? 'أضيفت الملاحظات والوصفة' : 'أضيفت الملاحظات'} إلى ملف ${firstName(name)}، وسيصل التحديث ${relatives}.`
    : 'تم حفظ الجلسة وإضافة التحديثات إلى الملف.';

  const rows: { label: string; value: string }[] = [];
  if (summary) {
    rows.push({ label: 'الملاحظات', value: notesCountText(summary.notesCount) });
    if (hasPrescription) rows.push({ label: 'وصفة جديدة', value: summary.prescriptions.join('، ') });
    if (summary.nextAppointmentAt) {
      rows.push({
        label: 'الموعد القادم',
        value: `${formatDayMonth(summary.nextAppointmentAt)} · ${formatTime(summary.nextAppointmentAt)}`,
      });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/illustrations/success-session.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.title}>تم حفظ الجلسة</Text>
        <Text style={styles.body}>{body}</Text>

        {rows.length > 0 ? (
          <View style={styles.card}>
            {rows.map((row, index) => (
              <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
                <Text style={styles.value}>{row.value}</Text>
                <Text style={styles.label}>{row.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Footer>
        <PrimaryButton
          label="العودة إلى المواعيد"
          onPress={() => navigation.navigate('ClinicTabs', { screen: 'Appointments' })}
        />
        {patientId ? (
          <OutlineButton
            label="عرض ملف المريض"
            onPress={() => navigation.navigate('PatientFile', { patientId })}
          />
        ) : null}
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
    width: 280,
    height: 280,
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
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  value: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
});
