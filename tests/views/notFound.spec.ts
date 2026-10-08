import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// NotFound view — an unknown route shows the "Oops" page
test('unknown route shows not found', async ({ page }) => {
  await basicInit(page);
  await page.goto('/nowhere');

  await expect(page.getByText('Oops')).toBeVisible();
});
