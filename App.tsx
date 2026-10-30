import {
  ReadexPro_400Regular,
  ReadexPro_500Medium,
  ReadexPro_600SemiBold,
  useFonts,
} from '@expo-google-fonts/readex-pro';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { MedicationsProvider } from './context/MedicationsContext';
import MainTabs from './navigation/MainTabs';
import { RootStackParamList } from './navigation/types';
import AddedScreen from './screens/medications/AddedScreen';
import AddMethodScreen from './screens/medications/AddMethodScreen';
import DoseScheduleScreen from './screens/medications/DoseScheduleScreen';
import DurationStockScreen from './screens/medications/DurationStockScreen';
import MedicationFormScreen from './screens/medications/MedicationFormScreen';
import ReviewScreen from './screens/medications/ReviewScreen';
import ScanBoxScreen from './screens/medications/ScanBoxScreen';
import { colors } from './theme';

export type { RootStackParamList } from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    ReadexPro_400Regular,
    ReadexPro_500Medium,
    ReadexPro_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <MedicationsProvider>
      <NavigationContainer>
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
        <StatusBar style="dark" />
      </NavigationContainer>
    </MedicationsProvider>
  );
}
