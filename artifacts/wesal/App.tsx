import {
  NavigationContainer,
  createNavigationContainerRef,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ReadexPro_400Regular,
  ReadexPro_600SemiBold,
} from '@expo-google-fonts/readex-pro';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setBaseUrl, type CareInvitation } from '@workspace/api-client-react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './components/auth';
import { PharmacyProvider } from './components/PharmacyProvider';
import { ClinicsProvider } from './components/ClinicsProvider';
import ClinicsScreen from './screens/ClinicsScreen';
import SubscriptionsScreen from './screens/SubscriptionsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { SubscriptionsProvider } from './components/SubscriptionsProvider';
import { MedicationsProvider } from './context/MedicationsContext';
import type { MedicationsStackParamList } from './navigation/types';
import MedicationsScreen from './screens/MedicationsScreen';
import AddMethodScreen from './screens/medications/AddMethodScreen';
import ScanBoxScreen from './screens/medications/ScanBoxScreen';
import MedicationFormScreen from './screens/medications/MedicationFormScreen';
import DoseScheduleScreen from './screens/medications/DoseScheduleScreen';
import DurationStockScreen from './screens/medications/DurationStockScreen';
import ReviewScreen from './screens/medications/ReviewScreen';
import AddedScreen from './screens/medications/AddedScreen';
import { WesalButton } from './components/WesalButton';
import { FormScreen, InfoNote, ScreenTitle, Wordmark } from './components/WesalForm';
import AcceptInvitationScreen from './screens/AcceptInvitationScreen';
import HomeScreen from './screens/HomeScreen';
import InvitationCreatedScreen from './screens/InvitationCreatedScreen';
import InviteScreen from './screens/InviteScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PharmacyScreen from './screens/PharmacyScreen';
import PharmacyDetailScreen from './screens/PharmacyDetailScreen';
import RegisterScreen from './screens/RegisterScreen';
import TermsScreen from './screens/TermsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { tokens } from './constants/tokens';

setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);

export type RootStackParamList = {
  Onboarding: { step: 0 | 1 | 2 } | undefined;
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
  Terms: undefined;
  AcceptInvitation: undefined;
  Home: undefined;
  Pharmacy: undefined;
  Clinics: undefined;
  Subscriptions: undefined;
  Settings: undefined;
  PharmacyDetail: { pharmacyId: string };
  Medications: NavigatorScreenParams<MedicationsStackParamList> | undefined;
  AddMethod: undefined;
  ScanBox: undefined;
  MedicationForm: undefined;
  DoseSchedule: undefined;
  DurationStock: undefined;
  Review: undefined;
  Added: { id: string };
  Invite: undefined;
  InvitationCreated: { invitation: CareInvitation; token: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

void SplashScreen.preventAutoHideAsync();

function Startup() {
  return (
    <View style={styles.center} accessibilityLabel="جارٍ التحميل" accessibilityRole="progressbar">
      <ActivityIndicator color={tokens.colors.primary} />
    </View>
  );
}

function Unreachable({ onRetry }: { onRetry: () => void }) {
  return (
    <FormScreen>
      <Wordmark />
      <ScreenTitle title="تعذر الوصول إلى وصال" subtitle="ما زلت مسجّلًا على هذا الجهاز، لكننا لم نتمكن من الاتصال بالخادم." />
      <InfoNote tone="warning">تحقق من اتصالك بالإنترنت ثم أعد المحاولة. لم نحذف جلستك.</InfoNote>
      <View style={styles.retry}>
        <WesalButton label="إعادة المحاولة" accessibilityLabel="إعادة المحاولة" onPress={onRetry} testID="auth-retry" />
      </View>
    </FormScreen>
  );
}

function RootNavigator() {
  const { status, user, entryHint, pendingInvite, pendingReady, retry, isDemo } = useAuth();

  useEffect(() => {
    if (isDemo || !pendingInvite || !navigationRef.isReady()) return;
    if (navigationRef.getCurrentRoute()?.name !== 'AcceptInvitation') {
      navigationRef.navigate('AcceptInvitation');
    }
  }, [pendingInvite, isDemo]);

  if (status === 'loading' || !pendingReady) return <Startup />;
  if (status === 'unreachable') return <Unreachable onRetry={retry} />;

  const signedIn = status === 'signedIn';
  const initialRouteName: keyof RootStackParamList = pendingInvite && !isDemo
    ? 'AcceptInvitation'
    : signedIn
      ? entryHint === 'register'
        ? 'Invite'
        : 'Home'
      : 'Onboarding';

  return (
    <MedicationsProvider key={signedIn ? user?.id : 'signed-out'}>
    <Stack.Navigator
      key={signedIn ? `in-${user?.id}` : 'out'}
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: tokens.colors.background },
      }}
    >
      {signedIn ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
          <Stack.Screen name="Clinics" component={ClinicsScreen} />
          <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PharmacyDetail" component={PharmacyDetailScreen} />
          <Stack.Screen name="Medications" component={MedicationsScreen} />
          <Stack.Screen name="AddMethod" component={AddMethodScreen} />
          <Stack.Screen name="ScanBox" component={ScanBoxScreen} />
          <Stack.Screen name="MedicationForm" component={MedicationFormScreen} />
          <Stack.Screen name="DoseSchedule" component={DoseScheduleScreen} />
          <Stack.Screen name="DurationStock" component={DurationStockScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="Added" component={AddedScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Invite" component={InviteScreen} />
          <Stack.Screen name="InvitationCreated" component={InvitationCreatedScreen} />
          {!isDemo && <Stack.Screen name="AcceptInvitation" component={AcceptInvitationScreen} />}
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ step: 0 }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AcceptInvitation" component={AcceptInvitationScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      )}
    </Stack.Navigator>
    </MedicationsProvider>
  );
}

export default function App() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } }),
  );
  const [fontsLoaded, fontError] = useFonts({
    ReadexPro_400Regular,
    ReadexPro_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PharmacyProvider>
            <ClinicsProvider>
              <SubscriptionsProvider>
                <NavigationContainer ref={navigationRef}>
                  <RootNavigator />
                </NavigationContainer>
              </SubscriptionsProvider>
            </ClinicsProvider>
          </PharmacyProvider>
        </AuthProvider>
      </QueryClientProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background,
  },
  retry: { marginTop: 20 },
});
