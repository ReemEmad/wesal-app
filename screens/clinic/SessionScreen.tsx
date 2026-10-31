import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useClinic } from '../../context/ClinicContext';
import { useStartPrescription } from '../../hooks/useStartPrescription';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { formatElapsed, formatTime } from '../../utils/clinic';

type Props = NativeStackScreenProps<ClinicStackParamList, 'Session'>;

type ActionRow = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
};

export default function SessionScreen({ navigation, route }: Props) {
  const { appointmentId } = route.params;
  const { getAppointment, getPatient, session, startSession, setDraftNote, endSession } = useClinic();
  const startPrescription = useStartPrescription();

  const appointment = getAppointment(appointmentId);
  const patient = appointment ? getPatient(appointment.patientId) : undefined;
  const active = session?.appointmentId === appointmentId ? session : null;

  const [now, setNow] = useState(() => Date.now());
  const started = useRef(false);

  useEffect(() => {
    if (started.current || active || !appointment) return;
    started.current = true;
    startSession(appointmentId);
  }, [active, appointment, appointmentId, startSession]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!appointment || !patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ScreenHeader title="جلسة الكشف" onBack={() => navigation.goBack()} />
          <Text style={styles.empty}>تعذّر العثور على هذا الموعد.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const prescribed = active?.prescriptions ?? [];

  const newPrescription = () => {
    startPrescription(patient);
    navigation.navigate('MedicationForm');
  };

  const finish = () => {
    endSession();
    navigation.replace('SessionSaved', { appointmentId });
  };

  const actions: ActionRow[] = [
    {
      key: 'diagnosis',
      title: 'إضافة تشخيص أو مرض',
      subtitle: 'سجّل حالة جديدة في الملف',
      icon: 'stethoscope',
      onPress: () => navigation.navigate('SessionNotes', { appointmentId }),
    },
    {
      key: 'prescription',
      title: 'وصفة جديدة',
      subtitle:
        prescribed.length > 0 ? `تمت إضافة: ${prescribed.join('، ')}` : 'أضف دواء أو عدّل جرعة',
      icon: 'pill',
      onPress: newPrescription,
    },
    {
      key: 'lab',
      title: 'طلب تحليل',
      subtitle: 'اطلب فحصًا من المعمل',
      icon: 'water-outline',
      onPress: () => Alert.alert('قريبًا', 'طلب التحاليل سيتوفر قريبًا.'),
    },
  ];

  const startedAt = active?.startedAt ?? now;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="جلسة الكشف"
            subtitle={`${patient.name} · ملف ${toArabicDigits(patient.fileNo)}`}
            onBack={() => navigation.goBack()}
            leftAction={
              <RoundButton
                icon="document-text-outline"
                label="ملاحظات الجلسة"
                onPress={() => navigation.navigate('SessionNotes', { appointmentId })}
              />
            }
          />

          <View style={styles.banner}>
            <Text style={styles.timer}>{formatElapsed(now - startedAt)}</Text>
            <View style={styles.bannerTexts}>
              <Text style={styles.bannerTitle}>الجلسة جارية</Text>
              <Text style={styles.bannerSubtitle}>بدأت الساعة {formatTime(startedAt)}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ملاحظات الجلسة</Text>
            <TextInput
              style={styles.noteInput}
              value={active?.draftNote ?? ''}
              onChangeText={setDraftNote}
              placeholder="اكتب ملاحظاتك هنا..."
              placeholderTextColor={colors.textFaint}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.heading}>إجراءات الجلسة</Text>
          <View style={styles.actions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.action}
                onPress={action.onPress}
                accessibilityRole="button"
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
                <View style={styles.actionTexts}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <View style={styles.iconTile}>
                  <MaterialCommunityIcons name={action.icon} size={24} color={colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Footer>
          <PrimaryButton label="إنهاء الجلسة وحفظ" onPress={finish} />
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.sessionBanner,
  },
  timer: {
    fontFamily: fonts.semiBold,
    fontSize: 30,
    color: colors.surface,
  },
  bannerTexts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  bannerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.surface,
    textAlign: 'right',
  },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.cameraAccent,
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
  noteInput: {
    minHeight: 120,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'right',
  },
  actions: {
    gap: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  actionTexts: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  actionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  actionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
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
});
