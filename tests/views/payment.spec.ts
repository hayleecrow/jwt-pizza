import { test, expect } from '../testSetup';
import { basicInit, login, checkoutTwoPizzas } from '../helpers/mockService';

// Payment.cancel — cancelling returns to the menu
test('cancel payment returns to menu', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await checkoutTwoPizzas(page);
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.locator('h2')).toContainText('Awesome is a click away');
});
