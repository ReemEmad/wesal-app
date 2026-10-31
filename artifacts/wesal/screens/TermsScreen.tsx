import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { WesalButton } from '../components/WesalButton';
import { FormScreen, InfoNote, ScreenTitle, Wordmark } from '../components/WesalForm';
import { tokens } from '../constants/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'ما الذي نحفظه',
    body: 'عند إنشاء الحساب نحفظ اسمك ورقم هاتفك وبصمة آمنة مشتقة من كلمة مرورك، وليس كلمة المرور نفسها، والبريد الإلكتروني إن أضفته. عند إنشاء دعوة نحفظ اسم الشخص المدعو ورقم هاتفه وتاريخ ميلاده وصلة القرابة.',
  },
  {
    title: 'رقم الهاتف غير مُتحقق منه',
    body: 'لا نرسل رسائل SMS ولا رموز تحقق. لذلك لا نؤكد أن الرقم يخص صاحبه فعلًا، ويظهر كل حساب على أنه غير مُتحقق منه.',
  },
  {
    title: 'البريد الإلكتروني اختياري',
    body: 'البريد اختياري ولا نتحقق منه ولا نرسل إليه أي رسائل حاليًا.',
  },
  {
    title: 'الموافقة الصريحة',
    body: 'إنشاء الدعوة لا يعني إرسالها ولا يمنح أي وصول. يصبح الربط فعّالًا فقط عندما يسجّل الشخص المدعو برقم الهاتف نفسه ويوافق صراحةً. الرابط صالح لمرة واحدة ولمدة 7 أيام.',
  },
  {
    title: 'السحب والإلغاء',
    body: 'الدعوة تتطلب موافقة الشخص المدعو. الشاشة الرئيسية الحالية تعرض بيانات تجريبية فقط، ولا تعرض سجلات طبية حقيقية أو أدوات إدارة الموافقات.',
  },
  {
    title: 'لا توجد سجلات طبية',
    body: 'لا تحتوي وصال حاليًا على أي سجلات طبية أو صحية، ولا يمكن لأي طرف الوصول إلى معلومات طبية عبرها.',
  },
  {
    title: 'استعادة الحساب',
    body: 'لا توجد استعادة تلقائية لكلمة المرور لأننا لا نملك وسيلة تواصل مُتحققًا منها. الجلسات تنتهي بعد 30 يومًا.',
  },
];

export default function TermsScreen({ navigation }: Props) {
  return (
    <FormScreen>
      <Wordmark />
      <ScreenTitle title="الشروط وسياسة البيانات" subtitle="شرح مبسط لما يحدث لبياناتك اليوم" />
      <InfoNote tone="warning" title="مسودة غير نهائية">
        هذه الصفحة تصف سلوك التطبيق الحالي بصدق، وليست وثيقة قانونية نهائية. سيتم تحديثها قبل أي إطلاق رسمي.
      </InfoNote>
      {SECTIONS.map((s, i) => (
        <View key={s.title} style={styles.section}>
          <View style={styles.head}>
            <Text style={styles.num}>{String(i + 1).padStart(2, '0')}</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {s.title}
            </Text>
          </View>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
      <View style={styles.actions}>
        <WesalButton
          label="رجوع"
          accessibilityLabel="رجوع"
          variant="outline"
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.popToTop())}
          testID="terms-back"
        />
      </View>
    </FormScreen>
  );
}

const c = tokens.colors;
const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.fieldBorder,
  },
  head: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 10 },
  num: { fontFamily: tokens.typography.semiBold, fontSize: 13, color: c.primary },
  title: { fontFamily: tokens.typography.semiBold, fontSize: 16, color: c.text, writingDirection: 'rtl' },
  body: {
    marginTop: 6,
    fontFamily: tokens.typography.regular,
    fontSize: 14,
    lineHeight: 24,
    color: c.secondaryText,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  actions: { marginTop: 24 },
});
