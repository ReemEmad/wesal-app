export type PlanId = 'free' | 'advanced' | 'premium';
export type AccountPlan = {
  id: PlanId;
  name: string;
  subtitle: string;
  amountEGP: number | null;
  features: string[];
  elderLimit: 2 | 4;
  badge?: string;
};
export type DemoPlanSelection = { planId: PlanId; changedAt: string; mode: 'demo' };

// Approved by the user: monthly EGP pricing, not clinic-specific duration plans.
export const ACCOUNT_PLANS: AccountPlan[] = [
  {
    id: 'free', name: 'مجانية', subtitle: 'لرعاية أساسية واطمئنان يومي', amountEGP: 0, elderLimit: 2,
    features: ['متابعة الأدوية', 'رسائل صوتية', 'البحث عن الصيدليات والعيادات', 'حتى 2 من كبار السن'],
  },
  {
    id: 'advanced', name: 'متقدمة', subtitle: 'للمتابعة والتحليل بشكل أفضل', amountEGP: 50, elderLimit: 2,
    features: ['كل مميزات المجانية، بالإضافة إلى:', 'إحصائيات وتقارير الحالة', 'تحليل نسبة الالتزام بالأدوية', 'إشعارات داعمة للصحة النفسية'],
  },
  {
    id: 'premium', name: 'مميزة', subtitle: 'رعاية عائلية متكاملة', amountEGP: 100, elderLimit: 4, badge: 'الأكثر شمولًا',
    features: ['كل مميزات المتقدمة، بالإضافة إلى:', 'مشاركة أفراد العائلة في المتابعة', 'تنظيم المتابعة بالتناوب', 'حتى 4 من كبار السن'],
  },
];
export function isPlanId(value: unknown): value is PlanId {
  return ACCOUNT_PLANS.some(plan => plan.id === value);
}
