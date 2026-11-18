import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";

// Positive tests
test("successful login", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  await loginPage.navigate();
  await loginPage.login("standard_user", "secret_sauce");

  await expect(page).toHaveURL(/inventory/);

  await expect(inventoryPage.productList).toBeVisible();
  await expect(page.getByText("Products", { exact: true })).toBeVisible();
  await expect(inventoryPage.productItems).toHaveCount(6);
});

test("Locked-out user cannot log in", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("locked_out_user", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    "Sorry, this user has been locked out",
  );
});

test("Successful login with performance glitch user", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  await loginPage.navigate();
  await loginPage.login("performance_glitch_user", "secret_sauce");

  await expect(page).toHaveURL(/inventory/);
  await expect(inventoryPage.productList).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Products", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(inventoryPage.productItems).toHaveCount(6, { timeout: 15000 });
});

// Negative tests
test("Login with invalid username", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("wrong_user", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    "Username and password do not match",
  );
});

test("Login with invalid password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("standard_user", "wrong_password");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    "Username and password do not match",
  );
});

test("Login with invalid username and password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("wrong_user", "wrong_password");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText(
    "Username and password do not match",
  );
});

// Boundary tests
test("Login with empty username", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText("Username is required");
});

test("Login with empty password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("standard_user", "");

  await expect(page).toHaveURL("/");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText("Password is required");
});

test("Login with empty username and password", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("", "");
  await expect(page).toHaveURL("/");

  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toContainText("Username is required");
});

test("Separate browser contexts do not share authenticated sessions", async ({
  browser,
}) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  try {
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const loginPage1 = new LoginPage(page1);
    const loginPage2 = new LoginPage(page2);

    const inventoryPage1 = new InventoryPage(page1);

    await loginPage1.navigate();
    await loginPage1.login("standard_user", "secret_sauce");

    await expect(page1).toHaveURL(/inventory/);
    await expect(inventoryPage1.productList).toBeVisible();
    await expect(page1.getByText("Products", { exact: true })).toBeVisible();
    await expect(inventoryPage1.productItems).toHaveCount(6);

    const baseURL = test.info().project.use.baseURL as string;
    await page2.goto(new URL("/inventory.html", baseURL).toString());

    await expect(loginPage2.loginButton).toBeVisible();
    await expect(page2).not.toHaveURL(/inventory/);
  } finally {
    await context1.close();
    await context2.close();
  }
});
