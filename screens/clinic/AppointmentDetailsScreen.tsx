import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdherenceBar } from '../../components/AdherenceBar';
import { Avatar } from '../../components/Avatar';
import { Footer, OutlineButton, PrimaryButton, RoundButton } from '../../components/Buttons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusChip } from '../../components/StatusChip';
import { useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import {
  adherenceColor,
  formatTime,
  formatWeekdayDayMonth,
  formatWhen,
  NOTE_KIND,
  PATIENT_STATUS,
  relativesLabel,
} from '../../utils/clinic';

type Props = NativeStackScreenProps<ClinicStackParamList, 'AppointmentDetails'>;

export default function AppointmentDetailsScreen({ navigation, route }: Props) {
  const { getAppointment, getPatient, session, startSession, rescheduleAppointment, addAppointmentNote } =
    useClinic();
  const appointment = getAppointment(route.params.appointmentId);
  const patient = appointment ? getPatient(appointment.patientId) : undefined;

  const [adding, setAdding] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [iosDraft, setIosDraft] = useState<Date | null>(null);

  if (!appointment || !patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScreenHeader title="تفاصيل الموعد" onBack={() => navigation.goBack()} />
          <Text style={styles.empty}>تعذّر العثور على هذا الموعد.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const closed = appointment.status === 'completed' || appointment.status === 'cancelled';
  const sessionActive = session?.appointmentId === appointment.id;

  const startOrResume = () => {
    if (!sessionActive) startSession(appointment.id);
    navigation.navigate('Session', { appointmentId: appointment.id });
  };

  const saveNote = () => {
    addAppointmentNote(appointment.id, noteText);
    setNoteText('');
    setAdding(false);
  };

  const reschedule = () => {
    if (Platform.OS === 'ios') {
      if (iosDraft) {
        rescheduleAppointment(appointment.id, iosDraft.getTime());
        setIosDraft(null);
      } else {
        setIosDraft(new Date(appointment.startsAt));
      }
      return;
    }
    const current = new Date(appointment.startsAt);
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      onValueChange: (_event, pickedDate) => {
        if (!pickedDate) return;
        DateTimePickerAndroid.open({
          value: pickedDate,
          mode: 'time',
          onValueChange: (_timeEvent, pickedTime) => {
            if (!pickedTime) return;
            const next = new Date(pickedDate);
            next.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            rescheduleAppointment(appointment.id, next.getTime());
          },
        });
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="تفاصيل الموعد"
          subtitle={`${formatWeekdayDayMonth(appointment.startsAt)} · ${formatTime(appointment.startsAt)}`}
          onBack={() => navigation.goBack()}
          leftAction={
            <RoundButton
              icon="ellipsis-vertical"
              label="المزيد"
              onPress={() => Alert.alert('قريبًا', 'خيارات الموعد ستتوفر قريبًا.')}
            />
          }
        />

        <TouchableOpacity
          style={styles.patientCard}
          onPress={() => navigation.navigate('PatientFile', { patientId: patient.id })}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          <View style={styles.patientTop}>
            <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
            <View style={styles.identity}>
              <View style={styles.identityTexts}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientMeta}>
                  {toArabicDigits(patient.age)} سنة · ملف {toArabicDigits(patient.fileNo)}
                </Text>
              </View>
              <Avatar name={patient.name} source={patient.avatar} size={56} />
            </View>
          </View>
          <Text style={styles.summary}>{patient.summary}</Text>
          <View style={styles.patientBottom}>
            <StatusChip badge={PATIENT_STATUS[patient.status]} />
            <View style={styles.relatives}>
              <Text style={styles.relativesLabel}>{relativesLabel(patient.relatives.length)}</Text>
              <Ionicons name="people-outline" size={20} color={colors.textMuted} />
            </View>
            <AdherenceBar value={patient.adherence} color={adherenceColor(patient)} width={80} />
          </View>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <View style={styles.infoTexts}>
            <Text style={styles.infoLabel}>نوع الزيارة</Text>
            <Text style={styles.infoValue}>{appointment.visitType}</Text>
          </View>
          <View style={styles.iconTile}>
            <MaterialCommunityIcons name="stethoscope" size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoTexts}>
            <Text style={styles.infoLabel}>المدة المتوقعة</Text>
            <Text style={styles.infoValue}>{toArabicDigits(appointment.durationMin)} دقيقة</Text>
          </View>
          <View style={styles.iconTile}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setAdding((value) => !value)} accessibilityRole="button">
            <Text style={styles.link}>{adding ? 'إلغاء' : 'إضافة ملاحظة'}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>ملاحظات الموعد</Text>
        </View>

        {adding ? (
          <View style={styles.addNote}>
            <TextInput
              style={styles.noteInput}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="اكتب ملاحظتك..."
              placeholderTextColor={colors.textFaint}
              multiline
              textAlign="right"
              textAlignVertical="top"
              autoFocus
            />
            <PrimaryButton label="حفظ الملاحظة" disabled={noteText.trim() === ''} onPress={saveNote} />
          </View>
        ) : null}

        {appointment.notes.length === 0 && !adding ? (
          <Text style={styles.empty}>لا توجد ملاحظات لهذا الموعد.</Text>
        ) : null}

        {appointment.notes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteTop}>
              <StatusChip badge={NOTE_KIND[note.kind]} />
              <View style={styles.noteTexts}>
                <Text style={styles.noteAuthor}>{note.author}</Text>
                <Text style={styles.noteWhen}>{formatWhen(note.at)}</Text>
              </View>
            </View>
            <Text style={styles.noteBody}>{note.text}</Text>
          </View>
        ))}

        {iosDraft ? (
          <DateTimePicker
            value={iosDraft}
            mode="datetime"
            display="inline"
            locale="ar"
            onValueChange={(_event, picked) => setIosDraft(picked)}
          />
        ) : null}
      </ScrollView>

      <Footer>
        <PrimaryButton
          label={sessionActive ? 'متابعة الجلسة' : 'بدء الجلسة'}
          disabled={closed}
          onPress={startOrResume}
        />
        <OutlineButton
          label={iosDraft ? 'تأكيد الموعد الجديد' : 'إعادة جدولة'}
          disabled={closed}
          onPress={reschedule}
        />
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
  empty: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  patientCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadow.soft,
  },
  patientTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  identityTexts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  patientName: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  patientMeta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  summary: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'right',
  },
  patientBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  relatives: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relativesLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  infoTexts: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  addNote: {
    gap: spacing.md,
  },
  noteInput: {
    minHeight: 96,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  noteCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  noteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTexts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  noteAuthor: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  noteWhen: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  noteBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'right',
  },
});
