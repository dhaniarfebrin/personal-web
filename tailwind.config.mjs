import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"JetBrains Mono"', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        mono: ['"JetBrains Mono"', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: '#fdfcfc',
        ink: '#201d1d',
        'ink-deep': '#0f0000',
        charcoal: '#302c2c',
        body: '#424245',
        mute: '#646262',
        stone: '#6e6e73',
        ash: '#9a9898',
        'surface-soft': '#f8f7f7',
        'surface-card': '#f1eeee',
        'surface-dark': '#201d1d',
        'surface-dark-elevated': '#302c2c',
        hairline: 'rgba(15,0,0,0.12)',
        'hairline-strong': '#646262',
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
            '--tw-prose-body': '#424245',
            '--tw-prose-headings': '#201d1d',
            '--tw-prose-links': '#201d1d',
            '--tw-prose-bold': '#201d1d',
            '--tw-prose-counters': '#646262',
            '--tw-prose-bullets': '#646262',
            '--tw-prose-hr': 'rgba(15,0,0,0.12)',
            '--tw-prose-quotes': '#302c2c',
            '--tw-prose-quote-borders': '#646262',
            '--tw-prose-captions': '#646262',
            '--tw-prose-code': '#201d1d',
            '--tw-prose-pre-bg': '#f1eeee',
            '--tw-prose-pre-code': '#201d1d',
            '--tw-prose-th-borders': 'rgba(15,0,0,0.12)',
            '--tw-prose-td-borders': 'rgba(15,0,0,0.12)',
            fontFamily: '"JetBrains Mono", IBM Plex Mono, ui-monospace, monospace',
            a: {
              fontWeight: '400',
              textDecoration: 'underline',
              color: '#201d1d',
            },
            code: {
              backgroundColor: '#f1eeee',
              color: '#201d1d',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '400',
            },
            'code::before': false,
            'code::after': false,
            'pre code': {
              backgroundColor: 'transparent',
              color: '#201d1d',
              padding: '0',
            },
            blockquote: {
              borderLeftColor: '#646262',
              color: '#302c2c',
              fontStyle: 'normal',
            },
            h1: { color: '#201d1d', fontWeight: '700' },
            h2: { color: '#201d1d', fontWeight: '700' },
            h3: { color: '#201d1d', fontWeight: '700' },
          },
        },
      }),
    },
  },
  plugins: [typography],
};
