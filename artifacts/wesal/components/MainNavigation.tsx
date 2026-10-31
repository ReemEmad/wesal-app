import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';
import { Icon, type IconName } from './pharmacy/PharmacyUI';

type Props = { active: 'home' | 'pharmacy' | 'meds' | 'clinics'; onHome: () => void; onPharmacy: () => void; onMedications: () => void; onClinics: () => void };

export function MainNavigation({ active, onHome, onPharmacy, onMedications, onClinics }: Props) {
  const insets = useSafeAreaInsets();
  // Visual RTL order (right→left): Home, Clinics, Pharmacy, Medications.
  const items: { key: string; label: string; icon: IconName; onPress?: () => void }[] = [
    { key: 'home', label: 'الرئيسية', icon: 'home', onPress: onHome },
    { key: 'clinics', label: 'العيادات', icon: 'clinic', onPress: onClinics },
    { key: 'pharmacy', label: 'الصيدلية', icon: 'cross', onPress: onPharmacy },
    { key: 'meds', label: 'الأدوية', icon: 'pill', onPress: onMedications },
  ];
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]} accessibilityRole="tablist">
      {items.map(item => {
        const on = item.key === active;
        const enabled = !!item.onPress;
        const color = on ? colors.primary : enabled ? colors.textMuted : colors.textFaint;
        return (
          <Pressable
            key={item.key}
            testID={`main-nav-${item.key}`}
            accessibilityRole="tab"
            accessibilityLabel={enabled ? item.label : `${item.label}، غير متاح في نسخة العرض`}
            accessibilityHint={enabled ? undefined : 'هذا القسم غير متاح حاليًا'}
            accessibilityState={{ selected: on, disabled: !enabled }}
            disabled={!enabled}
            onPress={() => { if (!on) item.onPress?.(); }}
            style={styles.item}
          >
            {on ? <View style={styles.indicator} /> : null}
            <Icon name={item.icon} size={22} color={color} width={on ? 2.2 : 1.7} />
            <Text style={[styles.label, { color }, on && styles.labelOn]}>{item.label}</Text>
            {!enabled ? <Text style={styles.soon}>قريبًا</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default MainNavigation;

const styles = StyleSheet.create({
  bar: { flexDirection: 'row-reverse', backgroundColor: colors.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, shadowColor: '#4D3380', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 8 },
  item: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52, paddingTop: 6 },
  indicator: { position: 'absolute', top: -8, width: 54, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  label: { fontFamily: fonts.regular, fontSize: 12 },
  labelOn: { fontFamily: fonts.semiBold },
  soon: { fontFamily: fonts.regular, fontSize: 9, color: colors.textFaint, marginTop: -2 },
});
