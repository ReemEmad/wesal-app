import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OutlineButton, PrimaryButton } from '../../components/Buttons';
import { WizardScreen } from '../../components/WizardScreen';
import { DOSAGE_FORMS, DosageForm, getDosageForm } from '../../constants/dosageForms';
import { useMedications } from '../../context/MedicationsContext';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { formatQuantity } from '../../utils/arabic';

const MAX_QUANTITY = 99;

export default function MedicationFormScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'MedicationForm'>) {
  const { draft, patchDraft, source, editingId } = useMedications();
  const config = getDosageForm(draft.form);

  const formatPick = (value: number) => (draft.form === 'tablet' && value === 0.5 ? '½' : formatQuantity(value));

  const selectForm = (form: DosageForm) => {
    const next = getDosageForm(form);
    patchDraft({ form, quantity: next.defaultQuantity, unit: next.units[0] });
  };

  const changeQuantity = (delta: number) => {
    const next = Math.round((draft.quantity + delta) * 10) / 10;
    if (next >= config.step && next <= MAX_QUANTITY) patchDraft({ quantity: next });
  };

  const footer = (
    <>
      <PrimaryButton
        label="التالي"
        disabled={draft.name.trim() === ''}
        onPress={() => navigation.navigate('DoseSchedule')}
      />
      {source === 'camera' && !editingId ? (
        <OutlineButton label="تصوير العلبة مرة أخرى" onPress={() => navigation.goBack()} />
      ) : null}
    </>
  );

  return (
    <WizardScreen
      title="بيانات الدواء"
      subtitle="الخطوة ١ من ٤"
      step={1}
      onBack={() => navigation.goBack()}
      footer={footer}
    >
      <View style={styles.field}>
        <Text style={styles.label}>اسم الدواء</Text>
        <TextInput
          style={styles.input}
          value={draft.name}
          onChangeText={(name) => patchDraft({ name })}
          placeholder={`مثال: ${config.sampleName}`}
          placeholderTextColor={colors.textFaint}
          textAlign="right"
        />
      </View>

      <View style={styles.card}>
        <View style={styles.tiles}>
          {DOSAGE_FORMS.map((form) => {
            const selected = form.key === draft.form;
            return (
              <TouchableOpacity
                key={form.key}
                style={[styles.tile, selected && styles.tileSelected]}
                onPress={() => selectForm(form.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View style={[styles.tileIcon, { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : form.tint }]}>
                  <MaterialCommunityIcons
                    name={form.icon}
                    size={22}
                    color={selected ? colors.surface : form.iconColor}
                  />
                </View>
                <Text style={[styles.tileLabel, selected && styles.tileLabelSelected]}>{form.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.cardLabel}>{config.quantityLabel}</Text>

        {config.units.length > 1 ? (
          <View style={styles.segmented}>
            {config.units.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[styles.segment, draft.unit === unit && styles.segmentSelected]}
                onPress={() => patchDraft({ unit })}
                accessibilityRole="button"
              >
                <Text style={[styles.segmentLabel, draft.unit === unit && styles.segmentLabelSelected]}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepButton, styles.stepMinus]}
            onPress={() => changeQuantity(-config.step)}
            accessibilityRole="button"
            accessibilityLabel="إنقاص"
          >
            <Ionicons name="remove" size={26} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.stepValue}>
            <Text style={styles.stepNumber}>{formatQuantity(draft.quantity)}</Text>
            <Text style={styles.stepUnit}>{draft.unit}</Text>
          </View>
          <TouchableOpacity
            style={[styles.stepButton, styles.stepPlus]}
            onPress={() => changeQuantity(config.step)}
            accessibilityRole="button"
            accessibilityLabel="زيادة"
          >
            <Ionicons name="add" size={26} color={colors.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.picks}>
          {config.quickPicks.map((value) => {
            const selected = draft.quantity === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.pick, selected && styles.pickSelected]}
                onPress={() => patchDraft({ quantity: value })}
                accessibilityRole="button"
              >
                <Text style={[styles.pickLabel, selected && styles.pickLabelSelected]}>{formatPick(value)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>ملاحظات (اختياري)</Text>
        <TextInput
          style={styles.input}
          value={draft.notes}
          onChangeText={(notes) => patchDraft({ notes })}
          placeholder="مثال: يؤخذ بعد الأكل مع كوب ماء"
          placeholderTextColor={colors.textFaint}
          textAlign="right"
        />
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
  input: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 28,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  tiles: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  tileSelected: {
    backgroundColor: colors.primary,
    ...shadow.selected,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  tileLabelSelected: {
    color: colors.surface,
  },
  cardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  segmented: {
    flexDirection: 'row-reverse',
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: radius.md - 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  segmentLabelSelected: {
    color: colors.surface,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMinus: {
    backgroundColor: colors.primaryLight,
  },
  stepPlus: {
    backgroundColor: colors.primary,
    ...shadow.selected,
  },
  stepValue: {
    alignItems: 'center',
  },
  stepNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 32,
    color: colors.text,
  },
  stepUnit: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  picks: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  pick: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickSelected: {
    backgroundColor: colors.primary,
  },
  pickLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  pickLabelSelected: {
    color: colors.surface,
  },
});
