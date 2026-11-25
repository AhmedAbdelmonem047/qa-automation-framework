import { type Page, type Locator } from "@playwright/test";
import {
  createProductLocators,
  PRODUCT_ITEM_SELECTOR,
  PRODUCT_PRICE_SELECTOR,
} from "./helpers/productLocators";

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
    this.productItems = page.locator(PRODUCT_ITEM_SELECTOR);

    const productLocators = createProductLocators(this.productItems);
    this.productNames = productLocators.productNames;
    this.productPrices = productLocators.productPrices;

    this.sortDropdown = page.getByRole("combobox");
  }

  // Internal helper
  private getProductCard(productName: string): Locator {
    return this.productItems.filter({
      has: this.page.getByText(productName, { exact: true }),
    });
  }

  // Get a specific product's cart action button
  getProductActionButton(
    productName: string,
    action: "Add to cart" | "Remove",
  ): Locator {
    return this.getProductCard(productName).getByRole("button", {
      name: action,
      exact: true,
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
        .locator(PRODUCT_PRICE_SELECTOR)
        .innerText()
    ).trim();
  }

  // Get all products
  async getAllProducts(): Promise<{ name: string; price: string }[]> {
    await this.productList.waitFor({ state: "visible" });

    const count = await this.productItems.count();
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

  // Sort products
  async sortProducts(option: ProductSortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  // Add product to cart
  async addProductToCart(productName: string): Promise<void> {
    await this.getProductActionButton(productName, "Add to cart").click();
  }

  // Remove product from cart
  async removeProductFromCart(productName: string): Promise<void> {
    await this.getProductActionButton(productName, "Remove").click();
  }
}
