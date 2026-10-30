import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FigmaIcon } from '../components/FigmaIcon';
import ClinicsScreen from '../screens/ClinicsScreen';
import HomeScreen from '../screens/HomeScreen';
import PharmacyScreen from '../screens/PharmacyScreen';
import { colors, fonts } from '../theme';
import MedicationsStack from './MedicationsStack';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Medications: 'الأدوية',
  Pharmacy: 'الصيدلية',
  Clinics: 'العيادات',
  Home: 'الرئيسية',
};

function TabIcon({ name, color, size }: { name: keyof MainTabParamList; color: string; size: number }) {
  switch (name) {
    case 'Medications':
      return <FigmaIcon name="icon_nav_medications" size={size} color={color} />;
    case 'Pharmacy':
      return <FigmaIcon name="icon_nav_pharmacy" size={size} color={color} />;
    case 'Home':
      return <FigmaIcon name="icon_nav_home" size={size} color={color} />;
    case 'Clinics':
      return <Ionicons name="add-circle-outline" size={size} color={color} />;
  }
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabel: TAB_LABELS[route.name],
        tabBarLabelStyle: { fontFamily: fonts.regular, fontSize: 11 },
        tabBarIcon: ({ color, size }) => <TabIcon name={route.name} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Medications" component={MedicationsStack} />
      <Tab.Screen name="Pharmacy" component={PharmacyScreen} />
      <Tab.Screen name="Clinics" component={ClinicsScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}
