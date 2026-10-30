import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MedicationDetailsScreen from '../screens/medications/MedicationDetailsScreen';
import MedicationsListScreen from '../screens/medications/MedicationsListScreen';
import { MedicationsStackParamList } from './types';

const Stack = createNativeStackNavigator<MedicationsStackParamList>();

export default function MedicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicationsList" component={MedicationsListScreen} />
      <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} />
    </Stack.Navigator>
  );
}
