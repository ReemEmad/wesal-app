import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { I18nManager, Image, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { WesalButton } from '../components/WesalButton';
import { WesalScreen, useWesalLayout } from '../components/WesalScreen';
import { WesalText } from '../components/WesalText';
import { tokens } from '../constants/tokens';

const slides = [
  {
    illustration: require('../assets/images/onboarding-care.png'),
    imageLabel: 'رجل مسن يستخدم هاتفه وتظهر صورة مقدم الرعاية',
    title: 'اطمئن على عزيزك، وتابع التزامه\nبمواعيد الدواء',
  },
  {
    illustration: require('../assets/images/onboarding-voice.png'),
    imageLabel: 'مقدمة رعاية وعزيزها يتواصلان برسائل صوتية',
    title: 'خليك قريب من أحبابك، وابعتلهم\nرسالة بصوتك تحسسهم إنك دايمًا\nمعاهم',
  },
  {
    illustration: require('../assets/images/onboarding-clinic.png'),
    imageLabel: 'رجل مسن ومقدمة الرعاية يتواصلان مع الطبيبة',
    title: 'عيادتك وطبيبك على تواصل معاك\nومع أحبابك، لرعاية أقرب واطمئنان\nأكتر',
  },
] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation, route }: Props) {
  const { width, scale } = useWesalLayout();
  const step = route.params?.step ?? 0;
  const slide = slides[step];
  const imageWidth = Math.min(width - 32, 400) * scale;
  const imageHeight = imageWidth / (370 / 400);
  const isLast = step === 2;

  const openWelcome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const next = () => {
    if (isLast) {
      openWelcome();
    } else {
      navigation.push('Onboarding', { step: (step + 1) as 1 | 2 });
    }
  };

  return (
    <WesalScreen>
      <View
        style={[
          styles.illustrationArea,
          { height: imageHeight + 46 * scale, paddingTop: 46 * scale },
        ]}
      >
        {step > 0 && (
          <View
            pointerEvents="none"
            style={[
              styles.backdrop,
              {
                width: imageWidth * 0.95,
                height: imageWidth * 0.95,
                top: imageHeight * (step === 1 ? 0.285 : 0.16),
              },
            ]}
          />
        )}
        <Image
          accessible
          accessibilityLabel={slide.imageLabel}
          source={slide.illustration}
          resizeMode="contain"
          style={{ width: imageWidth, height: imageHeight }}
        />
      </View>

      <View
        accessible
        accessibilityLabel={`الخطوة ${step + 1} من ثلاث خطوات`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: 3, now: step + 1 }}
        style={[styles.pagination, { marginTop: 46 * scale }]}
        testID={`onboarding-page-${step + 1}`}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === step && styles.activeDot]}
          />
        ))}
      </View>

      <WesalText
        accessibilityRole="header"
        style={[styles.title, { marginTop: 32 * scale }]}
      >
        {slide.title}
      </WesalText>

      <View style={styles.footer}>
        <WesalButton
          accessibilityLabel={isLast ? 'ابدأ الآن' : 'التالي'}
          label={isLast ? 'ابدأ الآن' : 'التالي'}
          onPress={next}
          testID={isLast ? 'onboarding-start' : 'onboarding-next'}
        />
        <View style={styles.skipSlot}>
          {!isLast && (
            <WesalButton
              accessibilityLabel="تخطي"
              label="تخطي"
              onPress={openWelcome}
              variant="link"
              testID="onboarding-skip"
            />
          )}
        </View>
      </View>
    </WesalScreen>
  );
}

const styles = StyleSheet.create({
  illustrationArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: tokens.colors.decorative,
    opacity: 0.65,
  },
  pagination: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    minHeight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: tokens.colors.paginationInactive,
  },
  activeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: tokens.colors.primary,
  },
  title: {
    width: '100%',
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 2,
  },
  skipSlot: {
    height: 48,
  },
});
