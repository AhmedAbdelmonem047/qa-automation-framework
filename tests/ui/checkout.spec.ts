import { test, expect } from "@playwright/test";

import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { checkoutTestData } from "../../test-data/checkout-data";

test("Complete a valid purchase and verify order summary", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  const customer = checkoutTestData.validCustomer;
  const product = checkoutTestData.selectedProduct;

  // 1. Login
  await loginPage.navigate();
  await loginPage.login("standard_user", "secret_sauce");
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(inventoryPage.productList).toBeVisible();

  // 2. Add product to cart
  await inventoryPage.addProductToCart(product.name);

  // 3. Open cart
  await cartPage.openCart();
  await expect(page).toHaveURL(/cart\.html/);

  // 4. Start checkout
  await cartPage.proceedToCheckout();
  await expect(page).toHaveURL(/checkout-step-one\.html/);

  // 5. Enter customer information
  await checkoutPage.firstNameInput.fill(customer.firstName);
  await checkoutPage.lastNameInput.fill(customer.lastName);
  await checkoutPage.postalCodeInput.fill(customer.postalCode);
  await checkoutPage.continueButton.click();
  await expect(page).toHaveURL(/checkout-step-two\.html/);

  // 6. Verify order overview
  await expect(checkoutPage.cartItems).toHaveCount(1);
  await expect(checkoutPage.cartItems).toContainText(product.name);
  await expect(checkoutPage.cartItems).toContainText(
    `$${product.price.toFixed(2)}`,
  );

  // Calculate expected order summary independently
  const subtotal = product.price;
  const tax = Math.round(subtotal * checkoutTestData.taxRate * 100) / 100;
  const total = Number((subtotal + tax).toFixed(2));
  const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;
  await expect(checkoutPage.subtotalLabel).toHaveText(
    `Item total: ${formatCurrency(subtotal)}`,
  );
  await expect(checkoutPage.taxLabel).toHaveText(`Tax: ${formatCurrency(tax)}`);
  await expect(checkoutPage.totalLabel).toHaveText(
    `Total: ${formatCurrency(total)}`,
  );

  // 7. Finish purchase
  await checkoutPage.finishButton.click();
  await expect(page).toHaveURL(/checkout-complete\.html/);

  // 8. Verify order completion
  await expect(checkoutPage.completionHeader).toHaveText(
    "Thank you for your order!",
  );
  await expect(checkoutPage.completionMessage).toBeVisible();
  await expect(checkoutPage.backToProductsButton).toBeVisible();
});

test.describe("Checkout form validation", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login("standard_user", "secret_sauce");

    // Add a product to the cart
    await inventoryPage.addProductToCart(checkoutTestData.selectedProduct.name);

    // Navigate to checkout
    await cartPage.openCart();
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  // Run one test for each validation scenario
  for (const scenario of checkoutTestData.validationScenarios) {
    test(`Reject checkout with ${scenario.name}`, async ({ page }) => {
      const checkoutPage = new CheckoutPage(page);

      // Use keyboard input for non-empty first names
      if (scenario.customer.firstName) {
        await checkoutPage.firstNameInput.click();

        await checkoutPage.firstNameInput.pressSequentially(
          scenario.customer.firstName,
        );
      } else {
        await checkoutPage.firstNameInput.fill("");
      }

      await expect(checkoutPage.firstNameInput).toHaveValue(
        scenario.customer.firstName,
      );

      await checkoutPage.lastNameInput.fill(scenario.customer.lastName);

      await expect(checkoutPage.lastNameInput).toHaveValue(
        scenario.customer.lastName,
      );

      await checkoutPage.postalCodeInput.fill(scenario.customer.postalCode);

      await expect(checkoutPage.postalCodeInput).toHaveValue(
        scenario.customer.postalCode,
      );

      // Attempt to continue
      await checkoutPage.continueButton.click();

      // Verify checkout cannot proceed
      await expect(page).toHaveURL(/checkout-step-one\.html/);

      // Verify the appropriate validation message
      await expect(checkoutPage.errorMessage).toHaveText(
        scenario.expectedError,
      );
    });
  }
});
