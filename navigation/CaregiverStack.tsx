import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddedScreen from '../screens/medications/AddedScreen';
import AddMethodScreen from '../screens/medications/AddMethodScreen';
import DoseScheduleScreen from '../screens/medications/DoseScheduleScreen';
import DurationStockScreen from '../screens/medications/DurationStockScreen';
import MedicationFormScreen from '../screens/medications/MedicationFormScreen';
import ReviewScreen from '../screens/medications/ReviewScreen';
import ScanBoxScreen from '../screens/medications/ScanBoxScreen';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function CaregiverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddMethod" component={AddMethodScreen} />
      <Stack.Screen name="ScanBox" component={ScanBoxScreen} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} />
      <Stack.Screen name="DoseSchedule" component={DoseScheduleScreen} />
      <Stack.Screen name="DurationStock" component={DurationStockScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Added" component={AddedScreen} options={{ gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
