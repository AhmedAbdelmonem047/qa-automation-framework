# Test Execution Report

## 1. Overview

| Item           | Details                                            |
| -------------- | -------------------------------------------------- |
| Project        | QA Automation Framework                            |
| Application    | SauceDemo                                          |
| Framework      | Playwright Test                                    |
| Language       | TypeScript                                         |
| Test Areas     | Authentication, Inventory, Shopping Cart, Checkout |
| Browsers       | Chromium, Firefox, WebKit                          |
| Execution Date | November 18, 2026                                  |

## 2. Final Regression Execution Summary

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

**Final result: All 90 test executions passed.**

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

## 4. Test Findings and Investigations

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
- Final full regression suite: all 90 executions passed.

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
- Final full regression suite passed all 90 executions across Chromium, Firefox, and WebKit.

**Conclusion:** The alternative input method resolved the observed failures in subsequent verification runs. The underlying cause of the original WebKit behavior has not been established.

## 5. Test Automation Improvements

The following improvements were implemented during the project and regression investigation:

- Centralized page-specific locators and interactions using the Page Object Model.
- Preferred accessible role-based locators for interactive elements.
- Used dedicated `data-test` attributes for application elements where appropriate.
- Reused product-card locator helpers to avoid duplicated locator logic.
- Added exact accessible-name matching to avoid strict-mode violations.
- Centralized checkout test data in typed TypeScript fixtures.
- Added input-value assertions before checkout form submission.
- Used condition-based assertions instead of fixed waiting delays.
- Applied test-specific timeouts for intentionally slow application behavior.
- Investigated intermittent browser-specific failures through repeated execution.
- Used Playwright Trace Viewer to investigate failed executions.
- Preserved independent test sessions using Playwright browser-context isolation.

No arbitrary `waitForTimeout()` delays or retry-based workarounds were introduced.

## 6. Application Defects

No confirmed application defects were identified during the final regression execution.

The two investigated WebKit issues were addressed through test automation changes. Their underlying causes were not conclusively established.

The successful regression run confirms the tested scenarios passed; it does not establish that the application is free of defects.

## 7. Final Execution Status

| Area                    | Implementation | Final Regression |
| ----------------------- | -------------- | ---------------- |
| Authentication          | Complete       | Passed           |
| Inventory               | Complete       | Passed           |
| Shopping Cart           | Complete       | Passed           |
| Checkout                | Complete       | Passed           |
| Checkout Validation     | Complete       | Passed           |
| Cross-browser execution | Configured     | Passed           |

**Overall result: 90/90 passed, 0 failed.**

## 8. Conclusion

The QA Automation Framework successfully completed its initial UI regression milestone.

The project now includes automated authentication, inventory, shopping-cart, and checkout coverage using Playwright and TypeScript.

The final regression run achieved a 100% pass rate across Chromium, Firefox, and WebKit.

Two intermittent WebKit behaviors were investigated, and appropriate automation improvements were introduced and verified without relying on arbitrary delays or retries.

The framework provides a reproducible foundation for subsequent API automation, advanced Playwright testing, CI integration, and expanded regression coverage.
