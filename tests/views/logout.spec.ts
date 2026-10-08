import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// Logout — logging out clears the user and the auth token, and shows Login again
test('logout', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'KC' })).not.toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});
