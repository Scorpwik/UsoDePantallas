import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://uso-de-pantallas.vercel.app',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
