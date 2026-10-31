import { StyleSheet, Text } from 'react-native';

import { Patient } from '../context/ClinicContext';
import { colors, fonts } from '../theme';
import { diseasesCountText } from '../utils/clinic';
import { SectionCard } from './SectionCard';

export function DiseasesCard({ patient }: { patient: Patient }) {
  return (
    <SectionCard title="الأمراض">
      <Text style={styles.count}>{diseasesCountText(patient.diseases.length)}</Text>
      <Text style={styles.list}>{patient.diseases.join(' - ')}</Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  count: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'right',
  },
  list: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'right',
  },
});
