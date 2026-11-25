import { type Page, type Locator } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;

  // Customer information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  // Order overview
  readonly cartItems: Locator;
  readonly paymentInformation: Locator;
  readonly shippingInformation: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Completion page
  readonly completionHeader: Locator;
  readonly completionMessage: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Customer information
    this.firstNameInput = page.getByPlaceholder("First Name", {
      exact: true,
    });
    this.lastNameInput = page.getByPlaceholder("Last Name", {
      exact: true,
    });
    this.postalCodeInput = page.getByPlaceholder("Zip/Postal Code", {
      exact: true,
    });

    this.continueButton = page.getByRole("button", {
      name: "Continue",
      exact: true,
    });
    this.cancelButton = page.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
    this.errorMessage = page.locator('[data-test="error"]');

    // Order overview
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.paymentInformation = page.locator('[data-test="payment-info-value"]');
    this.shippingInformation = page.locator(
      '[data-test="shipping-info-value"]',
    );
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');

    this.finishButton = page.getByRole("button", {
      name: "Finish",
      exact: true,
    });

    // Completion page
    this.completionHeader = page.getByRole("heading", {
      name: "Thank you for your order!",
      exact: true,
    });

    this.completionMessage = page.getByText(
      "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
      { exact: true },
    );

    this.backToProductsButton = page.getByRole("button", {
      name: "Back Home",
      exact: true,
    });
  }
}
