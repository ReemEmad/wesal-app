import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import { Image, Linking, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList } from '../App';
import { buildInviteLink, useAuth } from '../components/auth';
import { WesalButton } from '../components/WesalButton';
import {
  FormScreen,
  InfoNote,
  Initials,
  ScreenTitle,
  Wordmark,
  relationshipLabel,
} from '../components/WesalForm';
import { tokens } from '../constants/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'InvitationCreated'>;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function InvitationCreatedScreen({ navigation, route }: Props) {
  const { isDemo } = useAuth();
  const { invitation, token } = route.params;
  const { width } = useWindowDimensions();
  const art = Math.min(width - 140, 210);
  const link = useMemo(() => buildInviteLink(token), [token]);
  const invitationCode = isDemo
    ? `DEMO-${invitation.id.replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()}`
    : token;
  const [notice, setNotice] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const message = `مرحبًا ${invitation.recipientName}، أنشأ ${invitation.caregiverName} دعوة لك على وصال لمشاركة الرعاية. لن يُشارك أي شيء إلا بعد موافقتك. افتح الرابط للاطلاع والقرار:\n${link.url}${
    link.requiresApp ? '\n(يتطلب الرابط تثبيت تطبيق وصال)' : ''
  }`;

  const copy = async () => {
    if (isDemo) return;
    try {
      await Clipboard.setStringAsync(link.url);
      setNotice({ tone: 'success', text: 'تم نسخ رابط الدعوة. شاركه مع الشخص بنفسك.' });
    } catch {
      setNotice({ tone: 'danger', text: 'تعذر النسخ. يمكنك تحديد الرابط الظاهر أعلاه ونسخه يدويًا.' });
    }
  };

  const copyCode = async () => {
    try {
      const copied = await Clipboard.setStringAsync(invitationCode);
      if (!copied) throw new Error('Clipboard write failed');
      setNotice({
        tone: 'success',
        text: isDemo ? 'تم نسخ الكود التجريبي. لا يمكن استخدامه للانضمام إلى حساب حقيقي.' : 'تم نسخ كود الدعوة.',
      });
    } catch {
      setNotice({ tone: 'danger', text: 'تعذر نسخ الكود. يمكنك تحديد الكود الظاهر ونسخه يدويًا.' });
    }
  };

  const whatsapp = async () => {
    if (isDemo) return;
    const digits = invitation.recipientPhone.replace(/\D/g, '');
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(url);
      setNotice(null);
    } catch {
      setNotice({ tone: 'danger', text: 'تعذر فتح واتساب على هذا الجهاز. انسخ الرابط وأرسله بطريقة أخرى.' });
    }
  };

  return (
    <FormScreen>
      <Wordmark />
      <Image
        source={require('../assets/images/invitation-created.png')}
        accessible
        accessibilityLabel="رسم لظرف دعوة يخرج منه شخصان يتصافحان"
        resizeMode="contain"
        style={[styles.art, { width: art, height: art }]}
      />
      <ScreenTitle
        title={isDemo ? 'دعوة تجريبية' : 'تم إنشاء الدعوة'}
        subtitle={isDemo ? 'هذه محاكاة محلية فقط. لم تُرسل دعوة ولا يوجد رابط حقيقي للمشاركة.' : 'لم تُرسل الدعوة بعد. شارك الرابط بنفسك مع الشخص ليتمكن من الانضمام إلى وصال والموافقة على مشاركة الرعاية.'}
      />

      <View style={styles.card} accessible accessibilityLabel={`${invitation.recipientName}، ${invitation.recipientPhone}`}>
        <Initials name={invitation.recipientName} size={58} />
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={styles.key}>الاسم</Text>
            <Text style={styles.value} numberOfLines={1}>
              {invitation.recipientName}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>رقم الجوال</Text>
            <Text style={[styles.value, styles.ltr]}>{invitation.recipientPhone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>الصلة</Text>
            <Text style={styles.value}>{relationshipLabel(invitation.relationship)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.linkBox}>
        <Text style={styles.key}>{isDemo ? 'كود الدعوة التجريبي' : 'كود الدعوة'}</Text>
        <Text selectable testID="invite-code" style={[styles.codeText, styles.ltr]}>
          {invitationCode}
        </Text>
        {isDemo && <Text style={styles.linkMeta}>للتجربة فقط، ولا يُرسل إلى أي شخص أو يربط حسابات حقيقية.</Text>}
      </View>

      {!isDemo && <View style={styles.linkBox}>
        <Text selectable style={styles.linkText} numberOfLines={2}>
          {link.url}
        </Text>
        <Text style={styles.linkMeta}>
          صالح للاستخدام مرة واحدة حتى {formatDate(invitation.expiresAt)}.
          {link.requiresApp ? ' هذا الرابط يفتح تطبيق وصال فقط، ويجب أن يكون التطبيق مثبتًا لدى المستلم.' : ''}
        </Text>
      </View>}

      {notice ? (
        <InfoNote tone={notice.tone} testID="invite-share-notice">
          {notice.text}
        </InfoNote>
      ) : null}

      <View style={styles.actions}>
        <WesalButton
          label="نسخ كود الدعوة"
          accessibilityLabel={isDemo ? 'نسخ كود الدعوة التجريبي' : 'نسخ كود الدعوة'}
          variant="outline"
          onPress={copyCode}
          testID="invite-copy-code"
        />
        <View style={styles.gap} />
        <WesalButton
          label="مشاركة عبر واتساب"
          accessibilityLabel="مشاركة رابط الدعوة عبر واتساب"
          onPress={whatsapp}
          disabled={isDemo}
          testID="invite-whatsapp"
        />
        <View style={styles.gap} />
        <WesalButton
          label="نسخ رابط الدعوة"
          accessibilityLabel="نسخ رابط الدعوة"
          variant="outline"
          onPress={copy}
          disabled={isDemo}
          testID="invite-copy"
        />
        <WesalButton
          label="العودة إلى الرئيسية"
          accessibilityLabel="العودة إلى الصفحة الرئيسية"
          variant="link"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          testID="invite-done"
        />
      </View>
      <Text style={styles.footnote}>
        {isDemo ? 'الكود للتجربة فقط. عند المتابعة ستنتقل إلى الشاشة الرئيسية.' : 'احفظ الكود أو الرابط قبل مغادرة هذه الصفحة، فلن يظهرا مرة أخرى.'}
      </Text>
    </FormScreen>
  );
}

const c = tokens.colors;
const styles = StyleSheet.create({
  art: { alignSelf: 'center', marginTop: 8 },
  card: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: tokens.radius.card,
    backgroundColor: c.decorative,
  },
  cardBody: { flex: 1, gap: 6 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 10 },
  key: { fontFamily: tokens.typography.regular, fontSize: 14, color: c.secondaryText },
  value: { flexShrink: 1, fontFamily: tokens.typography.semiBold, fontSize: 15, color: c.text },
  ltr: { writingDirection: 'ltr' },
  linkBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.fieldBorder,
    backgroundColor: c.field,
  },
  linkText: { fontFamily: tokens.typography.regular, fontSize: 13, color: c.primary, textAlign: 'left' },
  codeText: {
    marginTop: 8,
    fontFamily: tokens.typography.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: c.primary,
    textAlign: 'left',
  },
  linkMeta: {
    marginTop: 8,
    fontFamily: tokens.typography.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: c.secondaryText,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: { marginTop: 20 },
  gap: { height: 14 },
  footnote: {
    marginTop: 6,
    fontFamily: tokens.typography.regular,
    fontSize: 12.5,
    lineHeight: 20,
    color: c.secondaryText,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
