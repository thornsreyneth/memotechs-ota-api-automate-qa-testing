import { test, expect } from '@playwright/test';
import { getLocationTree } from '../../helpers/location.helper';
import { locationTreeSchema } from '../../types/location.types';

async function readTree(
  request: Parameters<typeof getLocationTree>[0],
) {
  const response = await getLocationTree(request);

  expect(response.status(), 'Location tree HTTP status').toBe(200);

  expect(response.headers()['content-type']).toContain(
    'application/json',
  );

  const body: unknown = await response.json();
  const result = locationTreeSchema.safeParse(body);


  if (!result.success) {
    throw new Error(
      `Invalid location-tree response:\n${JSON.stringify(
        result.error.issues,
        null,
        2,
      )}`,
    );
  }

  return result.data;
}

test.describe('OTA — Location tree', () => {
  test('LOCATION-TREE-001: returns JSON matching the response structure', async ({
    request,
  }) => {
    await readTree(request);
  });

  test('LOCATION-TREE-002: numeric coordinates are within geographic ranges', async ({
    request,
  }) => {
    const tree = await readTree(request);

    for (const entry of tree) {
      for (const stop of entry.stops) {
        const label =
          `merchant=${entry.merchant.id}, stop=${stop.id}`;

        if (stop.latitude !== null) {
          const latitude = Number(stop.latitude);

          expect.soft(latitude, `${label}: latitude`).toBeGreaterThanOrEqual(-90);
          expect.soft(latitude, `${label}: latitude`).toBeLessThanOrEqual(90);
        }

        if (stop.longitude !== null) {
          const longitude = Number(stop.longitude);

          expect.soft(longitude, `${label}: longitude`).toBeGreaterThanOrEqual(-180);
          expect.soft(longitude, `${label}: longitude`).toBeLessThanOrEqual(180);
        }
      }
    }
  });

  test('LOCATION-TREE-003: no duplicate stop IDs within one entry', async ({
    request,
  }) => {
    const tree = await readTree(request);

    for (const entry of tree) {
      const ids = entry.stops.map((stop) => stop.id);

      expect.soft(
        new Set(ids).size,
        `Duplicate stops: merchant=${entry.merchant.id}, ` +
          `location=${entry.location.name}`,
      ).toBe(ids.length);
    }
  });

  test('LOCATION-TREE-004: no duplicate service-type IDs per entry', async ({
    request,
  }) => {
    const tree = await readTree(request);

    for (const entry of tree) {
      const items = entry.merchant.serviceTypes?.items;

      if (!items) {
        continue;
      }

      const ids = items.map((item) => item.id);

      expect.soft(
        new Set(ids).size,
        `Duplicate service types: merchant=${entry.merchant.id}`,
      ).toBe(ids.length);
    }
  });
});