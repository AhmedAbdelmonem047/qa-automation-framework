# API Testing Guide

## 1. Overview

The API automation suite tests the [Restful Booker API](https://restful-booker.herokuapp.com) using Playwright and TypeScript. It is a separate test target from the SauceDemo UI suite; the two applications do not share test data.

The suite covers:

- API health checks.
- Booking creation and retrieval.
- Authenticated booking updates and deletion.
- Negative scenarios for missing required fields, invalid data types, and unauthorized requests.
- Runtime response validation using Zod.
- Automatic test-data cleanup.

The API tests use a dedicated `ApiClient` abstraction and reusable booking helpers to reduce duplicated request logic.

## 2. Environment Configuration

The API tests require three environment variables:

| Variable       | Description                           |
| -------------- | ------------------------------------- |
| `API_BASE_URL` | Base URL of the Restful Booker API.   |
| `API_USERNAME` | Username used for API authentication. |
| `API_PASSWORD` | Password used for API authentication. |

Create a `.env` file in the project root:

```env
API_BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=your_username
API_PASSWORD=your_password
```

Replace the placeholder credentials with the credentials configured for the API environment.

The Playwright project configuration must load the root `.env` file before the test files read `process.env`. This is important because the API spec validates its required environment variables when the test module is loaded. Use the environment-loading approach already configured in `playwright.config.ts`.

**Important:**

- Never commit `.env` or actual credentials.
- Ensure `.env` is included in `.gitignore`.
- Keep `.env.example` with placeholder values so other developers know which variables are required.
- Configure the same variables as GitHub Actions repository secrets for CI.
- Do not put real credentials in `.env.example`, documentation, or workflow files.

### Base URL Configuration

The API base URL is read from `API_BASE_URL` and validated before the tests execute. The API spec sets Playwright's `baseURL` using `test.use()`, allowing requests to use relative endpoint paths.

For example:

```typescript
await request.get("/booking");
```

The `ApiClient` uses Playwright's API request context to centralize API operations. The API suite uses the `request` fixture and does not need to launch a browser.

## 3. Authentication Handling

Authentication is required for protected booking operations, including updating and deleting bookings.

The authentication process works as follows:

1. The test calls the authentication endpoint through `ApiClient.createToken()`.
2. The response is validated using `AuthTokenResponseSchema`.
3. The returned token is cached in the current test's suite scope and reused when that test needs another authenticated operation, including cleanup.
4. The token is supplied to authenticated update and delete operations by the `ApiClient`.
5. The cached token is reset in `beforeEach`, so one test does not reuse another test's token.

Restful Booker uses a token cookie for authenticated booking operations. The `ApiClient` is responsible for applying the token to protected requests; tests should use its authenticated methods instead of duplicating cookie construction.

Authentication credentials are read from environment variables rather than hardcoded in test files.

## 4. Test Data Management and Cleanup

The API tests create their own booking data instead of relying on predefined booking IDs. Booking data is created for the test that needs it, and each created booking ID is tracked for cleanup.

### Booking Creation Helpers

The reusable booking helpers have the following responsibilities:

- `createBooking()` sends the booking creation request and validates the creation response using `CreateBookingResponseSchema`.
- `getBookingId()` extracts the validated booking identifier from the creation response.
- `createAndTrackBooking()` creates a booking and registers its ID in the current test's cleanup list.
- `createTestBooking()` creates a booking through the tracking helper and returns its ID for use in a test.

The reusable API-level creation and ID-extraction functions are in `tests/helpers/booking.helper.ts`. Test-specific tracking and lifecycle behavior remain in `tests/api/booking.spec.ts`.

### Automatic Cleanup

The booking spec uses an `afterEach` hook to delete bookings created during each test.

The cleanup process:

1. Checks whether any booking IDs have been registered.
2. Retrieves or reuses an authentication token.
3. Iterates through the unique tracked booking IDs.
4. Sends an authenticated DELETE request for each booking.
5. Verifies that each successfully deleted booking returns HTTP 404 when retrieved.
6. Collects cleanup failures and reports them through Playwright assertions.

The tracked booking IDs and cached authentication token are reset before each test. Cleanup is performed per test so test-created records are not intentionally shared between independent test cases.

### Explicit Deletion

When a test explicitly deletes a booking, the test verifies the DELETE response and then verifies that a subsequent GET returns HTTP 404. The booking ID is removed from the cleanup list only after both checks succeed, avoiding an unnecessary second deletion attempt while retaining cleanup tracking if verification fails.

### Negative Test Data

Negative creation tests intentionally submit malformed booking data. These requests are sent directly through Playwright's `request` fixture because the normal `Booking` TypeScript type correctly prevents malformed payloads from being passed through the typed `ApiClient` method.

If the API unexpectedly accepts an invalid request and returns a usable booking ID, the test extracts the ID defensively and registers it for automatic cleanup to reduce the risk of orphaned test data.

## 5. Response Validation

The API framework uses Zod for runtime response validation. TypeScript interfaces/types describe request and response data at compile time; Zod validates the actual JSON returned by the service at runtime.

The following schemas are used:

| Schema                        | Purpose                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `BookingSchema`               | Validates an individual booking response.                                                   |
| `CreateBookingResponseSchema` | Validates a booking-creation response, including its booking identifier and booking object. |
| `AuthTokenResponseSchema`     | Validates the authentication response and token.                                            |

Successful booking creation is validated in the reusable booking helper. Retrieval and update responses, including verification reads, are parsed with `BookingSchema`. Authentication responses are parsed with `AuthTokenResponseSchema`.

Negative tests should not parse an expected error response with a successful booking schema. They should assert the expected HTTP status and validate an error body only when the API's error-response contract is known.

## 6. Running API Tests

First, make sure the root `.env` file contains the required variables and that dependencies are installed.

Run the complete API test suite:

```bash
npx playwright test tests/api
```

Run only the booking API tests:

```bash
npx playwright test tests/api/booking.spec.ts
```

Run the API tests using the list reporter:

```bash
npx playwright test tests/api --reporter=list
```

Run TypeScript compilation checks:

```bash
npx tsc --noEmit
```

The API suite uses Playwright's API request context and does not require a browser project to be launched. Playwright still uses the project's test runner, configuration, fixtures, and reporters.

### Known API Validation Limitations

The Restful Booker API may accept certain invalid booking payloads or return server errors instead of the expected client errors.

The affected missing-field and invalid-data tests use Playwright's `test.fail(true)` annotation to document these known validation limitations. A failing annotated test is reported as an expected failure; an unexpectedly passing test is reported as an unexpected pass.

The annotation classifies a failure as expected at the test level, so the test result and error should still be reviewed. It does not prove that the API returned the specific validation response intended by the test. If the API begins rejecting the invalid requests correctly, remove the annotation and keep the expected status assertion as a normal passing test.

## 7. Continuous Integration

The API suite needs the same environment variables when executed through GitHub Actions. Configure the following repository secrets:

- `API_BASE_URL`
- `API_USERNAME`
- `API_PASSWORD`

The workflow must explicitly map the secrets into the test job or step environment. Creating repository secrets alone does not automatically expose them to a workflow.

Example job-level configuration:

```yaml
env:
  API_BASE_URL: ${{ secrets.API_BASE_URL }}
  API_USERNAME: ${{ secrets.API_USERNAME }}
  API_PASSWORD: ${{ secrets.API_PASSWORD }}
```

The workflow should install dependencies before running the API tests. The local `.env` file is not uploaded to the CI environment; GitHub Actions secrets provide the required configuration securely.

If the variables are missing from the workflow environment, the API spec will stop with an explicit configuration error. Record CI as passing only after the workflow has completed successfully with the required secrets configured.

## 8. Important Files

| File                              | Responsibility                                             |
| --------------------------------- | ---------------------------------------------------------- |
| `utils/api-client.ts`             | Centralized API request methods and API types.             |
| `utils/schemas/booking.schema.ts` | Runtime response schemas and inferred types.               |
| `tests/helpers/booking.helper.ts` | Reusable booking creation and booking-ID extraction.       |
| `tests/api/booking.spec.ts`       | Booking API tests, per-test tracking, and cleanup.         |
| `playwright.config.ts`            | Playwright configuration and environment loading.          |
| `.env`                            | Local API configuration; excluded from Git.                |
| `.env.example`                    | Placeholder environment-variable template; safe to commit. |
