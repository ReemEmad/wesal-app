import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AccountPlan } from '../../constants/subscriptions';
import { Icon, num } from '../pharmacy/PharmacyUI';
import { colors, fonts, radius, shadow, spacing } from '../../theme';
import { canPurchase, priceLabel } from './planText';

type Props = { plan: AccountPlan; selected: boolean; current: boolean; onSelect: () => void; disabled?: boolean };

export function PlanCard({ plan, selected, current, onSelect, disabled }: Props) {
  const unpriced = !canPurchase(plan);
  const locked = disabled || current || unpriced;
  const cta = current ? 'خطتك الحالية' : unpriced ? 'غير متاحة حاليًا' : selected ? 'تم الاختيار' : 'اختيار الخطة';
  return (
    <View style={[styles.card, selected && styles.cardOn, current && styles.cardCurrent]}>
      {plan.badge || current ? (
        <View style={styles.badges}>
          {plan.badge ? <View style={styles.badge}><Icon name="star" size={13} /><Text style={styles.badgeText}>{plan.badge}</Text></View> : null}
          {current ? <View style={[styles.badge, styles.currentBadge]}><Icon name="check" size={13} color={colors.success} width={2.4} /><Text style={[styles.badgeText, { color: colors.success }]}>خطتك الحالية</Text></View> : null}
        </View>
      ) : null}
      <View style={styles.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name}>{plan.name}</Text>
          <Text style={styles.subtitle}>{plan.subtitle}</Text>
        </View>
        <Text style={[styles.price, unpriced && styles.priceMuted]}>{priceLabel(plan)}</Text>
      </View>
      <View style={styles.limit}>
        <Icon name="home" size={15} />
        <Text style={styles.limitText}>حتى {num(plan.elderLimit)} من كبار السن</Text>
      </View>
      <View style={{ gap: 8 }}>
        {plan.features.map(f => (
          <View key={f} style={styles.feature}>
            <Icon name="check" size={15} color={colors.success} width={2.2} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable testID={`subscription-plan-${plan.id}`} accessibilityRole="radio"
        accessibilityState={{ selected, disabled: locked }} accessibilityLabel={`${plan.name}، ${priceLabel(plan)}، ${cta}`}
        disabled={locked} onPress={onSelect}
        style={({ pressed }) => [styles.cta, selected && styles.ctaOn, locked && styles.ctaOff, pressed && styles.pressed]}>
        <Text style={[styles.ctaText, selected && { color: colors.surface }, locked && { color: colors.textMuted }]}>{cta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 22, padding: spacing.lg, gap: spacing.md, borderWidth: 1.5, borderColor: colors.divider },
  cardOn: { borderColor: colors.primary, ...shadow.soft },
  cardCurrent: { backgroundColor: colors.inputBg },
  badges: { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap' },
  badge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoftBg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  currentBadge: { backgroundColor: colors.successBg },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.primary },
  top: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.md },
  name: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, textAlign: 'right' },
  subtitle: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: colors.textMuted, textAlign: 'right' },
  price: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text, textAlign: 'left', maxWidth: 130 },
  priceMuted: { fontSize: 13, color: colors.warning },
  limit: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: colors.primarySoftBg, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 8 },
  limitText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text },
  feature: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  featureText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, textAlign: 'right' },
  cta: { minHeight: 46, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  ctaOn: { backgroundColor: colors.primary },
  ctaOff: { borderColor: colors.chipBorder, backgroundColor: colors.background },
  ctaText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
});
