import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Footer, PrimaryButton, RoundButton } from '../../components/Buttons';
import { Chip } from '../../components/Chip';
import { StatusChip } from '../../components/StatusChip';
import { TabHeader } from '../../components/TabHeader';
import { Appointment, AppointmentStatus, useClinic } from '../../context/ClinicContext';
import { ClinicNavigation, ClinicTabParamList } from '../../navigation/types';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { toArabicDigits } from '../../utils/arabic';
import {
  addDays,
  APPOINTMENT_STATUS,
  formatDayNumber,
  formatTime,
  formatWeekday,
  formatWeekdayDayMonth,
  isSameDay,
  startOfDay,
} from '../../utils/clinic';

type Filter = 'all' | 'upcoming' | 'done' | 'cancelled';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'upcoming', label: 'القادمة' },
  { key: 'done', label: 'منتهية' },
  { key: 'cancelled', label: 'ملغاة' },
];

const FILTER_STATUSES: Record<Exclude<Filter, 'all'>, AppointmentStatus[]> = {
  upcoming: ['confirmed', 'pending', 'needsFollowUp'],
  done: ['completed'],
  cancelled: ['cancelled'],
};

const DAYS_SHOWN = 6;

function countText(count: number): string {
  if (count === 0) return 'لا مواعيد';
  if (count === 1) return 'موعد واحد';
  if (count === 2) return 'موعدان';
  return `${toArabicDigits(count)} مواعيد`;
}

function matchesFilter(appointment: Appointment, filter: Filter): boolean {
  return filter === 'all' || FILTER_STATUSES[filter].includes(appointment.status);
}

export default function AppointmentsScreen() {
  const navigation = useNavigation<ClinicNavigation>();
  const route = useRoute<RouteProp<ClinicTabParamList, 'Appointments'>>();
  const { appointments, getPatient } = useClinic();

  const [today] = useState(() => startOfDay(Date.now()));
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [filter, setFilter] = useState<Filter>('all');
  const [showIosPicker, setShowIosPicker] = useState(false);

  const focusDate = route.params?.focusDate;
  useEffect(() => {
    if (focusDate === undefined) return;
    const day = startOfDay(focusDate);
    setAnchor(day);
    setSelected(day);
    setFilter('all');
  }, [focusDate]);

  const days = useMemo(() => Array.from({ length: DAYS_SHOWN }, (_, index) => addDays(anchor, index)), [anchor]);

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => isSameDay(appointment.startsAt, selected))
        .sort((a, b) => a.startsAt - b.startsAt),
    [appointments, selected]
  );
  const visible = dayAppointments.filter((appointment) => matchesFilter(appointment, filter));

  const isToday = isSameDay(selected, today);
  const subtitle = `${formatWeekdayDayMonth(selected)} · ${countText(dayAppointments.length)} ${
    isToday ? 'اليوم' : 'في هذا اليوم'
  }`;

  const jumpTo = (date: Date) => {
    const day = startOfDay(date.getTime());
    setAnchor(day);
    setSelected(day);
  };

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: new Date(selected),
        mode: 'date',
        onValueChange: (_event, date) => {
          if (date) jumpTo(date);
        },
      });
    } else {
      setShowIosPicker((value) => !value);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TabHeader
          title="المواعيد"
          subtitle={subtitle}
          leftAction={<RoundButton icon="calendar-outline" label="اختيار تاريخ" onPress={openPicker} />}
        />

        {showIosPicker ? (
          <DateTimePicker
            value={new Date(selected)}
            mode="date"
            display="inline"
            locale="ar"
            onValueChange={(_event, date) => jumpTo(date)}
          />
        ) : null}

        <View style={styles.week}>
          {days.map((day) => {
            const active = isSameDay(day, selected);
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCard, active && styles.dayCardActive]}
                onPress={() => setSelected(day)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.dayName, active && styles.dayTextActive]} numberOfLines={1}>
                  {formatWeekday(day)}
                </Text>
                <Text style={[styles.dayNumber, active && styles.dayTextActive]}>{formatDayNumber(day)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.chips}>
          {FILTERS.map((item) => (
            <Chip key={item.key} label={item.label} selected={filter === item.key} onPress={() => setFilter(item.key)} />
          ))}
        </View>

        <View style={styles.list}>
          {visible.length === 0 ? (
            <Text style={styles.empty}>لا توجد مواعيد في هذا اليوم.</Text>
          ) : (
            visible.map((appointment) => {
              const patient = getPatient(appointment.patientId);
              const [clock, period] = formatTime(appointment.startsAt).split(' ');
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.id })}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                >
                  <StatusChip badge={APPOINTMENT_STATUS[appointment.status]} />
                  <View style={styles.texts}>
                    <Text style={styles.name} numberOfLines={1}>
                      {patient?.name ?? 'مريض'}
                    </Text>
                    <Text style={styles.reason} numberOfLines={1}>
                      {appointment.reason}
                    </Text>
                  </View>
                  <View style={styles.timeTile}>
                    <Text style={styles.timeValue}>{clock}</Text>
                    <Text style={styles.timePeriod}>{period}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Footer>
        <PrimaryButton label="حجز موعد جديد" onPress={() => navigation.navigate('AddAppointment')} />
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
    gap: spacing.lg,
  },
  week: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  dayCardActive: {
    backgroundColor: colors.primary,
    ...shadow.selected,
  },
  dayName: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  dayNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
  },
  dayTextActive: {
    color: colors.surface,
  },
  chips: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  empty: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  texts: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  reason: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
  timeTile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.primary,
  },
  timePeriod: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
});
