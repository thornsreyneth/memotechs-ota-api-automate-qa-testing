import { test, expect } from '@playwright/test';
import {
  requiredEnv,
  withAvailablePairsResponse,
} from '../../helpers/location.pairs.helper';
import {
  availablePairsSchema,
} from '../../types/location.pairs.types';

function getTestDate(): string {
  const date = requiredEnv('OTA_PAIRS_DATE');

  if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    throw new Error('OTA_PAIRS_DATE must use DD-MM-YYYY');
  }

  return date;
}

test.describe('OTA — Available location pairs', () => {
  test('PAIRS-001: valid request returns the expected structure', async () => {
    await withAvailablePairsResponse(
      getTestDate(),
      'valid',
      async (response) => {
        expect(response.status()).toBe(200);

        expect(response.headers()['content-type']).toContain(
          'application/json',
        );

        const body: unknown = await response.json();
        const result = availablePairsSchema.safeParse(body);

        if (!result.success) {
          throw new Error(
            `Invalid available-pairs response:\n${JSON.stringify(
              result.error.issues,
              null,
              2,
            )}`,
          );
        }
      },
    );
  });

  test('PAIRS-002: location IDs have consistent names', async () => {
    await withAvailablePairsResponse(
      getTestDate(),
      'valid',
      async (response) => {
        expect(response.status()).toBe(200);

        const body = availablePairsSchema.parse(
          await response.json(),
        );

        const locations = new Map<
          number,
          { name: string; nameKh: string }
        >();

        for (const pair of body.items) {
          for (const location of [
            pair.fromLocation,
            pair.toLocation,
          ]) {
            const names = {
              name: location.name,
              nameKh: location.nameKh,
            };

            const previous = locations.get(location.id);

            if (previous) {
              expect.soft(
                names,
                `Inconsistent names for location ID ${location.id}`,
              ).toEqual(previous);
            } else {
              locations.set(location.id, names);
            }
          }
        }
      },
    );
  });

  test('PAIRS-003: missing authentication is rejected', async () => {
    await withAvailablePairsResponse(
      getTestDate(),
      'missing',
      async (response) => {
        expect(
          response.status(),
          'Swagger documents HTTP 401 for unauthorized requests',
        ).toBe(401);
      },
    );
  });

  test('PAIRS-004: invalid authentication is rejected', async () => {
    await withAvailablePairsResponse(
      getTestDate(),
      'invalid',
      async (response) => {
        expect(
          response.status(),
          'Swagger documents HTTP 401 for unauthorized requests',
        ).toBe(401);
      },
    );
  });
});