import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        void: '#030405',
        amberSignal: '#ffb64d',
        cyanSignal: '#5ce8ff',
        panel: 'rgba(255, 255, 255, 0.075)',
      },
      boxShadow: {
        amber: '0 0 38px rgba(255, 182, 77, 0.34)',
        cyan: '0 0 42px rgba(92, 232, 255, 0.24)',
      },
    },
  },
  plugins: [],
};

export default config;
