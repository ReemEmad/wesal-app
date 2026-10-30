---
name: frontend-design
description: Use when building or styling screens and components in the Wesal app (React Native + Expo) — covers layout, spacing, theming, and component conventions to keep the UI consistent.
---

# Frontend Design

Conventions for building UI in this Expo/React Native app. Keep the app's look consistent as screens are added.

## Styling

- Use `StyleSheet.create` for component styles — no inline style objects except for one-off dynamic values.
- Prefer flexbox (`flex`, `flexDirection`, `justifyContent`, `alignItems`) over fixed positioning.
- Keep spacing on a consistent scale (e.g. 4/8/12/16/24/32) rather than arbitrary pixel values.

## Components & screens

- Screens live in `screens/`, one file per screen, default-exported.
- Extract a piece of UI into `components/` only once it's reused in a second place — don't pre-build a component library.
- Type all props explicitly; avoid `any`.

## Theming

- No design system/theme exists yet. When one is introduced (colors, typography, spacing tokens), centralize it in a single `theme.ts` and reference it from styles rather than hardcoding values per screen.
- Until then, keep colors/fonts minimal and consistent across screens (reuse the same hex values rather than introducing new ones per screen).

## Platform considerations

- Design mobile-first; verify layouts work on both iOS and Android.
- Use `SafeAreaView` (from `react-native-safe-area-context`) on screens with content near the edges.
- Avoid platform-specific hacks unless necessary; prefer Expo/React Native APIs that work cross-platform.
