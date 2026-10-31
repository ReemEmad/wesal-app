export const colors = {
  background: '#F3EFE7',
  surface: '#FFFFFF',
  primary: '#6546A4',
  primaryLight: '#EDE6F8',
  primarySoftBg: '#F5F1FB',
  text: '#222126',
  textMuted: '#696570',
  textFaint: '#A19CA7',
  success: '#37675A',
  successBg: '#E7F2E9',
  warning: '#A66B2A',
  warningBg: '#FAF0DE',
  danger: '#B42318',
  dangerBg: '#FBEAEA',
  alertBg: '#FFF8F7',
  alertBorder: '#F0C9C9',
  divider: '#EEE8DE',
  info: '#245C91',
  infoBg: '#E6EFF8',
  stockLow: '#805318',
  stockLowBg: '#F7EDDA',
  chipBorder: '#D9D3CA',
  inputBg: '#FFFDFA',
  inputBorder: '#E3DED5',
  deleteText: '#8B1C13',
  tileTan: '#F3ECDD',
  tileTanIcon: '#7A5524',
  tileLavender: '#EDE6F8',
  tileBlue: '#E8EEF7',
  tileBlueIcon: '#2F5C8F',
  tileRose: '#F6E6E8',
  tileRoseIcon: '#9B2C3A',
  adherenceLow: '#A33B48',
  dangerSolid: '#DC3A2E',
  badgeRed: '#FB2C36',
  badgeRedRing: '#FF6900',
  blobCool: '#E1E6EA',
  blobWarm: '#E8E0D2',
  sessionBanner: '#4C2F85',
  camera: '#222126',
  cameraAccent: '#C9B6E9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 19,
  pill: 999,
};

export const fonts = {
  regular: 'ReadexPro_400Regular',
  medium: 'ReadexPro_500Medium',
  semiBold: 'ReadexPro_600SemiBold',
};

export const shadow = {
  soft: {
    shadowColor: '#4D3380',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  selected: {
    shadowColor: '#6546A4',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
} as const;
