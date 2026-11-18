export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export interface CheckoutValidationScenario {
  name: string;
  customer: CheckoutCustomer;
  expectedError: string;
}

export const checkoutTestData = {
  validCustomer: {
    firstName: "Test",
    lastName: "User",
    postalCode: "12345",
  },

  validationScenarios: [
    {
      name: "missing first name",
      customer: {
        firstName: "",
        lastName: "User",
        postalCode: "12345",
      },
      expectedError: "Error: First Name is required",
    },
    {
      name: "missing last name",
      customer: {
        firstName: "Test",
        lastName: "",
        postalCode: "12345",
      },
      expectedError: "Error: Last Name is required",
    },
    {
      name: "missing postal code",
      customer: {
        firstName: "Test",
        lastName: "User",
        postalCode: "",
      },
      expectedError: "Error: Postal Code is required",
    },
  ] satisfies CheckoutValidationScenario[],

  selectedProduct: {
    name: "Sauce Labs Backpack",
    price: 29.99,
  },

  taxRate: 0.08,
};
