import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';
import { Footer } from './Buttons';
import { ScreenHeader } from './ScreenHeader';

export function WizardScreen({
  title,
  subtitle,
  step,
  onBack,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  step: number;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title={title} subtitle={subtitle} step={step} onBack={onBack} />
          {children}
        </ScrollView>
        <Footer>{footer}</Footer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
});
