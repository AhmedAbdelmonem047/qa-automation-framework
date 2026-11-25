import { test, expect } from "@playwright/test";

import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";

// Extract a monetary amount from a displayed label.
function extractAmount(text: string): number {
  const match = text.match(/\$([\d,]+\.\d{2})/);

  if (!match) {
    throw new Error(`Could not extract amount from: ${text}`);
  }

  return Number(match[1].replace(/,/g, ""));
}

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

    // Wait for inventory to load before starting each test.
    await expect(inventoryPage.productList).toBeVisible();
  });

  test("should add multiple products and manage the shopping cart", async () => {
    // Add products
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.addProductToCart("Sauce Labs Bike Light");

    // Verify cart count
    await expect(cartPage.cartBadge).toHaveText("2");

    // Open cart
    await cartPage.openCart();

    // Verify cart contents
    await expect(cartPage.cartItems).toHaveCount(2);

    await expect(cartPage.productNames).toHaveText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    await expect(cartPage.productPrices).toHaveText(["$29.99", "$9.99"]);

    // Remove Backpack
    await cartPage.removeProduct("Sauce Labs Backpack");

    // Verify remaining product
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(cartPage.cartBadge).toHaveText("1");

    await expect(cartPage.productNames).toHaveText(["Sauce Labs Bike Light"]);

    await expect(cartPage.productPrices).toHaveText(["$9.99"]);

    // Continue shopping
    await cartPage.continueShopping();

    // Verify inventory and cart state
    await expect(inventoryPage.productList).toBeVisible();
    await expect(cartPage.cartBadge).toHaveText("1");

    // Return to cart
    await cartPage.openCart();

    // Verify cart contents persist
    await expect(cartPage.cartItems).toHaveCount(1);

    await expect(cartPage.productNames).toHaveText(["Sauce Labs Bike Light"]);

    await expect(cartPage.productPrices).toHaveText(["$9.99"]);
  });

  test("should validate required checkout information", async () => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");

    await expect(cartPage.cartBadge).toHaveText("1");

    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    // Verify customer information page
    await expect(checkoutPage.firstNameInput).toBeVisible();

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

    // Submit valid customer information
    await checkoutPage.postalCodeInput.fill("12345");
    await checkoutPage.continueButton.click();

    // Verify navigation to order overview
    await expect(checkoutPage.finishButton).toBeVisible();
    await expect(checkoutPage.cartItems).toHaveCount(1);
  });

  test("should complete an order and verify all purchase details", async () => {
    // 1. Add products to cart
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.addProductToCart("Sauce Labs Bike Light");

    // Verify cart count
    await expect(cartPage.cartBadge).toHaveText("2");

    // 2. Open cart
    await cartPage.openCart();

    // Verify cart contents
    await expect(cartPage.cartItems).toHaveCount(2);

    await expect(cartPage.productNames).toHaveText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    await expect(cartPage.productPrices).toHaveText(["$29.99", "$9.99"]);

    // 3. Proceed to checkout
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.firstNameInput).toBeVisible();

    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.postalCodeInput.fill("12345");

    await checkoutPage.continueButton.click();

    // 4. Verify checkout summary
    await expect(checkoutPage.cartItems).toHaveCount(2);

    // Verify product names
    await expect(checkoutPage.productNames).toHaveText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    // Verify product prices
    await expect(checkoutPage.productPrices).toHaveText(["$29.99", "$9.99"]);

    // Verify payment and shipping information
    await expect(checkoutPage.paymentInformation).toBeVisible();
    await expect(checkoutPage.shippingInformation).toBeVisible();

    // Verify subtotal, tax and total labels
    await expect(checkoutPage.subtotalLabel).toHaveText("Item total: $39.98");

    await expect(checkoutPage.taxLabel).toHaveText("Tax: $3.20");

    await expect(checkoutPage.totalLabel).toHaveText("Total: $43.18");

    // Extract actual displayed amounts
    const subtotal = extractAmount(
      await checkoutPage.subtotalLabel.innerText(),
    );

    const tax = extractAmount(await checkoutPage.taxLabel.innerText());

    const total = extractAmount(await checkoutPage.totalLabel.innerText());

    // Verify expected amounts
    expect(subtotal).toBe(39.98);
    expect(tax).toBe(3.2);
    expect(total).toBe(43.18);

    // Verify total = subtotal + tax using actual UI values
    expect(Math.round((subtotal + tax) * 100)).toBe(Math.round(total * 100));

    // 5. Finish order
    await checkoutPage.finishButton.click();

    // Verify final confirmation
    await expect(checkoutPage.completionHeader).toHaveText(
      "Thank you for your order!",
    );

    await expect(checkoutPage.completionMessage).toHaveText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );

    await expect(checkoutPage.backToProductsButton).toBeVisible();
  });
});
