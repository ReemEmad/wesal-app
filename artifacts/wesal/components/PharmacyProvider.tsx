import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { useAuth } from './auth';
import { PHARMACIES, MEDICINES, initialCart, cartSummary, type Cart, type DemoOrder } from '../constants/pharmacy';

type SavedState = {
  version: 1;
  address: string;
  carts: Record<string, Cart>;
  orders: DemoOrder[];
};
const fresh = (): SavedState => ({ version: 1, address: 'المنزل - شارع النيل، القاهرة', carts: {}, orders: [] });

async function read(key: string | null) {
  if (!key) return null;
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

function validateSaved(value: unknown): value is SavedState {
  if (!value || typeof value !== 'object') return false;
  const s = value as SavedState;
  if (s.version !== 1 || typeof s.address !== 'string' || !s.address.trim() ||
      !s.carts || typeof s.carts !== 'object' || !Array.isArray(s.orders) || s.orders.length > 5) return false;
  const validCart = (cart: Cart) => !!cart && typeof cart === 'object' &&
    Object.entries(cart).every(([id, quantity]) => MEDICINES.some(m => m.id === id && m.available) &&
      Number.isInteger(quantity) && quantity > 0 && quantity <= 99);
  return Object.entries(s.carts).every(([id, cart]) => PHARMACIES.some(p => p.id === id) && validCart(cart)) &&
    s.orders.every(o => o && typeof o.id === 'string' && PHARMACIES.some(p => p.id === o.pharmacyId) &&
      typeof o.pharmacyName === 'string' && typeof o.address === 'string' && typeof o.createdAt === 'string' &&
      typeof o.prescriptionAttached === 'boolean' && Number.isFinite(o.total) && o.total >= 0 &&
      Array.isArray(o.items) && o.items.every(i => i && MEDICINES.some(m => m.id === i.medicineId) &&
        typeof i.name === 'string' && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99 &&
        Number.isFinite(i.price) && i.price >= 0));
}

type PharmacyContextValue = {
  ready: boolean;
  persistenceError: string | null;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  getCart: (pharmacyId: string) => Cart;
  setQuantity: (pharmacyId: string, medicineId: string, quantity: number) => void;
  toggleMedicine: (pharmacyId: string, medicineId: string) => void;
  addMedicine: (pharmacyId: string, medicineId: string) => void;
  prescriptionUri: string | null;
  setPrescriptionUri: (uri: string | null) => void;
  placeDemoOrder: (pharmacyId: string) => DemoOrder;
  orders: DemoOrder[];
};
const PharmacyContext = createContext<PharmacyContextValue | null>(null);

export function PharmacyProvider({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  const key = status === 'signedIn' && user ? `wesal.pharmacy.${user.id}` : null;
  const [session, setSession] = useState<{ owner: string | null; data: SavedState }>({ owner: null, data: fresh() });
  const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const previousKey = useRef<string | null>(null);
  const writes = useRef(Promise.resolve());
  const ready = !!key && session.owner === key;
  const data = ready ? session.data : fresh();
  const dataRef = useRef(session);

  useEffect(() => {
    let cancelled = false;
    const old = previousKey.current;
    previousKey.current = key;
    if (old && old !== key) {
      // Finish any in-flight save before removing the previous user's demo data.
      writes.current = writes.current.catch(() => undefined).then(() => remove(old)).catch(() => undefined);
    }
    void (async () => {
      let next = fresh();
      let error: string | null = null;
      try {
        const saved = await read(key);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (!validateSaved(parsed)) throw new Error('Invalid demo state');
          next = parsed;
        }
      } catch {
        error = 'تعذر استعادة بيانات الصيدلية المحلية. بدأت تجربة جديدة.';
      }
      if (!cancelled) {
        setPrescriptionUri(null);
        setPersistenceError(error);
        const restored = { owner: key, data: next };
        dataRef.current = restored;
        setSession(restored);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  // Serialize writes so a slower previous write cannot overwrite a newer cart.
  const update = useCallback((change: (current: SavedState) => SavedState) => {
    const current = dataRef.current;
    if (!key || current.owner !== key) throw new Error('انتظر تحميل التجربة ثم حاول مرة أخرى.');
    const next = { owner: key, data: change(current.data) };
    dataRef.current = next;
    setSession(next);
    writes.current = writes.current.catch(() => undefined).then(async () => {
      if (previousKey.current !== key) return;
      try {
        await write(key, JSON.stringify(next.data));
      } catch {
        if (previousKey.current === key) {
          setPersistenceError('تعذر حفظ التجربة على هذا الجهاز. قد لا تبقى التغييرات بعد إعادة الفتح.');
        }
      }
    });
  }, [key]);

  const getCart = (pharmacyId: string) => data.carts[pharmacyId] ?? initialCart();
  const setQuantity = (pharmacyId: string, medicineId: string, quantity: number) => {
    if (!PHARMACIES.some(p => p.id === pharmacyId)) throw new Error('الصيدلية غير موجودة.');
    if (!MEDICINES.some(m => m.id === medicineId && m.available)) return;
    update(current => {
      const cart = { ...(current.carts[pharmacyId] ?? initialCart()) };
      const count = Math.max(0, Math.min(99, Math.floor(quantity)));
      if (count) cart[medicineId] = count;
      else delete cart[medicineId];
      return { ...current, carts: { ...current.carts, [pharmacyId]: cart } };
    });
  };
  const currentCart = (id: string) => dataRef.current.data.carts[id] ?? initialCart();
  const placeDemoOrder = (pharmacyId: string) => {
    const pharmacy = PHARMACIES.find(p => p.id === pharmacyId);
    if (!pharmacy?.isOpen) throw new Error('الصيدلية مغلقة الآن.');
    const summary = cartSummary(currentCart(pharmacyId));
    if (!summary.count && !prescriptionUri) throw new Error('اختر دواء أو أرفق صورة روشتة أولًا.');
    const order: DemoOrder = {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      pharmacyId,
      pharmacyName: pharmacy.name,
      createdAt: new Date().toISOString(),
      address: dataRef.current.data.address,
      items: summary.items,
      total: summary.total,
      prescriptionAttached: !!prescriptionUri,
    };
    update(current => ({ ...current, orders: [order, ...current.orders].slice(0, 5) }));
    return order;
  };

  return (
    <PharmacyContext.Provider value={{
      ready, persistenceError, deliveryAddress: data.address,
      setDeliveryAddress: address => {
        const trimmed = address.trim();
        if (trimmed.length < 3) throw new Error('اكتب عنوانًا من ٣ أحرف على الأقل.');
        update(current => ({ ...current, address: trimmed.slice(0, 200) }));
      },
      getCart, setQuantity,
      toggleMedicine: (id, medicineId) => setQuantity(id, medicineId, currentCart(id)[medicineId] ? 0 : 1),
      addMedicine: (id, medicineId) => setQuantity(id, medicineId, (currentCart(id)[medicineId] ?? 0) + 1),
      prescriptionUri: ready ? prescriptionUri : null, setPrescriptionUri, placeDemoOrder, orders: data.orders,
    }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) throw new Error('usePharmacy must be inside PharmacyProvider');
  return context;
}
