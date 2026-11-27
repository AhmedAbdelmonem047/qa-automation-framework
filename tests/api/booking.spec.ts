import { test, expect } from "@playwright/test";
import {
  ApiClient,
  type Booking,
  type CreateBookingResponse,
  type AuthCredentials,
  type AuthTokenResponse,
} from "../../utils/api-client";

const apiBaseURL = process.env.API_BASE_URL;

if (!apiBaseURL) {
  throw new Error("API_BASE_URL is missing. Check your root .env file.");
}

const apiUsername = process.env.API_USERNAME;
const apiPassword = process.env.API_PASSWORD;

if (!apiUsername || !apiPassword) {
  throw new Error("API_USERNAME or API_PASSWORD is missing from .env.");
}

const credentials: AuthCredentials = {
  username: apiUsername,
  password: apiPassword,
};

test.use({
  baseURL: apiBaseURL,
});

// Reusable booking test data
function createBookingData(): Booking {
  return {
    firstname: "Test",
    lastname: "Tester",
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: "2026-12-10",
      checkout: "2026-12-15",
    },
    additionalneeds: "Breakfast",
  };
}

test.describe("Restful Booker API - Booking", () => {
  // Track bookings created by each individual test.
  let bookingIdsToCleanup: number[] = [];
  let authToken: string | undefined;

  test.beforeEach(() => {
    bookingIdsToCleanup = [];
    authToken = undefined;
  });

  // Generate and reuse an authentication token within a test.
  async function getAuthToken(api: ApiClient): Promise<string> {
    if (authToken) {
      return authToken;
    }

    const response = await api.createToken(credentials);

    expect(response.status()).toBe(200);

    const responseBody = (await response.json()) as AuthTokenResponse;

    if (
      typeof responseBody.token !== "string" ||
      responseBody.token.length === 0
    ) {
      throw new Error("Authentication failed: no token returned.");
    }

    authToken = responseBody.token;

    return authToken;
  }

  // Create a booking and immediately register its ID for cleanup.
  async function createAndTrackBooking(api: ApiClient, booking: Booking) {
    const response = await api.createBooking(booking);

    const responseBody = (await response.json()) as CreateBookingResponse;

    if (
      Number.isInteger(responseBody.bookingid) &&
      responseBody.bookingid > 0
    ) {
      bookingIdsToCleanup.push(responseBody.bookingid);
    }

    return { response, responseBody };
  }

  // Reusable booking creation for retrieval and update tests.
  async function createTestBooking(
    api: ApiClient,
    booking: Booking,
  ): Promise<number> {
    const { response, responseBody } = await createAndTrackBooking(
      api,
      booking,
    );

    expect(response.status()).toBe(200);
    expect(responseBody.bookingid).toBeGreaterThan(0);

    return responseBody.bookingid;
  }

  // Automatically delete test-created bookings after every test.
  test.afterEach(async ({ request }) => {
    if (bookingIdsToCleanup.length === 0) {
      return;
    }

    const api = new ApiClient(request);
    const token = await getAuthToken(api);

    const cleanupFailures: string[] = [];

    // Use a copy to avoid modifying the tracked IDs while iterating.
    const bookingIds = [...new Set(bookingIdsToCleanup)];

    for (const bookingId of bookingIds) {
      try {
        const deleteResponse = await api.deleteBooking(bookingId, token);

        if (deleteResponse.status() !== 201) {
          cleanupFailures.push(
            `Booking ${bookingId}: deletion returned ${deleteResponse.status()}`,
          );
          continue;
        }

        const verificationResponse = await api.getBooking(bookingId);

        if (verificationResponse.status() !== 404) {
          cleanupFailures.push(
            `Booking ${bookingId}: expected GET 404, received ${verificationResponse.status()}`,
          );
        }
      } catch (error) {
        cleanupFailures.push(
          `Booking ${bookingId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    bookingIdsToCleanup = [];

    expect(
      cleanupFailures,
      "Booking cleanup failed:\n" + cleanupFailures.join("\n"),
    ).toEqual([]);
  });

  // Health check
  test("Health check returns 201 Created", async ({ request }) => {
    const api = new ApiClient(request);

    const response = await api.healthCheck();

    expect(response.status()).toBe(201);
    expect(await response.text()).toBe("Created");
  });

  // Booking creation
  test("Create booking successfully", async ({ request }) => {
    const api = new ApiClient(request);
    const bookingData = createBookingData();

    const { response, responseBody } = await createAndTrackBooking(
      api,
      bookingData,
    );

    expect(response.status()).toBe(200);

    expect(responseBody.bookingid).toBeDefined();
    expect(typeof responseBody.bookingid).toBe("number");
    expect(Number.isInteger(responseBody.bookingid)).toBe(true);
    expect(responseBody.bookingid).toBeGreaterThan(0);

    expect(responseBody.booking).toBeDefined();

    expect(responseBody.booking).toMatchObject({ ...bookingData });

    expect(typeof responseBody.booking.firstname).toBe("string");
    expect(typeof responseBody.booking.lastname).toBe("string");
    expect(typeof responseBody.booking.totalprice).toBe("number");
    expect(typeof responseBody.booking.depositpaid).toBe("boolean");

    expect(typeof responseBody.booking.bookingdates.checkin).toBe("string");
    expect(typeof responseBody.booking.bookingdates.checkout).toBe("string");

    expect(typeof responseBody.booking.additionalneeds).toBe("string");
  });

  // Booking retrieval
  test("Retrieve booking by ID successfully", async ({ request }) => {
    const api = new ApiClient(request);

    const bookingData = createBookingData();
    const bookingId = await createTestBooking(api, bookingData);

    const response = await api.getBooking(bookingId);

    expect(response.status()).toBe(200);

    const responseBody = (await response.json()) as Booking;

    expect(responseBody).toMatchObject({ ...bookingData });

    expect(responseBody.firstname).toBe(bookingData.firstname);
    expect(responseBody.lastname).toBe(bookingData.lastname);
  });

  // Authenticated booking update
  test("Update booking successfully with authentication", async ({
    request,
  }) => {
    const api = new ApiClient(request);

    const originalBooking = createBookingData();
    const bookingId = await createTestBooking(api, originalBooking);

    const token = await getAuthToken(api);

    const updatedBooking: Booking = {
      ...originalBooking,
      firstname: "Ahmed Updated",
      lastname: "QA Updated",
      totalprice: 250,
      depositpaid: false,
      bookingdates: {
        checkin: originalBooking.bookingdates.checkin,
        checkout: "2026-12-16",
      },
      additionalneeds: "Late checkout",
    };

    const updateResponse = await api.updateBooking(
      bookingId,
      updatedBooking,
      token,
    );

    expect(updateResponse.status()).toBe(200);

    const updateBody = (await updateResponse.json()) as Booking;

    expect(updateBody).toMatchObject({ ...updatedBooking });

    // Verify that the update was persisted.
    const verificationResponse = await api.getBooking(bookingId);

    expect(verificationResponse.status()).toBe(200);

    const verificationBody = (await verificationResponse.json()) as Booking;

    expect(verificationBody).toMatchObject({ ...updatedBooking });
  });

  // Booking deletion
  test("Delete booking successfully with authentication", async ({
    request,
  }) => {
    const api = new ApiClient(request);

    // Arrange: Create a booking.
    const bookingData = createBookingData();
    const bookingId = await createTestBooking(api, bookingData);

    // Arrange: Authenticate.
    const token = await getAuthToken(api);

    // Act: Delete the booking.
    const deleteResponse = await api.deleteBooking(bookingId, token);

    // Assert: Successful deletion.
    expect(deleteResponse.status()).toBe(201);

    // The explicit deletion was successful.
    // Remove this ID to prevent afterEach from deleting it again.
    bookingIdsToCleanup = bookingIdsToCleanup.filter((id) => id !== bookingId);

    // Verify that the booking no longer exists.
    const verificationResponse = await api.getBooking(bookingId);

    expect(verificationResponse.status()).toBe(404);
  });
});