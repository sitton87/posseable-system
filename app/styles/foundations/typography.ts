export const typography = {
  fontFamily: `'Calibri', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
  headingsWeight: 800,
  bodyWeight: 500,
  sizes: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 20,
    title: 24,
  },
};

export type TypographyToken = keyof typeof typography;

