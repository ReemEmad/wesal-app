import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../App';

export type { RootStackParamList } from '../App';
export type MedicationsStackParamList = {
  MedicationsList: undefined;
  MedicationDetails: { id: string };
};
export type RootNavigation = NavigationProp<RootStackParamList>;
