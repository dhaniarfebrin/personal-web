import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono"', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        mono: ['"JetBrains Mono"', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: 'var(--color-canvas)',
        ink: 'var(--color-ink)',
        'ink-deep': 'var(--color-ink-deep)',
        charcoal: 'var(--color-charcoal)',
        body: 'var(--color-body)',
        mute: 'var(--color-mute)',
        stone: 'var(--color-stone)',
        ash: 'var(--color-ash)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-card': 'var(--color-surface-card)',
        // surface-dark and surface-dark-elevated are always dark (never inverted)
        'surface-dark': '#201d1d',
        'surface-dark-elevated': '#302c2c',
        hairline: 'var(--color-hairline)',
        'hairline-strong': 'var(--color-hairline-strong)',
        accent: '#007aff',
        'accent-hover': '#0056b3',
        danger: '#ff3b30',
        warning: '#ff9f0a',
        success: '#30d158',
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        full: '9999px',
      },
      fontSize: {
        'display-xl': ['38px', { lineHeight: '1.5', fontWeight: '700' }],
        'heading-md': ['16px', { lineHeight: '1.5', fontWeight: '700' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-md': ['14px', { lineHeight: '2', fontWeight: '400' }],
      },
      spacing: {
        section: '96px',
      },
      maxWidth: {
        content: '960px',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-body)',
            '--tw-prose-headings': 'var(--color-ink)',
            '--tw-prose-links': 'var(--color-ink)',
            '--tw-prose-bold': 'var(--color-ink)',
            '--tw-prose-counters': 'var(--color-mute)',
            '--tw-prose-bullets': 'var(--color-mute)',
            '--tw-prose-hr': 'var(--color-hairline)',
            '--tw-prose-quotes': 'var(--color-charcoal)',
            '--tw-prose-quote-borders': 'var(--color-hairline-strong)',
            '--tw-prose-captions': 'var(--color-mute)',
            '--tw-prose-code': 'var(--color-ink)',
            '--tw-prose-pre-bg': 'var(--color-surface-card)',
            '--tw-prose-pre-code': 'var(--color-ink)',
            '--tw-prose-th-borders': 'var(--color-hairline)',
            '--tw-prose-td-borders': 'var(--color-hairline)',
            fontFamily: '"JetBrains Mono", IBM Plex Mono, ui-monospace, monospace',
            a: {
              fontWeight: '400',
              textDecoration: 'underline',
              color: 'var(--color-ink)',
            },
            code: {
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-ink)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '400',
            },
            'code::before': false,
            'code::after': false,
            'pre code': {
              backgroundColor: 'transparent',
              color: 'var(--color-ink)',
              padding: '0',
            },
            blockquote: {
              borderLeftColor: 'var(--color-hairline-strong)',
              color: 'var(--color-charcoal)',
              fontStyle: 'normal',
            },
            h1: { color: 'var(--color-ink)', fontWeight: '700' },
            h2: { color: 'var(--color-ink)', fontWeight: '700' },
            h3: { color: 'var(--color-ink)', fontWeight: '700' },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
