import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        experimental: {
          async: true,
        },
      },
    }),
    tailwindcss(),
    icons({ compiler: 'svelte' }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: '/soundcloud-explorer',
});
