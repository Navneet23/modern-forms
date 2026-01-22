/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // M3 Primary colors (Purple/Violet based - matching Lavender Dreams theme)
        primary: {
          DEFAULT: '#6750A4',
          50: '#F6EDFF',
          100: '#E9DDFF',
          200: '#D3BBFF',
          300: '#B794F6',
          400: '#9A70DB',
          500: '#6750A4',
          600: '#5B4397',
          700: '#4F378B',
          800: '#432B7E',
          900: '#371E73',
        },
        // M3 Secondary colors
        secondary: {
          DEFAULT: '#625B71',
          50: '#F6F2FA',
          100: '#E8E0F0',
          200: '#CCC4D9',
          300: '#B0A7BE',
          400: '#958DA3',
          500: '#625B71',
          600: '#564F63',
          700: '#4A4356',
          800: '#3E3749',
          900: '#332B3C',
        },
        // M3 Tertiary colors
        tertiary: {
          DEFAULT: '#7D5260',
          50: '#FFD8E4',
          100: '#FFB1C8',
          200: '#EF8FAB',
          300: '#D5728F',
          400: '#BA5674',
          500: '#7D5260',
          600: '#704654',
          700: '#633B48',
          800: '#56303C',
          900: '#492530',
        },
        // M3 Error colors
        error: {
          DEFAULT: '#B3261E',
          50: '#FCEEEE',
          100: '#F9DEDC',
          200: '#F2B8B5',
          300: '#EC928E',
          400: '#E46962',
          500: '#B3261E',
          600: '#A11D17',
          700: '#8E1510',
          800: '#7C0D09',
          900: '#690502',
        },
        // M3 Surface colors
        surface: {
          DEFAULT: '#FFFBFE',
          dim: '#DED8E1',
          bright: '#FFFBFE',
          container: {
            lowest: '#FFFFFF',
            low: '#F7F2FA',
            DEFAULT: '#F3EDF7',
            high: '#ECE6F0',
            highest: '#E6E0E9',
          },
        },
        // M3 Outline colors
        outline: {
          DEFAULT: '#79747E',
          variant: '#CAC4D0',
        },
        // M3 On-colors (text on surfaces)
        on: {
          primary: '#FFFFFF',
          'primary-container': '#21005D',
          secondary: '#FFFFFF',
          'secondary-container': '#1D192B',
          tertiary: '#FFFFFF',
          'tertiary-container': '#31111D',
          error: '#FFFFFF',
          'error-container': '#410E0B',
          surface: '#1C1B1F',
          'surface-variant': '#49454F',
          background: '#1C1B1F',
        },
        // Legacy primary colors for backward compatibility
        'primary-legacy': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      // M3 Border radius
      borderRadius: {
        'none': '0px',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
        'full': '9999px',
      },
      // M3 Box shadows (elevations)
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      },
      // M3 Spacing/sizing
      spacing: {
        '13': '3.25rem',
        '18': '4.5rem',
      },
      // M3 Animation timing
      transitionTimingFunction: {
        'md-standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'md-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'md-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'md-emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      transitionDuration: {
        'short1': '50ms',
        'short2': '100ms',
        'short3': '150ms',
        'short4': '200ms',
        'medium1': '250ms',
        'medium2': '300ms',
        'medium3': '350ms',
        'medium4': '400ms',
        'long1': '450ms',
        'long2': '500ms',
      },
      // M3 Typography
      fontSize: {
        // Display
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-md': ['45px', { lineHeight: '52px', letterSpacing: '0' }],
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0' }],
        // Headline
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0' }],
        // Title
        'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        // Body
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        // Label
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },
      // M3 Min height for touch targets
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
