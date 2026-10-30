import { NavigationProp, NavigatorScreenParams } from '@react-navigation/native';

export type MedicationsStackParamList = {
  MedicationsList: undefined;
  MedicationDetails: { id: string };
};

export type MainTabParamList = {
  Medications: NavigatorScreenParams<MedicationsStackParamList> | undefined;
  Pharmacy: undefined;
  Clinics: undefined;
  Home: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AddMethod: undefined;
  ScanBox: undefined;
  MedicationForm: undefined;
  DoseSchedule: undefined;
  DurationStock: undefined;
  Review: undefined;
  Added: { id: string };
};

export type RootNavigation = NavigationProp<RootStackParamList>;
