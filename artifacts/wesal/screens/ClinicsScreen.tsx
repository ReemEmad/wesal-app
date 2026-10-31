import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { useClinics } from '../components/ClinicsProvider';
import { MainNavigation } from '../components/MainNavigation';
import { Banner, Btn, Icon, num, s as ui } from '../components/pharmacy/PharmacyUI';
import { CLINICS, DOCTORS } from '../constants/clinics';
import { normalizeSearch } from '../constants/pharmacy';
import { colors, fonts, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Clinics'>;
type Step = 'list' | 'clinic' | 'doctor' | 'details' | 'review';
type Draft = { id?: string; clinicId: string; doctorId: string; department: string; reason: string };

const EMPTY: Draft = { clinicId: '', doctorId: '', department: '', reason: '' };
const STEPS: Step[] = ['clinic', 'doctor', 'details', 'review'];
const STEP_LABEL: Record<Step, string> = { list: '', clinic: 'العيادة', doctor: 'الطبيب', details: 'سبب المتابعة', review: 'المراجعة' };

const clinicOf = (id: string) => CLINICS.find(c => c.id === id);
const doctorOf = (id: string) => DOCTORS.find(d => d.id === id);

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return num(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
}

function SearchBox({ value, onChange, label, testID }: { value: string; onChange: (t: string) => void; label: string; testID: string }) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={20} />
      <TextInput testID={testID} value={value} onChangeText={onChange} placeholder={label} accessibilityLabel={label}
        placeholderTextColor={colors.textFaint} returnKeyType="search" style={styles.searchInput} textAlign="right" />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="مسح البحث" onPress={() => onChange('')} hitSlop={8}>
          <Icon name="close" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Option({ testID, title, sub, selected, onPress, icon }: { testID: string; title: string; sub: string; selected: boolean; onPress: () => void; icon: 'clinic' | 'doc' }) {
  return (
    <Pressable testID={testID} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={`${title}، ${sub}`}
      onPress={onPress} style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && ui.pressed]}>
      <View style={[styles.optIcon, selected && { backgroundColor: colors.primary }]}>
        <Icon name={icon} size={20} color={selected ? colors.surface : colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.optTitle}>{title}</Text>
        <Text style={styles.optSub} numberOfLines={2}>{sub}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <Icon name="check" size={14} color={colors.surface} width={2.4} /> : null}</View>
    </Pressable>
  );
}

function Field({ label, testID, value, onChange, max, multiline, error, hint }: {
  label: string; testID: string; value: string; onChange: (t: string) => void; max: number; multiline?: boolean; error?: string; hint?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.fieldHead}>
        <Text style={styles.fieldLabel} nativeID={`${testID}-label`}>{label}</Text>
        <Text style={styles.counter}>{num(value.length)} / {num(max)}</Text>
      </View>
      <TextInput testID={testID} value={value} onChangeText={onChange} maxLength={max} multiline={multiline}
        accessibilityLabel={label} accessibilityLabelledBy={`${testID}-label`} placeholderTextColor={colors.textFaint}
        style={[styles.input, multiline && { minHeight: 96, textAlignVertical: 'top' }, !!error && { borderColor: colors.danger }]} textAlign="right" />
      {error ? <Text accessibilityRole="alert" style={styles.err}>{error}</Text> : hint ? <Text style={ui.label}>{hint}</Text> : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ClinicsScreen({ navigation }: Props) {
  const { ready, error, followUps, saveFollowUp, removeFollowUp } = useClinics();
  const [step, setStep] = useState<Step>('list');
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [clinicQ, setClinicQ] = useState('');
  const [doctorQ, setDoctorQ] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const clinics = useMemo(() => {
    const q = normalizeSearch(clinicQ);
    return CLINICS.filter(c => !q || normalizeSearch(`${c.name} ${c.area} ${c.description}`).includes(q));
  }, [clinicQ]);

  const clinicDoctors = useMemo(() => DOCTORS.filter(d => d.clinicId === draft.clinicId), [draft.clinicId]);
  const doctors = useMemo(() => {
    const q = normalizeSearch(doctorQ);
    return clinicDoctors.filter(d => !q || normalizeSearch(`${d.name} ${d.department}`).includes(q));
  }, [clinicDoctors, doctorQ]);

  const clinic = clinicOf(draft.clinicId);
  const doctor = doctorOf(draft.doctorId);
  const dept = draft.department.trim();
  const reason = draft.reason.trim();
  const deptErr = !dept ? 'اكتب القسم.' : dept.length > 60 ? 'القسم أطول من ٦٠ حرفًا.' : undefined;
  const reasonErr = !reason ? 'اكتب سبب المتابعة.' : reason.length > 160 ? 'السبب أطول من ١٦٠ حرفًا.' : undefined;

  const resetFlow = () => {
    setDraft(EMPTY); setClinicQ(''); setDoctorQ(''); setTouched(false); setSaveError(null);
  };
  const startNew = () => { resetFlow(); setJustSaved(null); setStep('clinic'); };
  const startEdit = (id: string) => {
    const f = followUps.find(x => x.id === id);
    if (!f) return;
    resetFlow(); setJustSaved(null); setConfirmId(null);
    setDraft({ id: f.id, clinicId: f.clinicId, doctorId: f.doctorId, department: f.department, reason: f.reason });
    setStep('review');
  };
  const cancel = () => { if (submitting) return; resetFlow(); setStep('list'); };
  const back = () => {
    if (submitting) return;
    const i = STEPS.indexOf(step);
    if (i <= 0) cancel(); else { setSaveError(null); setStep(STEPS[i - 1]); }
  };

  const pickClinic = (id: string) => {
    setDraft(d => (d.clinicId === id ? d : { ...d, clinicId: id, doctorId: '', department: '' }));
    setDoctorQ('');
  };
  const pickDoctor = (id: string) => {
    const doc = doctorOf(id);
    setDraft(d => (d.doctorId === id ? d : { ...d, doctorId: id, department: doc?.department ?? '' }));
  };

  const goReview = () => {
    setTouched(true);
    if (deptErr || reasonErr) return;
    setStep('review');
  };

  const save = async () => {
    if (submitting || !ready) return;
    setSubmitting(true); setSaveError(null);
    try {
      await saveFollowUp({ id: draft.id, clinicId: draft.clinicId, doctorId: draft.doctorId, department: dept, reason });
      setJustSaved(draft.id ? 'تم تحديث المتابعة على هذا الجهاز.' : 'تم حفظ المتابعة على هذا الجهاز.');
      resetFlow(); setStep('list');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'تعذر حفظ المتابعة. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setRemovingId(id); setRemoveError(null);
    try { await removeFollowUp(id); setConfirmId(null); setJustSaved(null); }
    catch (e) { setRemoveError(e instanceof Error ? e.message : 'تعذر حذف المتابعة.'); }
    finally { setRemovingId(null); }
  };

  const stepIndex = STEPS.indexOf(step);
  const sorted = useMemo(() => [...followUps].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [followUps]);

  const renderList = () => (
    <>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.title}>العيادات</Text>
          <Text style={styles.sub}>رتّب متابعات والدك مع الأطباء في مكان واحد</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}><Icon name="clinic" size={22} color={colors.surface} /></View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.heroLabel}>المتابعات المحفوظة</Text>
          <Text style={styles.heroValue}>{ready ? (sorted.length ? `${num(sorted.length)} ${sorted.length === 1 ? 'متابعة' : 'متابعات'}` : 'لا توجد متابعات بعد') : 'جارٍ التحميل…'}</Text>
        </View>
        <Pressable testID="clinic-add" accessibilityRole="button" accessibilityLabel="إضافة متابعة" disabled={!ready}
          onPress={startNew} style={({ pressed }) => [styles.heroBtn, !ready && ui.disabled, pressed && ui.pressed]}>
          <Icon name="plus" size={16} />
          <Text style={styles.heroBtnText}>إضافة متابعة</Text>
        </Pressable>
      </View>

      {justSaved ? <Banner testID="clinic-saved-banner">{justSaved}</Banner> : null}
      {error ? <Banner tone="warning">{error}</Banner> : null}
      {removeError ? <Banner tone="danger">{removeError}</Banner> : null}

      {!ready ? (
        [0, 1].map(i => <View key={i} style={[styles.card, styles.skeleton]} />)
      ) : !sorted.length ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="clinic" size={28} /></View>
          <Text style={ui.strong}>لم تُضف أي متابعة بعد</Text>
          <Text style={[ui.label, { textAlign: 'center' }]}>اختر عيادة وطبيبًا واكتب سبب المتابعة لتتذكره في الزيارة القادمة.</Text>
          <Btn testID="clinic-add-empty" label="إضافة متابعة" icon="plus" onPress={startNew} />
        </View>
      ) : (
        sorted.map(f => {
          const c = clinicOf(f.clinicId);
          const d = doctorOf(f.doctorId);
          const confirming = confirmId === f.id;
          return (
            <View key={f.id} style={styles.card} testID={`clinic-followup-${f.id}`}>
              <View style={styles.cardTop}>
                <View style={styles.optIcon}><Icon name="clinic" size={20} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.optTitle}>{d?.name ?? 'طبيب غير متوفر'}</Text>
                  <Text style={styles.optSub}>{f.department} · {c?.name ?? 'عيادة غير متوفرة'}</Text>
                </View>
              </View>
              <Text style={styles.reason}>{f.reason}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.localPill}><Icon name="check" size={12} color={colors.success} width={2.4} /><Text style={styles.localText}>محفوظ على هذا الجهاز</Text></View>
                <Text style={ui.label}>{formatDate(f.createdAt)}</Text>
              </View>
              {confirming ? (
                <View style={styles.confirm} accessibilityLiveRegion="polite">
                  <Text style={[ui.strong, { color: colors.deleteText }]}>حذف هذه المتابعة من هذا الجهاز؟</Text>
                  <View style={styles.actions}>
                    <Pressable testID={`clinic-remove-confirm-${f.id}`} accessibilityRole="button" accessibilityLabel="تأكيد الحذف"
                      disabled={removingId === f.id} onPress={() => remove(f.id)} style={[styles.smallBtn, styles.dangerBtn, removingId === f.id && ui.disabled]}>
                      <Text style={[styles.smallText, { color: colors.surface }]}>{removingId === f.id ? 'جارٍ الحذف…' : 'نعم، احذف'}</Text>
                    </Pressable>
                    <Pressable testID={`clinic-remove-cancel-${f.id}`} accessibilityRole="button" accessibilityLabel="تراجع عن الحذف"
                      disabled={removingId === f.id} onPress={() => setConfirmId(null)} style={styles.smallBtn}>
                      <Text style={styles.smallText}>تراجع</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.actions}>
                  <Pressable testID={`clinic-edit-${f.id}`} accessibilityRole="button" accessibilityLabel={`عرض وتعديل متابعة ${d?.name ?? ''}`}
                    onPress={() => startEdit(f.id)} style={styles.smallBtn}>
                    <Text style={styles.smallText}>عرض وتعديل</Text>
                  </Pressable>
                  <Pressable testID={`clinic-remove-${f.id}`} accessibilityRole="button" accessibilityLabel={`حذف متابعة ${d?.name ?? ''}`}
                    onPress={() => { setConfirmId(f.id); setRemoveError(null); }} style={styles.smallBtn}>
                    <Text style={[styles.smallText, { color: colors.deleteText }]}>حذف</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}

      <Banner>نسخة عرض: العيادات والأطباء أمثلة توضيحية غير موثّقة. استخدم بيانات تجريبية فقط؛ لا يُرسل أي شيء لأي طبيب أو عيادة.</Banner>
    </>
  );

  const renderFlow = () => (
    <>
      <View style={styles.flowHead}>
        <Pressable testID="clinic-back" accessibilityRole="button" accessibilityLabel="رجوع" onPress={back} hitSlop={6} style={styles.iconBtn}>
          <View style={{ transform: [{ scaleX: -1 }] }}><Icon name="chevron" size={18} /></View>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.flowTitle}>{draft.id ? 'تعديل متابعة' : 'متابعة جديدة'}</Text>
          <Text style={styles.sub}>الخطوة {num(stepIndex + 1)} من {num(STEPS.length)} · {STEP_LABEL[step]}</Text>
        </View>
        <Pressable testID="clinic-cancel" accessibilityRole="button" accessibilityLabel="إلغاء والعودة للقائمة دون حفظ" onPress={cancel} style={styles.cancelBtn}>
          <Text style={styles.smallText}>إلغاء</Text>
        </Pressable>
      </View>
      <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {STEPS.map((s, i) => <View key={s} style={[styles.progSeg, i <= stepIndex && { backgroundColor: colors.primary }]} />)}
      </View>

      {step === 'clinic' ? (
        <>
          <Text style={styles.q}>في أي عيادة يتابع والدك؟</Text>
          <SearchBox testID="clinic-search" value={clinicQ} onChange={setClinicQ} label="ابحث باسم العيادة أو المنطقة" />
          {clinics.map(c => (
            <Option key={c.id} testID={`clinic-select-${c.id}`} icon="clinic" title={c.name} sub={`${c.area} · ${c.description}`}
              selected={draft.clinicId === c.id} onPress={() => pickClinic(c.id)} />
          ))}
          {!clinics.length ? (
            <View style={styles.empty}>
              <Text style={ui.strong}>لا توجد عيادة بهذا الاسم</Text>
              <Btn label="مسح البحث" variant="outline" onPress={() => setClinicQ('')} />
            </View>
          ) : null}
          <Btn testID="clinic-next-doctor" label="التالي: اختيار الطبيب" disabled={!draft.clinicId} onPress={() => setStep('doctor')} />
        </>
      ) : null}

      {step === 'doctor' ? (
        <>
          <Text style={styles.q}>أطباء {clinic?.name ?? 'العيادة'}</Text>
          {clinicDoctors.length > 3 ? <SearchBox testID="doctor-search" value={doctorQ} onChange={setDoctorQ} label="ابحث باسم الطبيب أو التخصص" /> : null}
          {doctors.map(d => (
            <Option key={d.id} testID={`doctor-select-${d.id}`} icon="doc" title={d.name} sub={d.department}
              selected={draft.doctorId === d.id} onPress={() => pickDoctor(d.id)} />
          ))}
          {!doctors.length ? (
            <View style={styles.empty}>
              <Text style={ui.strong}>{clinicDoctors.length ? 'لا يوجد طبيب بهذا الاسم' : 'لا يوجد أطباء مسجلون لهذه العيادة'}</Text>
              {clinicDoctors.length ? <Btn label="مسح البحث" variant="outline" onPress={() => setDoctorQ('')} /> : <Btn label="اختيار عيادة أخرى" variant="outline" onPress={() => setStep('clinic')} />}
            </View>
          ) : null}
          <Btn testID="clinic-next-details" label="التالي: سبب المتابعة" disabled={!draft.doctorId} onPress={() => setStep('details')} />
        </>
      ) : null}

      {step === 'details' ? (
        <>
          <Text style={styles.q}>ما الذي تريد متابعته مع {doctor?.name ?? 'الطبيب'}؟</Text>
          <View style={styles.formCard}>
            <Field testID="clinic-department" label="القسم" value={draft.department} max={60}
              onChange={t => setDraft(d => ({ ...d, department: t }))} error={touched ? deptErr : undefined}
              hint="مُعبّأ من تخصص الطبيب، ويمكنك تعديله." />
            <Field testID="clinic-reason" label="سبب المتابعة" value={draft.reason} max={160} multiline
              onChange={t => setDraft(d => ({ ...d, reason: t }))} error={touched ? reasonErr : undefined}
              hint="مثال: مراجعة نتيجة تحليل السكر التراكمي." />
          </View>
          <Btn testID="clinic-review" label="مراجعة المتابعة" onPress={goReview} />
        </>
      ) : null}

      {step === 'review' ? (
        <>
          <Text style={styles.q}>راجع قبل الحفظ</Text>
          <View style={styles.formCard}>
            <Row label="العيادة" value={clinic ? `${clinic.name} · ${clinic.area}` : 'غير متوفرة'} />
            <Row label="الطبيب" value={doctor?.name ?? 'غير متوفر'} />
            <Row label="القسم" value={dept} />
            <Row label="السبب" value={reason} />
            <View style={styles.actions}>
              <Pressable testID="clinic-change-clinic" accessibilityRole="button" accessibilityLabel="تغيير العيادة" onPress={() => setStep('clinic')} style={styles.smallBtn}><Text style={styles.smallText}>تغيير العيادة</Text></Pressable>
              <Pressable testID="clinic-change-doctor" accessibilityRole="button" accessibilityLabel="تغيير الطبيب" onPress={() => setStep('doctor')} style={styles.smallBtn}><Text style={styles.smallText}>تغيير الطبيب</Text></Pressable>
              <Pressable testID="clinic-change-details" accessibilityRole="button" accessibilityLabel="تعديل القسم والسبب" onPress={() => setStep('details')} style={styles.smallBtn}><Text style={styles.smallText}>تعديل السبب</Text></Pressable>
            </View>
          </View>
          <Banner tone="warning">تُحفظ هذه المتابعة على هذا الجهاز فقط. لن يُبلَّغ أي طبيب أو عيادة، ولا يحصل أحد على وصول لملف والدك، وهذا ليس حجزًا لموعد.</Banner>
          {saveError ? <Banner tone="danger" testID="clinic-save-error">{saveError}</Banner> : null}
          <Btn testID="clinic-save" label={submitting ? 'جارٍ الحفظ…' : draft.id ? 'حفظ التعديلات' : 'تأكيد وحفظ'}
            disabled={submitting || !ready || !clinic || !doctor || !!deptErr || !!reasonErr} onPress={save} />
        </>
      ) : null}
    </>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.root} testID="clinics-screen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {step === 'list' ? renderList() : renderFlow()}
        </ScrollView>
      </KeyboardAvoidingView>
      <MainNavigation active="clinics" onHome={() => navigation.popTo('Home')} onClinics={() => undefined}
        onPharmacy={() => navigation.popTo('Pharmacy')} onMedications={() => navigation.popTo('Medications')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center' },
  title: { fontFamily: fonts.semiBold, fontSize: 22, color: colors.text, textAlign: 'right' },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  hero: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, flexWrap: 'wrap' },
  heroIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  heroLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryLight, textAlign: 'right' },
  heroValue: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.surface, textAlign: 'right' },
  heroBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, minHeight: 40 },
  heroBtnText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, ...shadow.soft },
  skeleton: { height: 128, backgroundColor: colors.primarySoftBg, shadowOpacity: 0, elevation: 0 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  reason: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: colors.text, textAlign: 'right', backgroundColor: colors.inputBg, borderRadius: radius.sm, padding: spacing.md },
  cardMeta: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  localPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: colors.successBg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  localText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.success },
  actions: { flexDirection: 'row-reverse', gap: spacing.sm, flexWrap: 'wrap' },
  smallBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.chipBorder, justifyContent: 'center', backgroundColor: colors.surface },
  dangerBtn: { backgroundColor: colors.danger, borderColor: colors.danger },
  smallText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primary },
  confirm: { gap: spacing.sm, backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primarySoftBg, alignItems: 'center', justifyContent: 'center' },
  flowHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  flowTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  progress: { flexDirection: 'row-reverse', gap: 6 },
  progSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.divider },
  q: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, textAlign: 'right', marginTop: spacing.xs },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, minHeight: 52 },
  searchInput: { flex: 1, minHeight: 48, fontFamily: fonts.regular, fontSize: 15, color: colors.text, writingDirection: 'rtl' },
  option: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1.5, borderColor: 'transparent' },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primarySoftBg },
  optIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, textAlign: 'right' },
  optSub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.chipBorder, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  formCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
  fieldHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.text, textAlign: 'right' },
  counter: { fontFamily: fonts.regular, fontSize: 12, color: colors.textFaint },
  input: { minHeight: 50, borderRadius: radius.md, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.inputBg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.regular, fontSize: 15, color: colors.text, writingDirection: 'rtl' },
  err: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger, textAlign: 'right' },
  row: { gap: 2, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: spacing.sm },
  rowLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.textMuted, textAlign: 'right' },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, textAlign: 'right' },
});
