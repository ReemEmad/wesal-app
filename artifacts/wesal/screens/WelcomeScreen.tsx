import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import type { RootStackParamList } from '../App';
import { WesalButton } from '../components/WesalButton';
import { WesalScreen, useWesalLayout } from '../components/WesalScreen';
import { WesalText } from '../components/WesalText';
import { tokens } from '../constants/tokens';

export default function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Welcome'>) {
  const { width, height, scale } = useWesalLayout();
  const imageSize = Math.min(width - 52, 390) * scale;

  return (
    <View style={styles.root}>
      <WesalScreen contentStyle={styles.content}>
        <View pointerEvents="none" style={styles.decoration}>
          <View style={styles.leftShape} />
          <View style={styles.rightShape} />
          <View
            style={[
              styles.bottomShape,
              {
                top: height * 0.64,
                width: width * 1.6,
                height: height * 0.6,
              },
            ]}
          />
        </View>

        <Image
          accessible
          accessibilityLabel="وصال"
          source={require('../assets/images/wesal-wordmark.png')}
          resizeMode="contain"
          style={[styles.wordmark, { marginTop: 64 * scale }]}
        />
        <WesalText variant="welcomeHeading" accessibilityRole="header" style={styles.title}>
          أهلًا بك في وصال
        </WesalText>
        <WesalText variant="body" style={styles.subtitle}>
          خلي رعاية أحبابك أسهل، وكن قريبًا منهم في كل
          {'\n'}خطوة.
        </WesalText>

        <Image
          accessible
          accessibilityLabel="مقدمة رعاية محاطة برموز التواصل والدواء والرعاية الطبية"
          source={require('../assets/images/welcome-caregiver.png')}
          resizeMode="contain"
          style={{
            width: imageSize,
            height: imageSize,
            marginTop: 24 * scale,
          }}
        />

        <View style={styles.footer}>
          <WesalButton
            accessibilityLabel="إنشاء حساب جديد"
            label="إنشاء حساب جديد"
            onPress={() => navigation.navigate('Register')}
            testID="welcome-create-account"
          />
          <View style={styles.buttonGap} />
          <WesalButton
            accessibilityLabel="لدي حساب بالفعل"
            label="لدي حساب بالفعل"
            variant="outline"
            onPress={() => navigation.navigate('Login')}
            testID="welcome-sign-in"
          />
        </View>
      </WesalScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: tokens.colors.background,
  },
  content: {
    overflow: 'hidden',
  },
  decoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  leftShape: {
    position: 'absolute',
    left: -112,
    top: 8,
    width: 150,
    height: 160,
    borderRadius: 100,
    backgroundColor: tokens.colors.decorative,
    opacity: 0.5,
  },
  rightShape: {
    position: 'absolute',
    right: -110,
    top: 210,
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: tokens.colors.decorative,
    opacity: 0.5,
  },
  bottomShape: {
    position: 'absolute',
    left: -40,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 240,
    backgroundColor: tokens.colors.decorative,
    opacity: 0.65,
    transform: [{ rotate: '-25deg' }],
  },
  wordmark: {
    width: 120,
    height: 42,
  },
  title: {
    marginTop: 16,
  },
  subtitle: {
    width: '100%',
    marginTop: 12,
  },
  footer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 28,
  },
  buttonGap: {
    height: 16,
  },
});
