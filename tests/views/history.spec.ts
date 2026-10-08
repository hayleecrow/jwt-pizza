import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// History view — page renders its title
test('history page', async ({ page }) => {
  await basicInit(page);
  await page.goto('/history');

  await expect(page.getByText('Mama Rucci, my my')).toBeVisible();
});
