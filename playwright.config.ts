import 'dotenv/config';
import { defineConfig } from '@playwright/test';

const baseURL = process.env.OTA_BASE_URL;

if (!baseURL) {
  throw new Error('Missing OTA_BASE_URL in .env');
}

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  workers: 1,
  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});