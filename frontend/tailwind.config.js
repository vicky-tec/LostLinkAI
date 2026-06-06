/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* ── Theme Colors from CSS Variables ── */
        'background':                 'var(--color-background)',
        'surface':                    'var(--color-surface)',
        'surface-container-lowest':   'var(--color-surface-container-lowest)',
        'surface-container-low':      'var(--color-surface-container-low)',
        'surface-container':          'var(--color-surface-container)',
        'surface-container-high':     'var(--color-surface-container-high)',
        'surface-container-highest':  'var(--color-surface-container-highest)',
        'on-surface':                 'var(--color-on-surface)',
        'on-surface-variant':         'var(--color-on-surface-variant)',
        'outline':                    'var(--color-outline)',
        'outline-variant':            'var(--color-outline-variant)',
        'border':                     'var(--color-border)',
        
        /* Primary */
        'primary':                    'var(--color-primary)',
        'primary-container':          'var(--color-primary-container)',
        'on-primary':                 'var(--color-on-primary)',
        'inverse-primary':            'var(--color-inverse-primary)',
        
        /* Secondary */
        'secondary':                  'var(--color-secondary)',
        'secondary-container':        'var(--color-secondary-container)',
        'on-secondary':               'var(--color-on-secondary)',
        
        /* Tertiary (AI / Found states) */
        'tertiary':                   'var(--color-tertiary)',
        'tertiary-container':         'var(--color-tertiary-container)',
        'on-tertiary':                'var(--color-on-tertiary)',
        
        /* Error */
        'error':                      'var(--color-error)',
        'error-container':            'var(--color-error-container)',
      },
      spacing: {
        'xs':            '8px',
        'sm':            '16px',
        'md':            '24px',
        'lg':            '40px',
        'xl':            '64px',
        'gutter':        '20px',
        'base':          '4px',
        'container-max': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.5rem',
        full:    '9999px',
      },
      fontFamily: {
        sans:              ['Inter', 'system-ui', 'sans-serif'],
        sora:              ['Sora', 'sans-serif'],
        'display-lg':      ['Sora', 'sans-serif'],
        'headline-lg':     ['Sora', 'sans-serif'],
        'headline-mobile': ['Sora', 'sans-serif'],
        'title-md':        ['Sora', 'sans-serif'],
        'body-lg':         ['Inter', 'sans-serif'],
        'body-sm':         ['Inter', 'sans-serif'],
        'label-caps':      ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg':      ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg':     ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-md':        ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'body-lg':         ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm':         ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps':      ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      animation: {
        'shimmer':    'shimmer 2s infinite linear',
        'glow':       'glow 3s ease-in-out infinite alternate',
        'spin-slow':  'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 10px rgba(77, 142, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(77, 142, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(77, 142, 255, 0.3)',
        'glow-tertiary': '0 0 20px rgba(76, 215, 246, 0.3)',
        'glow-strong': '0 0 40px rgba(77, 142, 255, 0.5)',
      },
    },
  },
  plugins: [],
}
