import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// CloseFranchise.close — admin confirms closing a franchise and it disappears from the list
test('close franchise', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: /topSpot/ }).getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('Are you sure you want to close the topSpot franchise?')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole('cell', { name: 'topSpot' })).not.toBeVisible();
});

// CloseFranchise Cancel — the franchise is kept
test('cancel close franchise', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('row', { name: /topSpot/ }).getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('cell', { name: 'topSpot' })).toBeVisible();
});
