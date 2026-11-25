# Test Execution Report

## 1. Overview

| Item                                 | Details                                            |
| ------------------------------------ | -------------------------------------------------- |
| Project                              | QA Automation Framework                            |
| Application                          | SauceDemo                                          |
| Framework                            | Playwright Test                                    |
| Language                             | TypeScript                                         |
| Test Areas                           | Authentication, Inventory, Shopping Cart, Checkout |
| Configured browser projects          | Chromium, Firefox, WebKit                          |
| Latest verification browser projects | Chromium, Firefox                                  |
| Historical Baseline Date             | November 18, 2026                                  |
| Latest verification date             | Not supplied                                       |

## 2. Previously Recorded Full Regression Run — November 18, 2026

The complete Playwright test suite was executed across all three configured browser projects.

| Item                  | Result |
| --------------------- | -----: |
| Total test executions |     90 |
| Passed                |     90 |
| Failed                |      0 |
| Pass rate             |   100% |
| Browser projects      |      3 |
| Distinct test cases   |     30 |

### Browser Results

| Browser   | Executions | Passed | Failed |
| --------- | ---------: | -----: | -----: |
| Chromium  |         30 |     30 |      0 |
| Firefox   |         30 |     30 |      0 |
| WebKit    |         30 |     30 |      0 |
| **Total** |     **90** | **90** |  **0** |

**Recorded baseline result: All 90 test executions passed.**

> Scope note: This run is dated November 18, 2026 and records 30 distinct tests. It predates the later end-to-end checkout exercises and shared product-locator refactor. It must not be used as evidence that those later changes passed.

## 3. Automated Test Coverage

### 3.1 Authentication

The authentication suite covers:

- Successful login with valid credentials.
- Login rejection for locked-out users.
- Successful login with the performance-glitch user.
- Invalid username.
- Invalid password.
- Invalid username and password.
- Empty username.
- Empty password.
- Empty username and password.
- Session isolation between separate browser contexts.

### 3.2 Inventory

The inventory suite covers:

- Inventory list visibility.
- Expected product count.
- Product names and prices.
- Price sorting from low to high.
- Price sorting from high to low.
- Product-name sorting from A to Z.
- Product-name sorting from Z to A.
- Product names and prices remaining correctly associated after sorting.

### 3.3 Shopping Cart

The shopping-cart suite covers:

- Initial empty cart state.
- Adding a product from inventory.
- Removing a product from inventory.
- Verifying cart contents and product prices.
- Cart badge updates when adding multiple products.
- Removing a selected product from the cart page.
- Empty cart state after removing all products.
- Cart persistence when navigating between inventory and cart pages.

### 3.4 Checkout

The checkout suite covers:

- Completing a valid purchase from inventory through confirmation.
- Verifying customer information submission.
- Verifying the order overview and selected product.
- Verifying subtotal, tax, and final total.
- Verifying the order-completion message.
- Rejecting checkout when the first name is missing.
- Rejecting checkout when the last name is missing.
- Rejecting checkout when the postal code is missing.

## 4. End-to-End Checkout Exercises and Refactoring

The end-to-end checkout exercises, negative scenarios, selector review, and shared product-locator refactor are complete. The latest verification reported **102 tests passed and 0 failed** across the Chromium and Firefox suites. The individual result counts for each browser and the execution date were not supplied, so this report does not infer a per-browser split or date.

| Area                                             | Completed scope                                                                                                                                                                                                                 | Status / evidence                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Selector review                                  | Reviewed page-object selectors and preferred `getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()` where suitable. Retained `data-test` and structural selectors where semantic locators were not appropriate. | Complete.                                                                                                  |
| End-to-end product selection, cart, and checkout | Added multi-product cart management, product removal, cart-persistence checks, and a complete checkout journey.                                                                                                                 | Complete; included in the reported passing verification.                                                   |
| Purchase assertions                              | Added exact product names/prices, cart counts, checkout summary, subtotal, tax, total, arithmetic consistency, and final confirmation assertions.                                                                               | Complete; included in the reported passing verification.                                                   |
| Negative checkout and unavailable products       | Added required-field negative tests and an empty-cart behavior investigation. Unavailable-product coverage is N/A because the practice application does not expose a reliable stock/availability state.                         | Supported scenarios included in the reported passing verification; unsupported scenario documented as N/A. |
| Cross-browser verification and locator refactor  | Removed duplicated product-locator definitions, ran the suites in Chromium and Firefox, reviewed the refactor, and committed the changes.                                                                                       | Complete; 102 passed, 0 failed across the two browser suites.                                              |

### Latest reported verification result

| Item                     |                  Result |
| ------------------------ | ----------------------: |
| Tests reported           |                     102 |
| Passed                   |                     102 |
| Failed                   |                       0 |
| Pass rate                |                    100% |
| Browser projects         |       Chromium, Firefox |
| Per-browser result split |            Not supplied |
| Execution date           |            Not supplied |
| Locator refactor         | Completed and committed |

The reported total is recorded as supplied. No 51/51 or other per-browser split is assumed. This result is separate from the November 18 historical baseline of 90/90 executions across Chromium, Firefox, and WebKit.

### Behavior and scope notes

- Cart tests verify product names and prices as well as item/badge counts, including after a removal and return from inventory.
- Checkout summary tests verify displayed subtotal, tax, and total, including arithmetic consistency.
- The empty-cart test documents the observed application behavior: checkout can advance to the order overview with no products and displays a zero-value summary. The test stops before submitting an empty order. This is recorded as a potential application behavior/defect for review, not as an intended business rule.
- Unavailable-product testing is N/A. The standard practice application does not expose a reliable out-of-stock or inventory-availability state, so no unsupported scenario was fabricated.

## 5. Test Findings and Investigations

### FIND-001: Performance-Glitch User – WebKit

**Test:** Successful login with performance_glitch_user

**Initial observation:**

- Login succeeded and navigation reached the inventory URL.
- The inventory list intermittently failed to become visible within the default 5-second assertion timeout.
- The behavior was observed during WebKit stress testing.

**Investigation:**
The performance-glitch user introduces additional application delays. The inventory page can take longer to become visible after login.

During selector refactoring, the original 15-second assertion timeout was inadvertently omitted.

**Resolution:**

Restored a test-specific 15-second visibility timeout:

```typescript
await expect(inventoryPage.productList).toBeVisible({
  timeout: 15000,
});
```

The test also verifies the Products heading and expected product count.

**Verification:**

- Initial WebKit stress run with the shorter timeout: 22 passed, 8 failed.
- After restoring the timeout: 30 consecutive executions passed.
- November 18 historical full regression: all 90 executions passed.

**Conclusion:** The observed failures were resolved by restoring the appropriate assertion timeout. No fixed waiting delays were introduced.

### FIND-002: Intermittent First-Name Input Retention – WebKit

**Test area:** Checkout form validation

**Initial observation:**

- Chromium and Firefox repeated executions passed.
- WebKit intermittently displayed the first-name validation message when the test expected the last-name or postal-code validation message.
- Diagnostic assertions identified instances where the first-name input remained empty after Playwright's `fill()` operation.

**Investigation:**

Added input-value assertions to verify that customer information was entered correctly before submitting the checkout form.

A targeted diagnostic execution using the original `fill()` approach produced:

- 35 passed.
- 5 failed.
- 40 total executions.

**Resolution:**

Changed non-empty first-name input to keyboard-based entry:

```typescript
await checkoutPage.firstNameInput.click();

await checkoutPage.firstNameInput.pressSequentially(
  scenario.customer.firstName,
);
```

Empty first-name scenarios continue to use `fill("")`.

Input-value assertions are retained for all three customer information fields.

**Verification:**

- Targeted WebKit validation tests passed after the change.
- November 18 historical full regression passed all 90 executions across Chromium, Firefox, and WebKit.

**Conclusion:** The alternative input method resolved the observed failures in subsequent verification runs. The underlying cause of the original WebKit behavior has not been established.

## 6. Test Automation Improvements

The following improvements were implemented during the project and regression investigation:

- Centralized page-specific locators and interactions using the Page Object Model.
- Preferred accessible role-based locators for interactive elements.
- Used dedicated `data-test` attributes for application elements where appropriate.
- Reused product-card locator helpers within page objects to avoid repeating product-card lookup logic.
- Removed duplicated product item/name/price locator definitions across the relevant page objects.
- Added exact accessible-name matching to avoid strict-mode violations.
- Centralized checkout test data in typed TypeScript fixtures.
- Added input-value assertions before checkout form submission.
- Used condition-based assertions instead of fixed waiting delays.
- Applied test-specific timeouts for intentionally slow application behavior.
- Investigated intermittent browser-specific failures through repeated execution.
- Used Playwright Trace Viewer to investigate failed executions.
- Preserved independent test sessions using Playwright browser-context isolation.

No arbitrary `waitForTimeout()` delays or retry-based workarounds were introduced.

## 7. Application Defects

No application defect has been confirmed through a separate defect-triage process. The two investigated WebKit issues were addressed through test automation changes; their underlying causes were not conclusively established.

The November 18 historical regression and the later Chromium/Firefox verification confirm that their respective tested scenarios passed; neither establishes that the application is free of defects. The empty-cart test observed that checkout can advance to an order overview with no products and a zero-value summary. This is recorded as a potential application behavior/defect for review; the test does not submit an empty order. Unavailable-product behavior remains N/A because the practice application does not expose a reliable stock state.

## 8. Final Execution Status

| Area                                 | Implementation | Latest status                                                          |
| ------------------------------------ | -------------- | ---------------------------------------------------------------------- |
| Authentication                       | Complete       | Covered by the historical regression baseline                          |
| Inventory                            | Complete       | Covered by the historical regression baseline                          |
| Shopping Cart                        | Complete       | Covered by the historical regression baseline and end-to-end exercises |
| Checkout                             | Complete       | Covered by the historical regression baseline and end-to-end exercises |
| Negative Checkout                    | Complete       | Negative scenarios passed in the reported run                          |
| Selector review and locator refactor | Complete       | Selector review and locator refactor completed                         |
| Chromium/Firefox validation          | Complete       | 102 passed, 0 failed (per-browser split not supplied)                  |
| Historical three-browser regression  | Complete       | 90/90 passed across Chromium, Firefox, and WebKit on November 18, 2026 |

**Latest verification: 102 passed, 0 failed (100%) across the Chromium and Firefox suites.**

**Historical baseline: 90/90 passed, 0 failed across Chromium, Firefox, and WebKit on November 18, 2026.**

These are separate runs and are not added together.

## 9. Conclusion

The end-to-end checkout and refactoring work is complete. It added product selection, cart management, checkout assertions, negative checkout coverage, and an empty-cart behavior investigation. The page-object selector review and shared product-locator refactor were also completed.

The latest verification reported 102 passed and 0 failed across Chromium and Firefox. The individual per-browser counts and execution date were not provided. The earlier November 18, 2026 full regression baseline remains documented separately at 90/90 passing across Chromium, Firefox, and WebKit.

Unavailable-product testing is documented as not applicable because the practice application does not expose a reliable inventory-availability state. The empty-cart scenario records the application's zero-value checkout-summary behavior without submitting an empty order.

The framework remains a foundation for subsequent API automation, CI integration, and expanded regression coverage.
