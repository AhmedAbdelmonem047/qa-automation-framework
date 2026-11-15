# Test Plan — QA Automation Framework

## 1. Document Information

| Item | Value |
| --- | --- |
| Project | QA Automation Framework |
| Repository | `qa-automation-framework` |
| Status | Initial test plan |
| Primary tools | Playwright, TypeScript, Postman, Newman, GitHub Actions |
| UI application under test | SauceDemo — <https://www.saucedemo.com> |
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
- Completing the standard checkout journey.
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
- Testing the internal implementation or source code of the demo applications.
- Guaranteeing availability or data stability of the public demo services.

These exclusions may be revisited in a future project, but they are not required deliverables for this framework.

## 6. Test Types

| Test type | Application / layer | Purpose |
| --- | --- | --- |
| Functional UI | SauceDemo | Verify key user-facing features and workflows |
| Negative UI | SauceDemo | Verify invalid input and rejected user actions |
| UI regression | SauceDemo | Re-run critical journeys after changes |
| API functional | Restful Booker | Verify supported endpoint behavior |
| API negative | Restful Booker | Verify invalid, missing, or unauthorized requests |
| API contract / schema checks | Restful Booker | Check response structure and important data types |
| Integration-flow checks | Framework test layer | Verify selected sequences across related API operations |
| Smoke checks | UI and API | Quickly verify that critical paths are working |
| Cross-browser checks | SauceDemo | Run selected UI coverage in configured Playwright browsers |
| CI checks | Repository | Verify that tests can run in a clean automated environment |

Cross-browser coverage should be limited to the browsers configured in `playwright.config.ts`; do not claim coverage for browsers that have not actually been run.

## 7. Test Approach

### UI

- Use Playwright Test with TypeScript.
- Keep page-specific selectors and actions in page objects under `pages/`.
- Keep reusable setup in fixtures under `fixtures/`.
- Keep test scenarios in `tests/ui/`.
- Prefer user-visible locators and stable accessible attributes.
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

## 8. Test Environments

| Environment | Purpose | Configuration |
| --- | --- | --- |
| Local development | Authoring and debugging tests | Developer machine, supported Node.js version, project dependencies, browser binaries |
| GitHub Actions | Repeatable automated execution | Clean runner, Node.js version pinned in workflow, dependencies installed from lockfile, Playwright browsers installed |
| SauceDemo | UI system under test | `https://www.saucedemo.com` |
| Restful Booker | API system under test | `https://restful-booker.herokuapp.com` |

### Configuration rules

- Keep base URLs and other environment-specific values in configuration or environment variables.
- Do not commit passwords, access tokens, or other secrets.
- Use only the demo credentials intended for SauceDemo practice.
- Keep Postman environment files free of real secrets.
- Make the selected browser projects and retry behavior explicit in `playwright.config.ts`.
- The public API may be intermittently unavailable; document the date and effect of any blocked run.

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Public demo API downtime or rate limiting | API tests may fail for reasons unrelated to the framework | Keep tests independently runnable; distinguish service outages from test failures; retry only where justified |
| Shared API data changes | Tests may become order-dependent or flaky | Create unique records, avoid fixed IDs, and clean up created data |
| UI changes in SauceDemo | Selectors or expected behavior may change | Prefer stable, user-facing locators and centralize selectors in page objects |
| Flaky timing or network behavior | Intermittent failures reduce confidence | Use Playwright auto-waiting and condition-based assertions; avoid arbitrary sleeps |
| Secrets accidentally committed | Credential exposure | Use environment variables and GitHub repository secrets; review files before committing |
| Browser or dependency version mismatch | Local and CI results differ | Commit the lockfile and install dependencies reproducibly with `npm ci` |
| Incomplete test data cleanup | Later runs become unreliable | Use unique data and cleanup steps; make cleanup failures visible |
| Overly broad test coverage | Suite becomes slow and difficult to maintain | Prioritize critical flows and keep smoke checks separate from broader regression runs |

## 10. Entry Criteria

Testing may begin when:

- The repository has been cloned and dependencies have been installed successfully.
- The required Playwright browser binaries are installed.
- The configured UI and API base URLs are reachable.
- Required environment variables are supplied, if the selected test requires them.
- Test data and demo credentials are available and appropriate for the target.
- The test code compiles and the selected test files are discoverable.
- Any known external-service outage or blocking issue has been recorded.

For CI execution, the workflow must be configured with the required Node.js version and secrets, if any.

## 11. Exit Criteria

A test run can be considered complete when:

- All tests selected for that run have executed, or blocked tests have been clearly identified.
- Every failure has been reviewed and classified as an application issue, automation defect, environment/dependency issue, or known limitation.
- No unexplained critical smoke-test failure remains.
- The Playwright report and relevant failure evidence have been generated where configured.
- Any defects found have been recorded with reproducible steps and supporting evidence.
- The run result and known limitations have been documented.

A project milestone is ready for completion when the planned critical UI and API scenarios are implemented, the documented local commands work, and the GitHub Actions workflow completes successfully in a clean run. A passing run is evidence for the tested scope only; it is not proof that the applications are defect-free.

## 12. Deliverables

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

## 13. Review and Maintenance

Review this plan when the target applications, test scope, configuration, or framework structure changes. Keep the README commands aligned with the actual `package.json` scripts and CI workflow. Do not document a test, browser, or CI capability as implemented until it has been added and executed successfully.
