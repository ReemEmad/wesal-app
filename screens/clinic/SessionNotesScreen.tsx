import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusChip } from '../../components/StatusChip';
import { NoteKind, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { formatWhen, NOTE_KIND } from '../../utils/clinic';

type Props = NativeStackScreenProps<ClinicStackParamList, 'SessionNotes'>;
type Filter = 'all' | NoteKind;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'diagnosis', label: 'تشخيص' },
  { key: 'followUp', label: 'للمتابعة' },
  { key: 'relative', label: 'من قريب' },
];

function notesCountText(count: number): string {
  if (count === 0) return 'لا ملاحظات';
  if (count === 1) return 'ملاحظة واحدة';
  if (count === 2) return 'ملاحظتان';
  return `${toArabicDigits(count)} ${count <= 10 ? 'ملاحظات' : 'ملاحظة'}`;
}

export default function SessionNotesScreen({ navigation, route }: Props) {
  const { getAppointment, getPatient, addPatientNote } = useClinic();
  const appointment = getAppointment(route.params.appointmentId);
  const patient = appointment ? getPatient(appointment.patientId) : undefined;

  const [filter, setFilter] = useState<Filter>('all');
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollViewInstance>(null);
  const inputRef = useRef<TextInputInstance>(null);

  if (!patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScreenHeader title="ملاحظات الجلسة" onBack={() => navigation.goBack()} />
          <Text style={styles.empty}>تعذّر العثور على هذا الموعد.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const visible = patient.notes.filter((note) => filter === 'all' || note.kind === filter);

  const focusInput = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
    inputRef.current?.focus();
  };

  const save = () => {
    addPatientNote(patient.id, { kind: filter === 'followUp' ? 'followUp' : 'diagnosis', text });
    setText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="ملاحظات الجلسة"
            subtitle={`${patient.name} · ${notesCountText(patient.notes.length)}`}
            onBack={() => navigation.goBack()}
            leftAction={<RoundButton icon="add" label="ملاحظة جديدة" onPress={focusInput} />}
          />

          <View style={styles.chips}>
            {FILTERS.map((item) => (
              <Chip
                key={item.key}
                label={item.label}
                selected={filter === item.key}
                onPress={() => setFilter(item.key)}
              />
            ))}
          </View>

          {visible.length === 0 ? <Text style={styles.empty}>لا توجد ملاحظات في هذا التصنيف.</Text> : null}

          {visible.map((note) => (
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

          <View style={styles.field}>
            <Text style={styles.label}>ملاحظة جديدة</Text>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="اكتب ملاحظتك..."
              placeholderTextColor={colors.textFaint}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <Footer>
          <PrimaryButton label="حفظ الملاحظة" disabled={text.trim() === ''} onPress={save} />
        </Footer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  input: {
    minHeight: 120,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
});
