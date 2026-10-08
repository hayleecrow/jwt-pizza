import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// Home view — page title and the "Order now" call to action are shown
test('home page', async ({ page }) => {
  await basicInit(page);

  expect(await page.title()).toBe('JWT Pizza');
  await expect(page.getByRole('button', { name: 'Order now' })).toBeVisible();
});
