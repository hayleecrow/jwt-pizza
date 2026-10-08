import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// CreateFranchise.createFranchise — admin creates a franchise and it appears in the franchise list
test('create franchise', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').fill('NewFranchise');
  await page.getByPlaceholder('franchisee admin email').fill('new@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await page.getByPlaceholder('Filter franchises').fill('New');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByRole('cell', { name: 'NewFranchise' })).toBeVisible();
});

// CreateFranchise Cancel — returns to the admin dashboard without creating anything
test('cancel create franchise', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole('cell', { name: 'NewFranchise' })).not.toBeVisible();
});
