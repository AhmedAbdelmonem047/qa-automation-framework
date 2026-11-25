import { type Locator } from "@playwright/test";

export const PRODUCT_ITEM_SELECTOR = '[data-test="inventory-item"]';

export const PRODUCT_NAME_SELECTOR = '[data-test="inventory-item-name"]';

export const PRODUCT_PRICE_SELECTOR = '[data-test="inventory-item-price"]';

// Create reusable product name and price locators.
export function createProductLocators(items: Locator) {
  return {
    productNames: items.locator(PRODUCT_NAME_SELECTOR),
    productPrices: items.locator(PRODUCT_PRICE_SELECTOR),
  };
}
