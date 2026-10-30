import { useMemo } from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { FigmaIcon } from '../components/FigmaIcon';
import { colors, fonts, radius, spacing } from '../theme';
import { toArabicDigits } from '../utils/arabic';

type DoseStatus = 'confirmed' | 'pending' | 'upcoming';

type DoseEntry = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  period: 'sun' | 'moon';
  status: DoseStatus;
};

const FAMILY_MEMBER_NAME = 'أحمد';

const DOSES: DoseEntry[] = [
  { id: '1', name: 'ميتفورمين ٥٠٠', dosage: 'قرص واحد', time: '٨:٠٠ ص', period: 'sun', status: 'confirmed' },
  { id: '2', name: 'أملوديبين ٥', dosage: 'قرص واحد', time: '٩:٠٠ ص', period: 'sun', status: 'confirmed' },
  { id: '3', name: 'ميتفورمين ٥٠٠', dosage: 'قرص واحد', time: '٢:٠٠ م', period: 'sun', status: 'pending' },
  { id: '4', name: 'فيتامين د', dosage: 'قرص واحد', time: '٨:٠٠ م', period: 'moon', status: 'upcoming' },
  { id: '5', name: 'ميتفورمين ٥٠٠', dosage: 'قرص واحد', time: '١٠:٠٠ م', period: 'moon', status: 'upcoming' },
];

const STATUS_CONFIG: Record<
  DoseStatus,
  { label: string; background: string; foreground: string }
> = {
  confirmed: { label: 'تم التأكيد', background: colors.successBg, foreground: colors.success },
  pending: { label: 'بانتظار التأكيد', background: colors.warningBg, foreground: colors.warning },
  upcoming: { label: 'موعده لاحقًا', background: colors.primarySoftBg, foreground: colors.primary },
};

const RING_SIZE = 108;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function StatusBadge({ status }: { status: DoseStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.background }]}>
      <Text style={[styles.statusBadgeLabel, { color: config.foreground }]}>{config.label}</Text>
      {status === 'confirmed' && <FigmaIcon name="icon_check_circle" size={17} />}
      {status === 'pending' && <FigmaIcon name="icon_clock" size={17} />}
      {status === 'upcoming' && <FigmaIcon name="icon_ring_outline" width={17} height={16} />}
    </View>
  );
}

function FamilyChip({
  label,
  image,
  selected,
}: {
  label: string;
  image?: ImageSourcePropType;
  selected?: boolean;
}) {
  return (
    <View style={styles.familyChip}>
      <View style={[styles.familyAvatar, selected && styles.familyAvatarSelected]}>
        {image ? (
          <Image source={image} style={styles.familyAvatarImage} resizeMode="cover" />
        ) : (
          <FigmaIcon name="icon_add_family" size={24} />
        )}
      </View>
      <Text style={styles.familyChipLabel}>{label}</Text>
    </View>
  );
}

function DoseRow({ dose }: { dose: DoseEntry }) {
  return (
    <View style={styles.doseRow}>
      <StatusBadge status={dose.status} />

      <View style={styles.doseInfo}>
        <View style={styles.doseNameBlock}>
          <Text style={styles.doseName}>{dose.name}</Text>
          <Text style={styles.doseDosage}>{dose.dosage}</Text>
        </View>
        <View style={styles.doseTimeBlock}>
          <FigmaIcon name={dose.period === 'sun' ? 'icon_sun' : 'icon_moon'} size={16} />
          <Text style={styles.doseTime}>{dose.time}</Text>
        </View>
      </View>

      {dose.status === 'pending' && (
        <View style={styles.doseChevron}>
          <FigmaIcon name="icon_chevron_down" size={11} />
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const dateLabel = useMemo(
    () => new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    []
  );

  const confirmedCount = DOSES.filter((dose) => dose.status === 'confirmed').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.notificationButton} accessibilityLabel="الإشعارات">
            <FigmaIcon name="icon_bell" size={21} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.headerText}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              <Text style={styles.greetingText}>مساء الخير {FAMILY_MEMBER_NAME}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Image
                source={require('../assets/figma/avatar-ahmed-541de5.png')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <View style={styles.familyRow}>
          <FamilyChip label="أضف" />
          <FamilyChip label="أبي" image={require('../assets/figma/avatar-dad-326ac1.png')} />
          <FamilyChip label="أمي" image={require('../assets/figma/avatar-mom-697d8b.png')} selected />
        </View>

        <View style={styles.progressCard}>
          <Image
            source={require('../assets/figma/progress-decoration.png')}
            style={styles.progressDecoration}
            resizeMode="contain"
          />

          <View style={styles.progressRing}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.progressRingImage}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#C9B6E9"
                strokeWidth={RING_STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.surface}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${RING_CIRCUMFERENCE * (confirmedCount / DOSES.length)} ${RING_CIRCUMFERENCE}`}
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <Text style={styles.progressRingValue}>
              {toArabicDigits(confirmedCount)} من {toArabicDigits(DOSES.length)}
            </Text>
            <Text style={styles.progressRingLabel}>جرعات تم تأكيدها</Text>
          </View>

          <View style={styles.progressMessage}>
            <Text style={styles.progressMessageText}>والدتك بخير، ومتابعتك فارقة</Text>
            <FigmaIcon name="icon_smile" size={20} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.scheduleHeader}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>أدوية سعاد</Text>
              <FigmaIcon name="icon_pill" size={15} />
            </View>
            <Text style={styles.cardTitle}>جدول أدوية اليوم</Text>
          </View>

          <View style={styles.doseList}>
            {DOSES.map((dose) => (
              <DoseRow key={dose.id} dose={dose} />
            ))}
          </View>

          <TouchableOpacity style={styles.addMedicationButton}>
            <Text style={styles.addMedicationText}>إضافة دواء</Text>
            <FigmaIcon name="icon_plus" size={18} />
          </TouchableOpacity>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertRow}>
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>ماما مأكدتش دوا الصبح</Text>
              <Text style={styles.alertSubtitle}>ميتفورمين ٥٠٠ · كان ميعاده ٩:٠٠ · اتأجل مرة</Text>
            </View>
            <View style={styles.alertIconCircle}>
              <FigmaIcon name="icon_alert" size={20} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.alertRow}>
            <View style={styles.alertText}>
              <Text style={styles.alertReasonLabel}>السبب اللي اختارته</Text>
              <Text style={styles.alertReasonValue}>الدوا خلص</Text>
            </View>
            <View style={styles.alertReasonIcon}>
              <FigmaIcon name="icon_box" size={18} />
            </View>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>اتصل بماما</Text>
            <FigmaIcon name="icon_phone" size={16} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.voiceButton}>
            <Text style={styles.voiceButtonText}>تسجيل رسالة صوتية</Text>
            <FigmaIcon name="icon_mic" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.earlierCard}>
          <View style={styles.alertRow}>
            <View style={styles.alertText}>
              <Text style={styles.alertReasonLabel}>اتأكد الساعة ٧:٠٢</Text>
              <Text style={styles.alertReasonValue}>أملوديبين ٥ · تم التأكيد</Text>
            </View>
            <View style={styles.confirmedIconCircle}>
              <FigmaIcon name="icon_check" size={18} />
            </View>
          </View>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FB2C36',
    borderWidth: 1.3,
    borderColor: '#FF6900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dateText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.text,
    textAlign: 'right',
  },
  greetingText: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'right',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  familyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
  },
  familyChip: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  familyAvatar: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  familyAvatarSelected: {
    borderWidth: 4,
    borderColor: colors.primary,
  },
  familyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  familyChipLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 136,
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    overflow: 'hidden',
  },
  progressDecoration: {
    position: 'absolute',
    left: 251,
    top: 19,
    width: 136.5,
    height: 91,
  },
  progressMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  progressMessageText: {
    width: 122,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.surface,
    textAlign: 'right',
  },
  progressRing: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  progressRingImage: {
    position: 'absolute',
    width: 108,
    height: 108,
  },
  progressRingValue: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.surface,
  },
  progressRingLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.surface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagPillText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.primary,
  },
  doseList: {
    gap: spacing.sm,
  },
  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(245, 241, 251, 0.34)',
    borderWidth: 0.5,
    borderColor: '#EDF1ED',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusBadgeLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  doseChevron: {
    position: 'absolute',
    left: spacing.md + 2,
    bottom: 6,
    transform: [{ rotate: '-90deg' }],
  },
  doseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  doseNameBlock: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  doseName: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  doseDosage: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
  },
  doseTimeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  doseTime: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textMuted,
  },
  addMedicationButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 48,
  },
  addMedicationText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.surface,
  },
  alertCard: {
    backgroundColor: colors.alertBg,
    borderWidth: 2,
    borderColor: colors.alertBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  alertText: {
    flex: 1,
    gap: spacing.xs,
  },
  alertTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'right',
  },
  alertSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    textAlign: 'right',
  },
  alertIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertReasonValue: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  alertReasonLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    textAlign: 'right',
  },
  alertReasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  callButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 48,
  },
  callButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.surface,
  },
  voiceButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFDFA',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    height: 48,
  },
  voiceButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
  earlierCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  confirmedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
