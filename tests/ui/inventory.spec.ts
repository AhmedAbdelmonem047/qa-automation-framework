import { test, expect } from "@playwright/test";
import { InventoryPage } from "../../pages/InventoryPage";
import { LoginPage } from "../../pages/LoginPage";

// Start an authenticated session for each test
test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login("standard_user", "secret_sauce");
});

// Product list is visible and loaded
test("Inventory visibility", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await expect(inventoryPage.productList).toBeVisible();
});

// Exactly 6 products are displayed
test("Product count", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await expect(inventoryPage.productItems).toHaveCount(6);
});

// Every product has a non-empty name and price
test("Product information", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const products = await inventoryPage.getAllProducts();
  expect(products).toHaveLength(6);
  for (const product of products) {
    expect(product.name.trim()).not.toBe("");
    expect(product.price.trim()).not.toBe("");
  }
});

// Prices are sorted low to high
test("Price ascending sorting", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.sortProducts("lohi");
  const prices = (await inventoryPage.getAllProductPrices()).map((price) =>
    Number(price.replace("$", "")),
  );

  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

// Prices are sorted high to low
test("Price descending sorting", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.sortProducts("hilo");
  const prices = (await inventoryPage.getAllProductPrices()).map((price) =>
    Number(price.replace("$", "")),
  );

  expect(prices).toEqual([...prices].sort((a, b) => b - a));
});

// Products are sorted A–Z
test("Name ascending sorting", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.sortProducts("az");

  const names = await inventoryPage.getAllProductNames();
  const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

  expect(names).toEqual(sortedNames);
});

// Products are sorted Z-A
test("Name descending sorting", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  await inventoryPage.sortProducts("za");

  const names = await inventoryPage.getAllProductNames();
  const sortedNames = [...names].sort((a, b) => b.localeCompare(a));

  expect(names).toEqual(sortedNames);
});

// Product names and prices remain correctly associated after sorting
test("Product information after sorting", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);

  const originalProducts = await inventoryPage.getAllProducts();
  await inventoryPage.sortProducts("lohi");
  const sortedProducts = await inventoryPage.getAllProducts();

  const originalPrices = new Map(
    originalProducts.map(({ name, price }) => [name, price]),
  );

  for (const product of sortedProducts) {
    expect(originalPrices.get(product.name)).toBe(product.price);
  }

  expect(sortedProducts).toHaveLength(originalProducts.length);
});
