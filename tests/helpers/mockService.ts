import { Page } from '@playwright/test';
import { expect } from '../testSetup';
import { Role, User } from '../../src/service/pizzaService';

export const validUsers: Record<string, User> = {
  'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
  'a@jwt.com': { id: '1', name: 'Admin Person', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] },
  'f@jwt.com': { id: '2', name: 'Fran Chisee', email: 'f@jwt.com', password: 'franchisee', roles: [{ role: Role.Diner }, { role: Role.Franchisee, objectId: '2' }] },
};

// Mocks the JWT Pizza Service (request shapes follow jwt-pizza-service/src/routes) and loads the home page.
export async function basicInit(page: Page, options: { franchiseeHasFranchise?: boolean } = {}) {
  let loggedInUser: User | undefined;
  const hasFranchise = options.franchiseeHasFranchise ?? true;

  let franchises = [
    {
      id: 2,
      name: 'LotaPizza',
      admins: [{ id: 2, name: 'Fran Chisee', email: 'f@jwt.com' }],
      stores: [
        { id: 4, name: 'Lehi', totalRevenue: 100 },
        { id: 5, name: 'Springville', totalRevenue: 200 },
        { id: 6, name: 'American Fork', totalRevenue: 300 },
      ],
    },
    { id: 3, name: 'PizzaCorp', admins: [{ id: 9, name: 'Other Person', email: 'o@jwt.com' }], stores: [{ id: 7, name: 'Spanish Fork', totalRevenue: 50 }] },
    { id: 4, name: 'topSpot', admins: [], stores: [] },
  ];

  // Login (PUT), register (POST) and logout (DELETE)
  await page.route('*/**/api/auth', async (route) => {
    const method = route.request().method();
    if (method === 'PUT') {
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 404, json: { message: 'unknown user' } });
        return;
      }
      loggedInUser = user;
      await route.fulfill({ json: { user: loggedInUser, token: 'abcdef' } });
    } else if (method === 'POST') {
      const regReq = route.request().postDataJSON();
      expect(regReq).toMatchObject({ name: expect.any(String), email: expect.any(String), password: expect.any(String) });
      loggedInUser = { id: '10', name: regReq.name, email: regReq.email, roles: [{ role: Role.Diner }] };
      await route.fulfill({ json: { user: loggedInUser, token: 'abcdef' } });
    } else if (method === 'DELETE') {
      expect(route.request().headers()['authorization']).toBe('Bearer abcdef');
      loggedInUser = undefined;
      await route.fulfill({ json: { message: 'logout successful' } });
    }
  });

  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Order history (GET) and place order (POST)
  await page.route('*/**/api/order', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        json: {
          dinerId: 3,
          orders: [{ id: 15, franchiseId: 2, storeId: 4, date: '2024-06-05T05:14:40.000Z', items: [{ id: 1, menuId: 1, description: 'Veggie', price: 0.0038 }] }],
        },
      });
      return;
    }
    expect(route.request().method()).toBe('POST');
    const orderReq = route.request().postDataJSON();
    expect(orderReq).toMatchObject({
      franchiseId: 2,
      storeId: '4',
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
    });
    await route.fulfill({ json: { order: { ...orderReq, id: 23 }, jwt: 'eyJpYXQ' } });
  });

  // Franchise list (GET) and create franchise (POST)
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    if (route.request().method() === 'POST') {
      const req = route.request().postDataJSON();
      expect(req).toMatchObject({ name: expect.any(String), admins: [{ email: expect.any(String) }] });
      franchises = [...franchises, { id: 10, name: req.name, admins: [{ id: 5, name: 'New Admin', email: req.admins[0].email }], stores: [] }];
      await route.fulfill({ json: franchises[franchises.length - 1] });
      return;
    }
    expect(route.request().method()).toBe('GET');
    const url = new URL(route.request().url());
    const filter = (url.searchParams.get('name') ?? '*').replace(/\*/g, '').toLowerCase();
    await route.fulfill({ json: { franchises: franchises.filter((f) => f.name.toLowerCase().includes(filter)), more: false } });
  });

  // A user's franchises (GET) and close franchise (DELETE)
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const id = Number(route.request().url().split('/').pop());
    if (route.request().method() === 'DELETE') {
      franchises = franchises.filter((f) => f.id !== id);
      await route.fulfill({ json: { message: 'franchise deleted' } });
      return;
    }
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: hasFranchise ? [franchises[0]] : [] });
  });

  // Create store (POST)
  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    expect(route.request().method()).toBe('POST');
    const req = route.request().postDataJSON();
    expect(req).toMatchObject({ name: expect.any(String) });
    const store = { id: 20, name: req.name, totalRevenue: 0 };
    franchises[0].stores = [...franchises[0].stores, store];
    await route.fulfill({ json: store });
  });

  // Close store (DELETE)
  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
    expect(route.request().method()).toBe('DELETE');
    const storeId = Number(route.request().url().split('/').pop());
    franchises = franchises.map((f) => ({ ...f, stores: f.stores.filter((s) => s.id !== storeId) }));
    await route.fulfill({ json: { message: 'store deleted' } });
  });

  // JWT Pizza Factory order verification
  await page.route('*/**/api/order/verify', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ jwt: 'eyJpYXQ' });
    await route.fulfill({ json: { message: 'valid', payload: { vendor: { id: 'test' }, diner: { id: 3 } } } });
  });

  // Documentation
  await page.route(/\/api\/docs/, async (route) => {
    await route.fulfill({
      json: {
        endpoints: [{ requiresAuth: false, method: 'GET', path: '/api/order/menu', description: 'Get the pizza menu', example: 'curl localhost:3000/api/order/menu', response: [{ id: 1, title: 'Veggie' }] }],
      },
    });
  });

  await page.goto('/');
}

export async function login(page: Page, email: string, password: string) {
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
}

// Puts one Veggie and one Pepperoni in the cart for store 4 and checks out (diner must already be logged in).
export async function checkoutTwoPizzas(page: Page) {
  await page.goto('/menu');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await page.getByRole('button', { name: 'Checkout' }).click();
}
