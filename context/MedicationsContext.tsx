import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { DosageForm, getDosageForm } from '../constants/dosageForms';

export type MealTiming = 'before' | 'with' | 'after';
export type Duration = 7 | 14 | 30 | 'ongoing';
export type MedicationStatus = 'active' | 'paused';
export type Frequency = 1 | 2 | 3;

export type MedicationDraft = {
  name: string;
  form: DosageForm;
  quantity: number;
  unit: string;
  notes: string;
  frequency: Frequency;
  times: number[];
  mealTiming: MealTiming;
  customTiming?: string;
  weeklyDay?: number;
  duration: Duration;
  startDate: number;
  stock: number;
  lowStockAlert: boolean;
};

export type Medication = MedicationDraft & {
  id: string;
  status: MedicationStatus;
};

export type DraftSource = 'manual' | 'camera';

export type DraftTarget = {
  patientId: string;
  patientName: string;
  onSave: (draft: MedicationDraft) => string;
};

export const DEFAULT_TIMES: Record<Frequency, number[]> = {
  1: [8 * 60],
  2: [8 * 60, 20 * 60],
  3: [8 * 60, 14 * 60, 20 * 60],
};

export function createEmptyDraft(): MedicationDraft {
  const form = getDosageForm('tablet');
  return {
    name: '',
    form: form.key,
    quantity: form.defaultQuantity,
    unit: form.units[0],
    notes: '',
    frequency: 2,
    times: DEFAULT_TIMES[2],
    mealTiming: 'after',
    duration: 'ongoing',
    startDate: Date.now(),
    stock: 30,
    lowStockAlert: true,
  };
}

const startOfToday = new Date().setHours(0, 0, 0, 0);

const SEED: Medication[] = [
  {
    id: 'seed-1',
    name: 'ميتفورمين ٥٠٠ مجم',
    form: 'tablet',
    quantity: 1,
    unit: 'قرص',
    notes: 'يؤخذ بعد الأكل مع كوب ماء',
    frequency: 2,
    times: [8 * 60, 20 * 60],
    mealTiming: 'after',
    duration: 'ongoing',
    startDate: startOfToday,
    stock: 60,
    lowStockAlert: true,
    status: 'active',
  },
  {
    id: 'seed-2',
    name: 'أملوديبين ٥ مجم',
    form: 'tablet',
    quantity: 1,
    unit: 'قرص',
    notes: '',
    frequency: 1,
    times: [9 * 60],
    mealTiming: 'before',
    customTiming: 'صباحًا',
    duration: 'ongoing',
    startDate: startOfToday,
    stock: 30,
    lowStockAlert: true,
    status: 'active',
  },
  {
    id: 'seed-3',
    name: 'أتورفاستاتين ٢٠ مجم',
    form: 'tablet',
    quantity: 1,
    unit: 'قرص',
    notes: '',
    frequency: 1,
    times: [22 * 60],
    mealTiming: 'before',
    customTiming: 'قبل النوم',
    duration: 'ongoing',
    startDate: startOfToday,
    stock: 5,
    lowStockAlert: true,
    status: 'active',
  },
  {
    id: 'seed-4',
    name: 'فيتامين د٣',
    form: 'capsule',
    quantity: 1,
    unit: 'كبسولة',
    notes: '',
    frequency: 1,
    times: [12 * 60],
    mealTiming: 'with',
    weeklyDay: 5,
    duration: 'ongoing',
    startDate: startOfToday,
    stock: 8,
    lowStockAlert: true,
    status: 'active',
  },
];

type MedicationsContextValue = {
  medications: Medication[];
  draft: MedicationDraft;
  editingId: string | null;
  source: DraftSource;
  target: DraftTarget | null;
  patchDraft: (patch: Partial<MedicationDraft>) => void;
  startNew: (source: DraftSource, target?: DraftTarget) => void;
  startEditing: (id: string) => void;
  saveDraft: () => string;
  removeMedication: (id: string) => void;
  togglePause: (id: string) => void;
  getMedication: (id: string) => Medication | undefined;
};

const MedicationsContext = createContext<MedicationsContextValue | null>(null);

export function MedicationsProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(SEED);
  const [draft, setDraft] = useState<MedicationDraft>(createEmptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [source, setSource] = useState<DraftSource>('manual');
  const [target, setTarget] = useState<DraftTarget | null>(null);

  const patchDraft = useCallback((patch: Partial<MedicationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const startNew = useCallback((nextSource: DraftSource, nextTarget?: DraftTarget) => {
    setDraft(createEmptyDraft());
    setEditingId(null);
    setSource(nextSource);
    setTarget(nextTarget ?? null);
  }, []);

  const getMedication = useCallback(
    (id: string) => medications.find((medication) => medication.id === id),
    [medications]
  );

  const startEditing = useCallback(
    (id: string) => {
      const existing = medications.find((medication) => medication.id === id);
      if (!existing) return;
      const { id: _id, status: _status, ...rest } = existing;
      setDraft(rest);
      setEditingId(id);
      setSource('manual');
      setTarget(null);
    },
    [medications]
  );

  const saveDraft = useCallback(() => {
    if (target) return target.onSave(draft);
    if (editingId) {
      setMedications((current) =>
        current.map((medication) => (medication.id === editingId ? { ...medication, ...draft } : medication))
      );
      return editingId;
    }
    const id = `med-${Date.now()}`;
    setMedications((current) => [...current, { ...draft, id, status: 'active' }]);
    return id;
  }, [draft, editingId, target]);

  const removeMedication = useCallback((id: string) => {
    setMedications((current) => current.filter((medication) => medication.id !== id));
  }, []);

  const togglePause = useCallback((id: string) => {
    setMedications((current) =>
      current.map((medication) =>
        medication.id === id
          ? { ...medication, status: medication.status === 'active' ? 'paused' : 'active' }
          : medication
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      medications,
      draft,
      editingId,
      source,
      target,
      patchDraft,
      startNew,
      startEditing,
      saveDraft,
      removeMedication,
      togglePause,
      getMedication,
    }),
    [medications, draft, editingId, source, target, patchDraft, startNew, startEditing, saveDraft, removeMedication, togglePause, getMedication]
  );

  return <MedicationsContext.Provider value={value}>{children}</MedicationsContext.Provider>;
}

export function useMedications(): MedicationsContextValue {
  const value = useContext(MedicationsContext);
  if (!value) throw new Error('useMedications must be used inside MedicationsProvider');
  return value;
}
