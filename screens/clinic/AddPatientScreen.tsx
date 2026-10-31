import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
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

import { Avatar } from '../../components/Avatar';
import { Footer, PrimaryButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionCard } from '../../components/SectionCard';
import { StatusChip } from '../../components/StatusChip';
import { Invite, useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import { formatSince } from '../../utils/clinic';

type Mode = 'phone' | 'username';

const ACCEPTED_BADGE = {
  label: 'تم القبول',
  background: colors.infoBg,
  foreground: colors.info,
  icon: 'checkmark-circle-outline',
} as const;

function sentLabel(invite: Invite): string {
  const since = formatSince(invite.sentAt);
  return since === 'اليوم' ? 'أُرسلت اليوم' : since;
}

export default function AddPatientScreen({
  navigation,
}: NativeStackScreenProps<ClinicStackParamList, 'AddPatient'>) {
  const { invites, sendInvite, cancelInvite } = useClinic();
  const [mode, setMode] = useState<Mode>('phone');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');

  const send = () => {
    sendInvite({ kind: mode, contact: contact.trim(), name });
    setContact('');
    setName('');
    Alert.alert('تم إرسال الدعوة', 'سنخبرك فور موافقة المريض على ربط ملفه.');
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    setContact('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="إضافة مريض"
            subtitle="أرسل دعوة ربط ليوافق المريض على مشاركة ملفه"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.modes}>
            <Chip label="رقم الجوال" selected={mode === 'phone'} onPress={() => changeMode('phone')} />
            <Chip label="اسم المستخدم" selected={mode === 'username'} onPress={() => changeMode('username')} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{mode === 'phone' ? 'رقم جوال المريض' : 'اسم المستخدم'}</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              placeholder={mode === 'phone' ? '٠١٠ ٢٣٤٥ ٦٧٨٩' : 'مثال: nadia.kamel'}
              placeholderTextColor={colors.textFaint}
              keyboardType={mode === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>اسم المريض (اختياري)</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="مثال: نادية كامل"
              placeholderTextColor={colors.textFaint}
              textAlign="right"
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.infoText}>لن تظهر لك بيانات المريض إلا بعد موافقته أو موافقة قريبه المسؤول.</Text>
            <Ionicons name="lock-closed-outline" size={26} color={colors.primary} />
          </View>

          <SectionCard title={`الدعوات المرسلة (${toArabicDigits(invites.length)})`}>
            {invites.map((invite) => (
              <View key={invite.id} style={styles.inviteRow}>
                {invite.status === 'accepted' ? (
                  <StatusChip badge={ACCEPTED_BADGE} />
                ) : (
                  <TouchableOpacity
                    style={styles.cancelInvite}
                    onPress={() => cancelInvite(invite.id)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelInviteLabel}>إلغاء الدعوة</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.inviteIdentity}>
                  <View style={styles.inviteTexts}>
                    <Text style={styles.inviteName}>{invite.name}</Text>
                    <Text style={styles.inviteMeta}>
                      {invite.kind === 'phone' ? 'جوال' : 'مستخدم'} {toArabicDigits(invite.contact)} ·{' '}
                      {sentLabel(invite)}
                    </Text>
                  </View>
                  <Avatar name={invite.name} source={invite.avatar} size={52} />
                </View>
              </View>
            ))}
          </SectionCard>
        </ScrollView>

        <Footer>
          <PrimaryButton label="إرسال دعوة الربط" disabled={contact.trim().length < 5} onPress={send} />
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
  modes: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
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
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
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
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  inviteIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  inviteTexts: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  inviteName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  inviteMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  cancelInvite: {
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSolid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelInviteLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.surface,
  },
});
