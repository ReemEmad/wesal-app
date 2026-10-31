import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../App';
import { MainNavigation } from '../components/MainNavigation';
import MedicationsStack from '../navigation/MedicationsStack';
import { colors, fonts } from '../theme';

export default function MedicationsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Medications'>) {
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <Text style={styles.notice}>
        نسخة تجريبية: التغييرات خلال الجلسة فقط، ولا تُرسل تذكيرات فعلية.
      </Text>
      <MedicationsStack />
      <MainNavigation
        active="meds"
        onHome={() => navigation.popTo('Home')}
        onPharmacy={() => navigation.popTo('Pharmacy')}
        onMedications={() => undefined}
        onClinics={() => navigation.popTo('Clinics')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  notice: {
    paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primarySoftBg,
    color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center',
  },
});
