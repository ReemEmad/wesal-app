import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Patient } from '../context/ClinicContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { toArabicDigits } from '../utils/arabic';
import { adherenceColor, PATIENT_STATUS, relativesLabel } from '../utils/clinic';
import { AdherenceBar } from './AdherenceBar';
import { Avatar } from './Avatar';
import { FigmaIcon } from './FigmaIcon';
import { StatusChip } from './StatusChip';

export function PatientCard({ patient, onPress }: { patient: Patient; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} accessibilityRole="button" activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Ionicons name="chevron-back" size={22} color={colors.textMuted} />
        <View style={styles.identity}>
          <View style={styles.texts}>
            <Text style={styles.name}>{patient.name}</Text>
            <Text style={styles.meta}>
              {toArabicDigits(patient.age)} سنة · ملف {toArabicDigits(patient.fileNo)}
            </Text>
          </View>
          <Avatar name={patient.name} source={patient.avatar} size={56} />
        </View>
      </View>

      <View style={styles.row}>
        <AdherenceBar value={patient.adherence} color={adherenceColor(patient)} />
        <Text style={styles.summary} numberOfLines={1}>
          {patient.summary}
        </Text>
      </View>

      <View style={styles.row}>
        <StatusChip badge={PATIENT_STATUS[patient.status]} />
        <View style={styles.relatives}>
          <Text style={styles.relativesLabel}>{relativesLabel(patient.relatives.length)}</Text>
          <FigmaIcon name="icon_users_small" size={18} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.md,
    ...shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  texts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'right',
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summary: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'right',
  },
  relatives: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relativesLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
