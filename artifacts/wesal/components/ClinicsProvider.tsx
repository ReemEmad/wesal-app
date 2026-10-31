import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { useAuth } from './auth';
import { validateFollowUp, type CareFollowUp, type FollowUpInput } from '../constants/clinics';

type Saved = { version: 1; followUps: CareFollowUp[] };
type ClinicsContextValue = {
  ready: boolean;
  error: string | null;
  followUps: CareFollowUp[];
  saveFollowUp: (input: FollowUpInput) => Promise<void>;
  removeFollowUp: (id: string) => Promise<void>;
};
const ClinicsContext = createContext<ClinicsContextValue | null>(null);
const fresh = (): Saved => ({ version: 1, followUps: [] });

async function read(key: string) {
  return Platform.OS === 'web' ? window.sessionStorage.getItem(key) : SecureStore.getItemAsync(key);
}
async function write(key: string, value: string) {
  if (Platform.OS === 'web') window.sessionStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}
async function remove(key: string) {
  if (Platform.OS === 'web') window.sessionStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}
function isSaved(value: unknown): value is Saved {
  if (!value || typeof value !== 'object') return false;
  const state = value as Saved;
  if (state.version !== 1 || !Array.isArray(state.followUps) || state.followUps.length > 12) return false;
  const ids = new Set<string>();
  return state.followUps.every(item => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) ||
      typeof item.clinicId !== 'string' || typeof item.doctorId !== 'string' ||
      typeof item.department !== 'string' || typeof item.reason !== 'string' ||
      typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) ||
      validateFollowUp(item)) return false;
    ids.add(item.id);
    return true;
  });
}

/** Local caregiver choices only: never grants a doctor access or sends a request. */
export function ClinicsProvider({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  const key = status === 'signedIn' && user ? `wesal.clinics.${user.id}` : null;
  const [session, setSession] = useState<{ owner: string | null; data: Saved }>({ owner: null, data: fresh() });
  const [error, setError] = useState<string | null>(null);
  const current = useRef(session);
  const owner = useRef<string | null>(null);
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const previous = owner.current;
    owner.current = key;
    // A signed-out user's demonstration health notes must not leak into the next account.
    if (previous && previous !== key) {
      queue.current = queue.current.catch(() => undefined).then(() => remove(previous)).catch(() => undefined);
    }
    void (async () => {
      let data = fresh();
      let message: string | null = null;
      try {
        if (key) {
          const stored = await read(key);
          if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (!isSaved(parsed)) throw new Error('Invalid local follow-ups');
            data = parsed;
          }
        }
      } catch {
        message = 'تعذر استعادة بيانات المتابعة المحلية. لا توجد متابعة محملة الآن؛ يمكنك المحاولة بإعادة فتح التطبيق.';
      }
      if (!cancelled) {
        const next = { owner: key, data };
        current.current = next;
        setSession(next);
        setError(message);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  const ready = !!key && session.owner === key;
  const commit = (change: (saved: Saved) => Saved): Promise<void> => {
    const operation = queue.current.catch(() => undefined).then(async () => {
      if (!key || owner.current !== key || current.current.owner !== key) throw new Error('انتظر تحميل بيانات المتابعة ثم حاول مرة أخرى.');
      const next = change(current.current.data);
      try {
        await write(key, JSON.stringify(next));
      } catch {
        throw new Error('تعذر الحفظ على هذا الجهاز. لم يتم حفظ التغييرات؛ حاول مرة أخرى.');
      }
      if (owner.current !== key) throw new Error('انتهت الجلسة. سجّل الدخول مرة أخرى.');
      const updated = { owner: key, data: next };
      current.current = updated;
      setSession(updated);
      setError(null);
    });
    queue.current = operation.catch(() => undefined);
    return operation;
  };
  const saveFollowUp = (input: FollowUpInput) => commit(saved => {
    const validation = validateFollowUp(input);
    if (validation) throw new Error(validation);
    const existing = input.id ? saved.followUps.find(item => item.id === input.id) : undefined;
    if (input.id && !existing) throw new Error('هذه المتابعة لم تعد موجودة.');
    if (!existing && saved.followUps.length >= 12) throw new Error('يمكن حفظ ١٢ متابعة في نسخة العرض. احذف متابعة قبل إضافة أخرى.');
    if (saved.followUps.some(item => item.id !== input.id && item.clinicId === input.clinicId && item.doctorId === input.doctorId)) {
      throw new Error('توجد متابعة مع هذا الطبيب بالفعل. يمكنك تعديلها من القائمة.');
    }
    const item: CareFollowUp = {
      id: existing?.id ?? `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      clinicId: input.clinicId,
      doctorId: input.doctorId,
      department: input.department.trim(),
      reason: input.reason.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    return { version: 1, followUps: existing ? saved.followUps.map(row => row.id === item.id ? item : row) : [...saved.followUps, item] };
  });
  const removeFollowUp = (id: string) => commit(saved => {
    if (!saved.followUps.some(item => item.id === id)) throw new Error('هذه المتابعة لم تعد موجودة.');
    return { version: 1, followUps: saved.followUps.filter(item => item.id !== id) };
  });

  return <ClinicsContext.Provider value={{ ready, error, followUps: ready ? session.data.followUps : [], saveFollowUp, removeFollowUp }}>{children}</ClinicsContext.Provider>;
}

export function useClinics() {
  const value = useContext(ClinicsContext);
  if (!value) throw new Error('ClinicsProvider is required');
  return value;
}
