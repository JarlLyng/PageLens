/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ij: {
          primary: 'var(--ij-color-primary)',
          'primary-hover': 'var(--ij-color-primary-hover)',
          'on-primary': 'var(--ij-color-on-primary)',
          text: 'var(--ij-color-text-primary)',
          'text-secondary': 'var(--ij-color-text-secondary)',
          'text-tertiary': 'var(--ij-color-text-tertiary)',
          bg: 'var(--ij-color-bg-app)',
          card: 'var(--ij-color-bg-card)',
          muted: 'var(--ij-color-bg-muted)',
          surface: 'var(--ij-color-surface-default)',
          border: 'var(--ij-color-border-subtle)',
          'border-strong': 'var(--ij-color-border-default)',
          success: 'var(--ij-color-state-success)',
          warning: 'var(--ij-color-state-warning)',
          error: 'var(--ij-color-state-error)',
        },
        eco: {
          a: '#0cce6b',
          b: '#8ac926',
          c: '#ffca3a',
          d: '#ff924c',
          e: '#ff595e',
          f: '#d00000',
        },
      },
      borderRadius: {
        'ij-sm': 'var(--ij-radius-sm)',
        'ij-md': 'var(--ij-radius-md)',
        'ij-lg': 'var(--ij-radius-lg)',
      },
      fontFamily: {
        sans: ['var(--ij-font-ui)', 'system-ui', 'sans-serif'],
        mono: ['var(--ij-font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1080px',
      },
    },
  },
  plugins: [],
}
