import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, fonts, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  planLabel: string;
  onSettings: () => void;
  onSubscriptions: () => void;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError: string | null;
};

function Item({ icon, label, onPress, testID, trailing, danger, disabled }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; testID: string; trailing?: React.ReactNode; danger?: boolean; disabled?: boolean;
}) {
  const fg = danger ? colors.deleteText : colors.text;
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed, disabled && { opacity: 0.6 }]}>
      <View style={[styles.itemIcon, danger && { backgroundColor: colors.dangerBg }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.deleteText : colors.primary} />
      </View>
      <Text style={[styles.itemText, { color: fg }]}>{label}</Text>
      {trailing}
    </Pressable>
  );
}

export function HomeMenu({ visible, onClose, planLabel, onSettings, onSubscriptions, onLogout, loggingOut, logoutError }: Props) {
  const close = () => { if (!loggingOut) onClose(); };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="إغلاق القائمة" />
        <SafeAreaView edges={['top']} style={styles.wrap} pointerEvents="box-none">
          <View style={styles.panel} accessibilityViewIsModal>
            <View style={styles.head}>
              <Text accessibilityRole="header" style={styles.title}>القائمة</Text>
              <Pressable testID="home-menu-close" accessibilityRole="button" accessibilityLabel="إغلاق القائمة" onPress={close} hitSlop={8} style={styles.close}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <Item testID="home-menu-settings" icon="settings-outline" label="الإعدادات" onPress={onSettings} disabled={loggingOut} />
            <Item testID="home-menu-subscriptions" icon="card-outline" label="الاشتراكات" onPress={onSubscriptions} disabled={loggingOut}
              trailing={<View style={styles.badge}><Text style={styles.badgeText}>{planLabel}</Text></View>} />
            <View style={styles.divider} />
            <Item testID="home-menu-logout" icon="log-out-outline" label={loggingOut ? 'جارٍ تسجيل الخروج…' : 'تسجيل الخروج'} onPress={onLogout} danger disabled={loggingOut}
              trailing={loggingOut ? <ActivityIndicator color={colors.deleteText} /> : null} />
            {logoutError ? <Text accessibilityRole="alert" style={styles.err}>{logoutError}</Text> : null}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(36,26,54,0.38)' },
  wrap: { flex: 1, paddingHorizontal: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center' },
  panel: { marginTop: spacing.sm, backgroundColor: colors.background, borderRadius: 22, padding: spacing.lg, gap: spacing.xs },
  head: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text, textAlign: 'right' },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  pressed: { backgroundColor: colors.primarySoftBg },
  itemIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 16, textAlign: 'right' },
  badge: { backgroundColor: colors.successBg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.success },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xs },
  err: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger, textAlign: 'right', paddingHorizontal: spacing.sm },
});
