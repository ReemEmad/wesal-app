import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '../../components/Chip';
import { PatientCard } from '../../components/PatientCard';
import { PersonRow } from '../../components/PersonRow';
import { SearchField } from '../../components/SearchField';
import { SectionCard } from '../../components/SectionCard';
import { useClinic } from '../../context/ClinicContext';
import { ClinicStackParamList } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';

type Scope = 'all' | 'patients' | 'relatives';

const SCOPES: { key: Scope; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'patients', label: 'المرضى' },
  { key: 'relatives', label: 'الأقارب' },
];

export default function PatientSearchScreen({
  navigation,
}: NativeStackScreenProps<ClinicStackParamList, 'PatientSearch'>) {
  const { search } = useClinic();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');

  const trimmed = query.trim();
  const results = search(trimmed);
  const showPatients = scope !== 'relatives' && results.patients.length > 0;
  const showRelatives = scope !== 'patients' && results.relatives.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
            <Text style={styles.cancel}>إلغاء</Text>
          </TouchableOpacity>
          <View style={styles.field}>
            <SearchField
              placeholder="ابحث عن مريض أو قريب"
              value={query}
              onChangeText={setQuery}
              autoFocus
              focused
            />
          </View>
        </View>

        <View style={styles.chips}>
          {SCOPES.map((item) => (
            <Chip key={item.key} label={item.label} selected={scope === item.key} onPress={() => setScope(item.key)} />
          ))}
        </View>

        {trimmed === '' ? (
          <Text style={styles.hint}>ابحث بالاسم أو رقم الملف أو اسم القريب</Text>
        ) : !showPatients && !showRelatives ? (
          <Text style={styles.hint}>لا توجد نتائج مطابقة</Text>
        ) : null}

        {showPatients ? (
          <SectionCard title={`المرضى (${toArabicDigits(results.patients.length)})`}>
            {results.patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onPress={() => navigation.navigate('PatientFile', { patientId: patient.id })}
              />
            ))}
          </SectionCard>
        ) : null}

        {showRelatives ? (
          <SectionCard title={`الأقارب (${toArabicDigits(results.relatives.length)})`}>
            {results.relatives.map(({ relative, patient }) => (
              <PersonRow
                key={`${patient.id}-${relative.id}`}
                name={relative.name}
                avatar={relative.avatar}
                phone={relative.phone}
                subtitle={`${relative.relation} ${patient.gender === 'female' ? 'المريضة' : 'المريض'} ${patient.name}`}
              />
            ))}
          </SectionCard>
        ) : null}
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
  cancel: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.primary,
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
