import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Platform, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OutlineButton, PrimaryButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { WizardScreen } from '../../components/WizardScreen';
import { Duration, useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, spacing } from '../../theme';
import { formatLongDate, toArabicDigits } from '../../utils/arabic';
import { durationText, stockDaysText, stockUnitText } from '../../utils/medication';

const DURATIONS: Duration[] = [7, 14, 30, 'ongoing'];
const LATIN_DIGITS: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function parseStock(text: string): number {
  const latin = text.replace(/[٠-٩]/g, (digit) => LATIN_DIGITS[digit]).replace(/\D/g, '');
  return latin === '' ? 0 : Math.min(parseInt(latin, 10), 9999);
}

export default function DurationStockScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'DurationStock'>) {
  const { draft, patchDraft } = useMedications();
  const [showIosPicker, setShowIosPicker] = useState(false);

  const startDate = new Date(draft.startDate);
  const next = () => navigation.navigate('Review');

  const openDatePicker = () => {
    const onValueChange = (_event: unknown, date?: Date) => {
      if (date) patchDraft({ startDate: date.getTime() });
    };
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: startDate, mode: 'date', onValueChange });
    } else {
      setShowIosPicker((value) => !value);
    }
  };

  return (
    <WizardScreen
      title="المدة والمخزون"
      subtitle="الخطوة ٣ من ٤"
      step={3}
      onBack={() => navigation.goBack()}
      footer={
        <>
          <PrimaryButton label="التالي" onPress={next} />
          <OutlineButton label="تخطي" onPress={next} />
        </>
      }
    >
      <View style={styles.field}>
        <Text style={styles.label}>مدة العلاج</Text>
        <View style={styles.chips}>
          {DURATIONS.map((duration) => (
            <Chip
              key={String(duration)}
              label={durationText(duration)}
              selected={draft.duration === duration}
              onPress={() => patchDraft({ duration })}
            />
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>تاريخ البدء</Text>
        <TouchableOpacity style={styles.input} onPress={openDatePicker} accessibilityRole="button">
          <Text style={styles.inputText}>{formatLongDate(startDate)}</Text>
        </TouchableOpacity>
        {showIosPicker ? (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="inline"
            locale="ar"
            onValueChange={(_event, date) => patchDraft({ startDate: date.getTime() })}
          />
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>عدد {draft.form === 'tablet' ? 'الأقراص' : draft.form === 'capsule' ? 'الكبسولات' : 'الوحدات'} المتوفرة</Text>
        <View style={styles.input}>
          <Text style={styles.stockUnit}>{stockUnitText(draft)}</Text>
          <TextInput
            style={styles.stockInput}
            value={toArabicDigits(draft.stock)}
            onChangeText={(text) => patchDraft({ stock: parseStock(text) })}
            keyboardType="number-pad"
            textAlign="right"
          />
        </View>
        <Text style={styles.helper}>{stockDaysText(draft)}</Text>
      </View>

      <View style={styles.toggleCard}>
        <Switch
          value={draft.lowStockAlert}
          onValueChange={(lowStockAlert) => patchDraft({ lowStockAlert })}
          trackColor={{ true: colors.primary, false: colors.chipBorder }}
          thumbColor={colors.surface}
        />
        <View style={styles.toggleTexts}>
          <Text style={styles.toggleTitle}>تنبيه عند انخفاض المخزون</Text>
          <Text style={styles.toggleSubtitle}>نذكّرك عند بقاء {toArabicDigits(7)} أيام فقط</Text>
        </View>
        <Ionicons name="notifications-outline" size={22} color={colors.primary} />
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  stockUnit: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  stockInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  helper: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  toggleTexts: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  toggleSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
