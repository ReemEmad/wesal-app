import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, OutlineButton } from '../../components/Buttons';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';

type Option = {
  key: 'manual' | 'camera' | 'voice';
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  highlighted?: boolean;
  disabled?: boolean;
};

const OPTIONS: Option[] = [
  {
    key: 'manual',
    title: 'إدخال يدوي',
    subtitle: 'اكتب بيانات الدواء بنفسك',
    icon: 'pencil-outline',
    tint: colors.tileTan,
    iconColor: colors.tileTanIcon,
  },
  {
    key: 'camera',
    title: 'تصوير علبة الدواء',
    subtitle: 'صوّر العلبة ثم أدخل بيانات الدواء يدويًا',
    icon: 'camera-outline',
    tint: colors.tileLavender,
    iconColor: colors.primary,
    highlighted: true,
  },
  {
    key: 'voice',
    title: 'تسجيل رسالة صوتية',
    subtitle: 'قل اسم الدواء وجرعته وسنكتبها لك',
    icon: 'mic-outline',
    tint: colors.tileBlue,
    iconColor: colors.tileBlueIcon,
    disabled: true,
  },
];

export default function AddMethodScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddMethod'>) {
  const { startNew } = useMedications();

  const choose = (option: Option) => {
    if (option.key === 'voice') {
      Alert.alert('قريبًا', 'تسجيل رسالة صوتية سيكون متاحًا قريبًا.');
      return;
    }
    startNew(option.key);
    navigation.navigate(option.key === 'camera' ? 'ScanBox' : 'MedicationForm');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ScreenHeader
          title="إضافة دواء"
          subtitle="اختر الطريقة الأسهل لإدخال بيانات الدواء"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.card, option.highlighted && styles.cardHighlighted, option.disabled && styles.cardDisabled]}
              onPress={() => choose(option)}
              accessibilityRole="button"
            >
              <View style={styles.chevron}>
                <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
              </View>
              <View style={styles.texts}>
                <Text style={styles.title}>{option.title}</Text>
                <Text style={styles.subtitle}>{option.subtitle}</Text>
              </View>
              <View style={[styles.iconTile, { backgroundColor: option.tint }]}>
                <Ionicons name={option.icon} size={34} color={option.iconColor} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tip}>
          <Text style={styles.tipText}>التصوير لا يستخرج بيانات الدواء تلقائيًا في هذه النسخة. أدخل البيانات وراجعها يدويًا.</Text>
          <Ionicons name="sparkles-outline" size={22} color={colors.info} />
        </View>
      </View>

      <Footer>
        <OutlineButton label="إلغاء" onPress={() => navigation.goBack()} />
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
    padding: spacing.lg,
    gap: spacing.xl,
  },
  options: {
    gap: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardHighlighted: {
    borderColor: colors.primary,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  iconTile: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.info,
    textAlign: 'right',
  },
});
