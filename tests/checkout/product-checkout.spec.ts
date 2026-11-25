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

  test("should prevent checkout when required information is missing", async () => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");

    await expect(cartPage.cartBadge).toHaveText("1");

    await cartPage.openCart();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.firstNameInput).toBeVisible();

    // Verify checkout starts on customer information page
    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html$/);

    // First name validation
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: First Name is required",
    );

    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html$/);

    // Last name validation
    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: Last Name is required",
    );

    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html$/);

    // Postal code validation
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.errorMessage).toHaveText(
      "Error: Postal Code is required",
    );

    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html$/);

    // Submit valid customer information
    await checkoutPage.postalCodeInput.fill("12345");
    await checkoutPage.continueButton.click();

    // Verify navigation to order overview
    await expect(checkoutPage.page).toHaveURL(/checkout-step-two\.html$/);

    await expect(checkoutPage.finishButton).toBeVisible();
    await expect(checkoutPage.cartItems).toHaveCount(1);
  });

  test("should document checkout behavior when the cart is empty", async () => {
    // Open cart without adding products
    await cartPage.openCart();

    // Verify empty cart
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toBeHidden();

    // Attempt checkout with an empty cart
    await cartPage.proceedToCheckout();

    // SauceDemo allows navigation to checkout with an empty cart.
    await expect(checkoutPage.firstNameInput).toBeVisible();

    await expect(checkoutPage.page).toHaveURL(/checkout-step-one\.html$/);

    // Submit valid customer information
    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.postalCodeInput.fill("12345");

    await checkoutPage.continueButton.click();

    // Verify empty checkout overview
    await expect(checkoutPage.page).toHaveURL(/checkout-step-two\.html$/);

    await expect(checkoutPage.cartItems).toHaveCount(0);
    await expect(checkoutPage.finishButton).toBeVisible();

    // Verify zero-value order summary
    await expect(checkoutPage.subtotalLabel).toHaveText(
      /Item total:\s*\$0(?:\.00)?/,
    );

    await expect(checkoutPage.taxLabel).toHaveText(/Tax:\s*\$0(?:\.00)?/);

    await expect(checkoutPage.totalLabel).toHaveText(/Total:\s*\$0(?:\.00)?/);
  });

  test("should complete an order and verify all purchase details", async () => {
    // Add products to cart
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

    // Proceed to checkout
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.firstNameInput).toBeVisible();

    // Enter customer information
    await checkoutPage.firstNameInput.fill("Ahmed");
    await checkoutPage.lastNameInput.fill("Mohamed");
    await checkoutPage.postalCodeInput.fill("12345");

    await checkoutPage.continueButton.click();

    await expect(checkoutPage.page).toHaveURL(/checkout-step-two\.html$/);

    // Verify checkout summary
    await expect(checkoutPage.cartItems).toHaveCount(2);

    await expect(checkoutPage.productNames).toHaveText([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    await expect(checkoutPage.productPrices).toHaveText(["$29.99", "$9.99"]);

    // Verify payment and shipping information
    await expect(checkoutPage.paymentInformation).toBeVisible();
    await expect(checkoutPage.shippingInformation).toBeVisible();

    // Verify displayed price labels
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

    // Finish order
    await checkoutPage.finishButton.click();

    // Verify final confirmation
    await expect(checkoutPage.page).toHaveURL(/checkout-complete\.html$/);

    await expect(checkoutPage.completionHeader).toHaveText(
      "Thank you for your order!",
    );

    await expect(checkoutPage.completionMessage).toHaveText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
    );

    await expect(checkoutPage.backToProductsButton).toBeVisible();
  });
});
