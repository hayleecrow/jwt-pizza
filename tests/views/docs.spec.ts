import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// Docs view — service docs list each endpoint with its method and path
test('service docs', async ({ page }) => {
  await basicInit(page);
  await page.goto('/docs/service');

  await expect(page.getByRole('heading', { name: '[GET] /api/order/menu' })).toBeVisible();
});

// Docs view — factory docs list each endpoint with its method and path
test('factory docs', async ({ page }) => {
  await basicInit(page);
  await page.goto('/docs/factory');

  await expect(page.getByRole('heading', { name: '[GET] /api/order/menu' })).toBeVisible();
});
