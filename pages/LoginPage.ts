import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username", { exact: true });
    this.passwordInput = page.getByPlaceholder("Password", { exact: true });
    this.loginButton = page.getByRole("button", {
      name: "Login",
      exact: true,
    });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  // Navigate to login page
  async navigate(): Promise<void> {
    await this.page.goto("/");
  }

  // Login using username and password
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
