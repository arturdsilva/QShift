/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      clientsClaim: true,
      skipWaiting: true
    },
    includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png', 'icons/maskable_icon.png'],
    manifest: {
      name: 'QShift',
      short_name: 'QShift',
      theme_color: '#3f415aff',
      background_color: '#3f415aff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [{
        src: '/icons/logo192.png',
        sizes: '192x192',
        type: 'image/png'
      }, {
        src: '/icons/maskable_icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      }, {
        src: '/icons/logo512.png',
        sizes: '512x512',
        type: 'image/png'
      }]
    }
  })],
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});