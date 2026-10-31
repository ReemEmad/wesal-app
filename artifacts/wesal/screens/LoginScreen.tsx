import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLoginWesal } from '@workspace/api-client-react';
import React, { useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import type { RootStackParamList } from '../App';
import { errorMessage, useAuth } from '../components/auth';
import { WesalButton } from '../components/WesalButton';
import {
  FormScreen,
  InfoNote,
  OrDivider,
  PasswordField,
  PhoneField,
  ScreenTitle,
  Wordmark,
  normalizePhone,
} from '../components/WesalForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn, startDemo, pendingInvite } = useAuth();
  const login = useLoginWesal();
  const { width } = useWindowDimensions();
  const art = Math.min(width - 120, 230);
  const [countryCode, setCountryCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const enterDemo = async () => {
    if (demoLoading || login.isPending) return;
    setDemoLoading(true);
    setFormError(null);
    setPhoneError(null);
    setPasswordError(null);
    setPassword('');
    try {
      await startDemo(undefined, undefined, undefined, 'login');
    } catch {
      setFormError('تعذر فتح التجربة. حاول مرة أخرى.');
      setDemoLoading(false);
    }
  };

  const submit = async () => {
    if (demoLoading || login.isPending) return;
    const normalized = normalizePhone(countryCode, phone);
    setPhoneError(!phone.trim() ? 'أدخل رقم الهاتف.' : normalized ? null : 'رقم الهاتف غير صحيح.');
    setPasswordError(password ? null : 'أدخل كلمة المرور.');
    setFormError(null);
    if (!normalized || !password) return;
    try {
      const session = await login.mutateAsync({ data: { phone: normalized, password } });
      setPassword('');
      await signIn(session, 'login');
    } catch (error) {
      setFormError(errorMessage(error, 'رقم الهاتف أو كلمة المرور غير صحيحة.'));
    }
  };

  return (
    <FormScreen>
      <Wordmark />
      <Image
        source={require('../assets/images/login-welcome-back.png')}
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel="رسم لابنة تتابع أحد أحبائها عبر هاتفها"
        resizeMode="contain"
        style={[styles.art, { width: art, height: art }]}
      />
      <ScreenTitle title="مرحبًا بعودتك" subtitle="سجّل دخولك للاستمرار في متابعة أحبائك" />

      <InfoNote title="تجربة بدون حساب" testID="login-demo-note">
        افتح الصفحة الرئيسية مباشرة بدون رقم هاتف أو كلمة مرور. لن يُنشأ حساب حقيقي أو تُقبل دعوات حقيقية.
      </InfoNote>
      <View style={styles.demoActions}>
        <WesalButton
          label="دخول تجريبي للرئيسية"
          accessibilityLabel="دخول تجريبي إلى الصفحة الرئيسية بدون حساب"
          variant="outline"
          onPress={enterDemo}
          loading={demoLoading}
          disabled={login.isPending}
          testID="login-demo"
        />
      </View>

      {pendingInvite ? (
        <InfoNote title="دعوة بانتظار موافقتك">
          سجّل الدخول بالحساب المرتبط بالرقم الذي وصلته الدعوة، وستفتح صفحة الدعوة مباشرة.
        </InfoNote>
      ) : null}

      <PhoneField
        label="رقم الهاتف"
        placeholder="أدخل رقم الهاتف"
        value={phone}
        onChangeText={setPhone}
        countryCode={countryCode}
        onCountryCodeChange={setCountryCode}
        error={phoneError}
        hint="تسجيل الدخول يتم برقم الهاتف فقط."
        testID="auth-phone"
      />
      <PasswordField
        label="كلمة المرور"
        placeholder="أدخل كلمة المرور"
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
        error={passwordError}
        testID="auth-password"
        onSubmitEditing={submit}
        returnKeyType="go"
      />

      {formError ? (
        <InfoNote tone="danger" testID="login-error">
          {formError}
        </InfoNote>
      ) : null}

      <View style={styles.actions}>
        <WesalButton
          label="تسجيل الدخول"
          accessibilityLabel="تسجيل الدخول"
          onPress={submit}
          loading={login.isPending}
          disabled={demoLoading}
          testID="login-submit"
        />
        <OrDivider />
        <WesalButton
          label="إنشاء حساب جديد"
          accessibilityLabel="إنشاء حساب جديد"
          variant="soft"
          onPress={() => navigation.replace('Register')}
          disabled={demoLoading || login.isPending}
          testID="login-to-register"
        />
      </View>
      <InfoNote tone="calm">
        نسيت كلمة المرور؟ لا توجد حاليًا استعادة تلقائية للحساب، لأننا لا نملك وسيلة تواصل مُتحققًا منها لإثبات ملكيتك له.
      </InfoNote>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  art: { alignSelf: 'center', marginTop: 12 },
  demoActions: { marginTop: 12, marginBottom: 16 },
  actions: { marginTop: 22, marginBottom: 8 },
});
