import type { AccountPlan, PlanId } from '../../constants/subscriptions';
import { toArabicDigits } from '../../utils/arabic';

export const egp = (n: number) => `${toArabicDigits(n)} جنيه`;

export function priceLabel(plan: AccountPlan) {
  if (plan.amountEGP === null) return 'السعر لم يُحدد بعد';
  if (plan.amountEGP === 0) return egp(0);
  return `${egp(plan.amountEGP)} شهريًا`;
}

export const canPurchase = (plan: AccountPlan) => plan.amountEGP !== null;
export const needsPayment = (plan: AccountPlan) => (plan.amountEGP ?? 0) > 0;

export function planMenuLabel(id: PlanId) {
  if (id === 'free') return 'اشتراك مجاني';
  if (id === 'advanced') return 'اشتراك متقدم (تجريبي)';
  return 'اشتراك مميز (تجريبي)';
}

export function formatArDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'غير متوفر';
  try {
    return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
  } catch {
    return toArabicDigits(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
  }
}
