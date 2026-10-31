import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddAppointmentScreen from '../screens/clinic/AddAppointmentScreen';
import AddPatientScreen from '../screens/clinic/AddPatientScreen';
import AppointmentDetailsScreen from '../screens/clinic/AppointmentDetailsScreen';
import MedicationAddedScreen from '../screens/clinic/MedicationAddedScreen';
import PatientFileScreen from '../screens/clinic/PatientFileScreen';
import PatientHistoryScreen from '../screens/clinic/PatientHistoryScreen';
import PatientMedicationsScreen from '../screens/clinic/PatientMedicationsScreen';
import PatientRelativesScreen from '../screens/clinic/PatientRelativesScreen';
import PatientSearchScreen from '../screens/clinic/PatientSearchScreen';
import SessionNotesScreen from '../screens/clinic/SessionNotesScreen';
import SessionSavedScreen from '../screens/clinic/SessionSavedScreen';
import SessionScreen from '../screens/clinic/SessionScreen';
import DoseScheduleScreen from '../screens/medications/DoseScheduleScreen';
import DurationStockScreen from '../screens/medications/DurationStockScreen';
import MedicationFormScreen from '../screens/medications/MedicationFormScreen';
import ReviewScreen from '../screens/medications/ReviewScreen';
import ClinicTabs from './ClinicTabs';
import { ClinicStackParamList } from './types';

const Stack = createNativeStackNavigator<ClinicStackParamList>();

export default function ClinicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClinicTabs" component={ClinicTabs} />
      <Stack.Screen name="PatientSearch" component={PatientSearchScreen} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PatientFile" component={PatientFileScreen} />
      <Stack.Screen name="PatientMedications" component={PatientMedicationsScreen} />
      <Stack.Screen name="PatientHistory" component={PatientHistoryScreen} />
      <Stack.Screen name="PatientRelatives" component={PatientRelativesScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="SessionNotes" component={SessionNotesScreen} />
      <Stack.Screen name="SessionSaved" component={SessionSavedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} />
      <Stack.Screen name="DoseSchedule" component={DoseScheduleScreen} />
      <Stack.Screen name="DurationStock" component={DurationStockScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="MedicationAdded" component={MedicationAddedScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
