import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const adminPassword = (
    process.env.VITE_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.VITE_PASSWORD ||
    process.env.PASSWORD ||
    ''
  ).trim();

  const subAdminKey = (
    process.env.VITE_SUB_ADMIN_ACCESS_KEY ||
    process.env.SUB_ADMIN_ACCESS_KEY ||
    ''
  ).trim();

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      __APP_ADMIN_PASSWORD__: JSON.stringify(adminPassword),
      __APP_SUB_ADMIN_ACCESS_KEY__: JSON.stringify(subAdminKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          subadmin: path.resolve(__dirname, 'subadmin.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
