const { nextui } = require('@nextui-org/react');

module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // === Einstein Brand Colors (extracted from logo: deep navy blue) ===
        brand: {
          primary:      '#1F2A49', // Deep Navy Blue — logo color, buttons, active states
          'primary-dk': '#141C33', // Darker Navy    — hover/pressed states
          'primary-lt': '#EDF0F7', // Light Navy Tint — active nav bg, highlight bg
          accent:       '#3A4F7A', // Medium Navy    — secondary accents, borders
          gold:         '#FFB300', // Golden         — achievements, badges, accents
          'gold-lt':    '#FFF8E1', // Soft Gold      — badge backgrounds
          navy:         '#0D1220', // Deepest Navy   — exam mode header
          cyan:         '#00B4D8', // Electric Cyan  — timer, progress accent
        },
        // === Neutral System ===
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#F5F7FB', // Slightly blue-tinted off-white — complements navy brand
          subtle:  '#EDF0F7', // Matches brand-primary-lt
        },
        border: {
          DEFAULT: '#E8ECEF',
          strong:  '#CBD5E1',
        },
        content: {
          primary:   '#0D1117', // Main text
          secondary: '#525F7F', // Secondary text
          muted:     '#8898AA', // Placeholders, captions
          inverse:   '#FFFFFF', // Text on dark bg
        },
        // === Status Colors ===
        success: {
          DEFAULT: '#10B981',
          light:   '#D1FAE5',
          dark:    '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light:   '#FEF3C7',
          dark:    '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light:   '#FEE2E2',
          dark:    '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light:   '#DBEAFE',
          dark:    '#2563EB',
        },
        // Legacy compatibility (kept so existing imports don't break)
        background: {
          DEFAULT: '#F8FAFB',
          dark: '#0f172a',
        },
        foreground: {
          DEFAULT: '#0D1117',
          dark: '#f8fafc',
        },
      },
      fontFamily: {
        // Display/hero headings only
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        // All UI: body, labels, inputs, buttons
        inter: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Exam timer, scores
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Accessible scale — minimum 12px
        '2xs': ['12px', { lineHeight: '16px', letterSpacing: '-0.01em' }],
        xs:    ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
        sm:    ['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
        base:  ['15px', { lineHeight: '22px', letterSpacing: '-0.01em' }],
        md:    ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        lg:    ['17px', { lineHeight: '26px', letterSpacing: '-0.015em' }],
        xl:    ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.025em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.03em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.03em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.04em' }],
      },
      spacing: {
        // Safe area insets for iOS notch / Android cutout
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
      borderRadius: {
        sm:   '6px',
        DEFAULT: '8px',
        md:   '10px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
        full: '9999px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        'brand':   '0 4px 14px rgba(31,42,73,0.30)',
        'gold':    '0 4px 14px rgba(255,179,0,0.30)',
        inner:     'inset 0 2px 4px rgba(0,0,0,0.06)',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        beep: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        blink: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
        dotBlink: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(31,42,73,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(31,42,73,0)' },
        },
      },
      animation: {
        rotate:    'rotate 2s linear infinite',
        beep:      'beep 1.5s ease-in-out infinite',
        blink:     'blink 1.2s ease-in-out infinite',
        'dot-1':   'dotBlink 1s ease-in-out infinite',
        'dot-2':   'dotBlink 1s ease-in-out infinite 0.2s',
        'dot-3':   'dotBlink 1s ease-in-out infinite 0.4s',
        'fade-up': 'fadeInUp 0.4s ease-out both',
        shimmer:   'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      screens: {
        xs:  '375px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [nextui()],
  important: true,
};
