import type { ImageSourcePropType } from 'react-native';

// Sample catalog from the supplied pharmacy designs, not live pharmacy inventory.
export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  deliveryMinutes: number;
  isOpen: boolean;
  is24Hours: boolean;
  hours: string;
  image: ImageSourcePropType;
};

export type Medicine = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  fromSchedule: boolean;
};

export const PHARMACIES: Pharmacy[] = [
  { id: 'hayah', name: 'صيدلية الحياة', address: 'شارع النيل، القاهرة', distanceKm: 0.5, rating: 4.8, deliveryMinutes: 20, isOpen: true, is24Hours: false, hours: 'من ٩:٠٠ ص إلى ١١:٠٠ م', image: require('../assets/pharmacy/hayah.png') },
  { id: 'dawaa', name: 'صيدلية الدواء', address: 'القاهرة', distanceKm: 1.2, rating: 4.6, deliveryMinutes: 35, isOpen: true, is24Hours: true, hours: 'مفتوحة ٢٤ ساعة', image: require('../assets/pharmacy/dawaa.png') },
  { id: 'shifaa', name: 'صيدلية الشفاء', address: 'القاهرة', distanceKm: 1.8, rating: 4.5, deliveryMinutes: 40, isOpen: false, is24Hours: false, hours: 'تفتح ٩ ص', image: require('../assets/pharmacy/shifaa.png') },
];

export const MEDICINES: Medicine[] = [
  { id: 'metformin', name: 'ميتفورمين ٥٠٠ مجم', description: 'علبة · ٣٠ قرص', price: 25, available: true, fromSchedule: true },
  { id: 'amlodipine', name: 'أملوديبين ٥ مجم', description: 'علبة · ٣٠ قرص', price: 52, available: true, fromSchedule: true },
  { id: 'vitamin-d', name: 'فيتامين د ١٠٠٠', description: 'علبة · ٣٠ كبسولة', price: 55, available: true, fromSchedule: true },
  { id: 'panadol-advance', name: 'بانادول أدفانس ٥٠٠ مجم', description: 'أقراص · ٢٤ قرص', price: 38, available: true, fromSchedule: false },
  { id: 'panadol-extra', name: 'بانادول إكسترا', description: 'أقراص · ٢٤ قرص', price: 45, available: true, fromSchedule: false },
  { id: 'panadol-cold', name: 'بانادول كولد آند فلو', description: 'أقراص · ٢٤ قرص', price: 53, available: false, fromSchedule: false },
];

export type Cart = Record<string, number>;
export type DemoOrder = {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  createdAt: string;
  address: string;
  items: { medicineId: string; name: string; quantity: number; price: number }[];
  total: number;
  prescriptionAttached: boolean;
};

export function initialCart(): Cart {
  return { metformin: 1, amlodipine: 1 };
}

export function cartSummary(cart: Cart) {
  const items = MEDICINES.filter(m => m.available && (cart[m.id] ?? 0) > 0)
    .map(m => ({ medicineId: m.id, name: m.name, quantity: cart[m.id], price: m.price }));
  return {
    items,
    count: items.reduce((n, item) => n + item.quantity, 0),
    total: items.reduce((n, item) => n + item.quantity * item.price, 0),
  };
}

export function normalizeSearch(text: string) {
  return text.trim().toLowerCase().normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
}
