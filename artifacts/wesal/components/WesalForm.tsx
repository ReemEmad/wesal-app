import React, { useState, type PropsWithChildren, type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tokens } from '../constants/tokens';

const c = tokens.colors;

/* ---------- Screen shell ---------- */

export function FormScreen({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.blobMist} />
        <View style={styles.blobSand} />
      </View>
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.flex, Platform.OS === 'web' && styles.webSafe]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.column}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function Wordmark() {
  return (
    <Image
      accessible
      accessibilityLabel="وصال"
      source={require('../assets/images/wesal-wordmark.png')}
      resizeMode="contain"
      style={styles.wordmark}
    />
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.titleBlock}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function OrDivider() {
  return (
    <View style={styles.divider} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>أو</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

/* ---------- Messages ---------- */

export function InfoNote({
  title,
  children,
  tone = 'calm',
  testID,
}: PropsWithChildren<{ title?: string; tone?: 'calm' | 'warning' | 'danger' | 'success'; testID?: string }>) {
  const toneStyle = {
    calm: styles.noteCalm,
    warning: styles.noteWarning,
    danger: styles.noteDanger,
    success: styles.noteSuccess,
  }[tone];
  const titleColor = { calm: c.primary, warning: c.warning, danger: c.danger, success: c.success }[tone];
  return (
    <View
      testID={testID}
      style={[styles.note, toneStyle]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion={tone === 'danger' ? 'polite' : undefined}
    >
      {title ? (
        <View style={styles.noteHead}>
          <View style={[styles.shield, { borderColor: titleColor }]} />
          <Text style={[styles.noteTitle, { color: titleColor }]}>{title}</Text>
        </View>
      ) : null}
      <Text style={styles.noteBody}>{children}</Text>
    </View>
  );
}

/* ---------- Field ---------- */

type FieldProps = TextInputProps & {
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string | null;
  testID: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  ltr?: boolean;
};

export function Field({
  label,
  optionalLabel,
  hint,
  error,
  testID,
  leading,
  trailing,
  ltr,
  style,
  ...input
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optionalLabel ? <Text style={styles.optional}>{`  (${optionalLabel})`}</Text> : null}
      </Text>
      <View
        style={[
          styles.inputBox,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {leading}
        <TextInput
          {...input}
          testID={testID}
          accessibilityLabel={optionalLabel ? `${label} ${optionalLabel}` : label}
          accessibilityHint={hint}
          placeholderTextColor="#9b96a2"
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[styles.input, ltr && styles.inputLtr, style]}
          textAlign="right"
        />
        {trailing}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function PasswordField(props: Omit<FieldProps, 'secureTextEntry' | 'trailing'>) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      leading={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
          style={styles.inlineAction}
          testID={`${props.testID}-toggle`}
        >
          <Text style={styles.inlineActionText}>{visible ? 'إخفاء' : 'إظهار'}</Text>
        </Pressable>
      }
    />
  );
}

/* ---------- Phone ---------- */

export const COUNTRY_CODES = [
  { code: '+20', name: 'مصر' },
  { code: '+966', name: 'السعودية' },
  { code: '+971', name: 'الإمارات' },
  { code: '+962', name: 'الأردن' },
  { code: '+965', name: 'الكويت' },
  { code: '+974', name: 'قطر' },
];

const ARABIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;
export function toLatinDigits(value: string) {
  return value.replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf) % 10));
}

/** Returns an E.164-style number or null. Local numbers drop their leading 0. */
export function normalizePhone(countryCode: string, raw: string): string | null {
  const text = toLatinDigits(raw.trim());
  let full: string;
  if (text.startsWith('+') || text.startsWith('00')) {
    full = '+' + text.replace(/\D/g, '').replace(/^00/, '');
  } else {
    const local = text.replace(/\D/g, '').replace(/^0+/, '');
    if (!local) return null;
    full = countryCode + local;
  }
  if (!/^\+\d{8,15}$/.test(full)) return null;
  if (full.startsWith('+20') && !/^\+201[0125]\d{8}$/.test(full)) return null;
  return full;
}

export function PhoneField({
  countryCode,
  onCountryCodeChange,
  ...props
}: Omit<FieldProps, 'leading' | 'keyboardType' | 'ltr'> & {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Field
        {...props}
        ltr
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`رمز الدولة ${countryCode}، اضغط للتغيير`}
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((o) => !o)}
            style={styles.codeChip}
            testID={`${props.testID}-country`}
          >
            <Text style={styles.codeText}>{countryCode}</Text>
            <Chevron open={open} />
          </Pressable>
        }
      />
      {open ? (
        <View style={styles.codeList} accessibilityRole="radiogroup">
          {COUNTRY_CODES.map((item) => {
            const selected = item.code === countryCode;
            return (
              <Pressable
                key={item.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  onCountryCodeChange(item.code);
                  setOpen(false);
                }}
                style={[styles.chip, selected && styles.chipOn]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                  {item.name} {item.code}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/* ---------- Date ---------- */

export type DateParts = { day: string; month: string; year: string };

export function validateBirthDate(parts: DateParts): { value: string | null; error: string | null } {
  const d = toLatinDigits(parts.day).trim();
  const m = toLatinDigits(parts.month).trim();
  const y = toLatinDigits(parts.year).trim();
  if (!d && !m && !y) return { value: null, error: 'أدخل تاريخ الميلاد.' };
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return { value: null, error: 'اكتب اليوم والشهر بالأرقام، والسنة بأربعة أرقام.' };
  }
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    month < 1 ||
    month > 12 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { value: null, error: 'هذا التاريخ غير موجود في التقويم.' };
  }
  if (year < 1900 || date.getTime() > Date.now()) {
    return { value: null, error: 'تاريخ الميلاد يجب أن يكون بين 1900 واليوم.' };
  }
  const iso = `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { value: iso, error: null };
}

export function DateField({
  value,
  onChange,
  error,
  testID,
  label,
}: {
  value: DateParts;
  onChange: (next: DateParts) => void;
  error?: string | null;
  testID: string;
  label: string;
}) {
  const part = (key: keyof DateParts, placeholder: string, maxLength: number, a11y: string) => (
    <TextInput
      testID={key === 'day' ? testID : `${testID}-${key}`}
      accessibilityLabel={`${label}: ${a11y}`}
      value={value[key]}
      onChangeText={(t) => onChange({ ...value, [key]: toLatinDigits(t).replace(/\D/g, '') })}
      keyboardType="number-pad"
      maxLength={maxLength}
      placeholder={placeholder}
      placeholderTextColor="#9b96a2"
      textAlign="center"
      style={[styles.datePart, key === 'year' && styles.dateYear]}
    />
  );
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, styles.dateRow, !!error && styles.inputError]}>
        {part('day', 'يوم', 2, 'اليوم')}
        <Text style={styles.dateSep}>/</Text>
        {part('month', 'شهر', 2, 'الشهر')}
        <Text style={styles.dateSep}>/</Text>
        {part('year', 'سنة', 4, 'السنة')}
        <CalendarGlyph />
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------- Relationship ---------- */

export const RELATIONSHIPS = [
  { value: 'father', label: 'الأب' },
  { value: 'mother', label: 'الأم' },
  { value: 'spouse', label: 'الزوج / الزوجة' },
  { value: 'relative', label: 'قريب' },
  { value: 'friend', label: 'صديق' },
  { value: 'other', label: 'صلة أخرى' },
] as const;

export type RelationshipValue = (typeof RELATIONSHIPS)[number]['value'];

export function relationshipLabel(value: string) {
  return RELATIONSHIPS.find((r) => r.value === value)?.label ?? 'صلة أخرى';
}

export function RelationshipField({
  value,
  onChange,
  error,
  testID,
}: {
  value: RelationshipValue | null;
  onChange: (v: RelationshipValue) => void;
  error?: string | null;
  testID: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>صلة القرابة</Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`صلة القرابة: ${value ? relationshipLabel(value) : 'لم تُختر بعد'}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={[styles.inputBox, styles.selectBox, !!error && styles.inputError]}
      >
        <Chevron open={open} />
        <Text style={[styles.input, !value && styles.placeholder]}>
          {value ? relationshipLabel(value) : 'اختر صلة القرابة'}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.optionList} accessibilityRole="radiogroup">
          {RELATIONSHIPS.map((r) => {
            const selected = r.value === value;
            return (
              <Pressable
                key={r.value}
                testID={`${testID}-${r.value}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  onChange(r.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, selected && styles.optionOn, pressed && styles.pressed]}
              >
                <View style={[styles.radio, selected && styles.radioOn]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextOn]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/* ---------- Consent ---------- */

export function ConsentCheckbox({
  checked,
  onChange,
  label,
  testID,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  testID: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={styles.consent}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <View style={styles.tick} /> : null}
      </View>
      <Text style={styles.consentText}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Glyphs (drawn, no icon font dependency) ---------- */

export function Chevron({ open, color = c.secondaryText }: { open?: boolean; color?: string }) {
  return (
    <View
      style={[
        styles.chevron,
        { borderColor: color, transform: [{ rotate: open ? '-135deg' : '45deg' }] },
      ]}
    />
  );
}

function CalendarGlyph() {
  return (
    <View style={styles.calendar} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.calendarTop} />
    </View>
  );
}

export function Initials({ name, size = 56 }: { name: string; size?: number }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]).join(' ');
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.initials, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initialsText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background, overflow: 'hidden' },
  flex: { flex: 1 },
  webSafe: { paddingTop: 24, paddingBottom: 34 },
  scroll: { flexGrow: 1, paddingHorizontal: tokens.space.medium, paddingBottom: 32 },
  column: { width: '100%', maxWidth: 440, alignSelf: 'center', flexGrow: 1 },
  blobMist: {
    position: 'absolute',
    left: -90,
    bottom: -120,
    width: 280,
    height: 200,
    borderRadius: 160,
    backgroundColor: c.mist,
    opacity: 0.7,
  },
  blobSand: {
    position: 'absolute',
    right: -110,
    bottom: -100,
    width: 260,
    height: 190,
    borderRadius: 160,
    backgroundColor: c.sand,
    opacity: 0.75,
  },
  wordmark: { width: 120, height: 42, alignSelf: 'center', marginTop: 20 },
  titleBlock: { marginTop: 22, marginBottom: 12, alignItems: 'center' },
  title: {
    fontFamily: tokens.typography.semiBold,
    fontSize: 24,
    lineHeight: 36,
    color: c.primary,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  subtitle: {
    marginTop: 8,
    fontFamily: tokens.typography.regular,
    fontSize: 16,
    lineHeight: 26,
    color: c.secondaryText,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.fieldBorder },
  dividerText: {
    marginHorizontal: 14,
    color: c.secondaryText,
    fontFamily: tokens.typography.regular,
    fontSize: 14,
  },
  note: { borderRadius: 14, padding: 14, marginTop: 8 },
  noteCalm: { backgroundColor: c.decorative },
  noteWarning: { backgroundColor: c.warningSoft },
  noteDanger: { backgroundColor: c.dangerSoft },
  noteSuccess: { backgroundColor: c.successSoft },
  noteHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  shield: {
    width: 13,
    height: 15,
    borderWidth: 1.6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  noteTitle: { fontFamily: tokens.typography.semiBold, fontSize: 15, writingDirection: 'rtl' },
  noteBody: {
    fontFamily: tokens.typography.regular,
    fontSize: 13.5,
    lineHeight: 22,
    color: c.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  field: { marginTop: 14 },
  label: {
    fontFamily: tokens.typography.semiBold,
    fontSize: 15,
    color: c.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 8,
  },
  optional: { fontFamily: tokens.typography.regular, color: c.secondaryText, fontSize: 13 },
  inputBox: {
    minHeight: 50,
    borderRadius: tokens.radius.field,
    borderWidth: 1,
    borderColor: c.fieldBorder,
    backgroundColor: c.field,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputFocused: { borderColor: c.primary },
  inputError: { borderColor: c.danger },
  input: {
    flex: 1,
    minHeight: 48,
    fontFamily: tokens.typography.regular,
    fontSize: 15,
    color: c.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'center',
    paddingVertical: Platform.OS === 'web' ? 12 : 0,
    lineHeight: Platform.OS === 'web' ? 22 : undefined,
  },
  inputLtr: { writingDirection: 'ltr' },
  placeholder: { color: '#9b96a2' },
  error: {
    marginTop: 6,
    color: c.danger,
    fontFamily: tokens.typography.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  hint: {
    marginTop: 6,
    color: c.secondaryText,
    fontFamily: tokens.typography.regular,
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inlineAction: { paddingVertical: 6, paddingRight: 10 },
  inlineActionText: { color: c.primary, fontFamily: tokens.typography.semiBold, fontSize: 13 },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: c.decorative,
  },
  codeText: { color: c.primary, fontFamily: tokens.typography.semiBold, fontSize: 14 },
  codeList: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: c.fieldBorder,
    backgroundColor: c.field,
  },
  chipOn: { borderColor: c.primary, backgroundColor: c.decorative },
  chipText: { fontFamily: tokens.typography.regular, fontSize: 13, color: c.text },
  chipTextOn: { color: c.primary, fontFamily: tokens.typography.semiBold },
  dateRow: { justifyContent: 'flex-end', gap: 4 },
  datePart: {
    width: 46,
    minHeight: 46,
    fontFamily: tokens.typography.regular,
    fontSize: 15,
    color: c.text,
  },
  dateYear: { width: 64 },
  dateSep: { color: c.secondaryText, fontSize: 15 },
  calendar: {
    marginLeft: 'auto',
    width: 17,
    height: 16,
    borderWidth: 1.5,
    borderColor: c.secondaryText,
    borderRadius: 3,
  },
  calendarTop: { height: 4, backgroundColor: c.secondaryText, opacity: 0.6 },
  selectBox: { justifyContent: 'space-between' },
  optionList: {
    marginTop: 8,
    borderRadius: tokens.radius.field,
    borderWidth: 1,
    borderColor: c.fieldBorder,
    backgroundColor: c.field,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.fieldBorder,
  },
  optionOn: { backgroundColor: c.decorative },
  pressed: { opacity: 0.7 },
  optionText: { fontFamily: tokens.typography.regular, fontSize: 15, color: c.text },
  optionTextOn: { color: c.primary, fontFamily: tokens.typography.semiBold },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: c.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: c.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary },
  consent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: c.primary,
    backgroundColor: c.field,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxOn: { backgroundColor: c.primary },
  tick: {
    width: 7,
    height: 12,
    borderRightWidth: 2.4,
    borderBottomWidth: 2.4,
    borderColor: c.white,
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
  },
  consentText: {
    flex: 1,
    fontFamily: tokens.typography.regular,
    fontSize: 15,
    lineHeight: 24,
    color: c.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chevron: { width: 8, height: 8, borderRightWidth: 1.6, borderBottomWidth: 1.6, marginTop: -3 },
  initials: { backgroundColor: c.decorative, alignItems: 'center', justifyContent: 'center' },
  initialsText: { color: c.primary, fontFamily: tokens.typography.semiBold },
});
