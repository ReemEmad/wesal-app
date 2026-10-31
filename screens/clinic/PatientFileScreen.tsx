import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../components/Avatar';
import { PrimaryButton, RoundButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { DiseasesCard } from '../../components/DiseasesCard';
import { FormIconTile } from '../../components/FormIconTile';
import { MissingPatient } from '../../components/MissingPatient';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionCard } from '../../components/SectionCard';
import { ClinicMedication, DoseMark, Patient, useClinic } from '../../context/ClinicContext';
import { useStartPrescription } from '../../hooks/useStartPrescription';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { percentText } from '../../utils/clinic';
import { isExpired, timesText } from '../../utils/medication';

const DAY_LETTERS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

function doseRows(patient: Patient, med: ClinicMedication): DoseMark[][] {
  const logged = patient.doseLogs[med.id];
  if (logged) return logged;
  const todayIndex = (new Date().getDay() + 1) % 7;
  const rowCount = med.weeklyDay !== undefined ? 1 : med.frequency;
  const row: DoseMark[] = Array.from({ length: 7 }, (_, index) => (index < todayIndex ? 'taken' : 'pending'));
  return Array.from({ length: rowCount }, () => row);
}

function missedText(count: number): string {
  if (count === 0) return 'لم تفتها أي جرعة';
  if (count === 1) return 'فاتتها جرعة واحدة';
  if (count === 2) return 'فاتتها جرعتان';
  return `فاتتها ${toArabicDigits(count)} جرعات`;
}

function Mark({ mark }: { mark: DoseMark }) {
  if (mark === 'taken') {
    return (
      <View style={[styles.mark, styles.markTaken]}>
        <Ionicons name="checkmark" size={20} color={colors.surface} />
      </View>
    );
  }
  if (mark === 'missed') {
    return (
      <View style={[styles.mark, styles.markMissed]}>
        <Ionicons name="close" size={20} color={colors.danger} />
      </View>
    );
  }
  return <View style={[styles.mark, styles.markPending]} />;
}

function MedicationBlock({ patient, med }: { patient: Patient; med: ClinicMedication }) {
  const rows = doseRows(patient, med);
  return (
    <View style={styles.medBlock}>
      <View style={styles.medTitleRow}>
        <Text style={styles.medName}>{med.name}</Text>
        <FormIconTile form={med.form} width={40} height={44} radius={10} />
      </View>

      <View style={styles.medMetaRow}>
        <View style={styles.inUse}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.info} />
          <Text style={styles.inUseText}>قيد الاستخدام</Text>
        </View>
        <View style={styles.medTimes}>
          <Text style={styles.medTimesText}>{timesText(med)}</Text>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
        </View>
      </View>

      <View style={styles.grid}>
        {DAY_LETTERS.map((letter, column) => (
          <View key={letter} style={styles.gridColumn}>
            {rows.map((row, rowIndex) => (
              <Mark key={rowIndex} mark={row[column] ?? 'pending'} />
            ))}
            <Text style={styles.dayLetter}>{letter}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function PatientFileScreen({
  navigation,
  route,
}: NativeStackScreenProps<ClinicStackParamList, 'PatientFile'>) {
  const { getPatient } = useClinic();
  const startPrescription = useStartPrescription();
  const patient = getPatient(route.params.patientId);

  if (!patient) return <MissingPatient onBack={() => navigation.goBack()} />;

  const patientId = patient.id;
  const activeMeds = patient.medications.filter((med) => med.status === 'active' && !isExpired(med));
  const missed = activeMeds.reduce(
    (total, med) =>
      total + doseRows(patient, med).reduce((sum, row) => sum + row.filter((mark) => mark === 'missed').length, 0),
    0
  );

  const newTreatment = () => {
    startPrescription(patient);
    navigation.navigate('MedicationForm');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="ملف المريض"
          subtitle={`رقم الملف ${toArabicDigits(patient.fileNo)}`}
          onBack={() => navigation.goBack()}
          leftAction={
            <RoundButton
              icon="ellipsis-vertical"
              label="المزيد"
              size={52}
              color={colors.text}
              onPress={() => Alert.alert('قريبًا', 'خيارات الملف ستتوفر قريبًا.')}
            />
          }
        />

        <View style={styles.patientCard}>
          <View style={styles.patientRow}>
            <View style={styles.patientTexts}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>
                {toArabicDigits(patient.age)} سنة · {patient.gender === 'female' ? 'أنثى' : 'ذكر'}
              </Text>
              <Text style={styles.patientMeta}>{toArabicDigits(patient.phone)}</Text>
            </View>
            <Avatar name={patient.name} source={patient.avatar} size={80} />
          </View>
          <PrimaryButton label="علاج جديد" onPress={newTreatment} />
        </View>

        <View style={styles.chips}>
          <Chip label="نظرة عامة" selected onPress={() => {}} />
          <Chip label="الأدوية" onPress={() => navigation.navigate('PatientMedications', { patientId })} />
          <Chip label="التاريخ" onPress={() => navigation.navigate('PatientHistory', { patientId })} />
          <Chip label="الأقارب" onPress={() => navigation.navigate('PatientRelatives', { patientId })} />
        </View>

        <DiseasesCard patient={patient} />

        <View style={styles.card}>
          <View style={styles.adherenceHeader}>
            <Text style={styles.adherenceValue}>{percentText(patient.adherence)}</Text>
            <View style={styles.adherenceTitles}>
              <Text style={styles.cardTitle}>الالتزام بالدواء</Text>
              <Text style={styles.muted}>آخر ٧ أيام · {missedText(missed)}</Text>
            </View>
          </View>
          {activeMeds.length === 0 ? <Text style={styles.muted}>لا توجد أدوية نشطة.</Text> : null}
          {activeMeds.map((med) => (
            <MedicationBlock key={med.id} patient={patient} med={med} />
          ))}
        </View>

        <SectionCard title="الأقارب ومقدمو الرعاية">
          {patient.relatives.length === 0 ? <Text style={styles.muted}>لا يوجد أقارب مرتبطون بالملف.</Text> : null}
          {patient.relatives.map((relative) => (
            <PersonRow
              key={relative.id}
              name={relative.name}
              subtitle={`${relative.relation} · ${toArabicDigits(relative.phone)}`}
              avatar={relative.avatar}
              phone={relative.phone}
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
    paddingBottom: spacing.xxl + spacing.lg,
    gap: spacing.lg,
  },
  missing: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  missingText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  patientCard: {
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    gap: spacing.lg,
    ...shadow.soft,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  patientTexts: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  patientName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'right',
  },
  patientMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  muted: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  diseases: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'right',
  },
  card: {
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    gap: spacing.lg,
    ...shadow.soft,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  adherenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adherenceTitles: {
    alignItems: 'flex-end',
    gap: 2,
  },
  adherenceValue: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.primary,
  },
  medBlock: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadow.soft,
  },
  medTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  medName: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  medMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inUse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.infoBg,
  },
  inUseText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.info,
  },
  medTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medTimesText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  gridColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markTaken: {
    backgroundColor: colors.primary,
  },
  markMissed: {
    backgroundColor: colors.tileRose,
  },
  markPending: {
    backgroundColor: colors.divider,
  },
  dayLetter: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
