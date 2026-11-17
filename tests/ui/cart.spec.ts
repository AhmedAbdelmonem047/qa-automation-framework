import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";

const BACKPACK = "Sauce Labs Backpack";
const BIKE_LIGHT = "Sauce Labs Bike Light";
const BOLT_T_SHIRT = "Sauce Labs Bolt T-Shirt";

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login("standard_user", "secret_sauce");
});

// Initial cart state
test("Cart is initially empty", async ({ page }) => {
  const cartPage = new CartPage(page);
  await expect(cartPage.cartLink).toBeVisible();
  await expect(cartPage.cartBadge).toBeHidden();
});

// Add one product to cart
test("Add product to cart", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await expect(cartPage.cartBadge).toHaveText("1");

  const backpack = inventoryPage.productItems.filter({
    has: page.getByText(BACKPACK, { exact: true }),
  });

  await expect(
    backpack.getByRole("button", {
      name: "Remove",
      exact: true,
    }),
  ).toBeVisible();
});

// Remove product from inventory
test("Remove product from inventory", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await expect(cartPage.cartBadge).toHaveText("1");
  await inventoryPage.removeProductFromCart(BACKPACK);

  await expect(cartPage.cartBadge).toBeHidden();

  const backpack = inventoryPage.productItems.filter({
    has: page.getByText(BACKPACK, { exact: true }),
  });

  await expect(
    backpack.getByRole("button", {
      name: "Add to cart",
      exact: true,
    }),
  ).toBeVisible();
});

// Verify cart contents and product prices
test("Cart contains the correct products and prices", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await inventoryPage.addProductToCart(BIKE_LIGHT);
  await cartPage.openCart();
  await expect(cartPage.cartList).toBeVisible();
  await expect(cartPage.cartItems).toHaveCount(2);

  const products = await cartPage.getAllCartProducts();

  const productsByName = Object.fromEntries(
    products.map(({ name, price }) => [name, price]),
  );

  expect(productsByName).toEqual({
    [BACKPACK]: "$29.99",
    [BIKE_LIGHT]: "$9.99",
  });
});

// Cart count reflects multiple products
test("Cart count updates when adding multiple products", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await expect(cartPage.cartBadge).toHaveText("1");

  await inventoryPage.addProductToCart(BIKE_LIGHT);
  await expect(cartPage.cartBadge).toHaveText("2");

  await inventoryPage.addProductToCart(BOLT_T_SHIRT);
  await expect(cartPage.cartBadge).toHaveText("3");
});

// Remove one product from cart page
test("Remove selected product from cart page", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await inventoryPage.addProductToCart(BIKE_LIGHT);
  await cartPage.openCart();
  await expect(cartPage.cartBadge).toHaveText("2");
  await cartPage.removeProduct(BACKPACK);

  await expect(cartPage.cartBadge).toHaveText("1");
  await expect(cartPage.cartItems).toHaveCount(1);

  const names = await cartPage.getAllCartProductNames();

  expect(names).toEqual([BIKE_LIGHT]);
});

// Remove all products from cart
test("Cart becomes empty after removing all products", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await inventoryPage.addProductToCart(BIKE_LIGHT);
  await cartPage.openCart();
  await cartPage.removeProduct(BACKPACK);
  await expect(cartPage.cartBadge).toHaveText("1");
  await cartPage.removeProduct(BIKE_LIGHT);

  await expect(cartPage.cartItems).toHaveCount(0);
  await expect(cartPage.cartBadge).toBeHidden();
});

// Cart contents persist when navigating between pages
test("Cart state persists after returning to inventory", async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  await inventoryPage.addProductToCart(BACKPACK);
  await cartPage.openCart();
  await expect(cartPage.cartItems).toHaveCount(1);
  await expect(cartPage.cartBadge).toHaveText("1");
  await cartPage.continueShopping();

  await expect(inventoryPage.productList).toBeVisible();
  await expect(cartPage.cartBadge).toHaveText("1");
  await cartPage.openCart();

  const names = await cartPage.getAllCartProductNames();

  expect(names).toEqual([BACKPACK]);
});
