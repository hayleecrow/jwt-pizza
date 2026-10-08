import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// FranchiseDashboard — franchisee sees their franchise name and stores
test('franchise dashboard lists stores', async ({ page }) => {
  await basicInit(page);
  await login(page, 'f@jwt.com', 'franchisee');
  await page.getByRole('link', { name: 'Franchise' }).first().click();

  await expect(page.getByRole('main')).toContainText('LotaPizza');
  await expect(page.getByRole('cell', { name: 'Lehi' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Springville' })).toBeVisible();
});

// FranchiseDashboard — a user with no franchise sees the "piece of the pie" invitation
test('franchise dashboard without a franchise', async ({ page }) => {
  await basicInit(page, { franchiseeHasFranchise: false });
  await page.goto('/franchise-dashboard');

  await expect(page.getByText('So you want a piece of the pie?')).toBeVisible();
});
