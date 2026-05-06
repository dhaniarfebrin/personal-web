import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate[400]'),
            '--tw-prose-headings': theme('colors.slate[50]'),
            '--tw-prose-links': theme('colors.violet[400]'),
            '--tw-prose-bold': theme('colors.slate[50]'),
            '--tw-prose-counters': theme('colors.violet[400]'),
            '--tw-prose-bullets': theme('colors.violet[500]'),
            '--tw-prose-hr': theme('colors.slate[700]'),
            '--tw-prose-quotes': theme('colors.slate[300]'),
            '--tw-prose-quote-borders': theme('colors.violet[500]'),
            '--tw-prose-captions': theme('colors.slate[400]'),
            '--tw-prose-code': theme('colors.violet[400]'),
            '--tw-prose-pre-bg': theme('colors.slate[800]'),
            '--tw-prose-pre-code': theme('colors.slate[50]'),
            '--tw-prose-th-borders': theme('colors.slate[700]'),
            '--tw-prose-td-borders': theme('colors.slate[700]'),
            a: {
              fontWeight: '500',
              textDecoration: 'underline',
              textDecorationColor: theme('colors.violet[500]'),
              textUnderlineOffset: '2px',
              '&:hover': {
                color: theme('colors.violet[300]'),
              },
            },
            code: {
              backgroundColor: theme('colors.slate[800]'),
              color: theme('colors.violet[300]'),
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: '500',
            },
            'code::before': false,
            'code::after': false,
            'pre code': {
              backgroundColor: 'transparent',
              color: theme('colors.slate[50]'),
              padding: '0',
            },
            blockquote: {
              borderLeftColor: theme('colors.violet[500]'),
              color: theme('colors.slate[300]'),
              fontStyle: 'italic',
            },
            h1: {
              color: theme('colors.slate[50]'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.slate[50]'),
              fontWeight: '700',
            },
            h3: {
              color: theme('colors.slate[50]'),
              fontWeight: '600',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}
