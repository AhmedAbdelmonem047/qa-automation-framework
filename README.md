# QA Automation Framework

A portfolio test-automation project built with **Playwright, TypeScript, and the Page Object Model (POM)**.

The project contains two complementary automation suites that target separate practice applications:

- **SauceDemo:** UI automation covering authentication, inventory, shopping-cart operations, and checkout.
- **Restful Booker:** REST API automation covering booking operations, authentication, negative scenarios, runtime response validation, and test-data cleanup.

The UI and API suites are intentionally independent. They do not share application data and are not presented as a hybrid UI/API workflow.

> SauceDemo and Restful Booker are public practice services and are not owned by this project. Their availability and behavior may change. Recorded test results describe specific runs; they do not guarantee future availability or prove that either application is defect-free.

## Project Status

### Implemented UI automation

- TypeScript Playwright project with Chromium, Firefox, and WebKit browser projects.
- Page Object Model classes for login, inventory, cart, and checkout pages.
- Authentication tests, including negative cases and browser-context session isolation.
- Inventory visibility, product information, and sorting tests.
- Shopping-cart add/remove, contents, badge, empty-state, and navigation-persistence tests.
- End-to-end purchase and checkout required-field validation tests.
- Centralized typed checkout test data.
- Playwright HTML test reporting.

### Implemented API automation

- REST API tests for Restful Booker using Playwright's API request context.
- Centralized API operations through `ApiClient`.
- Booking creation, retrieval, authenticated update, and deletion.
- Negative scenarios for missing required fields, invalid data types, and unauthorized requests.
- Runtime response validation using Zod schemas.
- Reusable booking creation and booking-ID helpers.
- Per-test booking tracking and automatic cleanup.
- Environment-based API URL and authentication credentials.

The API implementation is documented in [`docs/api-testing.md`](docs/api-testing.md). Run the API suite before recording a new execution result; this README does not claim a current API pass count.

### Completed UI coverage and refactoring

The completed UI work includes reviewing page-object selectors and preferring accessible user-facing locators where appropriate; implementing end-to-end product selection, cart, and checkout exercises; adding exact product, price, cart-count, order-summary, calculation, and confirmation assertions; adding negative checkout and empty-cart scenarios; documenting unavailable-product coverage as not applicable because the practice application exposes no reliable stock state; and removing duplicated product-locator definitions.

The latest recorded Chromium/Firefox verification reported **102 tests passed and 0 failed**. Individual per-browser counts and the execution date were not supplied, so this README does not assign a split or date to that result.

### Planned extensions

- Postman collections and Newman execution.
- Additional API coverage and reusable fixtures as the framework evolves.
- Expanded reporting and test observability.

Planned items are not part of the current tested coverage.

## Tested Applications

| Application                                            | Type                      | Current status                                                     |
| ------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------ |
| [SauceDemo](https://www.saucedemo.com)                 | E-commerce web UI         | UI automation implemented                                          |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API practice service | API automation implemented; latest execution result to be recorded |

The two applications are separate test targets. SauceDemo is used for browser-based UI workflows; Restful Booker is used for direct API testing.

## Test Coverage

The November 18, 2026 historical UI baseline contained 30 distinct test cases and 90 successful executions across Chromium, Firefox, and WebKit. The later Chromium/Firefox verification is recorded separately below.

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

### REST API — `tests/api/booking.spec.ts`

- API health check.
- Create a booking and validate the returned booking data and identifier.
- Retrieve a booking by ID.
- Update a booking with authentication and verify the persisted result.
- Delete a booking with authentication and verify that it no longer exists.
- Attempt booking creation with a missing required field.
- Attempt booking creation with an invalid data type.
- Reject booking updates without authentication.
- Reject booking deletion with an invalid token.
- Validate authentication, booking, and booking-creation responses with Zod.
- Track test-created booking IDs and clean them up after each test.

**Known API validation limitations:** The missing-field and invalid-data tests use Playwright's expected-failure annotation to document observed validation weaknesses in the practice API. They are not evidence that the API correctly rejects those requests. Review the annotations when the API behavior changes.

## UI Execution Results

### Latest Chromium/Firefox Verification

The latest recorded validation reported the following result for the Chromium and Firefox UI suites:

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

The earlier recorded regression run covered 30 distinct UI test cases across Chromium, Firefox, and WebKit:

| Item                | Result |
| ------------------- | -----: |
| Distinct test cases |     30 |
| Total executions    |     90 |
| Passed              |     90 |
| Failed              |      0 |
| Pass rate           |   100% |

This historical run is retained as a separate baseline and is not combined with the later Chromium/Firefox result.

No API execution count is recorded in this README. Add API results only after running the suite and reviewing the report, including its expected-failure results and cleanup outcome.

See [`docs/test-execution-report.md`](docs/test-execution-report.md) for checkout coverage, the historical WebKit investigations, and UI execution details. See [`docs/api-testing.md`](docs/api-testing.md) for API setup and execution instructions.

## Repository Structure

The main project files are organized as follows. Keep this tree synchronized with the actual repository as files are added or moved.

```text
qa-automation-framework/
├── .github/
│   └── workflows/          # GitHub Actions workflow(s)
├── docs/
│   ├── api-testing.md
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
│   ├── api/
│   │   └── booking.spec.ts
│   ├── checkout/
│   │   └── product-checkout.spec.ts
│   ├── helpers/
│   │   └── booking.helper.ts
│   └── ui/
│       ├── auth.spec.ts
│       ├── inventory.spec.ts
│       ├── cart.spec.ts
│       └── checkout.spec.ts
├── utils/
│   ├── api-client.ts
│   └── schemas/
│       └── booking.schema.ts
├── .env.example
├── .gitignore
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

The local `.env` file is intentionally excluded from the repository and is not shown in the tree.

## Prerequisites

1. **Node.js** — use a version supported by the installed Playwright version.
2. **npm** — included with Node.js.
3. **Git** — to clone the repository and manage changes.
4. **Visual Studio Code** or another TypeScript editor (recommended).

Internet access is required to reach SauceDemo and Restful Booker and to install the Playwright browsers.

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

### 4. Configure API environment variables

Copy `.env.example` to `.env` in the project root and provide the required Restful Booker credentials:

```env
API_BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=your_username
API_PASSWORD=your_password
```

Do not commit `.env` or real credentials. See [`docs/api-testing.md`](docs/api-testing.md) for details.

## Running the Tests

Run the complete Playwright test suite across all configured projects:

```bash
npx playwright test
```

Run the UI tests:

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

Run an individual UI suite:

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

Run the API suite:

```bash
npx playwright test tests/api
```

Run only the booking API tests:

```bash
npx playwright test tests/api/booking.spec.ts
```

Run the API suite with the list reporter:

```bash
npx playwright test tests/api --reporter=list
```

Check TypeScript compilation:

```bash
npx tsc --noEmit
```

Run the suite in one browser project:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Run UI tests with a visible browser window:

```bash
npx playwright test --headed
```

Open Playwright's interactive UI mode:

```bash
npx playwright test --ui
```

The browser project names are configured in `playwright.config.ts`. The API suite uses Playwright's API request context and does not require launching a browser.

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

## API Test Architecture

The API suite uses `ApiClient` for endpoint operations, booking helpers for reusable creation and ID extraction, and Zod schemas for runtime response validation. Test-specific booking tracking, assertions, and cleanup remain in the API test suite.

API environment configuration, authentication handling, response schemas, cleanup behavior, and CI requirements are documented in [`docs/api-testing.md`](docs/api-testing.md).

## Test Data and Isolation

Non-secret checkout inputs and validation scenarios are centralized in `test-data/checkout-data.ts`. UI tests import this data instead of duplicating customer details and expected validation messages in individual test cases.

Playwright's built-in `page` fixture provides an isolated browser context for each UI test by default. Authentication, inventory, cart, and checkout tests establish their own required login state rather than depending on another test's execution. The authentication suite also verifies that separate browser contexts do not share authenticated sessions.

API tests create their own booking records and track their identifiers for cleanup. API test data is independent of SauceDemo UI test data.

## Test Documentation

- [`docs/test-plan.md`](docs/test-plan.md) — project objective, scope, exclusions, test types, environments, risks, and entry/exit criteria.
- [`docs/test-execution-report.md`](docs/test-execution-report.md) — recorded UI regression results, cross-browser findings, investigation details, and test improvements.
- [`docs/api-testing.md`](docs/api-testing.md) — API configuration, authentication, response validation, test-data management, cleanup, CI environment variables, and execution instructions.

## Continuous Integration

The repository includes a GitHub Actions workflow for Playwright test execution. The workflow needs the API environment variables to run the API tests. Configure these repository secrets in GitHub Actions:

- `API_BASE_URL`
- `API_USERNAME`
- `API_PASSWORD`

The workflow must explicitly map the secrets into the test job or step environment. Repository secrets are not automatically exposed to a workflow. Do not commit `.env` or actual credentials.

A successful CI run should be recorded only after the workflow has completed successfully with the required secrets configured. This README does not claim that the latest API CI execution is passing.

## Known Limitations

- UI automation currently focuses on SauceDemo authentication, inventory, shopping-cart, and checkout workflows.
- API automation targets Restful Booker; its test data is separate from SauceDemo.
- The missing-field and invalid-data API scenarios document known validation limitations and are marked as expected failures until the API behavior is corrected.
- Postman/Newman execution is not yet implemented.
- The exact latest API execution count and result have not been recorded in this README.
- SauceDemo and Restful Booker are public practice services and may change or become temporarily unavailable.
- The empty-cart scenario is covered as a behavior investigation; the test verifies the observed zero-item checkout summary without submitting an empty order.
- Unavailable-product testing is documented as N/A because the standard practice application does not expose a reliable stock/availability state.
- The November 18 three-browser UI baseline and the later Chromium/Firefox UI verification are separate runs with separate totals.
- Browser coverage is limited to the configured and executed browser projects.
- Passing tests demonstrate the tested scenarios under the recorded conditions; they do not prove that either application is defect-free.

## License

No license has been specified for this repository. Add a license file if and when one is selected.
