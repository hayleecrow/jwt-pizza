import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// CreateStore.createStore — franchisee creates a store and it appears on their dashboard
test('create store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'franchisee');
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByPlaceholder('store name').fill('Orem');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByRole('cell', { name: 'Orem' })).toBeVisible();
});

// CreateStore Cancel — returns to the franchise dashboard without creating a store
test('cancel create store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'franchisee');
  await page.getByRole('link', { name: 'Franchise' }).first().click();
  await page.getByRole('button', { name: 'Create store' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('main')).toContainText('LotaPizza');
});
