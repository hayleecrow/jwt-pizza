import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// CloseStore.close — admin confirms closing a store and it disappears
test('admin closes a store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: /Spanish Fork/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Are you sure you want to close the PizzaCorp store Spanish Fork')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('cell', { name: 'Spanish Fork' })).not.toBeVisible();
});

// CloseStore Cancel — the store is kept
test('admin cancels closing a store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: /Spanish Fork/ }).getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('cell', { name: 'Spanish Fork' })).toBeVisible();
});

// CloseStore.close — franchisee confirms closing their store and it disappears from their dashboard
test('franchisee closes a store', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'franchisee');
  await page.getByRole('link', { name: 'Franchise' }).first().click();

  await page.getByRole('row', { name: /Lehi/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Are you sure you want to close the LotaPizza store Lehi')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('cell', { name: 'Lehi' })).not.toBeVisible();
});
