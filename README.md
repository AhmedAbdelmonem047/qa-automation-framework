# QA Automation Framework

A portfolio QA automation project using **Playwright, TypeScript, Postman, Newman, and GitHub Actions**.

The repository demonstrates maintainable UI and API test automation against two public practice applications:

- **UI:** [SauceDemo](https://www.saucedemo.com)
- **API:** [Restful Booker](https://restful-booker.herokuapp.com)

> These are public demo services, not systems owned by this project. Their availability, data, and behavior can change. Test results apply only to the scenarios and environment used for a particular run.

## Project Goals

- Automate critical e-commerce user journeys in SauceDemo.
- Validate representative REST API operations in Restful Booker.
- Use TypeScript and Playwright Test for maintainable automation.
- Apply Page Object Model, reusable fixtures, utilities, and separate test data.
- Maintain Postman collections and run them with Newman.
- Generate useful test reports and failure evidence.
- Execute automated checks locally and through GitHub Actions.

## Repository Structure

```text
qa-automation-framework/
├── .github/
│   └── workflows/             # GitHub Actions workflows
├── docs/
│   ├── test-plan.md           # Scope, approach, risks, entry/exit criteria
│   ├── test-cases.md          # Detailed manual/automated scenarios
│   ├── traceability.md        # Requirement-to-test mapping
│   └── bug-reports.md         # Defect records and evidence
├── fixtures/                  # Shared Playwright fixtures
├── pages/                     # UI Page Object Model classes
├── postman/
│   ├── collections/           # Postman collections
│   └── environments/          # Non-secret environment templates
├── test-data/                 # Reusable test data
├── tests/
│   ├── ui/                    # SauceDemo UI tests
│   ├── api/                   # Restful Booker API tests
│   └── integration/           # Multi-step flow tests
├── utils/                     # Shared helpers
├── playwright.config.ts
├── package.json
├── package-lock.json
└── README.md
```

The structure above describes the intended organization. Keep it synchronized with the actual files in the repository as the project is implemented.

## Prerequisites

Install the following before starting:

1. **Node.js** — use the version specified in the repository's CI workflow or project configuration.
2. **npm** — included with Node.js.
3. **Git** — to clone the repository and manage changes.
4. **Visual Studio Code** or another TypeScript editor (recommended).

You also need internet access to reach SauceDemo and Restful Booker.

## Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd qa-automation-framework
```

Replace the placeholder with the actual repository URL.

### 2. Install project dependencies

```bash
npm ci
```

Use `npm ci` for a reproducible installation from the committed lockfile. If the repository does not yet contain `package-lock.json`, run `npm install` once to create it, then commit the lockfile.

### 3. Install Playwright browsers

```bash
npx playwright install
```

On Linux CI runners, install the required browser system dependencies as well:

```bash
npx playwright install --with-deps
```

### 4. Configure environment values

Use the repository's example environment file or the configuration documented in `playwright.config.ts`. Do not commit real credentials, tokens, or secrets.

Typical configuration values may include:

```env
UI_BASE_URL=https://www.saucedemo.com
API_BASE_URL=https://restful-booker.herokuapp.com
```

If the implementation uses different variable names or reads URLs directly from Playwright/Postman configuration, follow the actual configuration in the repository. Do not create a second, conflicting source of truth.

For SauceDemo, use the practice credentials provided by the SauceDemo login page. Do not use personal or production credentials.

## Running the Tests

The commands below use Playwright's standard CLI and can be run even if custom npm scripts have not yet been added.

### Run all Playwright tests

```bash
npx playwright test
```

### Run UI tests only

```bash
npx playwright test tests/ui
```

### Run API tests only

```bash
npx playwright test tests/api
```

### Run integration tests only

```bash
npx playwright test tests/integration
```

### Run a single test file

```bash
npx playwright test tests/ui/login.spec.ts
```

Replace the example path with an existing test file.

### Run tests in headed mode

```bash
npx playwright test --headed
```

### Run tests with the Playwright UI

```bash
npx playwright test --ui
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
```

The available project names are defined in `playwright.config.ts`. Use a project name that actually exists in that configuration.

## Viewing the Playwright Report

After a test run:

```bash
npx playwright show-report
```

The HTML report is generated according to the reporter configuration in `playwright.config.ts`. Screenshots, videos, and traces are produced only when enabled by the configuration.

For a failed test, open the report and inspect the error and attached evidence. If tracing is enabled, use the trace viewer:

```bash
npx playwright show-trace <PATH_TO_TRACE_ZIP>
```

Replace the placeholder with the trace file path shown in the test output or report.

## Running the Postman Collection with Newman

Newman runs Postman collections from the command line.

If Newman is included in the project's dependencies:

```bash
npx newman run postman/collections/<COLLECTION_FILE>.json
```

To run with a Postman environment file:

```bash
npx newman run postman/collections/<COLLECTION_FILE>.json   -e postman/environments/<ENVIRONMENT_FILE>.json
```

Replace both placeholders with the actual filenames in the repository.

If Newman has not yet been added to the project, install it as a development dependency:

```bash
npm install --save-dev newman
```

Then commit the updated `package.json` and `package-lock.json`.

Do not put real secrets in committed Postman environment files. Supply sensitive values through a secure local or CI mechanism.

## Suggested npm Scripts

Add scripts like these to `package.json` if they are not already present. Adjust paths and names to match the actual repository.

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test tests/ui",
    "test:api": "playwright test tests/api",
    "test:integration": "playwright test tests/integration",
    "test:headed": "playwright test --headed",
    "test:ui-mode": "playwright test --ui",
    "report": "playwright show-report",
    "postman": "newman run postman/collections/<COLLECTION_FILE>.json"
  }
}
```

After adding the scripts, use the shorter commands:

```bash
npm test
npm run test:ui
npm run test:api
npm run test:integration
npm run report
```

The `postman` script must use the real collection filename; replace the placeholder before adding it.

## GitHub Actions

The workflow under `.github/workflows/` should:

1. Check out the repository.
2. Set up the Node.js version used by the project.
3. Install dependencies with `npm ci`.
4. Install the required Playwright browsers.
5. Run the selected automated tests.
6. Upload the Playwright report and useful failure artifacts, even when tests fail.

The exact workflow trigger, browser matrix, and test commands are defined in the workflow file. Keep this README aligned with the implemented workflow.

## Test Documentation

- [`docs/test-plan.md`](docs/test-plan.md) — objectives, scope, exclusions, test types, environments, risks, and entry/exit criteria.
- [`docs/test-cases.md`](docs/test-cases.md) — detailed test scenarios and expected results.
- [`docs/traceability.md`](docs/traceability.md) — mapping between requirements and test cases.
- [`docs/bug-reports.md`](docs/bug-reports.md) — reproducible defect reports and evidence.

## Reproducing a Test Run

For a clean local run:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd qa-automation-framework
npm ci
npx playwright install
npx playwright test
npx playwright show-report
```

For Postman/Newman, run the collection command documented above after confirming the collection and environment filenames.

Record the date, test command, browser/project, pass/fail counts, and any external service outage when documenting a significant run.

## Known Limitations

- SauceDemo and Restful Booker are public practice services and may change or become temporarily unavailable.
- Restful Booker's shared data may be modified by other users.
- The suite covers the scenarios implemented in this repository, not every possible behavior.
- A passing test run does not prove that the target applications are defect-free.
- Browser coverage is limited to the browser projects actually configured and executed.

## License

Add a license if and when one is selected for this repository.
