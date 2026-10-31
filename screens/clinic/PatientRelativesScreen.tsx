import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { PersonRow } from '../../components/PersonRow';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionCard } from '../../components/SectionCard';
import { Patient, Relative, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { firstName, formatSince, formatWhen } from '../../utils/clinic';
import { MissingPatient } from '../../components/MissingPatient';

const FEMALE_RELATIONS = ['ابنة', 'حفيدة', 'زوجة', 'أخت', 'أم', 'بنت'];

function linkedText(count: number): string {
  if (count === 0) return 'لا يوجد أقارب مرتبطون بالملف';
  if (count === 1) return 'قريب واحد مرتبط بالملف';
  if (count === 2) return 'قريبان مرتبطان بالملف';
  if (count <= 10) return `${toArabicDigits(count)} أقارب مرتبطين بالملف`;
  return `${toArabicDigits(count)} قريبًا مرتبطين بالملف`;
}

function isFemale(relative?: Relative): boolean {
  return !!relative && FEMALE_RELATIONS.includes(relative.relation);
}

function activityItems(patient: Patient): { id: string; title: string; when: string }[] {
  const items: { id: string; title: string; when: string }[] = [];

  const first = patient.relatives.find((relative) => !relative.pending);
  if (first) {
    const morning = new Date();
    morning.setHours(8, 5, 0, 0);
    items.push({
      id: 'dose',
      title: `${firstName(first.name)} ${isFemale(first) ? 'سجّلت' : 'سجّل'} تناول جرعة الصباح`,
      when: formatWhen(morning.getTime()),
    });
  }

  const note = patient.notes.find((item) => item.kind === 'relative');
  if (note) {
    const author = patient.relatives.find((relative) => note.author.startsWith(relative.name));
    items.push({
      id: note.id,
      title: `${firstName(note.author)} ${isFemale(author) ? 'أضافت' : 'أضاف'} ملاحظة`,
      when: formatWhen(note.at),
    });
  }

  return items;
}

export default function PatientRelativesScreen({
  navigation,
  route,
}: NativeStackScreenProps<ClinicStackParamList, 'PatientRelatives'>) {
  const { getPatient } = useClinic();
  const patient = getPatient(route.params.patientId);

  if (!patient) return <MissingPatient onBack={() => navigation.goBack()} />;

  const name = firstName(patient.name);
  const activity = activityItems(patient);
  const soon = () => Alert.alert('قريبًا', 'دعوة الأقارب ستتوفر قريبًا.');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={`أقارب ${name}`}
          subtitle={linkedText(patient.relatives.length)}
          onBack={() => navigation.goBack()}
          leftAction={<RoundButton icon="person-add-outline" label="دعوة قريب" size={52} color={colors.text} onPress={soon} />}
        />

        <View style={styles.info}>
          <Text style={styles.infoText}>الأقارب يتابعون التزام {name} بالدواء، وتصلك ملاحظاتهم قبل كل زيارة.</Text>
          <Ionicons name="people-outline" size={26} color={colors.primary} />
        </View>

        <SectionCard title="مقدمو الرعاية">
          {patient.relatives.length === 0 ? <Text style={styles.empty}>لا يوجد أقارب مرتبطون بالملف.</Text> : null}
          {patient.relatives.map((relative) => (
            <PersonRow
              key={relative.id}
              name={relative.name}
              subtitle={
                relative.pending && relative.invitedAt
                  ? `${relative.relation} · أُرسلت الدعوة ${formatSince(relative.invitedAt)}`
                  : `${relative.relation} · ${toArabicDigits(relative.phone)}`
              }
              avatar={relative.avatar}
              phone={relative.phone}
            />
          ))}
        </SectionCard>

        <SectionCard title="آخر نشاط">
          {activity.length === 0 ? <Text style={styles.empty}>لا يوجد نشاط حديث.</Text> : null}
          {activity.map((item) => (
            <View key={item.id} style={styles.activity}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityWhen}>{item.when}</Text>
            </View>
          ))}
        </SectionCard>
      </ScrollView>

      <Footer>
        <PrimaryButton label="دعوة قريب جديد" onPress={soon} />
      </Footer>
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
    gap: spacing.lg,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoftBg,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.primary,
    textAlign: 'right',
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  activity: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    gap: 4,
  },
  activityTitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  activityWhen: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
