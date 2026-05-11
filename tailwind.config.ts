import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6EEF0',
          100: '#CFE0E5',
          200: '#A6C5CD',
          300: '#6E9AA6',
          400: '#3E7280',
          500: '#0F4C5C',
          600: '#0B404E',
          700: '#093945',
          800: '#062E38',
          900: '#04222B',
        },
        accent: {
          50: '#FBEFE6',
          100: '#F7DCC6',
          200: '#F1BC95',
          300: '#EA9A5F',
          400: '#E67E36',
          500: '#E36414',
          600: '#CC580E',
          700: '#C05308',
          800: '#9A4309',
          900: '#73320A',
        },
        cream: '#FFFCF5',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1A2D33',
          soft: '#4A5C61',
          muted: '#7A8A8F',
        },
        border: {
          DEFAULT: '#E8DFD2',
          strong: '#D6CAB7',
        },
        success: {
          DEFAULT: '#2D7A4A',
          soft: '#E3F2EA',
        },
        warning: {
          DEFAULT: '#C57B0B',
          soft: '#FBEFD6',
        },
        danger: {
          DEFAULT: '#B3261E',
          soft: '#FAE3E1',
        },
        info: {
          DEFAULT: '#0F4C5C',
          soft: '#E6EEF0',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-noto-tc)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'PingFang TC',
          'Microsoft JhengHei',
          'sans-serif',
        ],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.6' }],
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.3125rem', { lineHeight: '1.5' }],
        '2xl': ['1.625rem', { lineHeight: '1.4' }],
        '3xl': ['2.125rem', { lineHeight: '1.25' }],
        '4xl': ['2.625rem', { lineHeight: '1.2' }],
        hero: ['3rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.375rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(15, 76, 92, 0.08)',
        card: '0 6px 20px rgba(15, 76, 92, 0.10)',
        lifted: '0 14px 36px rgba(15, 76, 92, 0.14)',
        ring: '0 0 0 4px rgba(227, 100, 20, 0.25)',
      },
      maxWidth: {
        narrow: '36rem',
        content: '60rem',
        wide: '76rem',
      },
      backgroundImage: {
        'brand-gradient':
          'linear-gradient(135deg, #093945 0%, #0F4C5C 55%, #1B6072 100%)',
        'cream-gradient':
          'linear-gradient(180deg, #FFFCF5 0%, #FBEFE6 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 300ms ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
