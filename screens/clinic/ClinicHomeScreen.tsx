import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { Avatar } from '../../components/Avatar';
import { FigmaIcon } from '../../components/FigmaIcon';
import { PatientCard } from '../../components/PatientCard';
import { SearchField } from '../../components/SearchField';
import { SectionCard } from '../../components/SectionCard';
import { Appointment, CLINIC_ADHERENCE, DOCTOR, Patient, useClinic } from '../../context/ClinicContext';
import { ClinicNavigation } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { formatTime, formatWeekdayDayMonth, isSameDay, percentText } from '../../utils/clinic';

const RING_SIZE = 108;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function AppointmentRow({
  appointment,
  patient,
  onPress,
}: {
  appointment: Appointment;
  patient: Patient;
  onPress: () => void;
}) {
  const [time, period] = formatTime(appointment.startsAt).split(' ');
  return (
    <TouchableOpacity style={styles.appointmentRow} onPress={onPress} accessibilityRole="button" activeOpacity={0.8}>
      <View style={styles.timeTile}>
        <Text style={styles.timeValue}>{time}</Text>
        <Text style={styles.timePeriod}>{period}</Text>
      </View>
      <View style={styles.appointmentIdentity}>
        <View style={styles.appointmentTexts}>
          <Text style={styles.appointmentName}>{patient.name}</Text>
          <Text style={styles.appointmentReason}>{appointment.reason}</Text>
        </View>
        <Avatar name={patient.name} source={patient.avatar} size={52} />
      </View>
    </TouchableOpacity>
  );
}

export default function ClinicHomeScreen() {
  const navigation = useNavigation<ClinicNavigation>();
  const { patients, appointments, getPatient } = useClinic();

  const [now] = useState(() => Date.now());

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((item) => isSameDay(item.startsAt, now) && item.status !== 'cancelled')
        .sort((a, b) => a.startsAt - b.startsAt),
    [appointments, now]
  );

  const featuredPatients = useMemo(
    () =>
      [...patients]
        .sort((a, b) => Number(b.status === 'needsFollowUp') - Number(a.status === 'needsFollowUp'))
        .slice(0, 2),
    [patients]
  );

  const dateLabel = useMemo(() => formatWeekdayDayMonth(now), [now]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.bell} accessibilityRole="button" accessibilityLabel="الإشعارات">
            <FigmaIcon name="icon_bell" size={21} />
            <View style={styles.bellDot} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.headerTexts}>
              <Text style={styles.date}>{dateLabel}</Text>
              <Text style={styles.greeting}>مساء الخير {DOCTOR.name}</Text>
            </View>
            <Avatar name={DOCTOR.name} source={DOCTOR.avatar} size={48} />
          </View>
        </View>

        <SearchField placeholder="ابحث عن مريض أو موعد" onPress={() => navigation.navigate('PatientSearch')} />

        <View style={styles.banner}>
          <Image
            source={require('../../assets/figma/progress-decoration.png')}
            style={styles.bannerDecoration}
            resizeMode="contain"
          />

          <View style={styles.ring}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.cameraAccent}
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.surface}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${RING_CIRCUMFERENCE * (CLINIC_ADHERENCE / 100)} ${RING_CIRCUMFERENCE}`}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <Text style={styles.ringValue}>{percentText(CLINIC_ADHERENCE)}</Text>
            <Text style={styles.ringLabel}>التزام الأدوية</Text>
          </View>

          <Text style={styles.bannerMessage}>اهتمامك يصنع فارقًا</Text>
        </View>

        <SectionCard
          title={`مواعيد اليوم (${toArabicDigits(todayAppointments.length)})`}
          actionLabel="الكل"
          onAction={() => navigation.navigate('ClinicTabs', { screen: 'Appointments' })}
        >
          {todayAppointments.length === 0 ? (
            <Text style={styles.empty}>لا توجد مواعيد اليوم</Text>
          ) : (
            todayAppointments.slice(0, 2).map((appointment) => {
              const patient = getPatient(appointment.patientId);
              if (!patient) return null;
              return (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  patient={patient}
                  onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.id })}
                />
              );
            })
          )}
        </SectionCard>

        <SectionCard
          title={`المرضى (${toArabicDigits(patients.length)})`}
          actionLabel="عرض الكل"
          onAction={() => navigation.navigate('ClinicTabs', { screen: 'Patients' })}
        >
          {featuredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onPress={() => navigation.navigate('PatientFile', { patientId: patient.id })}
            />
          ))}
        </SectionCard>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bell: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.badgeRed,
    borderWidth: 1.3,
    borderColor: colors.badgeRedRing,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTexts: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
    textAlign: 'right',
  },
  greeting: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'right',
  },
  banner: {
    height: 136,
    paddingLeft: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerDecoration: {
    position: 'absolute',
    right: 4,
    top: 30,
    width: 112,
    height: 75,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ringSvg: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringValue: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.surface,
  },
  ringLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.surface,
  },
  bannerMessage: {
    flex: 1,
    paddingRight: 120,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.surface,
    textAlign: 'right',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  timeTile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  timePeriod: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.primary,
  },
  appointmentIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  appointmentTexts: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  appointmentName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  appointmentReason: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
