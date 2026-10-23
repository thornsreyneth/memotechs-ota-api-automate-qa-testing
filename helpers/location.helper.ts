import type { APIRequestContext } from '@playwright/test';

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }

  return value;
}

export function getLocationTree(request: APIRequestContext) {
  const username = requiredEnv('OTA_USERNAME');
  const password = requiredEnv('OTA_PASSWORD');

  const credentials = Buffer.from(
    `${username}:${password}`,
  ).toString('base64');

  return request.get('/api/location/v1/tree', {
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${credentials}`,
    },
  });
}