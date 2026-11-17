import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

// Postive tests
test("successful login", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("standard_user", "secret_sauce");

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator(".inventory_list")).toBeVisible();
  await expect(page.locator(".title")).toHaveText("Products");
  await expect(page.locator(".inventory_item")).toHaveCount(6);
});

test("Successful login with locked out user", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("locked_out_user", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText(
    "Sorry, this user has been locked out",
  );
});

test("Successful login with performance glitch user", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("performance_glitch_user", "secret_sauce");

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator(".inventory_list")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".title")).toHaveText("Products");
  await expect(page.locator(".inventory_item")).toHaveCount(6);
});

// Negative tests
test("Login with invalid username", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("wrong_user", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText(
    "Username and password do not match",
  );
});

test("Login with invalid password", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("standard_user", "wrong_password");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText(
    "Username and password do not match",
  );
});

test("Login with invalid username and password", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("wrong_user", "wrong_password");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText(
    "Username and password do not match",
  );
});

// Boundary tests
test("Login with empty username", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("", "secret_sauce");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText("Username is required");
});

test("Login with empty password", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("standard_user", "");

  await expect(page).toHaveURL("/");
  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText("Password is required");
});

test("Login with empty username and password", async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("", "");
  await expect(page).toHaveURL("/");

  await expect(login.errorMessage).toBeVisible();
  await expect(login.errorMessage).toContainText("Username is required");
});

test("Separate browser contexts do not share authenticated sessions", async ({
  browser,
}) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  try {
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const login = new LoginPage(page1);
    await login.navigate();
    await login.login("standard_user", "secret_sauce");

    await expect(page1).toHaveURL(/inventory/);
    await expect(page1.locator(".inventory_list")).toBeVisible();

    const baseURL = test.info().project.use.baseURL as string;
    await page2.goto(new URL("/inventory.html", baseURL).toString());

    await expect(page2.locator("#login-button")).toBeVisible();
    await expect(page2).not.toHaveURL(/inventory/);
  } finally {
    await context1.close();
    await context2.close();
  }
});
