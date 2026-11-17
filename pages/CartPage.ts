import { type Page, type Locator } from "@playwright/test";

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

    this.cartLink = page.locator(".shopping_cart_link");
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartList = page.locator(".cart_list");
    this.cartItems = page.locator(".cart_item");
    this.productNames = this.cartItems.locator(".inventory_item_name");
    this.productPrices = this.cartItems.locator(".inventory_item_price");

    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]',
    );
    this.checkoutButton = page.locator('[data-test="checkout"]');
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
      const item = this.cartItems.nth(i);
      const name = await item.locator(".inventory_item_name").innerText();
      const price = await item.locator(".inventory_item_price").innerText();

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
