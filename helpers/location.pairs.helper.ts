import {
  request as requestFactory,
  type APIResponse,
} from '@playwright/test';

type AuthMode = 'valid' | 'missing' | 'invalid';

export function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Missing ${name} in .env`);
  }

  return value;
}

export async function withAvailablePairsResponse(
  date: string,
  auth: AuthMode,
  check: (response: APIResponse) => Promise<void>,
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (auth !== 'missing') {
    const credentials =
      auth === 'valid'
        ? `${requiredEnv('OTA_USERNAME')}:${requiredEnv('OTA_PASSWORD')}`
        : 'invalid-qa-user:invalid-qa-password';

    headers.Authorization =
      `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  const context = await requestFactory.newContext({
    baseURL: requiredEnv('OTA_BASE_URL'),
    extraHTTPHeaders: headers,
  });

  try {
    const response = await context.get(
      '/api/location/v1/available-pairs',
      {
        params: { date },
        timeout: 30_000,
        maxRedirects: 0,
      },
    );

    await check(response);
  } finally {
    await context.dispose();
  }
}