import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListWesalInvitationsQueryKey,
  useCreateWesalInvitation,
} from '@workspace/api-client-react';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { errorMessage, useAuth } from '../components/auth';
import { WesalButton } from '../components/WesalButton';
import {
  DateField,
  Field,
  FormScreen,
  InfoNote,
  PhoneField,
  RelationshipField,
  ScreenTitle,
  Wordmark,
  normalizePhone,
  validateBirthDate,
  type DateParts,
  type RelationshipValue,
} from '../components/WesalForm';

type Props = NativeStackScreenProps<RootStackParamList, 'Invite'>;
type Errors = Partial<Record<'name' | 'birth' | 'relationship' | 'phone', string>>;

export default function InviteScreen({ navigation }: Props) {
  const { isDemo, createDemoInvitation } = useAuth();
  const queryClient = useQueryClient();
  const create = useCreateWesalInvitation();
  const [name, setName] = useState('');
  const [birth, setBirth] = useState<DateParts>({ day: '', month: '', year: '' });
  const [relationship, setRelationship] = useState<RelationshipValue | null>(null);
  const [countryCode, setCountryCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    const next: Errors = {};
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (trimmed.length < 2) next.name = 'اكتب الاسم بالكامل.';
    const date = validateBirthDate(birth);
    if (date.error) next.birth = date.error;
    if (!relationship) next.relationship = 'اختر صلة القرابة.';
    const normalized = normalizePhone(countryCode, phone);
    if (!phone.trim()) next.phone = 'أدخل رقم هاتف الشخص.';
    else if (!normalized) next.phone = 'رقم الهاتف غير صحيح.';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length || !normalized || !date.value || !relationship) return;

    try {
      const data = {
          recipientName: trimmed,
          recipientPhone: normalized,
          birthDate: date.value,
          relationship,
      };
      const created = isDemo
        ? { invitation: await createDemoInvitation(data), token: 'demo-not-a-real-invitation' }
        : await create.mutateAsync({ data });
      void queryClient.invalidateQueries({ queryKey: getListWesalInvitationsQueryKey() });
      navigation.replace('InvitationCreated', {
        invitation: created.invitation,
        token: created.token,
      });
    } catch (error) {
      setFormError(errorMessage(error, 'تعذر إنشاء الدعوة. حاول مرة أخرى.'));
    }
  };

  return (
    <FormScreen>
      <Wordmark />
      <ScreenTitle
        title="أضف شخصًا تهتم برعايته"
        subtitle="أدخل بياناته لإنشاء دعوة انضمام إلى وصال"
      />
      {isDemo && <InfoNote title="وضع تجريبي" testID="demo-invite-note">
        استخدم بيانات وهمية فقط. الدعوة محلية للتجربة، ولا تُرسل إلى أي شخص ولا تنشئ رابط مشاركة حقيقيًا.
      </InfoNote>}

      <Field
        label="الاسم بالكامل"
        placeholder="محمد إبراهيم محمد"
        value={name}
        onChangeText={setName}
        error={errors.name}
        testID="invite-name"
        maxLength={120}
      />
      <DateField
        label="تاريخ الميلاد"
        value={birth}
        onChange={setBirth}
        error={errors.birth}
        testID="invite-birth-date"
      />
      <RelationshipField
        value={relationship}
        onChange={setRelationship}
        error={errors.relationship}
        testID="invite-relationship"
      />
      <PhoneField
        label="رقم الهاتف"
        placeholder="01222015145"
        value={phone}
        onChangeText={setPhone}
        countryCode={countryCode}
        onCountryCodeChange={setCountryCode}
        error={errors.phone}
        hint="يجب أن يسجّل الشخص حسابه بهذا الرقم نفسه ليتمكن من قبول الدعوة."
        testID="invite-phone"
      />

      <InfoNote title="خصوصيته مهمة">
        لن تتمكن من الوصول إلى أي شيء يخص هذا الشخص إلا بعد أن يقبل الدعوة ويوافق صراحةً على المشاركة، ويمكنه سحب موافقته في أي وقت. لا تحتوي وصال حاليًا على أي سجلات طبية.
      </InfoNote>

      {formError ? (
        <InfoNote tone="danger" testID="invite-error">
          {formError}
        </InfoNote>
      ) : null}

      <View style={styles.actions}>
        <WesalButton
          label="إنشاء الدعوة"
          accessibilityLabel="إنشاء الدعوة"
          onPress={submit}
          loading={create.isPending}
          testID="invite-submit"
        />
        <WesalButton
          label="يمكنك إضافة شخص آخر لاحقًا"
          accessibilityLabel="تخطي الآن والانتقال إلى الصفحة الرئيسية"
          variant="link"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          testID="invite-skip"
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { marginTop: 22 },
});
