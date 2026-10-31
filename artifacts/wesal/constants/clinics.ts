// Demonstration directory only. These entries are not verified healthcare providers.
export type Clinic = { id: string; name: string; area: string; description: string };
export type Doctor = { id: string; clinicId: string; name: string; department: string };
export type CareFollowUp = {
  id: string;
  clinicId: string;
  doctorId: string;
  department: string;
  reason: string;
  createdAt: string;
};
export type FollowUpInput = Omit<CareFollowUp, 'id' | 'createdAt'> & { id?: string };

export const CLINICS: Clinic[] = [
  { id: 'nile', name: 'عيادة النيل — نموذج', area: 'القاهرة · مثال تجريبي', description: 'متابعة الباطنة والقلب' },
  { id: 'garden', name: 'عيادة الروضة — نموذج', area: 'الجيزة · مثال تجريبي', description: 'متابعة العظام والأعصاب' },
  { id: 'horizon', name: 'عيادة الأفق — نموذج', area: 'القاهرة · مثال تجريبي', description: 'متابعة الباطنة والسكري' },
];
export const DOCTORS: Doctor[] = [
  { id: 'nile-internal', clinicId: 'nile', name: 'د. أحمد — نموذج', department: 'الباطنة' },
  { id: 'nile-heart', clinicId: 'nile', name: 'د. مريم — نموذج', department: 'القلب والأوعية الدموية' },
  { id: 'garden-bones', clinicId: 'garden', name: 'د. عمر — نموذج', department: 'العظام' },
  { id: 'garden-neuro', clinicId: 'garden', name: 'د. نور — نموذج', department: 'المخ والأعصاب' },
  { id: 'horizon-internal', clinicId: 'horizon', name: 'د. علي — نموذج', department: 'الباطنة' },
  { id: 'horizon-diabetes', clinicId: 'horizon', name: 'د. سلمى — نموذج', department: 'السكري والغدد الصماء' },
];

export function validateFollowUp(input: FollowUpInput): string | null {
  if (!CLINICS.some(clinic => clinic.id === input.clinicId)) return 'اختر عيادة من القائمة.';
  if (!DOCTORS.some(doctor => doctor.id === input.doctorId && doctor.clinicId === input.clinicId)) {
    return 'اختر طبيبًا تابعًا للعيادة المختارة.';
  }
  if (!input.department.trim() || input.department.length > 60) return 'اكتب القسم في حدود ٦٠ حرفًا.';
  if (!input.reason.trim() || input.reason.length > 160) return 'اكتب سبب المتابعة في حدود ١٦٠ حرفًا.';
  return null;
}
