import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { tokens } from '../constants/tokens';

type WesalTextProps = TextProps & {
  variant?: 'heading' | 'button' | 'link' | 'body' | 'welcomeHeading';
};

export function WesalText({
  variant = 'heading',
  style,
  ...props
}: WesalTextProps) {
  return (
    <Text
      {...props}
      style={[styles.base, styles[variant], style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.regular,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  heading: {
    fontFamily: tokens.typography.semiBold,
    fontSize: 22,
    lineHeight: 32,
  },
  button: {
    color: tokens.colors.white,
    fontFamily: tokens.typography.semiBold,
    fontSize: 16,
  },
  link: {
    color: tokens.colors.primary,
    fontFamily: tokens.typography.regular,
    fontSize: 15,
  },
  body: {
    color: tokens.colors.secondaryText,
    fontSize: 17,
    lineHeight: 26,
  },
  welcomeHeading: {
    fontFamily: tokens.typography.semiBold,
    fontSize: 32,
    lineHeight: 46,
  },
});
