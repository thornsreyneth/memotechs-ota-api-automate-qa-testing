import {
  test,
  expect,
  type APIResponse,
} from '@playwright/test';

import {
  withLocationPairsResponse,
} from '../../helpers/all-available-location.helper';

import {
  allAvailableLocationSchema,
} from '../../types/all-available-location.types';

async function expectStatus(
  response: APIResponse,
  expectedStatus: number,
): Promise<void> {
  const actualStatus = response.status();

  // Print a short error message, never request credentials.
  let errorMessage = '';

  if (actualStatus !== expectedStatus) {
    try {
      const body = await response.json();

      if (
        body &&
        typeof body === 'object' &&
        typeof body.message === 'string'
      ) {
        errorMessage = body.message.slice(0, 300);
      }
    } catch {
      errorMessage = 'Response body is not JSON';
    }
  }

  expect(
    actualStatus,
    [
      `URL: ${response.url()}`,
      `Expected HTTP ${expectedStatus}; received HTTP ${actualStatus}`,
      errorMessage ? `Server message: ${errorMessage}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  ).toBe(expectedStatus);
}

test.describe('OTA — All available locations', () => {
  test('ALL-LOCATIONS-001: valid credentials return HTTP 200 and JSON', async () => {
    await withLocationPairsResponse('valid', async (response) => {
      await expectStatus(response, 200);

      expect(
        response.headers()['content-type'],
        'Response must have a JSON content type',
      ).toContain('application/json');

      await expect(
        response.json(),
        'Response body must be valid JSON',
      ).resolves.toBeDefined();
    });
  });

  test('ALL-LOCATIONS-002: response matches the documented structure', async () => {
    await withLocationPairsResponse('valid', async (response) => {
      await expectStatus(response, 200);

      const body: unknown = await response.json();
      const result = allAvailableLocationSchema.safeParse(body);

      if (!result.success) {
        const issues = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || '(root)',
          message: issue.message,
        }));

        throw new Error(
          `Response differs from the documented schema:\n${JSON.stringify(
            issues,
            null,
            2,
          )}`,
        );
      }
    });
  });

  test('ALL-LOCATIONS-003: missing authentication returns HTTP 401', async () => {
    await withLocationPairsResponse('missing', async (response) => {
      await expectStatus(response, 401);
    });
  });

  test('ALL-LOCATIONS-004: invalid authentication returns HTTP 401', async () => {
    await withLocationPairsResponse('invalid', async (response) => {
      await expectStatus(response, 401);
    });
  });
});