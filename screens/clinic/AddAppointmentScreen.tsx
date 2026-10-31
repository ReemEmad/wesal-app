import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton } from '../../components/Buttons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { normalizeSearch, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { formatFullDate, formatTime, startOfDay } from '../../utils/clinic';

type Props = NativeStackScreenProps<ClinicStackParamList, 'AddAppointment'>;

const DEFAULT_HOUR = 9;

export default function AddAppointmentScreen({ navigation, route }: Props) {
  const { patients, getPatient, addAppointment } = useClinic();

  const [title, setTitle] = useState('');
  const [patientId, setPatientId] = useState<string | null>(route.params?.patientId ?? null);
  const [query, setQuery] = useState('');
  const [nameText, setNameText] = useState(
    () => (route.params?.patientId ? getPatient(route.params.patientId)?.name : undefined) ?? ''
  );
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [iosPicker, setIosPicker] = useState<'date' | 'time' | null>(null);

  const patient = patientId ? getPatient(patientId) : undefined;
  const needle = normalizeSearch(query) || (patient ? '' : normalizeSearch(nameText));
  const matches = needle ? patients.filter((item) => normalizeSearch(item.name).includes(needle)) : [];

  const changeName = (text: string) => {
    setNameText(text);
    if (patient && text !== patient.name) setPatientId(null);
  };

  const selectPatient = (id: string, name: string) => {
    setPatientId(id);
    setNameText(name);
    setQuery('');
  };

  const openPicker = (mode: 'date' | 'time') => {
    const current = (mode === 'date' ? date : time) ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode,
        is24Hour: false,
        onValueChange: (_event, picked) => {
          if (!picked) return;
          if (mode === 'date') setDate(picked);
          else setTime(picked);
        },
      });
    } else {
      setIosPicker((value) => (value === mode ? null : mode));
    }
  };

  const startsAt = () => {
    const base = new Date(startOfDay((date ?? new Date()).getTime()));
    if (time) base.setHours(time.getHours(), time.getMinutes(), 0, 0);
    else base.setHours(DEFAULT_HOUR, 0, 0, 0);
    return base.getTime();
  };

  const canSubmit = title.trim() !== '' && !!patient && !!date;

  const confirm = () => {
    if (!patient || !canSubmit) return;
    const when = startsAt();
    addAppointment({ patientId: patient.id, title, notes, startsAt: when });
    navigation.navigate('ClinicTabs', { screen: 'Appointments', params: { focusDate: when } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="إضافة موعد" onBack={() => navigation.goBack()} />

          <View style={styles.field}>
            <Text style={styles.label}>اسم الموعد</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: كشف على القلب"
              placeholderTextColor={colors.textFaint}
              textAlign="right"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>اسم المريض</Text>
            <View style={styles.patientRow}>
              <View style={[styles.input, styles.searchBox]}>
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="ابحث بالاسم"
                  placeholderTextColor={colors.textFaint}
                  textAlign="right"
                />
              </View>
              <TextInput
                style={[styles.input, styles.selectedBox]}
                value={nameText}
                onChangeText={changeName}
                placeholder="اسم المريض"
                placeholderTextColor={colors.textFaint}
                textAlign="right"
              />
            </View>
            {matches.length > 0 ? (
              <View style={styles.results}>
                {matches.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.result}
                    onPress={() => selectPatient(item.id, item.name)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.resultText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ملاحظات</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="أضف ملاحظات للموعد (اختياري)"
              placeholderTextColor={colors.textFaint}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>الموعد</Text>
            <TouchableOpacity style={styles.input} onPress={() => openPicker('date')} accessibilityRole="button">
              <Ionicons name="calendar-outline" size={22} color={colors.textMuted} />
              <Text style={[styles.inputText, !date && styles.placeholder]}>
                {date ? formatFullDate(date.getTime()) : 'يوم / شهر / سنة'}
              </Text>
            </TouchableOpacity>
            {iosPicker === 'date' ? (
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                display="inline"
                locale="ar"
                onValueChange={(_event, picked) => setDate(picked)}
              />
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>الوقت</Text>
            <TouchableOpacity style={styles.input} onPress={() => openPicker('time')} accessibilityRole="button">
              <Ionicons name="time-outline" size={22} color={colors.textMuted} />
              <Text style={[styles.inputText, !time && styles.placeholder]}>
                {time ? formatTime(time.getTime()) : '--:--'}
              </Text>
            </TouchableOpacity>
            {iosPicker === 'time' ? (
              <DateTimePicker
                value={time ?? new Date()}
                mode="time"
                display="spinner"
                locale="ar"
                onValueChange={(_event, picked) => setTime(picked)}
              />
            ) : null}
          </View>
        </ScrollView>

        <Footer>
          <PrimaryButton label="تأكيد الموعد" disabled={!canSubmit} onPress={confirm} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  inputText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  placeholder: {
    color: colors.textFaint,
  },
  multiline: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  patientRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  selectedBox: {
    flex: 1,
  },
  results: {
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  result: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  resultText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
});
