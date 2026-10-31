import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { useAuth } from './auth';
import { ACCOUNT_PLANS, isPlanId, type DemoPlanSelection, type PlanId } from '../constants/subscriptions';

type ContextValue = {
  ready: boolean;
  error: string | null;
  currentPlanId: PlanId;
  saveDemoPlan: (planId: PlanId) => Promise<DemoPlanSelection>;
};
const SubscriptionsContext = createContext<ContextValue | null>(null);
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
function isSelection(value: unknown): value is DemoPlanSelection {
  if (!value || typeof value !== 'object') return false;
  const selection = value as DemoPlanSelection;
  return isPlanId(selection.planId) && selection.mode === 'demo' &&
    typeof selection.changedAt === 'string' && Number.isFinite(Date.parse(selection.changedAt));
}

/** Account-wide preview only. Never use this local selection as a paid entitlement. */
export function SubscriptionsProvider({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  // Separate storage from the discarded clinic-subscription experiment.
  const key = status === 'signedIn' && user ? `wesal.account-plan.${user.id}` : null;
  const [session, setSession] = useState<{ owner: string | null; planId: PlanId }>({ owner: null, planId: 'free' });
  const [error, setError] = useState<string | null>(null);
  const owner = useRef<string | null>(null);
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    const previous = owner.current;
    owner.current = key;
    if (previous && previous !== key) {
      queue.current = queue.current.catch(() => undefined).then(() => remove(previous)).catch(() => undefined);
    }
    void (async () => {
      let planId: PlanId = 'free';
      let message: string | null = null;
      try {
        if (key) {
          const stored = await read(key);
          if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (!isSelection(parsed)) throw new Error('Invalid local preview plan');
            planId = parsed.planId;
          }
        }
      } catch {
        message = 'تعذر استعادة اختيار الخطة المحلي. تظهر الخطة المجانية مؤقتًا؛ لم يتم خصم أي مبلغ.';
      }
      if (!cancelled) {
        setSession({ owner: key, planId });
        setError(message);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  const saveDemoPlan = (planId: PlanId): Promise<DemoPlanSelection> => {
    const operation = queue.current.catch(() => undefined).then(async () => {
      if (!key || owner.current !== key || session.owner !== key) throw new Error('انتظر تحميل الخطط ثم حاول مرة أخرى.');
      const plan = ACCOUNT_PLANS.find(item => item.id === planId);
      if (!plan || plan.amountEGP === null) throw new Error('هذه الخطة غير متاحة للاختيار الآن.');
      const selection: DemoPlanSelection = { planId, changedAt: new Date().toISOString(), mode: 'demo' };
      try {
        await write(key, JSON.stringify(selection));
      } catch {
        throw new Error('تعذر حفظ اختيارك على هذا الجهاز. لم تتغير الخطة ولم يتم خصم أي مبلغ؛ حاول مرة أخرى.');
      }
      if (owner.current !== key) throw new Error('انتهت الجلسة. سجّل الدخول مرة أخرى.');
      setSession({ owner: key, planId });
      setError(null);
      return selection;
    });
    queue.current = operation.then(() => undefined, () => undefined);
    return operation;
  };
  const ready = !!key && session.owner === key;
  return (
    <SubscriptionsContext.Provider value={{ ready, error, currentPlanId: ready ? session.planId : 'free', saveDemoPlan }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}
export function useSubscriptions() {
  const value = useContext(SubscriptionsContext);
  if (!value) throw new Error('SubscriptionsProvider is required');
  return value;
}
