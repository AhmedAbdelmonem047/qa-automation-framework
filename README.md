# QA Automation Framework

A portfolio test-automation project built with **Playwright, TypeScript, and the Page Object Model (POM)**.

The current implementation automates UI workflows on [SauceDemo](https://www.saucedemo.com), a public e-commerce practice application. The repository is being developed in stages, with API automation, checkout coverage, and CI execution planned as later extensions.

> SauceDemo is a public demo service, not an application owned by this project. Its availability and behavior can change. Test results below describe one recorded run and do not guarantee future availability or defect-free behavior.

## Project Status

### Implemented and tested

- TypeScript Playwright project with Chromium, Firefox, and WebKit browser projects.
- Page Object Model classes for login, inventory, and cart pages.
- UI authentication, inventory, sorting, and shopping-cart tests.
- Independent test sessions using Playwright's browser-context isolation and per-test login setup where applicable.
- Playwright HTML test reporting.

### Planned extensions

- Checkout form validation and end-to-end checkout flow.
- REST API automation against [Restful Booker](https://restful-booker.herokuapp.com).
- Postman collections and Newman execution.
- GitHub Actions continuous integration and automated report artifacts.
- Additional shared fixtures, utilities, and test-data organization as the suite grows.

The planned items are not part of the current tested coverage unless a later report or repository update explicitly marks them as implemented.

## Tested Application

| Application | Type | Current status |
|---|---|---|
| [SauceDemo](https://www.saucedemo.com) | E-commerce web UI | Automated UI tests implemented |
| [Restful Booker](https://restful-booker.herokuapp.com) | REST API practice service | Planned; no API test results are included in the current report |

## Test Coverage

The current UI suite contains **26 distinct test cases**. The recorded run executed them in three browser projects, for **78 successful test executions**.

### Authentication — `tests/ui/auth.spec.ts`

- Successful login.
- Locked-out user scenario.
- Performance-glitch user scenario.
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
- Every product has a non-empty name and a price.
- Price sorting: low to high.
- Price sorting: high to low.
- Name sorting: A–Z.
- Name sorting: Z–A.
- Product names remain associated with their correct prices after sorting.

### Shopping cart — `tests/ui/cart.spec.ts`

- Cart is initially empty.
- Add a selected product from the inventory.
- Remove a product from the inventory.
- Cart displays the correct products and prices.
- Cart badge count updates when multiple products are added.
- Remove a selected product from the cart page.
- Cart becomes empty after all products are removed.
- Cart contents persist after returning to the inventory page.

## Latest Recorded Test Run

The supplied Playwright HTML report records the following run:

| Item | Result |
|---|---:|
| Date | November 17, 2026 |
| Distinct test cases | 26 |
| Browser projects | Chromium, Firefox, WebKit |
| Total executions | 78 |
| Passed | 78 |
| Failed | 0 |
| Reported duration | 26.4 seconds |

This is a snapshot of the supplied report, not a claim that every future run will have the same result. Re-run the suite after changes and use the newly generated report as the current result.

## Repository Structure

The files relevant to the current UI suite are organized as follows:

```text
qa-automation-framework/
├── docs/
│   └── test-plan.md
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   └── CartPage.ts
├── tests/
│   └── ui/
│       ├── auth.spec.ts
│       ├── inventory.spec.ts
│       └── cart.spec.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

Other folders may be added as API tests, fixtures, Postman collections, CI workflows, and supporting utilities are implemented. Keep this tree synchronized with the actual repository.

## Prerequisites

1. **Node.js** — use a version supported by the installed Playwright version.
2. **npm** — included with Node.js.
3. **Git** — to clone the repository and manage changes.
4. **Visual Studio Code** or another TypeScript editor (recommended).

Internet access is required to reach SauceDemo.

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

`npm ci` installs the exact dependency versions recorded in `package-lock.json`.

### 3. Install Playwright browsers

```bash
npx playwright install
```

On Linux machines or CI runners, install the browser system dependencies as well:

```bash
npx playwright install --with-deps
```

## Running the Tests

Run the complete current suite:

```bash
npx playwright test
```

Run all UI tests:

```bash
npx playwright test tests/ui
```

Run a single suite:

```bash
npx playwright test tests/ui/auth.spec.ts
npx playwright test tests/ui/inventory.spec.ts
npx playwright test tests/ui/cart.spec.ts
```

Run only Chromium:

```bash
npx playwright test --project=chromium
```

Run with a visible browser window:

```bash
npx playwright test --headed
```

Open Playwright's interactive UI mode:

```bash
npx playwright test --ui
```

The browser project names are configured in `playwright.config.ts`. The commands above use the project names observed in the supplied test report.

## Viewing the Playwright Report

After a test run, open the HTML report with:

```bash
npx playwright show-report
```

The report shows test results by file and browser. Screenshots, videos, and traces are available only when enabled in the Playwright configuration and produced for that run.

If a trace was generated for a failed test, open it with:

```bash
npx playwright show-trace <PATH_TO_TRACE_ZIP>
```

Replace the placeholder with the actual trace path shown in the report or test output.

## Page Object Model

The UI tests keep page-specific selectors and reusable interactions in the `pages/` directory:

- `LoginPage.ts` — login-page locators and login interactions.
- `InventoryPage.ts` — inventory, product names and prices, sorting, and add/remove actions.
- `CartPage.ts` — cart navigation, cart items, product details, and cart actions.

Assertions and test scenarios belong in the `tests/ui/` specifications. Page objects provide reusable interactions and data-reading methods.

## Test Isolation

Tests use Playwright's test fixtures, which provide an isolated browser context for each test by default. Inventory and cart tests log in during their setup so they begin from an authenticated state, while the authentication suite tests both authenticated and unauthenticated scenarios. The authentication suite also contains a specific test verifying that separate browser contexts do not share authenticated sessions.

## Test Documentation

- [`docs/test-plan.md`](docs/test-plan.md) — project objective, scope, exclusions, test types, environments, risks, and entry/exit criteria.

Add links here when additional documentation files, such as detailed test cases, findings, or defect reports, are actually added to the repository.

## Planned API Automation: Restful Booker

Restful Booker is the planned API-testing target for a later project stage. The intended coverage includes creating, retrieving, updating, partially updating, and deleting bookings; authentication; and representative invalid-input and error-response scenarios.

No API test execution results are claimed in this README yet. Once API tests and Postman/Newman collections are implemented, add their actual file paths, setup requirements, execution commands, and latest verified results here.

## Planned Continuous Integration

GitHub Actions is a planned extension. When the workflow is implemented, document its actual trigger conditions, Node.js version, browser matrix, executed test commands, and uploaded report artifacts here. Do not treat CI as active until a workflow has been committed and successfully run.

## Known Limitations

- The current automated coverage focuses on SauceDemo's login, inventory, sorting, and cart workflows.
- Checkout form validation and order completion are not included in the current reported UI suite.
- API automation, Postman/Newman execution, and CI results are not included in the current report.
- SauceDemo is a public practice service and may change or become temporarily unavailable.
- Browser coverage is limited to the configured and executed projects.
- Passing tests demonstrate the tested scenarios under the recorded conditions; they do not prove that the application is defect-free.

## License

No license has been selected for this repository yet. Add a license file if and when one is chosen.
