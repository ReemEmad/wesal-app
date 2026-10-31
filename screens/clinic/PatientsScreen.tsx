import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { PatientCard } from '../../components/PatientCard';
import { SearchField } from '../../components/SearchField';
import { TabHeader } from '../../components/TabHeader';
import { Patient, REGISTERED_COUNT, useClinic } from '../../context/ClinicContext';
import { ClinicNavigation } from '../../navigation/types';
import { colors, fonts, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';

type Filter = 'all' | 'chronic' | 'needsFollowUp' | 'new';

const FILTERS: { key: Filter; label: string; match: (patient: Patient) => boolean }[] = [
  { key: 'all', label: 'الكل', match: () => true },
  { key: 'chronic', label: 'مزمنة', match: (patient) => patient.tags.includes('chronic') },
  { key: 'needsFollowUp', label: 'تحتاج متابعة', match: (patient) => patient.status === 'needsFollowUp' },
  { key: 'new', label: 'جدد', match: (patient) => patient.tags.includes('new') },
];

export default function PatientsScreen() {
  const navigation = useNavigation<ClinicNavigation>();
  const { patients } = useClinic();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(() => {
    const active = FILTERS.find((item) => item.key === filter) ?? FILTERS[0];
    return patients.filter(active.match);
  }, [patients, filter]);

  const header = (
    <View style={styles.header}>
      <TabHeader title="المرضى" subtitle={`${toArabicDigits(REGISTERED_COUNT)} مريضًا مسجّلًا في عيادتك`} />
      <SearchField
        placeholder="ابحث بالاسم أو رقم الملف أو اسم القريب"
        onPress={() => navigation.navigate('PatientSearch')}
      />
      <View style={styles.chips}>
        {FILTERS.map((item) => (
          <Chip key={item.key} label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={visible}
        keyExtractor={(patient) => patient.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد مرضى في هذا التصنيف</Text>}
        renderItem={({ item }) => (
          <PatientCard
            patient={item}
            onPress={() => navigation.navigate('PatientFile', { patientId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
      <Footer>
        <PrimaryButton label="إضافة مريض" onPress={() => navigation.navigate('AddPatient')} />
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
    padding: spacing.lg,
  },
  header: {
    gap: spacing.lg,
    paddingBottom: spacing.lg,
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
