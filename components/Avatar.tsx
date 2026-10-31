import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import { initials } from '../utils/clinic';

export function Avatar({
  name,
  source,
  size = 56,
}: {
  name: string;
  source?: ImageSourcePropType;
  size?: number;
}) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={[styles.box, box]} accessibilityLabel={name}>
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize: Math.round(size * 0.3) }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
