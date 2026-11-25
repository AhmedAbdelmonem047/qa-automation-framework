# Test Plan — QA Automation Framework

## 1. Document Information

| Item                       | Value                                                   |
| -------------------------- | ------------------------------------------------------- |
| Project                    | QA Automation Framework                                 |
| Repository                 | `qa-automation-framework`                               |
| Status                     | Maintained test plan; current UI exercises implemented  |
| Primary tools              | Playwright, TypeScript, Postman, Newman, GitHub Actions |
| UI application under test  | SauceDemo — <https://www.saucedemo.com>                 |
| API application under test | Restful Booker — <https://restful-booker.herokuapp.com> |

This document describes the intended testing scope and execution approach for this portfolio project. Update it when the implementation or target applications change.

## 2. Objective

Build a maintainable, repeatable automation framework that demonstrates practical QA engineering skills. The framework will:

- Automate important user journeys in the SauceDemo web application.
- Validate representative REST API behavior in Restful Booker.
- Organize tests using reusable page objects, fixtures, utilities, and test data.
- Produce useful execution evidence through Playwright HTML reports, screenshots, and traces.
- Run automated checks locally and through GitHub Actions.
- Keep UI and API tests understandable, independently executable, and straightforward to maintain.

The purpose is to demonstrate test design and automation practices. It is not to certify either demo application as defect-free.

## 3. Application Overview

### 3.1 SauceDemo (UI)

SauceDemo is a sample e-commerce application. The automated suite will cover the main shopping flow, including authentication, product browsing, cart operations, and checkout.

Target: <https://www.saucedemo.com>

### 3.2 Restful Booker (API)

Restful Booker is a public demo REST API for booking-related operations. The API suite will exercise representative booking operations, authentication, request validation, and error handling.

Target: <https://restful-booker.herokuapp.com>

The API is a shared public demo service. Its data and availability may change independently of this repository.

## 4. Scope

### 4.1 In Scope — UI Tests

- Login with valid and invalid credentials.
- Required-field and relevant login error behavior.
- Inventory page visibility and product information.
- Product sorting.
- Adding and removing products from the cart.
- Cart contents and item counts.
- Checkout form validation.
- Completing standard checkout journeys from inventory through order confirmation.
- End-to-end selection of multiple products, cart review, removal, and cart persistence.
- Exact assertions for product names and prices in inventory/cart/checkout views.
- Cart badge and cart-item count assertions after add/remove operations.
- Checkout summary assertions for item subtotal, tax, and final total, including arithmetic consistency.
- Final order-confirmation heading and message assertions.
- Negative checkout validation for missing first name, last name, and postal code.
- Empty-cart checkout behavior investigation, with the observed result documented rather than assumed.
- Unavailable-product testing only where the application exposes a reliable availability/out-of-stock state.
- Appropriate assertions for navigation, visible feedback, and key page state.

### 4.2 In Scope — API Tests

- Creating a booking.
- Retrieving a booking by ID.
- Retrieving the booking list where appropriate.
- Updating and partially updating a booking.
- Deleting a booking.
- Authentication token creation and use for protected operations.
- Required-field, invalid-input, and representative error responses.
- Response status, headers where relevant, response structure, and important field values.

Tests should create their own data where practical and clean up data they create when the API supports it.

### 4.3 In Scope — Framework Engineering

- TypeScript-based Playwright test setup.
- Page Object Model for UI interactions.
- Reusable fixtures and shared utilities.
- Centralized test data and configuration.
- API automation using Playwright API request support and/or Postman collections.
- Postman collections and environment files, with Newman execution.
- Playwright HTML reports, screenshots, and traces for useful failures.
- GitHub Actions workflow for automated execution.
- Clear documentation of setup, execution, coverage, and known limitations.

## 5. Exclusions

The following are intentionally outside this project's scope:

- Testing production e-commerce or booking systems.
- Exhaustive testing of every page, field, browser, device, or API endpoint.
- Real payment processing or use of real payment details.
- Security penetration testing, vulnerability scanning, or a formal security audit.
- Load, stress, endurance, and capacity testing.
- Native mobile application testing.
- Accessibility certification or a complete WCAG conformance audit.
- Unavailable-product automation when the selected practice application does not expose a testable stock or availability state. Record this as not applicable (N/A), rather than inventing an unsupported flow.
- Testing the internal implementation or source code of the demo applications.
- Guaranteeing availability or data stability of the public demo services.

These exclusions may be revisited in a future project, but they are not required deliverables for this framework.

## 6. Test Types

| Test type                    | Application / layer  | Purpose                                                                          |
| ---------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| Functional UI                | SauceDemo            | Verify key user-facing features and workflows                                    |
| Negative UI                  | SauceDemo            | Verify invalid input, required-field validation, and negative checkout behavior  |
| Boundary / empty-state UI    | SauceDemo            | Verify empty-cart state and document whether checkout is permitted without items |
| UI regression                | SauceDemo            | Re-run critical journeys after changes                                           |
| API functional               | Restful Booker       | Verify supported endpoint behavior                                               |
| API negative                 | Restful Booker       | Verify invalid, missing, or unauthorized requests                                |
| API contract / schema checks | Restful Booker       | Check response structure and important data types                                |
| Integration-flow checks      | Framework test layer | Verify selected sequences across related API operations                          |
| Smoke checks                 | UI and API           | Quickly verify that critical paths are working                                   |
| Cross-browser checks         | SauceDemo            | Run selected UI coverage in configured Playwright browsers                       |
| CI checks                    | Repository           | Verify that tests can run in a clean automated environment                       |

Cross-browser coverage should be limited to the browsers configured in `playwright.config.ts`; do not claim coverage for browsers that have not actually been run.

## 7. Test Approach

### UI

- Use Playwright Test with TypeScript.
- Keep page-specific selectors and actions in page objects under `pages/`.
- Keep reusable setup in fixtures under `fixtures/`.
- Keep established UI test scenarios in `tests/ui/` and end-to-end checkout exercises in `tests/checkout/`.
- Prefer semantic, user-facing locators in this order where appropriate: `getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()`.
- Retain stable `data-test` selectors for elements without a useful accessible locator, data extraction, and application-specific containers; use CSS selectors for structural containers where appropriate. Do not convert every selector indiscriminately.
- Keep repeated product item/name/price selector definitions in a shared helper where that refactor is implemented, while keeping page-specific interactions in their page objects.
- Use web-first assertions for product names, prices, cart counts, checkout summary values, navigation, and final confirmation.
- Avoid fixed sleeps. Use Playwright's auto-waiting and explicit state assertions.
- Keep test data separate from test logic.
- Capture screenshots and traces on failure; retain the HTML report as an execution artifact where configured.

### API

- Keep API tests under `tests/api/` and related multi-step checks under `tests/integration/`.
- Use isolated test data where possible.
- Assert status codes, response bodies, and relevant headers.
- Do not hard-code secrets or authentication tokens.
- Store Postman collections in `postman/collections/` and non-secret environment configuration in `postman/environments/`.
- Use Newman to run the Postman collection from the command line or CI.

### Test independence and cleanup

Tests should not rely on another test having run first. Use unique test data when possible, avoid assumptions about records in the shared public API, and clean up created records when practical. If the external service is unavailable or rate-limited, record the run as blocked by the dependency rather than treating it as an application defect.

## 8. End-to-End UI Exercise Coverage

The SauceDemo UI scope includes end-to-end exercises for product selection, cart management, checkout, negative validation, and selector maintainability. The latest Chromium/Firefox verification reported 102 tests passed and 0 failed. Individual per-browser counts and the execution date were not supplied; the test execution report records those limitations.

| Area                                             | Coverage / engineering activity                                                                                                                                                                                                                               | Completion evidence                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Selector review                                  | Reviewed page-object selectors and preferred `getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()` where they reliably identify user-facing controls. Retained `data-test` and structural selectors where semantic locators were unsuitable. | Selector review and page-object updates completed.                                                                         |
| End-to-end product, cart, and checkout exercises | Added multiple products, inspected cart contents, removed a product, returned to inventory, verified cart persistence, and completed checkout.                                                                                                                | End-to-end exercise spec completed and included in the reported passing test run.                                          |
| Purchase assertions                              | Added exact product-name and price assertions, cart item/badge counts, checkout product summary, item subtotal, tax, total, arithmetic consistency, and final confirmation checks.                                                                            | Assertions completed and included in the reported passing test run.                                                        |
| Negative and unsupported scenarios               | Added missing-field checkout validation and an empty-cart behavior investigation. Unavailable-product coverage is N/A because the practice application does not expose a reliable stock/availability state.                                                   | Negative and empty-cart scenarios included in the reported passing test run; unsupported stock scenario documented as N/A. |
| Cross-browser verification and locator refactor  | Removed duplicated product item/name/price locator definitions, ran the required suites in Chromium and Firefox, reviewed the changes, and committed the refactor.                                                                                            | Verification reported 102 passed and 0 failed across Chromium and Firefox; refactor committed.                             |

### Verification notes

- Keep each end-to-end test independent: it should establish its own login state and required cart state.
- Use web-first assertions for cart item counts, product names, prices, navigation, and checkout results to reduce timing-related flakiness.
- Verify subtotal, tax, and total against expected values and check the arithmetic relationship using the displayed amounts.
- The empty-cart test records the observed zero-value checkout summary and stops before submitting an empty order. Treat this as an application-behavior observation, not a desired business rule.
- Unavailable-product testing is N/A because the practice application does not expose a reliable out-of-stock or stock-availability state.
- The latest Chromium/Firefox validation reported 102 passed and 0 failed. The November 18, 2026 three-browser baseline remains a separate earlier run.

## 9. Test Environments

| Environment       | Purpose                        | Configuration                                                                                                         |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Local development | Authoring and debugging tests  | Developer machine, supported Node.js version, project dependencies, browser binaries                                  |
| GitHub Actions    | Repeatable automated execution | Clean runner, Node.js version pinned in workflow, dependencies installed from lockfile, Playwright browsers installed |
| SauceDemo         | UI system under test           | `https://www.saucedemo.com`                                                                                           |
| Restful Booker    | API system under test          | `https://restful-booker.herokuapp.com`                                                                                |

### Configuration rules

- Keep base URLs and other environment-specific values in configuration or environment variables.
- Do not commit passwords, access tokens, or other secrets.
- Use only the demo credentials intended for SauceDemo practice.
- Keep Postman environment files free of real secrets.
- Make the selected browser projects and retry behavior explicit in `playwright.config.ts`.
- The public API may be intermittently unavailable; document the date and effect of any blocked run.

## 10. Risks and Mitigations

| Risk                                      | Impact                                                    | Mitigation                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Public demo API downtime or rate limiting | API tests may fail for reasons unrelated to the framework | Keep tests independently runnable; distinguish service outages from test failures; retry only where justified |
| Shared API data changes                   | Tests may become order-dependent or flaky                 | Create unique records, avoid fixed IDs, and clean up created data                                             |
| UI changes in SauceDemo                   | Selectors or expected behavior may change                 | Prefer stable, user-facing locators and centralize selectors in page objects                                  |
| Flaky timing or network behavior          | Intermittent failures reduce confidence                   | Use Playwright auto-waiting and condition-based assertions; avoid arbitrary sleeps                            |
| Secrets accidentally committed            | Credential exposure                                       | Use environment variables and GitHub repository secrets; review files before committing                       |
| Browser or dependency version mismatch    | Local and CI results differ                               | Commit the lockfile and install dependencies reproducibly with `npm ci`                                       |
| Incomplete test data cleanup              | Later runs become unreliable                              | Use unique data and cleanup steps; make cleanup failures visible                                              |
| Overly broad test coverage                | Suite becomes slow and difficult to maintain              | Prioritize critical flows and keep smoke checks separate from broader regression runs                         |

## 11. Entry Criteria

Testing may begin when:

- The repository has been cloned and dependencies have been installed successfully.
- The required Playwright browser binaries are installed.
- The configured UI and API base URLs are reachable.
- Required environment variables are supplied, if the selected test requires them.
- Test data and demo credentials are available and appropriate for the target.
- The test code compiles and the selected test files are discoverable.
- Any known external-service outage or blocking issue has been recorded.

For CI execution, the workflow must be configured with the required Node.js version and secrets, if any.

## 12. Exit Criteria

A test run can be considered complete when:

- All tests selected for that run have executed, or blocked tests have been clearly identified.
- Every failure has been reviewed and classified as an application issue, automation defect, environment/dependency issue, or known limitation.
- No unexplained critical smoke-test failure remains.
- The Playwright report and relevant failure evidence have been generated where configured.
- Any defects found have been recorded with reproducible steps and supporting evidence.
- The run result and known limitations have been documented.

A project milestone is ready for completion when the planned critical UI and API scenarios are implemented, the documented local commands work, and the GitHub Actions workflow completes successfully in a clean run. A passing run is evidence for the tested scope only; it is not proof that the applications are defect-free.

## 13. Deliverables

- Playwright + TypeScript framework and configuration.
- UI tests for SauceDemo.
- API tests for Restful Booker.
- Page objects, fixtures, utilities, and test data.
- Postman collection and environment template.
- Newman execution support.
- Playwright HTML report and failure artifacts.
- GitHub Actions workflow.
- `README.md` with setup and run instructions.
- Test documentation under `docs/`, including this test plan.

## 14. Review and Maintenance

Review this plan when the target applications, test scope, configuration, or framework structure changes. Keep the README commands aligned with the actual `package.json` scripts and CI workflow. Do not document a test, browser, or CI capability as implemented until it has been added and executed successfully.
