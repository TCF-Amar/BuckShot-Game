import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        'dead-bg': '#080909',
        'dead-surface': '#121414',
        'dead-elevated': '#1B1D1D',
        'dead-red': '#A71922',
        'dead-red-bright': '#D33B42',
        'dead-text': '#E9E7E2',
        'dead-muted': '#969895',
        'dead-border': '#303333',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
};

