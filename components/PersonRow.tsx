import { Ionicons } from '@expo/vector-icons';
import { ImageSourcePropType, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fonts, radius, shadow, spacing } from '../theme';
import { dialNumber } from '../utils/clinic';
import { Avatar } from './Avatar';

/** Avatar + name + subtitle on the right, round lavender phone button on the left. */
export function PersonRow({
  name,
  subtitle,
  avatar,
  phone,
}: {
  name: string;
  subtitle: string;
  avatar?: ImageSourcePropType;
  phone?: string;
}) {
  return (
    <View style={styles.row}>
      {phone ? (
        <TouchableOpacity
          style={styles.call}
          onPress={() => Linking.openURL(dialNumber(phone))}
          accessibilityRole="button"
          accessibilityLabel={`اتصال بـ ${name}`}
        >
          <Ionicons name="call-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      ) : (
        <View />
      )}
      <View style={styles.identity}>
        <View style={styles.texts}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Avatar name={name} source={avatar} size={52} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  call: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  texts: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
