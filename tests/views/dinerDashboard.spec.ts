import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// DinerDashboard — shows the user's name, email and role
test('diner dashboard shows user info', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByText('Your pizza kitchen')).toBeVisible();
  await expect(page.getByText('Kai Chen')).toBeVisible();
  await expect(page.getByText('d@jwt.com')).toBeVisible();
});

// DinerDashboard order history — lists each order's id and its exact total (Veggie costs 0.0038 ₿)
test('diner dashboard shows order history with exact price', async ({ page }) => {
  // Known app bug: the total is rounded to 0.004 ₿ instead of the real price 0.0038 ₿. Remove test.fail() once fixed.
  test.fail();
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.getByRole('link', { name: 'KC' }).click();

  await expect(page.getByText('Here is your history of all the good times.')).toBeVisible();
  await expect(page.getByRole('cell', { name: '15' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '0.0038 ₿' })).toBeVisible({ timeout: 1000 });
});
