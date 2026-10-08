import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// App route constraints — Login/Register are shown only when logged out, Logout only when logged in
test('nav shows links based on login state', async ({ page }) => {
  await basicInit(page);
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).not.toBeVisible();

  await login(page, 'd@jwt.com', 'a');

  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).not.toBeVisible();
});

// App route constraints — the Admin link is shown to admins only
test('admin link only for admins', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();

  await page.getByRole('link', { name: 'Logout' }).click();
  await login(page, 'a@jwt.com', 'admin');
  await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
});
