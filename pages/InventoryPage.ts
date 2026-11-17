import { Page, Locator } from "@playwright/test";

export type ProductSortOption = "az" | "za" | "lohi" | "hilo";

export class InventoryPage {
  readonly page: Page;

  readonly productList: Locator;
  readonly productItems: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productList = page.locator(".inventory_list");
    this.productItems = page.locator(".inventory_item");
    this.productNames = page.locator(".inventory_item_name");
    this.productPrices = page.locator(".inventory_item_price");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  // Internal helper
  private getProductCard(productName: string): Locator {
    return this.productItems.filter({
      has: this.page.getByText(productName, { exact: true }),
    });
  }

  // Read all product names
  async getAllProductNames(): Promise<string[]> {
    await this.productList.waitFor({ state: "visible" });
    return (await this.productNames.allInnerTexts()).map((name) => name.trim());
  }

  // Read all product prices
  async getAllProductPrices(): Promise<string[]> {
    await this.productList.waitFor({ state: "visible" });
    return (await this.productPrices.allInnerTexts()).map((price) =>
      price.trim(),
    );
  }

  // Read a specific product's price
  async getProductPrice(productName: string): Promise<string> {
    return (
      await this.getProductCard(productName)
        .locator(".inventory_item_price")
        .innerText()
    ).trim();
  }

  // Get all products
  async getAllProducts(): Promise<{ name: string; price: string }[]> {
    await this.productList.waitFor({ state: "visible" });

    const count = await this.productItems.count();
    const products: { name: string; price: string }[] = [];

    for (let i = 0; i < count; i++) {
      const product = this.productItems.nth(i);
      const name = await product.locator(".inventory_item_name").innerText();
      const price = await product.locator(".inventory_item_price").innerText();

      products.push({
        name: name.trim(),
        price: price.trim(),
      });
    }
    return products;
  }

  // Sort products
  async sortProducts(option: ProductSortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  // Add product to cart
  async addProductToCart(productName: string): Promise<void> {
    await this.getProductCard(productName)
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  // Remove product from cart
  async removeProductFromCart(productName: string): Promise<void> {
    await this.getProductCard(productName)
      .getByRole("button", { name: "Remove" })
      .click();
  }
}
