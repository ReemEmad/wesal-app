import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { Banner, Btn, Icon, num, s as ui } from '../components/pharmacy/PharmacyUI';
import { useSubscriptions } from '../components/SubscriptionsProvider';
import { DemoCard, PayOption, Point, Processing, Row, st } from '../components/subscriptions/CheckoutParts';
import { PlanCard } from '../components/subscriptions/PlanCard';
import { canPurchase, egp, formatArDateTime, needsPayment, priceLabel } from '../components/subscriptions/planText';
import { ACCOUNT_PLANS, type PlanId } from '../constants/subscriptions';
import { colors, fonts, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Subscriptions'>;
type Step = 'plans' | 'payment' | 'review' | 'success';
type Saved = { planId: PlanId; changedAt: string; mode: 'demo' };

const STEP_LABEL: Record<Step, string> = { plans: 'اختيار الخطة', payment: 'الدفع التجريبي', review: 'المراجعة', success: '' };
const planOf = (id: PlanId | null) => ACCOUNT_PLANS.find(p => p.id === id);

export default function SubscriptionsScreen({ navigation }: Props) {
  const { ready, error, currentPlanId, saveDemoPlan } = useSubscriptions();
  const [step, setStep] = useState<Step>('plans');
  const [selected, setSelected] = useState<PlanId | null>(null);
  const [paymentOk, setPaymentOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const savingRef = useRef(false);
  const mounted = useRef(false);
  const scrollRef = useRef<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>(null);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [step, saving]);
  usePreventRemove(saving, () => undefined);

  const plan = planOf(selected);
  const current = planOf(currentPlanId);
  const paid = !!plan && needsPayment(plan);
  const flow: Step[] = paid ? ['plans', 'payment', 'review'] : ['plans', 'review'];
  const idx = flow.indexOf(step);

  const go = (s: Step) => { if (savingRef.current) return; setSaveError(null); setStep(s); };
  const leave = () => { if (savingRef.current) return; if (navigation.canGoBack()) navigation.goBack(); else navigation.popTo('Home'); };
  const back = () => {
    if (savingRef.current) return;
    if (step === 'plans' || step === 'success') leave(); else go(flow[idx - 1]);
  };
  const cancel = () => {
    if (savingRef.current) return;
    setSelected(null); setPaymentOk(false); setSaveError(null); setStep('plans');
  };
  const nextFromPlans = () => { if (plan && canPurchase(plan) && plan.id !== currentPlanId) go(paid ? 'payment' : 'review'); };

  const confirm = async () => {
    if (savingRef.current || !ready || !plan || !canPurchase(plan) || plan.id === currentPlanId || (paid && !paymentOk)) return;
    savingRef.current = true; setSaving(true); setSaveError(null);
    try {
      const rec = await saveDemoPlan(plan.id);
      if (!mounted.current) return;
      setSaved(rec); setStep('success'); setSelected(null); setPaymentOk(false);
    } catch (e) {
      if (!mounted.current) return;
      setSaveError(e instanceof Error && e.message ? e.message : 'تعذر حفظ الخطة. لم يتغير شيء، حاول مرة أخرى.');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const renderPlans = () => (
    <>
      <Text accessibilityRole="header" style={styles.h1}>اختر خطة الاشتراك المناسبة</Text>
      <Text style={ui.label}>كل الخطط شهرية. خطتك الحالية: {current?.name ?? '—'}.</Text>
      {error ? <Banner tone="warning">{error}</Banner> : null}
      {!ready ? [0, 1, 2].map(i => <View key={i} style={styles.skeleton} />) : ACCOUNT_PLANS.map(p => (
        <PlanCard key={p.id} plan={p} selected={selected === p.id} current={p.id === currentPlanId} onSelect={() => setSelected(p.id)} />
      ))}
      <Banner>نسخة عرض: الأسعار بالجنيه المصري، ولا يتم خصم أي مبلغ. اختيار خطة مدفوعة لا يفعّل مزاياها فعليًا في هذه النسخة.</Banner>
    </>
  );

  const renderPayment = () => (
    <>
      <Text accessibilityRole="header" style={styles.h1}>طريقة الدفع</Text>
      <Banner tone="warning">دفع تجريبي، لن يتم خصم أي مبلغ. لا نطلب رقم بطاقة أو رمز تحقق أو أي بيانات بنكية.</Banner>
      <DemoCard />
      <PayOption testID="subscription-payment-demo" title="البطاقة التجريبية" sub="•••• ٤٢٤٢ · للعرض فقط" selected={paymentOk} onPress={() => setPaymentOk(true)} />
      <PayOption title="Apple Pay" sub="غير متاح حتى يتم الربط الفعلي" selected={false} disabled onPress={() => undefined} />
      <PayOption title="STC Pay" sub="غير متاح حتى يتم الربط الفعلي" selected={false} disabled onPress={() => undefined} />
    </>
  );

  const renderReview = () => plan ? (
    <>
      <Text accessibilityRole="header" style={styles.h1}>راجع قبل الحفظ</Text>
      <View style={st.card}>
        <Row label="الخطة الحالية" value={current?.name ?? '—'} />
        <Row label="الخطة الجديدة" value={`${plan.name} · ${priceLabel(plan)}`} onChange={() => go('plans')} changeTestID="subscription-change-plan" disabled={saving} />
        {paid ? <Row label="طريقة الدفع" value="بطاقة تجريبية •••• ٤٢٤٢" onChange={() => go('payment')} changeTestID="subscription-change-payment" disabled={saving} /> : null}
        <Row label="عدد كبار السن" value={`حتى ${num(plan.elderLimit)}`} />
        <View style={styles.total}><Text style={ui.strong}>المبلغ الشهري</Text><Text style={styles.totalValue}>{egp(plan.amountEGP ?? 0)}</Text></View>
        <View style={styles.total}><Text style={ui.label}>الخصم الفعلي</Text><Text style={[ui.strong, { color: colors.success }]}>{egp(0)}</Text></View>
      </View>
      <View style={[st.card, styles.soft]}>
        <Point icon="check" text="لن يتم خصم أي مبلغ، ولا يوجد تجديد تلقائي." />
        <Point icon="doc" text={paid ? 'المزايا المدفوعة مثل الإحصائيات والتقارير لا تُفعّل فعليًا في نسخة العرض.' : 'سيعود حسابك إلى الخطة المجانية على هذا الجهاز.'} />
        <Point icon="home" text="يُحفظ الاختيار على هذا الجهاز فقط." />
      </View>
      {saveError ? (
        <View testID="subscription-error" accessibilityRole="alert" style={styles.errBox}>
          <Text style={[ui.strong, { color: colors.danger }]}>لم تُحفظ الخطة</Text>
          <Text style={[ui.body, { color: colors.danger }]}>{saveError}</Text>
        </View>
      ) : null}
    </>
  ) : null;

  const renderSuccess = () => {
    const p = planOf(saved?.planId ?? null);
    return (
      <View testID="subscription-success" style={{ gap: spacing.md }}>
        <View style={styles.successIcon}><Icon name="check" size={36} color={colors.surface} width={2.6} /></View>
        <Text accessibilityRole="header" style={[styles.h1, { textAlign: 'center' }]}>تم حفظ خطتك التجريبية</Text>
        <Text style={[ui.label, { textAlign: 'center' }]}>هذا اختيار تجريبي على هذا الجهاز، وليس اشتراكًا مدفوعًا مفعّلًا.</Text>
        {saved && p ? (
          <View style={st.card}>
            <Row label="الخطة" value={p.name} />
            <Row label="تاريخ التغيير" value={formatArDateTime(saved.changedAt)} />
            <View style={styles.total}><Text style={ui.label}>الخصم الفعلي</Text><Text style={[ui.strong, { color: colors.success }]}>{egp(0)}</Text></View>
          </View>
        ) : null}
      </View>
    );
  };

  const footer = () => {
    if (saving) return null;
    if (step === 'success') return <Btn testID="subscription-go-home" label="العودة للرئيسية" onPress={() => navigation.popTo('Home')} />;
    if (step === 'plans') return (
      <View style={styles.footRow}>
        <View style={{ flex: 1 }}>
          <Text style={ui.label}>الخطة المختارة</Text>
          <Text style={ui.strong}>{plan ? `${plan.name} · ${priceLabel(plan)}` : 'لم تختر بعد'}</Text>
        </View>
        <Btn testID="subscription-plan-next" label="متابعة" disabled={!plan || !ready} onPress={nextFromPlans} />
      </View>
    );
    if (step === 'payment') return <Btn testID="subscription-payment-next" label="التالي: المراجعة" disabled={!paymentOk} onPress={() => go('review')} />;
    return <Btn testID="subscription-confirm" label={saveError ? 'إعادة المحاولة' : paid ? 'تأكيد الاشتراك التجريبي' : 'تأكيد العودة للخطة المجانية'}
      disabled={!ready || !plan || (paid && !paymentOk)} onPress={confirm} />;
  };

  const inFlow = step !== 'success';
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.root} testID="subscriptions-screen">
      <View style={styles.head}>
        <Pressable testID="subscription-back" accessibilityRole="button" accessibilityLabel="رجوع" disabled={saving}
          onPress={back} hitSlop={6} style={({ pressed }) => [styles.iconBtn, saving && ui.disabled, pressed && st.pressed]}>
          <View style={{ transform: [{ scaleX: -1 }] }}><Icon name="chevron" size={18} /></View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>الاشتراكات</Text>
          {inFlow ? <Text style={ui.label}>الخطوة {num(idx + 1)} من {num(flow.length)} · {STEP_LABEL[step]}</Text> : null}
        </View>
        {inFlow && step !== 'plans' ? (
          <Pressable testID="subscription-cancel" accessibilityRole="button" accessibilityLabel="إلغاء دون حفظ" disabled={saving}
            onPress={cancel} style={[styles.cancel, saving && ui.disabled]}>
            <Text style={st.changeText}>إلغاء</Text>
          </Pressable>
        ) : null}
      </View>
      {inFlow ? (
        <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {flow.map((s, i) => <View key={s} style={[styles.seg, i <= idx && { backgroundColor: colors.primary }]} />)}
        </View>
      ) : null}
      <ScrollView ref={scrollRef as never} contentContainerStyle={styles.scroll}>
        {saving && plan ? <Processing planName={plan.name} /> : (
          <>
            {step === 'plans' && renderPlans()}
            {step === 'payment' && renderPayment()}
            {step === 'review' && renderReview()}
            {step === 'success' && renderSuccess()}
          </>
        )}
      </ScrollView>
      {!saving ? <View style={styles.footer}>{footer()}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cancel: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  progress: { flexDirection: 'row-reverse', gap: 6, paddingHorizontal: spacing.lg, paddingTop: spacing.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.divider },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  h1: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  skeleton: { height: 260, borderRadius: 22, backgroundColor: colors.primarySoftBg },
  soft: { backgroundColor: colors.primarySoftBg, shadowOpacity: 0, elevation: 0 },
  total: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.primary },
  errBox: { backgroundColor: colors.dangerBg, borderRadius: 16, padding: spacing.md, gap: 4 },
  successIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing.xl },
  footer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.background, width: '100%', maxWidth: 520, alignSelf: 'center' },
  footRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
});
