import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, OutlineButton, PrimaryButton } from '../../components/Buttons';
import { useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { nextDose, timingText } from '../../utils/medication';

export default function AddedScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Added'>) {
  const { getMedication, editingId } = useMedications();
  const med = getMedication(route.params.id);
  const upcoming = med ? nextDose(med) : null;
  const updated = editingId !== null;

  const goToList = () =>
    navigation.navigate('Main', { screen: 'Medications', params: { screen: 'MedicationsList' } });

  const goToDetails = () =>
    navigation.navigate('Main', {
      screen: 'Medications',
      params: { screen: 'MedicationDetails', params: { id: route.params.id } },
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/illustrations/success-medication.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.title}>{updated ? 'تم تحديث الدواء' : 'تمت إضافة الدواء'}</Text>
        <Text style={styles.body}>
          {updated
            ? `حدّثنا ${med?.name ?? 'الدواء'} في أدوية سعاد، وسنذكّرها بكل جرعة في موعدها.`
            : `أضفنا ${med?.name ?? 'الدواء'} إلى أدوية سعاد، وسنذكّرها بكل جرعة في موعدها.`}
        </Text>

        {med && upcoming ? (
          <View style={styles.card}>
            <View style={styles.cardTexts}>
              <Text style={styles.cardLabel}>الجرعة القادمة</Text>
              <Text style={styles.cardValue}>
                {upcoming.dayLabel} {upcoming.time} · {timingText(med)}
              </Text>
            </View>
            <Ionicons name="time-outline" size={26} color={colors.primary} />
          </View>
        ) : null}
      </View>

      <Footer>
        <PrimaryButton label="عرض الدواء" onPress={goToDetails} />
        <OutlineButton label="العودة إلى الأدوية" onPress={goToList} />
      </Footer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  illustration: {
    width: 260,
    height: 260,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cardTexts: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  cardValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
});
