import {
  request as requestFactory,
  type APIResponse,
} from '@playwright/test';

type AuthMode = 'valid' | 'missing' | 'invalid';

const ENDPOINT = '/api/location/v1/all-available-location';

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Configuration error: missing ${name} in .env`);
  }

  return value;
}

export async function withLocationPairsResponse(
  authMode: AuthMode,
  check: (response: APIResponse) => Promise<void>,
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (authMode !== 'missing') {
    const credentials =
      authMode === 'valid'
        ? `${requiredEnv('OTA_USERNAME')}:${requiredEnv('OTA_PASSWORD')}`
        : 'invalid-qa-user:invalid-qa-password';

    headers.Authorization =
      `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  // Fresh context prevents negative tests from inheriting authentication.
  const context = await requestFactory.newContext({
    baseURL: requiredEnv('OTA_BASE_URL'),
    extraHTTPHeaders: headers,
  });

  try {
    const response = await context.get(ENDPOINT, {
      timeout: 30_000,
      maxRedirects: 0,
    });

    await check(response);
  } finally {
    await context.dispose();
  }
}