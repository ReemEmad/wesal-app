import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { FigmaIcon } from '../components/FigmaIcon';
import AppointmentsScreen from '../screens/clinic/AppointmentsScreen';
import ClinicHomeScreen from '../screens/clinic/ClinicHomeScreen';
import PatientsScreen from '../screens/clinic/PatientsScreen';
import SettingsScreen from '../screens/clinic/SettingsScreen';
import { colors, fonts } from '../theme';
import { ClinicTabParamList } from './types';

const Tab = createBottomTabNavigator<ClinicTabParamList>();

const TAB_LABELS: Record<keyof ClinicTabParamList, string> = {
  Settings: 'الإعدادات',
  Appointments: 'المواعيد',
  Patients: 'المرضى',
  Home: 'الرئيسية',
};

function TabIcon({ name, color, size }: { name: keyof ClinicTabParamList; color: string; size: number }) {
  switch (name) {
    case 'Home':
      return <FigmaIcon name="icon_tab_home" size={size} color={color} />;
    case 'Settings':
      return <FigmaIcon name="icon_tab_settings" size={size} color={color} />;
    case 'Patients':
      return <FigmaIcon name="icon_tab_users" size={size} color={color} />;
    case 'Appointments':
      return <FigmaIcon name="icon_tab_calendar" size={size} color={color} />;
  }
}

export default function ClinicTabs() {
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
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Patients" component={PatientsScreen} />
      <Tab.Screen name="Home" component={ClinicHomeScreen} />
    </Tab.Navigator>
  );
}
