import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { errorMessage, useAuth } from '../components/auth';
import { WesalButton } from '../components/WesalButton';
import {
  Field,
  FormScreen,
  InfoNote,
  OrDivider,
  PasswordField,
  PhoneField,
  ScreenTitle,
  Wordmark,
  normalizePhone,
} from '../components/WesalForm';
import { tokens } from '../constants/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password', string>>;

export default function RegisterScreen({ navigation }: Props) {
  const { startDemo, pendingInvite } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    setFormError(null);
    try {
      await startDemo(name, normalizePhone(countryCode, phone) || phone, email);
      setPassword('');
    } catch (error) {
      setFormError(errorMessage(error, 'تعذر بدء التجربة.'));
      setSubmitting(false);
    }
  };

  return (
    <FormScreen>
      <Wordmark />
      <ScreenTitle title="إنشاء حساب جديد" subtitle="ابدأ رحلتك مع وصال وكن قريبًا من أحبائك" />
      <InfoNote tone="calm" title="تسجيل تجريبي بدون خادم" testID="demo-signup-note">
        كل الحقول اختيارية. اضغط إنشاء حساب للمتابعة فورًا. لن يُنشأ حساب حقيقي ولن تُحفظ كلمة المرور.
      </InfoNote>

      {pendingInvite ? (
        <InfoNote tone="calm" title="لديك دعوة بانتظارك">
          التسجيل التجريبي لا يقبل دعوات حقيقية ولا يمنح وصولًا إلى حسابات أو بيانات حقيقية.
        </InfoNote>
      ) : null}

      <Field
        label="الاسم الكامل"
        placeholder="أحمد محمد علي"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        textContentType="name"
        error={errors.name}
        hint="اكتب اسمك كما تحب أن يظهر لأفراد عائلتك."
        testID="auth-name"
        maxLength={120}
      />
      <PhoneField
        label="رقم الهاتف"
        placeholder="01222015145"
        value={phone}
        onChangeText={setPhone}
        countryCode={countryCode}
        onCountryCodeChange={setCountryCode}
        error={errors.phone}
        testID="auth-phone"
      />
      <InfoNote tone="warning">
        لن نرسل رسالة تحقق إلى هذا الرقم، ولن يظهر حسابك على أنه رقم مُتحقق منه. الرقم يُستخدم لتسجيل الدخول ولمطابقة الدعوات فقط.
      </InfoNote>
      <Field
        label="البريد الإلكتروني"
        optionalLabel="اختياري"
        placeholder="name@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        ltr
        error={errors.email}
        hint="لا نتحقق من البريد ولا نرسل إليه شيئًا حاليًا."
        testID="auth-email"
      />
      <PasswordField
        label="كلمة المرور"
        placeholder="أدخل كلمة المرور"
        value={password}
        onChangeText={setPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password}
        hint="اختيارية في التجربة، لا تُرسل ولا تُحفظ."
        testID="auth-password"
        maxLength={128}
        onSubmitEditing={submit}
        returnKeyType="go"
      />

      {formError ? (
        <InfoNote tone="danger" testID="register-error">
          {formError}
        </InfoNote>
      ) : null}

      <View style={styles.actions}>
        <WesalButton
          label="إنشاء حساب جديد"
          accessibilityLabel="إنشاء حساب جديد"
          onPress={submit}
          loading={submitting}
          testID="register-submit"
        />
        <OrDivider />
        <WesalButton
          label="لدي حساب بالفعل"
          accessibilityLabel="لدي حساب بالفعل، تسجيل الدخول"
          variant="outline"
          onPress={() => navigation.replace('Login')}
          testID="register-to-login"
        />
      </View>

      <View style={styles.terms}>
        <Text style={styles.termsText}>بإنشائك الحساب فإنك توافق على </Text>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="الشروط وسياسة البيانات"
          onPress={() => navigation.navigate('Terms')}
          hitSlop={8}
          testID="register-terms"
        >
          <Text style={styles.termsLink}>الشروط وسياسة البيانات</Text>
        </Pressable>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 22 },
  terms: {
    marginTop: 18,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  termsText: {
    fontFamily: tokens.typography.regular,
    fontSize: 13,
    color: tokens.colors.secondaryText,
    writingDirection: 'rtl',
  },
  termsLink: {
    fontFamily: tokens.typography.semiBold,
    fontSize: 13,
    color: tokens.colors.primary,
    textDecorationLine: 'underline',
  },
});
