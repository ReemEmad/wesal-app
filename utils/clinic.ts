import { Ionicons } from '@expo/vector-icons';

import type { AppointmentStatus, Patient, PatientNote, PatientStatus } from '../context/ClinicContext';
import { colors } from '../theme';
import { formatClock, toArabicDigits } from './arabic';

export type IconName = keyof typeof Ionicons.glyphMap;

export type BadgeStyle = { label: string; background: string; foreground: string; icon: IconName };

export const PATIENT_STATUS: Record<PatientStatus, BadgeStyle> = {
  adherent: { label: 'ملتزم', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  stable: { label: 'مستقر', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  needsFollowUp: {
    label: 'يحتاج متابعة',
    background: colors.stockLowBg,
    foreground: colors.stockLow,
    icon: 'time-outline',
  },
};

export const APPOINTMENT_STATUS: Record<AppointmentStatus, BadgeStyle> = {
  confirmed: { label: 'مؤكد', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  pending: {
    label: 'بانتظار التأكيد',
    background: colors.primaryLight,
    foreground: colors.primary,
    icon: 'time-outline',
  },
  needsFollowUp: {
    label: 'يحتاج متابعة',
    background: colors.stockLowBg,
    foreground: colors.stockLow,
    icon: 'time-outline',
  },
  completed: { label: 'تمت', background: colors.successBg, foreground: colors.success, icon: 'checkmark-circle-outline' },
  cancelled: { label: 'ملغي', background: colors.dangerBg, foreground: colors.danger, icon: 'close-circle-outline' },
};

export const NOTE_KIND: Record<PatientNote['kind'], BadgeStyle> = {
  diagnosis: { label: 'تشخيص', background: colors.infoBg, foreground: colors.info, icon: 'checkmark-circle-outline' },
  followUp: { label: 'للمتابعة', background: colors.primaryLight, foreground: colors.primary, icon: 'time-outline' },
  relative: { label: 'من قريب', background: colors.stockLowBg, foreground: colors.stockLow, icon: 'time-outline' },
};

export function relativesLabel(count: number): string {
  if (count === 0) return 'لا يوجد أقارب';
  if (count === 1) return 'قريب واحد';
  if (count === 2) return 'قريبان';
  return `${toArabicDigits(count)} أقارب`;
}

export function adherenceColor(patient: Pick<Patient, 'status'>): string {
  return patient.status === 'needsFollowUp' ? colors.adherenceLow : colors.primary;
}

export function percentText(value: number): string {
  return `${toArabicDigits(Math.round(value))}٪`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join(' ');
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function minutesOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return date.getHours() * 60 + date.getMinutes();
}

export function formatTime(timestamp: number): string {
  return formatClock(minutesOfDay(timestamp));
}

const arabicDate = (options: Intl.DateTimeFormatOptions) => (timestamp: number) =>
  new Intl.DateTimeFormat('ar-EG', options).format(new Date(timestamp));

export const formatWeekday = arabicDate({ weekday: 'long' });
export const formatDayMonth = arabicDate({ day: 'numeric', month: 'long' });
export const formatFullDate = arabicDate({ day: 'numeric', month: 'long', year: 'numeric' });
export const formatWeekdayDayMonth = arabicDate({ weekday: 'long', day: 'numeric', month: 'long' });
export const formatDayNumber = arabicDate({ day: 'numeric' });

/** "اليوم · ٩:٥٠ ص" / "أمس · ٦:٣٠ م" / "١٢ سبتمبر · ٩:٣٠ ص" */
export function formatWhen(timestamp: number, now = Date.now()): string {
  const time = formatTime(timestamp);
  if (isSameDay(timestamp, now)) return `اليوم · ${time}`;
  if (isSameDay(timestamp, addDays(now, -1))) return `أمس · ${time}`;
  return `${formatDayMonth(timestamp)} · ${time}`;
}

/** "اليوم" / "أمس" / "منذ ٣ أيام" */
export function formatSince(timestamp: number, now = Date.now()): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / DAY_MS);
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'أمس';
  if (days === 2) return 'منذ يومين';
  return `منذ ${toArabicDigits(days)} أيام`;
}

/** mm:ss in Arabic digits for the session timer */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return toArabicDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}

export function dialNumber(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function diseasesCountText(count: number): string {
  if (count === 0) return 'لا توجد أمراض مسجّلة';
  if (count === 1) return 'مرض واحد';
  if (count === 2) return 'مرضان';
  if (count <= 10) return `${toArabicDigits(count)} أمراض`;
  return `${toArabicDigits(count)} مرضًا`;
}
