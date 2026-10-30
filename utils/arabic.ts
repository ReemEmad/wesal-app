const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

export function formatQuantity(value: number): string {
  return toArabicDigits(String(value).replace('.', ','));
}

export function formatClock(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 < 12 ? 'ص' : 'م';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${toArabicDigits(`${hours12}:${String(minutes).padStart(2, '0')}`)} ${suffix}`;
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
