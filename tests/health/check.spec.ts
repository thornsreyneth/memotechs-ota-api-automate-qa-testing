import { test, expect } from '@playwright/test';
import { getHealth } from '../../helpers/health.helper';

test.describe('OTA Gateway — Health', () => {
  test('HEALTH-001: gateway returns a healthy response', async ({
    request,
  }) => {
    const response = await getHealth(request);

    await test.step('Verify HTTP status is 200', async () => {
      expect(response.status()).toBe(200);
    });

    await test.step('Verify response content type is JSON', async () => {
      expect(response.headers()['content-type']).toContain(
        'application/json',
      );
    });

    await test.step('Verify response body indicates healthy status', async () => {
      const body = await response.json();

      expect(body).toEqual({
        status: 'ok',
      });
    });
  });
});