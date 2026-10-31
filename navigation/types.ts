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

export type ClinicTabParamList = {
  Settings: undefined;
  Appointments: { focusDate?: number } | undefined;
  Patients: undefined;
  Home: undefined;
};

export type ClinicStackParamList = {
  ClinicTabs: NavigatorScreenParams<ClinicTabParamList> | undefined;
  PatientSearch: undefined;
  AddPatient: undefined;
  PatientFile: { patientId: string };
  PatientMedications: { patientId: string };
  PatientHistory: { patientId: string };
  PatientRelatives: { patientId: string };
  AddAppointment: { patientId?: string } | undefined;
  AppointmentDetails: { appointmentId: string };
  Session: { appointmentId: string };
  SessionNotes: { appointmentId: string };
  SessionSaved: { appointmentId: string };
  MedicationForm: undefined;
  DoseSchedule: undefined;
  DurationStock: undefined;
  Review: undefined;
  MedicationAdded: { patientId: string; medicationId: string };
};

export type ClinicNavigation = NavigationProp<ClinicStackParamList>;

export type AppStackParamList = {
  RoleSelect: undefined;
  Caregiver: NavigatorScreenParams<RootStackParamList> | undefined;
  Clinic: NavigatorScreenParams<ClinicStackParamList> | undefined;
};
