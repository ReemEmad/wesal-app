import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListWesalInvitationsQueryKey,
  getPreviewWesalInvitationQueryKey,
  useAcceptWesalInvitation,
  usePreviewWesalInvitation,
} from '@workspace/api-client-react';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { errorMessage, useAuth } from '../components/auth';
import { WesalButton } from '../components/WesalButton';
import {
  ConsentCheckbox,
  FormScreen,
  InfoNote,
  Initials,
  ScreenTitle,
  Wordmark,
  relationshipLabel,
} from '../components/WesalForm';
import { tokens } from '../constants/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AcceptInvitation'>;
const c = tokens.colors;

const STATUS_TEXT = {
  accepted: 'تم قبول هذه الدعوة من قبل، ولا يمكن استخدام الرابط مرة أخرى.',
  revoked: 'ألغى صاحب الدعوة هذه الدعوة.',
  expired: 'انتهت صلاحية هذه الدعوة. اطلب من صاحبها إنشاء دعوة جديدة.',
} as const;

function longDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function AcceptInvitationScreen({ navigation }: Props) {
  const { status, user, pendingInvite, clearPendingInvite, signOut } = useAuth();
  const queryClient = useQueryClient();
  const token = pendingInvite ?? '';
  const preview = usePreviewWesalInvitation(token, {
    query: { enabled: !!pendingInvite, queryKey: getPreviewWesalInvitationQueryKey(token), retry: 1 },
  });
  const accept = useAcceptWesalInvitation();
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const signedIn = status === 'signedIn';

  const leave = async () => {
    await clearPendingInvite();
    navigation.reset({ index: 0, routes: [{ name: signedIn ? 'Home' : 'Welcome' }] });
  };

  const submit = async () => {
    if (!pendingInvite) return;
    if (!consent) {
      setError('يجب تأكيد موافقتك أولًا بتحديد المربع.');
      return;
    }
    setError(null);
    try {
      await accept.mutateAsync({ data: { token: pendingInvite, consent: true } });
      await clearPendingInvite();
      await queryClient.invalidateQueries({ queryKey: getListWesalInvitationsQueryKey() });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError(errorMessage(e, 'تعذر قبول الدعوة.'));
    }
  };

  const switchAccount = async () => {
    setSwitching(true);
    setError(null);
    try {
      await signOut();
    } catch (e) {
      setError(errorMessage(e, 'تعذر تسجيل الخروج. حاول مرة أخرى.'));
      setSwitching(false);
    }
  };

  const data = preview.data;

  return (
    <FormScreen>
      <Wordmark />
      <ScreenTitle title="دعوة لمشاركة الرعاية" subtitle="القرار لك وحدك. لن يُربط حسابك بأحد دون موافقتك الصريحة." />

      {!pendingInvite ? (
        <InfoNote tone="warning" title="لا توجد دعوة مفتوحة">
          لم نجد رابط دعوة على هذا الجهاز. افتح الرابط الذي وصلك مرة أخرى.
        </InfoNote>
      ) : preview.isLoading ? (
        <View style={styles.skeleton} />
      ) : preview.isError || !data ? (
        <View>
          <InfoNote tone="danger">{errorMessage(preview.error, 'هذا الرابط غير صالح أو لم يعد متاحًا.')}</InfoNote>
          <WesalButton
            label="إعادة المحاولة"
            accessibilityLabel="إعادة تحميل الدعوة"
            variant="link"
            onPress={() => void preview.refetch()}
            testID="invite-preview-retry"
          />
        </View>
      ) : (
        <View>
          <View style={styles.card}>
            <Initials name={data.caregiverName} size={56} />
            <View style={styles.cardBody}>
              <Text style={styles.cardLead}>دعوة من</Text>
              <Text style={styles.cardName}>{data.caregiverName}</Text>
              <Text style={styles.cardMeta}>
                سجّلك بصفتك: {relationshipLabel(data.relationship)}
              </Text>
              {data.status === 'pending' ? (
                <Text style={styles.cardMeta}>صالحة حتى {longDate(data.expiresAt)}</Text>
              ) : null}
            </View>
          </View>

          {data.status !== 'pending' ? (
            <InfoNote tone="warning">{STATUS_TEXT[data.status]}</InfoNote>
          ) : (
            <>
              <InfoNote title="ماذا تعني الموافقة؟">
                ستظهر هذه المشاركة في صفحتك وصفحة {data.caregiverName}. لا توجد في وصال أي سجلات طبية، ولن يتمكن أحد من الاطلاع على معلومات صحية. يمكنك سحب موافقتك في أي وقت.
              </InfoNote>

              {signedIn ? (
                <>
                  <Text style={styles.signedAs}>
                    أنت مسجّل باسم {user?.name} ({user?.phone}). يجب أن يطابق هذا الرقم الرقم الذي أُنشئت له الدعوة.
                  </Text>
                  <ConsentCheckbox
                    checked={consent}
                    onChange={(v) => {
                      setConsent(v);
                      if (v) setError(null);
                    }}
                    label={`أوافق صراحةً على مشاركة الرعاية مع ${data.caregiverName}، وأعلم أنني أستطيع سحب موافقتي لاحقًا.`}
                    testID="consent-checkbox"
                  />
                  {error ? <InfoNote tone="danger">{error}</InfoNote> : null}
                  <View style={styles.actions}>
                    <WesalButton
                      label="قبول الدعوة"
                      accessibilityLabel="قبول الدعوة والموافقة على المشاركة"
                      onPress={submit}
                      disabled={!consent}
                      loading={accept.isPending}
                      testID="invite-accept"
                    />
                    <View style={styles.gap} />
                    <WesalButton
                      label="ليس هذا حسابي، تبديل الحساب"
                      accessibilityLabel="تسجيل الخروج للدخول بحساب آخر مع الاحتفاظ بالدعوة"
                      variant="outline"
                      onPress={switchAccount}
                      loading={switching}
                      testID="invite-switch-account"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.actions}>
                  <Text style={styles.signedAs}>
                    لقبول الدعوة سجّل الدخول أو أنشئ حسابًا برقم الهاتف الذي وصلته الدعوة. سنحتفظ بالدعوة على هذا الجهاز حتى تقرر.
                  </Text>
                  <WesalButton
                    label="إنشاء حساب للقبول"
                    accessibilityLabel="إنشاء حساب لقبول الدعوة"
                    onPress={() => navigation.navigate('Register')}
                    testID="invite-register"
                  />
                  <View style={styles.gap} />
                  <WesalButton
                    label="لدي حساب، تسجيل الدخول"
                    accessibilityLabel="تسجيل الدخول لقبول الدعوة"
                    variant="outline"
                    onPress={() => navigation.navigate('Login')}
                    testID="invite-login"
                  />
                </View>
              )}
            </>
          )}
        </View>
      )}

      <WesalButton
        label="تجاهل هذه الدعوة"
        accessibilityLabel="تجاهل الدعوة وإزالتها من هذا الجهاز"
        variant="link"
        onPress={leave}
        testID="invite-dismiss"
      />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  skeleton: { height: 110, borderRadius: tokens.radius.card, backgroundColor: c.decorative, marginTop: 8 },
  card: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: tokens.radius.card,
    backgroundColor: c.field,
    borderWidth: 1,
    borderColor: c.fieldBorder,
  },
  cardBody: { flex: 1, alignItems: 'flex-end' },
  cardLead: { fontFamily: tokens.typography.regular, fontSize: 13, color: c.secondaryText },
  cardName: { fontFamily: tokens.typography.semiBold, fontSize: 18, color: c.text, writingDirection: 'rtl' },
  cardMeta: {
    fontFamily: tokens.typography.regular,
    fontSize: 13,
    color: c.secondaryText,
    writingDirection: 'rtl',
    marginTop: 2,
  },
  signedAs: {
    marginTop: 14,
    fontFamily: tokens.typography.regular,
    fontSize: 13.5,
    lineHeight: 22,
    color: c.secondaryText,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: { marginTop: 16 },
  gap: { height: 12 },
});
