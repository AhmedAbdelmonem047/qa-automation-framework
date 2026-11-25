import { type Page, type Locator } from "@playwright/test";
import {
  createProductLocators,
  PRODUCT_ITEM_SELECTOR,
} from "./helpers/productLocators";

export class CartPage {
  readonly page: Page;

  // Locators
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly cartList: Locator;
  readonly cartItems: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');

    this.cartList = page.locator(".cart_list");
    this.cartItems = page.locator(PRODUCT_ITEM_SELECTOR);

    const productLocators = createProductLocators(this.cartItems);

    this.productNames = productLocators.productNames;
    this.productPrices = productLocators.productPrices;

    this.continueShoppingButton = page.getByRole("button", {
      name: "Continue Shopping",
      exact: true,
    });
    this.checkoutButton = page.getByRole("button", {
      name: "Checkout",
      exact: true,
    });
  }

  // Navigate to cart
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  // Get all product names in cart
  async getAllCartProductNames(): Promise<string[]> {
    await this.cartList.waitFor({ state: "visible" });

    return (await this.productNames.allInnerTexts()).map((name) => name.trim());
  }

  // Get all product prices in cart
  async getAllCartProductPrices(): Promise<string[]> {
    await this.cartList.waitFor({ state: "visible" });

    return (await this.productPrices.allInnerTexts()).map((price) =>
      price.trim(),
    );
  }

  // Get product names and prices together
  async getAllCartProducts(): Promise<{ name: string; price: string }[]> {
    await this.cartList.waitFor({ state: "visible" });

    const count = await this.cartItems.count();
    const products: { name: string; price: string }[] = [];

    for (let i = 0; i < count; i++) {
      const name = await this.productNames.nth(i).innerText();
      const price = await this.productPrices.nth(i).innerText();

      products.push({
        name: name.trim(),
        price: price.trim(),
      });
    }

    return products;
  }

  // Remove a selected product from cart
  async removeProduct(productName: string): Promise<void> {
    const product = this.cartItems.filter({
      has: this.page.getByText(productName, { exact: true }),
    });

    await product
      .getByRole("button", {
        name: "Remove",
        exact: true,
      })
      .click();
  }

  // Continue shopping
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  // Proceed to checkout
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
