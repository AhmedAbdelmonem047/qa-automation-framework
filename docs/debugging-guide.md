# Playwright Debugging Guide

This guide describes how to isolate a failing test, inspect its failure artifacts, use Playwright Trace Viewer, and record a diagnosis. The examples use the SauceDemo application and the project's Chromium, Firefox, and WebKit projects.

## 1. Prerequisites

The Playwright configuration should retain screenshots and traces for failed tests and generate an HTML report. The relevant settings in `playwright.config.ts` are:

```typescript
reporter: [
  ["list"],
  [
    "html",
    {
      outputFolder: "playwright-report",
      open: "never",
    },
  ],
],
use: {
  baseURL: "https://www.saucedemo.com/",
  screenshot: "only-on-failure",
  trace: "retain-on-failure",
},
```

Keep these settings inside the existing `defineConfig` object. Do not replace other project settings when adding or updating them.

- `screenshot: "only-on-failure"` attaches a screenshot when a test fails.
- `trace: "retain-on-failure"` retains a trace for a failed test and discards traces for successful tests.
- The HTML reporter writes its report to `playwright-report/`.

Failure artifacts are normally stored under `test-results/`. A passing run is expected to have an HTML report but no failure-only screenshot or retained trace.

## 2. Useful commands

Run commands from the project root.

### List tests

```bash
npx playwright test --list
```

List tests for one browser project:

```bash
npx playwright test --list --project=chromium
```

### Run the complete suite

```bash
npx playwright test
```

The project configuration determines which browser projects run. In this project, the configured projects are Chromium, Firefox, and WebKit.

### Run one spec in Chromium

```bash
npx playwright test tests/<spec-file>.spec.ts --project=chromium --workers=1
```

Replace the example path with the actual spec-file path.

### Run one test by title

```bash
npx playwright test tests/<spec-file>.spec.ts --project=chromium --grep "<distinctive test title>" --workers=1
```

Use a distinctive part of the test title. `--grep` selects tests whose titles match the supplied pattern.

### Reproduce a failure with a shorter test timeout

```bash
npx playwright test tests/<spec-file>.spec.ts --project=chromium --grep "<distinctive test title>" --timeout=10000 --max-failures=1 --workers=1
```

This is useful for a controlled debugging exercise such as intentionally changing one locator. The options mean:

- `--timeout=10000` sets the test timeout to 10 seconds for this run. It is a limit for the whole test, not a separate locator timeout.
- `--max-failures=1` stops the run after the first failed test.
- `--workers=1` makes the execution easier to follow and the output less interleaved.

These are command-line overrides; they do not permanently change `playwright.config.ts`. A shorter test timeout can also cause a test to time out if setup or earlier actions consume most of the available time. For an action-specific timeout, a locator action can instead be given an explicit timeout, for example `await loginButton.click({ timeout: 5000 });`. Only add that override when it is useful to the diagnosis.

### Open the HTML report

```bash
npx playwright show-report
```

Open the failed test in the report and review its error, steps, and attachments. The report is generated after the test run; `open: "never"` means it will not open automatically.

### Open a trace directly

```bash
npx playwright show-trace "test-results/<test-folder>/trace.zip"
```

Replace the example path with the actual trace ZIP path shown in the report or found in `test-results/`.

## 3. Trace Viewer inspection steps

1. Run the failing test with the configured failure artifacts enabled.
2. Open the HTML report with `npx playwright show-report`.
3. Select the failed test and read the complete error message. Note the failed action, locator, and timeout information.
4. Open the attached trace, or use `npx playwright show-trace` with the trace ZIP path.
5. In the **Actions** timeline, select the action that failed and inspect the actions immediately before it.
6. Read the action details and call log. Confirm which locator or assertion Playwright was trying to use and what it was waiting for.
7. Inspect the **Before** and **After** DOM snapshots around the failed action. Check whether the expected element exists, whether its accessible name or attributes differ, and whether the page is in the expected state.
8. Inspect the screenshot to understand the visible browser state at the point of failure. A screenshot is useful context, but it does not replace checking the DOM snapshot and error details.
9. Check the surrounding actions for earlier failures, unexpected navigation, or missing setup steps that could explain why the target element was unavailable.
10. Record evidence and a root-cause explanation in the relevant debugging document. Do not guess when the trace does not establish the cause.

### What to look for

| Evidence                                         | Possible meaning                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Locator resolves to zero elements                | The selector/name may be incorrect, or the element may not yet be present.                                   |
| Locator resolves to multiple elements            | The locator may be too broad; use a more specific, user-facing locator or scope it to the correct container. |
| Element is found but not visible                 | The page may be in the wrong state, or the element may be hidden.                                            |
| Element is disabled                              | The application may not yet allow the action, or the test may have skipped a required step.                  |
| Element is obstructed or does not receive events | Another element may cover it, or the page may still be transitioning.                                        |
| Expected element is absent from the DOM snapshot | The page may not have loaded the expected view, or an earlier action/navigation may have failed.             |
| Screenshot shows an unexpected page              | Check navigation, authentication, test data, and setup before blaming the locator.                           |

A timeout is a symptom, not by itself a root cause. Use the failed action, locator details, call log, DOM snapshots, and screenshot together to reach a diagnosis.

## 4. Sample failure analysis: intentionally incorrect login locator

This example illustrates the D06-T3 exercise. Replace the example details with the exact locator, test name, error, and observations from the actual run before treating it as a record of a real execution.

### Scenario

A valid-login test normally locates the SauceDemo login button using its accessible role and name:

```typescript
page.getByRole("button", { name: "Login" });
```

For the exercise, the accessible name is deliberately changed:

```typescript
page.getByRole("button", { name: "Login-Broken" });
```

The test then attempts to click the modified locator.

### Expected evidence

- The test fails while trying to perform the login-button action.
- The error identifies the modified locator and reports that Playwright could not complete the action before the applicable timeout.
- The trace shows the attempted action and locator.
- The DOM snapshot shows the actual login button with its normal accessible name, rather than the deliberately changed name.
- The screenshot should show the SauceDemo login page if navigation and setup completed as expected.

### Diagnosis

The locator's accessible name does not match the login button's actual accessible name. As a result, the locator cannot identify the intended button and the click cannot complete. The evidence points to a test-locator defect introduced for the exercise, rather than an application defect, provided the trace confirms that the login page loaded normally and the expected button is present.

### Resolution and verification

1. Restore the original login-button locator.
2. Re-run the selected test in Chromium and confirm it passes.
3. Run the complete configured suite:

   ```bash
   npx playwright test
   ```

4. Confirm the final result and record the actual pass/fail/skip counts.
5. Keep the failure diagnosis in `docs/debugging-findings.md`; use this guide as the reusable procedure for future investigations.

## 5. Documenting a real failure

For each meaningful failure, record:

- Test file, test title, browser project, and command used.
- The failed action and exact locator or assertion.
- The error message and relevant timeout.
- What the call log, DOM snapshots, and screenshot show.
- The root cause, supported by the trace evidence.
- The change made to resolve the issue.
- The result of rerunning the affected test and, when appropriate, the full suite.

Keep observations separate from assumptions. For example, record “the locator matched zero elements in the snapshot” only when that is what the trace shows.

## 6. Generated artifacts and Git

The HTML report and test artifacts are generated output. They should normally remain local and should not be committed unless the project explicitly requires retaining them.

Check that `.gitignore` contains:

```gitignore
/playwright-report/
/test-results/
```

Commit the reusable guide and relevant source/configuration changes, not generated reports, screenshots, or trace ZIP files by default.

## 7. Quick debugging workflow

1. Re-run only the failing test in the relevant browser project.
2. Open the HTML report and read the error.
3. Inspect the failed action, call log, DOM snapshots, and screenshot in Trace Viewer.
4. Identify and document the root cause using evidence.
5. Fix the test or application issue.
6. Re-run the affected test, then run the complete suite.
