import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppStackParamList } from '../navigation/types';
import { colors, fonts, spacing } from '../theme';

type RoleOption = {
  key: 'caregiver' | 'elder' | 'clinic';
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const OPTIONS: RoleOption[] = [
  { key: 'caregiver', title: 'أنا مقدم رعاية', subtitle: 'تابع أدوية أحبابك ومواعيدهم', icon: 'people-outline' },
  {
    key: 'elder',
    title: 'أنا كبير سن',
    subtitle: 'ادخل بكود الدعوة الذي أرسله لك أحد أفراد العائلة',
    icon: 'heart-outline',
  },
  { key: 'clinic', title: 'الدخول كعيادة طبية', subtitle: 'حسابات العيادات', icon: 'medkit-outline' },
];

export default function RoleSelectScreen({ navigation }: NativeStackScreenProps<AppStackParamList, 'RoleSelect'>) {
  const choose = (key: RoleOption['key']) => {
    if (key === 'caregiver') navigation.navigate('Caregiver');
    else if (key === 'clinic') navigation.navigate('Clinic');
    else Alert.alert('قريبًا', 'تجربة كبار السن قيد التصميم وستكون متاحة قريبًا.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={[styles.blob, styles.blobLeft]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobRight]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={require('../assets/brand/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="وصال"
        />

        <View style={styles.titles}>
          <Text style={styles.title}>كيف ستستخدم وصال؟</Text>
          <Text style={styles.subtitle}>اختر الطريقة التي تناسبك، وسنهيئ لك التجربة.</Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.card}
              onPress={() => choose(option.key)}
              accessibilityRole="button"
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
              <View style={styles.cardTexts}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
              </View>
              <View style={styles.iconTile}>
                <Ionicons name={option.icon} size={30} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  blob: {
    position: 'absolute',
    bottom: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  blobLeft: {
    left: -60,
    backgroundColor: colors.blobCool,
  },
  blobRight: {
    right: -70,
    backgroundColor: colors.blobWarm,
  },
  logo: {
    alignSelf: 'center',
    width: 184,
    height: 57,
  },
  titles: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  options: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cardTexts: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 4,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'right',
  },
  iconTile: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
