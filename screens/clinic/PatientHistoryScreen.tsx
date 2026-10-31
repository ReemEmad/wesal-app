import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, RoundButton } from '../../components/Buttons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionCard } from '../../components/SectionCard';
import { StatusChip } from '../../components/StatusChip';
import { Visit, VisitTag, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { BadgeStyle, formatFullDate } from '../../utils/clinic';
import { DiseasesCard } from '../../components/DiseasesCard';
import { MissingPatient } from '../../components/MissingPatient';

const TAG_BADGES: Record<VisitTag, BadgeStyle> = {
  followUp: { label: 'متابعة', background: colors.primaryLight, foreground: colors.primary, icon: 'time-outline' },
  goodResult: {
    label: 'نتيجة جيدة',
    background: colors.infoBg,
    foreground: colors.info,
    icon: 'checkmark-circle-outline',
  },
  prescription: { label: 'وصفة', background: colors.primaryLight, foreground: colors.primary, icon: 'time-outline' },
  urgent: { label: 'عاجل', background: colors.dangerBg, foreground: colors.danger, icon: 'information-circle-outline' },
};

function visitsCountText(count: number): string {
  if (count === 0) return 'لا توجد زيارات مسجّلة';
  if (count === 1) return 'زيارة واحدة مسجّلة';
  if (count === 2) return 'زيارتان مسجّلتان';
  if (count <= 10) return `${toArabicDigits(count)} زيارات مسجّلة`;
  return `${toArabicDigits(count)} زيارة مسجّلة`;
}

function TimelineEntry({ visit, last }: { visit: Visit; last: boolean }) {
  return (
    <View style={styles.entry}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <StatusChip badge={TAG_BADGES[visit.tag]} label={visit.tagLabel} />
          <Text style={styles.title}>{visit.title}</Text>
        </View>
        <Text style={styles.date}>{formatFullDate(visit.date)}</Text>
        <Text style={styles.note}>{visit.note}</Text>
      </View>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {last ? null : <View style={styles.line} />}
      </View>
    </View>
  );
}

export default function PatientHistoryScreen({
  navigation,
  route,
}: NativeStackScreenProps<ClinicStackParamList, 'PatientHistory'>) {
  const { getPatient } = useClinic();
  const patient = getPatient(route.params.patientId);

  if (!patient) return <MissingPatient onBack={() => navigation.goBack()} />;

  const soon = () => Alert.alert('قريبًا', 'هذه الميزة ستتوفر قريبًا.');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="التاريخ المرضي"
          subtitle={`${patient.name} · ${visitsCountText(patient.visits.length)}`}
          onBack={() => navigation.goBack()}
          leftAction={
            <RoundButton icon="document-text-outline" label="تقرير" size={52} color={colors.text} onPress={soon} />
          }
        />

        <PrimaryButton label="إضافة تحديث" onPress={soon} />

        <DiseasesCard patient={patient} />

        <SectionCard title="آخر الزيارات">
          {patient.visits.length === 0 ? <Text style={styles.empty}>لا توجد زيارات مسجّلة بعد.</Text> : null}
          {patient.visits.map((visit, index) => (
            <TimelineEntry key={visit.id} visit={visit} last={index === patient.visits.length - 1} />
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
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    gap: spacing.lg,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: 8,
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'right',
  },
  rail: {
    width: 14,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.primaryLight,
  },
});
