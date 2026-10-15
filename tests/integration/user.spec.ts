// Integration test: no mocks. Runs against a real jwt-pizza-service and the throwaway pizza_test database.
import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";

const password = "diner";
let email: string;

// Every test starts logged in as a freshly registered "pizza diner" on their own dashboard.
test.beforeEach(async ({ page }) => {
  email = `user${Date.now()}${Math.floor(Math.random() * 100000)}@jwt.com`;
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: "pd" }).click();
});

// Opens the Edit dialog, replaces only the given fields, presses Update, and waits for the
// service to answer the update request (so later checks never run before it has finished).
async function editUser(
  page: Page,
  changes: { name?: string; email?: string; password?: string },
) {
  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  const fields = page.locator("#hs-jwt-modal").getByRole("textbox");
  if (changes.name !== undefined) await fields.nth(0).fill(changes.name);
  if (changes.email !== undefined) await fields.nth(1).fill(changes.email);
  if (changes.password !== undefined)
    await fields.nth(2).fill(changes.password);
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes("/api/user/") && r.request().method() === "PUT",
    ),
    page.getByRole("button", { name: "Update" }).click(),
  ]);
}

// Only for updates that should succeed: the dialog closes once the service has accepted the change.
async function waitForDialogClosed(page: Page) {
  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });
}

async function logout(page: Page) {
  await page.getByRole("link", { name: "Logout" }).click();
}

async function login(page: Page, loginEmail: string, loginPassword: string) {
  await page.getByRole("link", { name: "Login", exact: true }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(loginEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(loginPassword);
  await page.getByRole("button", { name: "Login" }).click();
}

async function logoutAndLogin(
  page: Page,
  loginEmail: string,
  loginPassword: string,
) {
  await logout(page);
  await login(page, loginEmail, loginPassword);
}

// DinerDashboard.updateUser (name) — the dashboard shows the new name right after Update
test("update name shows the new name", async ({ page }) => {
  await expect(page.getByRole("main")).toContainText("pizza diner");

  await editUser(page, { name: "pizza dinerx" });
  await waitForDialogClosed(page);

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

// DinerDashboard.updateUser (name) — the new name is still there after logging out and back in
test("updated name persists across logout and login", async ({ page }) => {
  await editUser(page, { name: "pizza dinerx" });
  await waitForDialogClosed(page);

  await logoutAndLogin(page, email, password);
  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

// DinerDashboard.updateUser (email) — the new email logs in and the old email no longer does
test("update email replaces the login email", async ({ page }) => {
  const newEmail = `new${email}`;
  await editUser(page, { email: newEmail });
  await waitForDialogClosed(page);
  await expect(page.getByRole("main")).toContainText(newEmail);

  await logout(page);
  await login(page, email, password);
  await expect(page.getByRole("link", { name: "Logout" })).not.toBeVisible();

  await page.goto("/");
  await login(page, newEmail, password);
  await page.getByRole("link", { name: "pd" }).click();
  await expect(page.getByRole("main")).toContainText(newEmail);
});

// DinerDashboard.updateUser (password) — the new password logs in and the old password no longer does
test("update password replaces the login password", async ({ page }) => {
  await editUser(page, { password: "newpass" });
  await waitForDialogClosed(page);

  await logout(page);
  await login(page, email, password);
  await expect(page.getByRole("link", { name: "Logout" })).not.toBeVisible();

  await page.goto("/");
  await login(page, email, "newpass");
  await expect(page.getByRole("link", { name: "pd" })).toBeVisible();
});

// DinerDashboard.updateUser (duplicate email) — an email already used by another account is rejected and the user's own data is unchanged
test("update email to another account's email is rejected", async ({
  page,
}) => {
  // Known service bug: the user table has no UNIQUE constraint on email and PUT /api/user/:id does not
  // check for an existing account, so the duplicate email is saved. Remove test.fail() once fixed.
  test.fail();
  const takenEmail = `taken${email}`;
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("other diner");
  await page.getByRole("textbox", { name: "Email address" }).fill(takenEmail);
  await page.getByRole("textbox", { name: "Password" }).fill("other");
  await page.getByRole("button", { name: "Register" }).click();
  await logoutAndLogin(page, email, password);
  await page.getByRole("link", { name: "pd" }).click();

  await editUser(page, { email: takenEmail });

  await page.reload();
  await expect(page.getByRole("main")).toContainText(email);
  await expect(page.getByRole("main")).not.toContainText(takenEmail);
});

// DinerDashboard.updateUser (blank email) — clearing the email is rejected and the original email still logs in
test("update with a blank email is rejected", async ({ page }) => {
  await editUser(page, { email: "" });

  await page.reload();
  await expect(page.getByRole("main")).toContainText(email);

  await logoutAndLogin(page, email, password);
  await expect(page.getByRole("link", { name: "pd" })).toBeVisible();
});
