import type { Config } from 'tailwindcss';

/**
 * Tokens extraídos 1:1 do DESIGN.md do kit "Coral Energy" (Google Stitch).
 * Não alterar valores aqui sem atualizar o design system — o visual das
 * telas depende da correspondência exata com o HTML exportado.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta tonal (Material) do DESIGN.md
        tertiary: '#9c3e1f',
        'on-secondary-fixed-variant': '#454749',
        'surface-container-highest': '#e4e2e4',
        surface: '#fcf8fb',
        'surface-container-low': '#f6f3f5',
        'error-container': '#ffdad6',
        'inverse-primary': '#ffb59e',
        'on-secondary-fixed': '#1a1c1d',
        'surface-container-high': '#eae7ea',
        'surface-dim': '#dcd9dc',
        'primary-fixed-dim': '#ffb59e',
        'tertiary-container': '#bc5635',
        'outline-variant': '#e0c0b6',
        'primary-container': '#c74d24',
        'on-tertiary-fixed-variant': '#802a0b',
        'secondary-container': '#dfdfe1',
        'secondary-fixed': '#e2e2e4',
        'on-tertiary-fixed': '#3a0b00',
        'surface-tint': '#a8380f',
        'tertiary-fixed': '#ffdbd0',
        'on-surface-variant': '#58423b',
        background: '#fcf8fb',
        'on-error': '#ffffff',
        error: '#ba1a1a',
        'on-primary-fixed-variant': '#852400',
        'on-secondary-container': '#616365',
        'on-primary-fixed': '#3a0b00',
        'on-background': '#1b1b1d',
        secondary: '#5d5e60',
        'on-tertiary-container': '#fffbff',
        primary: '#a5360d',
        'on-surface': '#1b1b1d',
        'primary-fixed': '#ffdbd0',
        outline: '#8c7169',
        'tertiary-fixed-dim': '#ffb59e',
        'surface-container-lowest': '#ffffff',
        'surface-bright': '#fcf8fb',
        'on-secondary': '#ffffff',
        'surface-variant': '#e4e2e4',
        'inverse-surface': '#303032',
        'on-primary': '#ffffff',
        'secondary-fixed-dim': '#c6c6c8',
        'inverse-on-surface': '#f3f0f2',
        'on-error-container': '#93000a',
        'on-tertiary': '#ffffff',
        'on-primary-container': '#fffbff',
        'surface-container': '#f0edef',
        // Cores de marca citadas na seção "Colors" do DESIGN.md e usadas
        // diretamente nas telas exportadas
        coral: '#D85A30',
        'coral-dark': '#993C1D',
        'coral-tint': '#FAECE7',
        'neutral-fill': '#F5F5F7',
        ink: '#1D1D1F',
        'ink-secondary': '#6E6E73',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
        card: '28px', // cards hyper-rounded
        btn: '14px', // botões "squircle"
        input: '12px',
      },
      spacing: {
        'container-max': '1200px',
        xs: '8px',
        gutter: '24px',
        lg: '40px',
        xl: '64px',
        sm: '16px',
        'margin-mobile': '20px',
        base: '4px',
        md: '24px',
      },
      fontSize: {
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'display-lg-mobile': ['36px', { lineHeight: '42px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};

export default config;
