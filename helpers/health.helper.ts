import type { APIRequestContext } from '@playwright/test';

export function getHealth(request: APIRequestContext) {
  return request.get('/api/health/v1/check');
}