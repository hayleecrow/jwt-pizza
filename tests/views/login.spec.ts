import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// Login.submit — valid credentials log the diner in and show their initials in the header
test('login', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});

// Login.submit — bad password leaves the user logged out
test('login with bad password', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'wrong');

  await expect(page.getByRole('link', { name: 'KC' })).not.toBeVisible();
  await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
});
