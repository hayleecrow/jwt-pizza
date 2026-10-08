import { test, expect } from '../testSetup';
import { basicInit, login, checkoutTwoPizzas } from '../helpers/mockService';

// Delivery.verify — verifying a paid order sends its JWT to the factory, shows "valid", and Close dismisses the modal
test('verify delivery', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await checkoutTwoPizzas(page);
  await page.getByRole('button', { name: 'Pay now' }).click();

  await expect(page.getByText('Here is your JWT Pizza!')).toBeVisible();
  await expect(page.getByText('pie count:')).toBeVisible();
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByText('JWT Pizza - valid')).toBeVisible();
  // Preline ignores Close while the modal is still animating open, so wait until it reports it is fully open.
  await expect(page.locator('#hs-jwt-modal')).toHaveClass(/opened/);
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByText('JWT Pizza - valid')).not.toBeVisible();
});

// Delivery "Order more" — returns to the menu
test('order more returns to menu', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await checkoutTwoPizzas(page);
  await page.getByRole('button', { name: 'Pay now' }).click();
  await page.getByRole('button', { name: 'Order more' }).click();

  await expect(page.locator('h2')).toContainText('Awesome is a click away');
});
