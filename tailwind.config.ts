import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        board: '#c8e6c0',
        'board-border': '#000000',
        'space-brown': '#8B4513',
        'space-lightblue': '#AAD8E6',
        'space-pink': '#D93A96',
        'space-orange': '#F7941D',
        'space-red': '#ED1B24',
        'space-yellow': '#FEF200',
        'space-green': '#1FB25A',
        'space-blue': '#0072BB',
      },
    },
  },
  plugins: [],
};

export default config;
