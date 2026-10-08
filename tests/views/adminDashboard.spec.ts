import { test, expect } from '../testSetup';
import { basicInit, login } from '../helpers/mockService';

// AdminDashboard — admin sees every franchise with its stores
test('admin dashboard lists franchises', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole('cell', { name: 'LotaPizza' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'PizzaCorp' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Spanish Fork' })).toBeVisible();
});

// AdminDashboard.filterFranchises — filtering by name shows only matching franchises
test('admin dashboard filters franchises', async ({ page }) => {
  await basicInit(page);
  await login(page, 'a@jwt.com', 'admin');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByPlaceholder('Filter franchises').fill('Lota');
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByRole('cell', { name: 'LotaPizza' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'PizzaCorp' })).not.toBeVisible();
});

// AdminDashboard access control — a non-admin diner cannot see the dashboard
test('non-admin cannot see admin dashboard', async ({ page }) => {
  await basicInit(page);
  await login(page, 'd@jwt.com', 'a');
  await page.goto('/admin-dashboard');

  await expect(page.getByText("Mama Ricci's kitchen")).not.toBeVisible();
});
