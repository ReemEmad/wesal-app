import { MealTiming, Medication, MedicationDraft } from '../context/MedicationsContext';
import { formatClock, formatQuantity, toArabicDigits } from './arabic';

const MEAL_LABELS: Record<MealTiming, string> = {
  before: 'قبل الأكل',
  with: 'مع الأكل',
  after: 'بعد الأكل',
};

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function mealLabel(timing: MealTiming): string {
  return MEAL_LABELS[timing];
}

export function timingText(med: MedicationDraft): string {
  return med.customTiming ?? MEAL_LABELS[med.mealTiming];
}

export function doseText(med: MedicationDraft): string {
  const q = med.quantity;
  if (med.form === 'tablet') {
    if (q === 1) return 'قرص واحد';
    if (q === 2) return 'قرصان';
    if (q === 0.5) return 'نصف قرص';
    return `${formatQuantity(q)} أقراص`;
  }
  if (med.form === 'capsule') {
    if (q === 1) return 'كبسولة واحدة';
    if (q === 2) return 'كبسولتان';
    return `${formatQuantity(q)} كبسولات`;
  }
  return `${formatQuantity(q)} ${med.unit}`;
}

export function frequencyText(med: MedicationDraft): string {
  if (med.weeklyDay !== undefined) return 'أسبوعيًا';
  if (med.frequency === 1) return 'مرة يوميًا';
  if (med.frequency === 2) return 'مرتين يوميًا';
  return `${toArabicDigits(3)} مرات يوميًا`;
}

export function scheduleSummary(med: MedicationDraft): string {
  return `${doseText(med)} ${timingText(med)} · ${frequencyText(med)}`;
}

export function timesText(med: MedicationDraft): string {
  const times = med.times.map(formatClock);
  const joined = times.join(' و ');
  return med.weeklyDay !== undefined ? `${WEEKDAYS[med.weeklyDay]} ${joined}` : joined;
}

export function durationText(duration: MedicationDraft['duration']): string {
  if (duration === 'ongoing') return 'مستمر';
  if (duration === 7) return `${toArabicDigits(7)} أيام`;
  return `${toArabicDigits(duration)} يومًا`;
}

export function stockUnitText(med: MedicationDraft): string {
  if (med.form === 'tablet') return 'قرصًا';
  if (med.form === 'capsule') return 'كبسولة';
  return med.unit;
}

export function stockText(med: MedicationDraft): string {
  return `${toArabicDigits(med.stock)} ${stockUnitText(med)}`;
}

export function stockDays(med: MedicationDraft): number {
  const perDose = med.quantity > 0 ? med.quantity : 1;
  if (med.weeklyDay !== undefined) return Math.floor((med.stock / perDose) * 7);
  return Math.floor(med.stock / (med.frequency * perDose));
}

export function stockDaysText(med: MedicationDraft): string {
  return `يكفي حوالي ${toArabicDigits(stockDays(med))} يومًا بالجرعة الحالية`;
}

export function isStockLow(med: Medication): boolean {
  return med.lowStockAlert && stockDays(med) <= 7;
}

export function isExpired(med: Medication, now = new Date()): boolean {
  if (med.duration === 'ongoing') return false;
  const end = med.startDate + med.duration * 24 * 60 * 60 * 1000;
  return end < now.getTime();
}

export function hasDoseToday(med: Medication, now = new Date()): boolean {
  if (med.status !== 'active' || isExpired(med, now)) return false;
  return med.weeklyDay === undefined || med.weeklyDay === now.getDay();
}

export type NextDose = {
  dayLabel: string;
  time: string;
  relative: string;
};

export function nextDose(med: Medication, now = new Date()): NextDose | null {
  if (med.status !== 'active') return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();
  const daysAhead = med.weeklyDay === undefined ? 0 : (med.weeklyDay - today + 7) % 7;

  const sorted = [...med.times].sort((a, b) => a - b);
  let dayOffset = daysAhead;
  let target = sorted.find((minutes) => dayOffset > 0 || minutes > nowMinutes);
  if (target === undefined) {
    dayOffset = med.weeklyDay === undefined ? 1 : 7;
    target = sorted[0];
  }

  const diff = dayOffset * 1440 + target - nowMinutes;
  const dayLabel = dayOffset === 0 ? 'اليوم' : dayOffset === 1 ? 'غدًا' : WEEKDAYS[(today + dayOffset) % 7];

  let relative: string;
  if (diff < 60) relative = `بعد ${toArabicDigits(Math.max(diff, 1))} دقيقة`;
  else if (diff < 1440) {
    const hours = Math.round(diff / 60);
    relative = hours === 1 ? 'بعد ساعة' : hours === 2 ? 'بعد ساعتين' : `بعد ${toArabicDigits(hours)} ساعات`;
  } else {
    const days = Math.round(diff / 1440);
    relative = days === 1 ? 'بعد يوم' : `بعد ${toArabicDigits(days)} أيام`;
  }

  return { dayLabel, time: formatClock(target), relative };
}

export const MEAL_OPTIONS: { key: MealTiming; label: string }[] = [
  { key: 'before', label: MEAL_LABELS.before },
  { key: 'with', label: MEAL_LABELS.with },
  { key: 'after', label: MEAL_LABELS.after },
];
