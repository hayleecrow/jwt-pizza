import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// Register.submit — new diner is registered and logged in with their initials in the header
test('register', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Pat Newuser');
  await page.getByRole('textbox', { name: 'Email address' }).fill('p@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('pw');
  await page.getByRole('button', { name: 'Register' }).click();

  await expect(page.getByRole('link', { name: 'PN' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
});
