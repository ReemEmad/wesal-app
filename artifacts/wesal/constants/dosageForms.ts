import { colors } from '../theme';

export type DosageForm = 'tablet' | 'capsule' | 'syrup' | 'injection';

export type DosageFormConfig = {
  key: DosageForm;
  label: string;
  icon: 'cancel' | 'pill' | 'flask-outline' | 'needle';
  tint: string;
  iconColor: string;
  quantityLabel: string;
  units: string[];
  quickPicks: number[];
  defaultQuantity: number;
  step: number;
  sampleName: string;
};

export const DOSAGE_FORMS: DosageFormConfig[] = [
  {
    key: 'tablet',
    label: 'أقراص',
    icon: 'cancel',
    tint: colors.tileLavender,
    iconColor: colors.primary,
    quantityLabel: 'عدد الأقراص فى كل جرعة',
    units: ['قرص'],
    quickPicks: [0.5, 1, 2, 3],
    defaultQuantity: 1,
    step: 0.5,
    sampleName: 'ميتفورمين ٥٠٠ مجم',
  },
  {
    key: 'capsule',
    label: 'كبسولات',
    icon: 'pill',
    tint: colors.tileBlue,
    iconColor: colors.tileBlueIcon,
    quantityLabel: 'عدد الكبسولات فى كل جرعة',
    units: ['كبسولة'],
    quickPicks: [1, 2, 3, 4],
    defaultQuantity: 1,
    step: 1,
    sampleName: 'أوميبرازول ٢٠ مجم',
  },
  {
    key: 'syrup',
    label: 'شراب',
    icon: 'flask-outline',
    tint: colors.tileTan,
    iconColor: colors.tileTanIcon,
    quantityLabel: 'الكمية فى كل جرعة',
    units: ['مل', 'ملعقة صغيرة'],
    quickPicks: [2.5, 5, 10, 15],
    defaultQuantity: 5,
    step: 0.5,
    sampleName: 'باراسيتامول شراب ١٢٠ مجم',
  },
  {
    key: 'injection',
    label: 'حقن',
    icon: 'needle',
    tint: colors.tileRose,
    iconColor: colors.tileRoseIcon,
    quantityLabel: 'الكمية فى كل جرعة',
    units: ['مل'],
    quickPicks: [0.5, 1, 2, 5],
    defaultQuantity: 1,
    step: 0.5,
    sampleName: 'إنسولين لانتوس',
  },
];

export function getDosageForm(key: DosageForm): DosageFormConfig {
  return DOSAGE_FORMS.find((form) => form.key === key) ?? DOSAGE_FORMS[0];
}
