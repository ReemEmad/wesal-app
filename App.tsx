import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  ReadexPro_400Regular,
  ReadexPro_500Medium,
  ReadexPro_600SemiBold,
} from '@expo-google-fonts/readex-pro';
import { ActivityIndicator, View } from 'react-native';

import { FigmaIcon, FigmaIconName } from './components/FigmaIcon';
import HomeScreen from './screens/HomeScreen';
import MedicationsScreen from './screens/MedicationsScreen';
import PharmacyScreen from './screens/PharmacyScreen';
import SettingsScreen from './screens/SettingsScreen';
import { colors } from './theme';

export type MainTabParamList = {
  Settings: undefined;
  Pharmacy: undefined;
  Medications: undefined;
  Home: undefined;
};

export type RootStackParamList = {
  Main: undefined;
};

const TAB_ICONS: Record<keyof MainTabParamList, FigmaIconName> = {
  Settings: 'icon_nav_settings',
  Pharmacy: 'icon_nav_pharmacy',
  Medications: 'icon_nav_medications',
  Home: 'icon_nav_home',
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Settings: 'الإعدادات',
  Pharmacy: 'الصيدلية',
  Medications: 'الأدوية',
  Home: 'الرئيسية',
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabel: TAB_LABELS[route.name as keyof MainTabParamList],
        tabBarIcon: ({ color, size }) => (
          <FigmaIcon name={TAB_ICONS[route.name as keyof MainTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
      <Tab.Screen name="Medications" component={MedicationsScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}

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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
