import { test, expect } from '../testSetup';
import { basicInit } from '../helpers/mockService';

// About view — page renders its title
test('about page', async ({ page }) => {
  await basicInit(page);
  await page.goto('/about');

  await expect(page.getByText('The secret sauce')).toBeVisible();
});
