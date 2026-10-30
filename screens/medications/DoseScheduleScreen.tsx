import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PrimaryButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { WizardScreen } from '../../components/WizardScreen';
import { DEFAULT_TIMES, Frequency, useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { formatClock } from '../../utils/arabic';
import { MEAL_OPTIONS } from '../../utils/medication';

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 1, label: 'مرة واحدة يوميًا' },
  { value: 2, label: 'مرتين يوميًا' },
  { value: 3, label: '٣ مرات يوميًا' },
];

const DOSE_ORDINALS = ['الأولى', 'الثانية', 'الثالثة'];
const TIME_STEP = 30;

function isDaytime(minutes: number): boolean {
  return minutes >= 5 * 60 && minutes < 17 * 60;
}

export default function DoseScheduleScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'DoseSchedule'>) {
  const { draft, patchDraft } = useMedications();
  const [activeIndex, setActiveIndex] = useState(0);

  const changeFrequency = (frequency: Frequency) => {
    patchDraft({ frequency, times: DEFAULT_TIMES[frequency] });
    setActiveIndex(0);
  };

  const shiftTime = (index: number, delta: number) => {
    const times = draft.times.map((minutes, i) =>
      i === index ? (((minutes + delta) % 1440) + 1440) % 1440 : minutes
    );
    patchDraft({ times });
  };

  return (
    <WizardScreen
      title="مواعيد الجرعات"
      subtitle="الخطوة ٢ من ٤"
      step={2}
      onBack={() => navigation.goBack()}
      footer={<PrimaryButton label="التالي" onPress={() => navigation.navigate('DurationStock')} />}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>كم مرة في اليوم؟</Text>
        {FREQUENCIES.map((item) => {
          const selected = draft.frequency === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.radioRow, selected && styles.radioRowSelected]}
              onPress={() => changeFrequency(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={styles.radioLabel}>{item.label}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>أوقات الجرعات</Text>
        {draft.times.map((minutes, index) => {
          const active = index === activeIndex;
          return (
            <TouchableOpacity
              key={index}
              style={styles.timeRow}
              onPress={() => setActiveIndex(index)}
              accessibilityRole="button"
            >
              <View style={styles.timeControls}>
                <Text style={styles.timeValue}>{formatClock(minutes)}</Text>
                {active ? (
                  <View style={styles.adjust}>
                    <TouchableOpacity
                      style={[styles.adjustButton, styles.adjustMinus]}
                      onPress={() => shiftTime(index, -TIME_STEP)}
                      accessibilityLabel="تأخير الوقت نصف ساعة للخلف"
                    >
                      <Ionicons name="remove" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.adjustButton, styles.adjustPlus]}
                      onPress={() => shiftTime(index, TIME_STEP)}
                      accessibilityLabel="تقديم الوقت نصف ساعة"
                    >
                      <Ionicons name="add" size={18} color={colors.surface} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>الجرعة {DOSE_ORDINALS[index]}</Text>
                <Ionicons
                  name={isDaytime(minutes) ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>موعد الدواء مع الأكل</Text>
        <View style={styles.chips}>
          {MEAL_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              selected={draft.mealTiming === option.key}
              onPress={() => patchDraft({ mealTiming: option.key, customTiming: undefined })}
            />
          ))}
        </View>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.soft,
  },
  radioRowSelected: {
    borderColor: colors.primary,
  },
  radioLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  adjust: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  adjustButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustMinus: {
    backgroundColor: colors.primaryLight,
  },
  adjustPlus: {
    backgroundColor: colors.primary,
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeLabelText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
