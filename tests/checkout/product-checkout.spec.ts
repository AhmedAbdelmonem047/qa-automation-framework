import { test, expect } from "@playwright/test";

import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";

test.describe("Product Selection, Cart and Checkout", () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");
  });

  test("should add multiple products and manage the shopping cart", async () => {
    // Add products
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.addProductToCart("Sauce Labs Bike Light");

    // Verify cart badge
    await expect(cartPage.cartBadge).toHaveText("2");

    // Open cart
    await cartPage.openCart();

    // Verify selected products
    await expect(cartPage.cartItems).toHaveCount(2);

    await expect(cartPage.cartItems).toContainText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    // Remove Backpack
    await cartPage.removeProduct("Sauce Labs Backpack");

    // Verify remaining product
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartBadge).toHaveText("1");

    await expect(cartPage.cartItems).toContainText("Sauce Labs Bike Light");

    // Continue shopping
    await cartPage.continueShopping();

    // Verify inventory is displayed
    await expect(inventoryPage.productList).toBeVisible();

    // Verify cart badge persists
    await expect(cartPage.cartBadge).toHaveText("1");

    // Return to cart
    await cartPage.openCart();

    // Verify remaining cart item persists
    await expect(cartPage.cartItems).toHaveCount(1);

    await expect(cartPage.cartItems).toContainText("Sauce Labs Bike Light");
  });

  test("should validate required checkout information", async () => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");

    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    // First name validation
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: First Name is required",
    );

    // Last name validation
    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: Last Name is required",
    );

    // Postal code validation
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: Postal Code is required",
    );

    // Valid customer information
    await checkoutPage.postalCodeInput.fill("12345");
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.finishButton).toBeVisible();
  });

  test("should complete an order successfully", async ({ page }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.addProductToCart("Sauce Labs Bike Light");

    await expect(cartPage.cartBadge).toHaveText("2");

    await cartPage.openCart();

    expect(await cartPage.getAllCartProductNames()).toEqual([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    expect(await cartPage.getAllCartProductPrices()).toEqual([
      "$29.99",
      "$9.99",
    ]);

    await cartPage.proceedToCheckout();

    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.postalCodeInput.fill("12345");

    await checkoutPage.continueButton.click();

    // Verify order overview
    await expect(checkoutPage.cartItems).toHaveCount(2);

    await expect(checkoutPage.paymentInformation).toBeVisible();
    await expect(checkoutPage.shippingInformation).toBeVisible();

    const orderNames = await checkoutPage.cartItems
      .locator('[data-test="inventory-item-name"]')
      .allInnerTexts();

    expect(orderNames).toEqual([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    // Verify subtotal, tax and total calculations.
    const subtotalText = await checkoutPage.subtotalLabel.innerText();
    const taxText = await checkoutPage.taxLabel.innerText();
    const totalText = await checkoutPage.totalLabel.innerText();

    const amount = (text: string): number =>
      Number(text.match(/\$([\d.]+)/)?.[1]);

    const subtotal = amount(subtotalText);
    const tax = amount(taxText);
    const total = amount(totalText);

    expect(subtotal).toBeCloseTo(39.98, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // Complete order
    await checkoutPage.finishButton.click();

    await expect(checkoutPage.completionHeader).toBeVisible();
    await expect(checkoutPage.completionMessage).toBeVisible();

    await expect(checkoutPage.backToProductsButton).toBeVisible();
  });
});
