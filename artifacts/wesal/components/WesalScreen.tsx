import React, { type PropsWithChildren } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '../constants/tokens';

export function useWesalLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Only browser previews need substitute insets; devices use their real insets.
  const browserInsets = Platform.OS === 'web' ? 58 : 0;
  const availableHeight = Math.max(
    0,
    height - insets.top - insets.bottom - browserInsets,
  );
  const scale = Math.min(1, availableHeight / 816);

  return { width, height, availableHeight, scale };
}

type WesalScreenProps = PropsWithChildren<{
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function WesalScreen({ children, contentStyle }: WesalScreenProps) {
  const { availableHeight } = useWesalLayout();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, Platform.OS === 'web' && styles.webSafeArea]}
    >
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { minHeight: availableHeight },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  webSafeArea: {
    paddingTop: 24,
    paddingBottom: 34,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: tokens.space.medium,
  },
});
