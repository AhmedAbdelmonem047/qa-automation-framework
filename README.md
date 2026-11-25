# QA Automation Framework

A portfolio test-automation project built with **Playwright, TypeScript, and the Page Object Model (POM)**.

The current implementation automates UI workflows on [SauceDemo](https://www.saucedemo.com), a public e-commerce practice application. It covers authentication, inventory, shopping-cart operations, and checkout, including end-to-end purchase exercises, negative scenarios, selector improvements, shared-locator refactoring, and Chromium/Firefox verification. API automation and continuous integration are planned extensions.

> SauceDemo is a public demo service and is not owned by this project. Its availability and behavior may change. Test results in this README describe a recorded run; they do not guarantee future availability or prove that the application is defect-free.

## Project Status

### Implemented and tested

- TypeScript Playwright project with Chromium, Firefox, and WebKit browser projects.
- Page Object Model classes for login, inventory, cart, and checkout pages.
- Authentication tests, including negative cases and browser-context session isolation.
- Inventory visibility, product information, and sorting tests.
- Shopping-cart add/remove, contents, badge, empty-state, and navigation-persistence tests.
- End-to-end purchase and checkout required-field validation tests.
- Centralized typed checkout test data.
- Playwright HTML test reporting.

### Completed checkout coverage and refactoring

The completed work includes reviewing page-object selectors and preferring accessible user-facing locators where appropriate; implementing end-to-end product selection, cart, and checkout exercises; adding exact product, price, cart-count, order-summary, calculation, and confirmation assertions; adding negative checkout and empty-cart scenarios; documenting unavailable-product coverage as not applicable because the practice application exposes no reliable stock state; and removing duplicated product-locator definitions.

The latest Chromium/Firefox verification reported **102 tests passed and 0 failed**. Individual per-browser counts and the execution date were not supplied, so this README does not assign a split or date to that result.

### Planned extensions

- REST API automation against [Restful Booker](https://restful-booker.herokuapp.com).
- Postman collections and Newman execution.
- GitHub Actions continuous integration and automated report artifacts.
- Additional API fixtures, utilities, and supporting documentation as these capabilities are implemented.

Planned items are not part of the current tested coverage.

## Tested Applications

| Application                                            | Type                      | Current status                            |
| ------------------------------------------------------ | ------------------------- | ----------------------------------------- |
| [SauceDemo](https://www.saucedemo.com)                 | E-commerce web UI         | Automated UI tests implemented            |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API practice service | Planned; no API test results are included |

## Test Coverage

The November 18, 2026 historical baseline contained 30 distinct test cases and 90 successful executions across Chromium, Firefox, and WebKit. The later Chromium/Firefox verification is recorded separately below.

### Authentication — `tests/ui/auth.spec.ts`

- Successful login with valid credentials.
- Login rejection for a locked-out user.
- Successful login with the performance-glitch user.
- Invalid username.
- Invalid password.
- Invalid username and password.
- Empty username.
- Empty password.
- Empty username and password.
- Separate browser contexts do not share authenticated sessions.

### Inventory — `tests/ui/inventory.spec.ts`

- Inventory list visibility.
- Exactly six products are displayed.
- Every product has a non-empty name and price.
- Price sorting: low to high.
- Price sorting: high to low.
- Product-name sorting: A–Z.
- Product-name sorting: Z–A.
- Product names remain associated with their correct prices after sorting.

### Shopping Cart — `tests/ui/cart.spec.ts`

- Cart is initially empty.
- Add a selected product from the inventory.
- Remove a product from the inventory.
- Cart displays the correct products and prices.
- Cart badge count updates when multiple products are added.
- Remove a selected product from the cart page.
- Cart becomes empty after all products are removed.
- Cart contents persist after returning to the inventory page.

### Checkout — `tests/ui/checkout.spec.ts`

- Complete a valid purchase from inventory through checkout confirmation.
- Verify the selected product and order overview.
- Verify subtotal, tax, and final total.
- Verify the order-completion header and confirmation message.
- Reject checkout when the first name is missing.
- Reject checkout when the last name is missing.
- Reject checkout when the postal code is missing.

### End-to-End Checkout Exercises — `tests/checkout/product-checkout.spec.ts`

A separate end-to-end exercise spec complements the existing UI suites. The exercised scenarios are:

- Add multiple products and verify exact cart product names, prices, and badge count.
- Remove a selected product and verify the remaining product, price, and cart count.
- Navigate back to inventory and confirm that the remaining cart state persists.
- Validate checkout rejection when first name, last name, or postal code is missing.
- Complete a purchase and verify checkout product names/prices, item subtotal, tax, total, arithmetic consistency, and final confirmation.
- Verify and document empty-cart checkout behavior as an application-behavior investigation, not as a desired business rule. The test checks the zero-value summary and stops before order submission.
- Record unavailable-product testing as N/A because the practice application does not expose a reliable out-of-stock or availability state.

**Implementation and verification status: Completed.** The end-to-end test scenarios and assertions were implemented, the shared product-locator refactor was completed and committed, and the Chromium/Firefox validation reported 102 passed with 0 failures. This is a separate, later verification result and is not added to the November 18 historical baseline.

## Latest Chromium/Firefox Verification

The latest validation reported the following result for the Chromium and Firefox suites:

| Item                     |            Result |
| ------------------------ | ----------------: |
| Tests reported           |               102 |
| Passed                   |               102 |
| Failed                   |                 0 |
| Pass rate                |              100% |
| Browser projects         | Chromium, Firefox |
| Per-browser result split |      Not supplied |
| Execution date           |      Not supplied |

All 102 reported tests passed. The per-browser breakdown and execution date were not provided, so they are intentionally not inferred.

### Historical three-browser baseline — November 18, 2026

The earlier recorded regression run covered 30 distinct test cases across Chromium, Firefox, and WebKit:

| Item                | Result |
| ------------------- | -----: |
| Distinct test cases |     30 |
| Total executions    |     90 |
| Passed              |     90 |
| Failed              |      0 |
| Pass rate           |   100% |

This historical run is retained as a separate baseline and is not combined with the later Chromium/Firefox result.

See [`docs/test-execution-report.md`](docs/test-execution-report.md) for checkout coverage, the historical WebKit investigations, and execution details.

## Repository Structure

The main files relevant to the current UI suite are organized as follows:

```text
qa-automation-framework/
├── docs/
│   ├── test-plan.md
│   └── test-execution-report.md
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── test-data/
│   └── checkout-data.ts
├── tests/
│   ├── ui/
│   │   ├── auth.spec.ts
│   │   ├── inventory.spec.ts
│   │   ├── cart.spec.ts
│   │   └── checkout.spec.ts
│   └── checkout/
│       └── product-checkout.spec.ts  # End-to-end checkout exercises
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

Keep this tree synchronized with the actual repository as additional files and capabilities are added.

## Prerequisites

1. **Node.js** — use a version supported by the installed Playwright version.
2. **npm** — included with Node.js.
3. **Git** — to clone the repository and manage changes.
4. **Visual Studio Code** or another TypeScript editor (recommended).

Internet access is required to reach SauceDemo and install the Playwright browsers.

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd qa-automation-framework
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository's actual URL.

### 2. Install dependencies

```bash
npm ci
```

`npm ci` installs the dependency versions recorded in `package-lock.json`.

### 3. Install Playwright browsers

```bash
npx playwright install
```

On Linux machines or CI runners, install browser system dependencies as well:

```bash
npx playwright install --with-deps
```

## Running the Tests

Run the complete test suite across all configured browser projects:

```bash
npx playwright test
```

Run the existing UI tests:

```bash
npx playwright test tests/ui
```

Run the end-to-end checkout exercise spec:

```bash
npx playwright test tests/checkout/product-checkout.spec.ts
```

Run the checkout exercises in Chromium and Firefox separately:

```bash
npx playwright test tests/checkout/product-checkout.spec.ts --project=chromium
npx playwright test tests/checkout/product-checkout.spec.ts --project=firefox
```

Run an individual suite:

```bash
# Authentication
npx playwright test tests/ui/auth.spec.ts

# Inventory
npx playwright test tests/ui/inventory.spec.ts

# Shopping cart
npx playwright test tests/ui/cart.spec.ts

# Checkout
npx playwright test tests/ui/checkout.spec.ts
```

Run the suite in one browser project:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run with a visible browser window:

```bash
npx playwright test --headed
```

Open Playwright's interactive UI mode:

```bash
npx playwright test --ui
```

The browser project names are configured in `playwright.config.ts`.

## Viewing the Playwright Report

After a test run, open the HTML report with:

```bash
npx playwright show-report
```

If a trace was generated for a failed test, open it with:

```bash
npx playwright show-trace <PATH_TO_TRACE_ZIP>
```

Replace the placeholder with the actual trace path shown in the test output or report. Screenshots, videos, and traces are available only when enabled in the Playwright configuration and produced for that run.

## Page Object Model

The UI tests keep page-specific locators and reusable interactions in the `pages/` directory:

- `LoginPage.ts` — login-page locators, navigation, and authentication interaction.
- `InventoryPage.ts` — inventory and product locators, product information, sorting, and add/remove-cart actions.
- `CartPage.ts` — cart navigation, cart contents, product removal, and checkout navigation.
- `CheckoutPage.ts` — customer information, order overview, and completion-page locators.

Assertions and test scenarios belong in the `tests/ui/` and `tests/checkout/` specifications. Page objects provide reusable locators and interactions. The selector strategy prioritizes accessible user-facing locators (`getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()`) where suitable, while retaining stable `data-test` and structural selectors for elements that do not have a useful semantic locator.

## Test Data

Non-secret checkout inputs and validation scenarios are centralized in `test-data/checkout-data.ts`. Tests import this data instead of duplicating customer details and expected validation messages in individual test cases.

## Test Isolation

Playwright's built-in `page` fixture provides an isolated browser context for each test by default. Authentication, inventory, cart, and checkout tests establish their own required login state rather than depending on another test's execution. The authentication suite also verifies that separate browser contexts do not share authenticated sessions.

## Test Documentation

- [`docs/test-plan.md`](docs/test-plan.md) — project objective, scope, exclusions, test types, environments, risks, and entry/exit criteria.
- [`docs/test-execution-report.md`](docs/test-execution-report.md) — recorded regression results, cross-browser findings, investigation details, and test improvements.

## Planned API Automation: Restful Booker

Restful Booker is the planned API-testing target for a later project stage. The intended coverage includes creating, retrieving, updating, partially updating, and deleting bookings; authentication; and representative invalid-input and error-response scenarios.

API tests and their execution results are not included in the current project status. Once implemented, document their actual file paths, setup requirements, execution commands, and verified results here.

## Planned Continuous Integration

GitHub Actions is a planned extension. Once implemented, document the actual workflow triggers, Node.js version, browser matrix, executed test commands, and uploaded report artifacts. CI should not be described as active until a workflow has been committed and successfully run.

## Known Limitations

- Automated UI coverage currently focuses on SauceDemo authentication, inventory, shopping-cart, and checkout workflows.
- API automation against Restful Booker is not yet implemented.
- Postman/Newman execution is not yet implemented.
- GitHub Actions CI execution is not yet implemented.
- SauceDemo is a public practice service and may change or become temporarily unavailable.
- The empty-cart scenario is covered as a behavior investigation; the test verifies the observed zero-item checkout summary without submitting an empty order.
- Unavailable-product testing is documented as N/A because the standard practice application does not expose a reliable stock/availability state.
- The November 18 three-browser baseline and the later Chromium/Firefox verification are separate runs with separate totals.
- Browser coverage is limited to the configured and executed browser projects.
- Passing tests demonstrate the tested scenarios under the recorded conditions; they do not prove that the application is defect-free.

## License

No license has been specified for this repository. Add a license file if and when one is selected.
