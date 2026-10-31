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

import { ClinicProvider } from './context/ClinicContext';
import { MedicationsProvider } from './context/MedicationsContext';
import CaregiverStack from './navigation/CaregiverStack';
import ClinicStack from './navigation/ClinicStack';
import { AppStackParamList } from './navigation/types';
import RoleSelectScreen from './screens/RoleSelectScreen';
import { colors } from './theme';

export type { AppStackParamList, RootStackParamList } from './navigation/types';

const Stack = createNativeStackNavigator<AppStackParamList>();

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
      <ClinicProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
            <Stack.Screen name="Caregiver" component={CaregiverStack} />
            <Stack.Screen name="Clinic" component={ClinicStack} />
          </Stack.Navigator>
          <StatusBar style="dark" />
        </NavigationContainer>
      </ClinicProvider>
    </MedicationsProvider>
  );
}
