// Confirmed values from the available Forma Health token export.
// The full typography and shadow collections have not been supplied.
export const tokens = {
  colors: {
    background: '#f3efe7',
    primary: '#6546a4',
    primaryPressed: '#4c327f',
    text: '#222126',
    paginationInactive: '#d9d7dc',
    white: '#ffffff',
    secondaryText: '#696570',
    decorative: '#ede6f8',
    field: '#fffdf8',
    fieldBorder: '#e4ddd1',
    danger: '#a3352f',
    dangerSoft: '#f8e7e3',
    success: '#2e6a52',
    successSoft: '#e1efe7',
    warning: '#8a5a12',
    warningSoft: '#f7ecd6',
    mist: '#d6e0e6',
    sand: '#e2d8ca',
  },
  radius: {
    pill: 999,
    field: 10,
    card: 18,
  },
  space: {
    small: 8,
    medium: 16,
    large: 24,
  },
  typography: {
    regular: 'ReadexPro_400Regular',
    semiBold: 'ReadexPro_600SemiBold',
  },
} as const;
