import { test, expect } from "@playwright/test";

import {
  ApiClient,
  type Booking,
  type AuthCredentials,
} from "../../utils/api-client";

import { createBooking, getBookingId } from "../helpers/booking.helper";

import {
  AuthTokenResponseSchema,
  BookingSchema,
} from "../../utils/schemas/booking.schema";

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

    const responseBody = AuthTokenResponseSchema.parse(await response.json());

    authToken = responseBody.token;

    return authToken;
  }

  // Create a booking and immediately register its ID for cleanup.
  async function createAndTrackBooking(api: ApiClient, booking: Booking) {
    const result = await createBooking(api, booking);

    bookingIdsToCleanup.push(getBookingId(result.responseBody));

    return result;
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

    return responseBody.bookingid;
  }

  function extractCreatedBookingId(body: unknown): number | undefined {
    if (typeof body !== "object" || body === null || !("bookingid" in body)) {
      return undefined;
    }

    const id = body.bookingid;

    return typeof id === "number" && Number.isInteger(id) && id > 0
      ? id
      : undefined;
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

    // Verify the returned booking matches the submitted data.
    expect(responseBody.booking).toMatchObject({ ...bookingData });
  });

  // Booking retrieval
  test("Retrieve booking by ID successfully", async ({ request }) => {
    const api = new ApiClient(request);

    const bookingData = createBookingData();
    const bookingId = await createTestBooking(api, bookingData);

    const response = await api.getBooking(bookingId);

    expect(response.status()).toBe(200);

    const responseBody = BookingSchema.parse(await response.json());

    expect(responseBody).toMatchObject({ ...bookingData });
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

    const updateBody = BookingSchema.parse(await updateResponse.json());

    expect(updateBody).toMatchObject({ ...updatedBooking });

    // Verify that the update was persisted.
    const verificationResponse = await api.getBooking(bookingId);

    expect(verificationResponse.status()).toBe(200);

    const verificationBody = BookingSchema.parse(
      await verificationResponse.json(),
    );

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

    // Verify that the booking no longer exists.
    const verificationResponse = await api.getBooking(bookingId);

    expect(verificationResponse.status()).toBe(404);

    // Remove from cleanup tracking only after successful verification.
    bookingIdsToCleanup = bookingIdsToCleanup.filter((id) => id !== bookingId);
  });

  // Negative scenarios
  test.describe("Negative scenarios", () => {
    test("Reject booking creation when a required field is missing", async ({
      request,
    }) => {
      test.fail(true, "Known API validation limitation");

      const incompleteBooking = {
        firstname: "Missing",
        // lastname intentionally omitted
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
          checkin: "2027-01-01",
          checkout: "2027-01-05",
        },
        additionalneeds: "Breakfast",
      };

      const response = await request.post("/booking", {
        data: incompleteBooking,
      });

      // Prevent orphaned data if the API unexpectedly accepts the request.
      if (response.ok()) {
        const body: unknown = await response.json();
        const bookingId = extractCreatedBookingId(body);

        if (bookingId !== undefined) {
          bookingIdsToCleanup.push(bookingId);
        }
      }

      expect(response.status()).toBe(400);
    });

    test("Reject booking creation with an invalid data type", async ({
      request,
    }) => {
      test.fail(true, "Known API validation limitation");

      const invalidBooking = {
        firstname: "Invalid",
        lastname: "Price",
        totalprice: "not-a-number",
        depositpaid: true,
        bookingdates: {
          checkin: "2027-01-01",
          checkout: "2027-01-05",
        },
        additionalneeds: "Breakfast",
      };

      const response = await request.post("/booking", {
        data: invalidBooking,
      });

      // Track the booking if invalid data is unexpectedly accepted.
      if (response.ok()) {
        const body: unknown = await response.json();
        const bookingId = extractCreatedBookingId(body);

        if (bookingId !== undefined) {
          bookingIdsToCleanup.push(bookingId);
        }
      }

      expect(response.status()).toBe(400);
    });

    test("Reject booking update without authentication", async ({
      request,
    }) => {
      const api = new ApiClient(request);

      // Arrange: Create and track a valid booking.
      const bookingData = createBookingData();
      const bookingId = await createTestBooking(api, bookingData);

      // Act: Attempt update without authentication.
      const response = await request.put(`/booking/${bookingId}`, {
        data: {
          ...bookingData,
          firstname: "Unauthorized",
        },
      });

      // Assert: Request should be rejected.
      expect(response.status()).toBe(403);

      // Verify the original booking remains completely unchanged.
      const verificationResponse = await api.getBooking(bookingId);

      expect(verificationResponse.status()).toBe(200);

      const verificationBody = BookingSchema.parse(
        await verificationResponse.json(),
      );

      expect(verificationBody).toMatchObject({ ...bookingData });
    });

    test("Reject booking deletion with an invalid token", async ({
      request,
    }) => {
      const api = new ApiClient(request);

      // Arrange: Create and track a valid booking.
      const bookingData = createBookingData();
      const bookingId = await createTestBooking(api, bookingData);

      // Act: Attempt deletion with an invalid authentication token.
      const response = await request.delete(`/booking/${bookingId}`, {
        headers: {
          Cookie: "token=invalid-token",
        },
      });

      // Assert: Request should be rejected.
      expect(response.status()).toBe(403);

      // Verify the booking still exists and remains unchanged.
      const verificationResponse = await api.getBooking(bookingId);

      expect(verificationResponse.status()).toBe(200);

      const verificationBody = BookingSchema.parse(
        await verificationResponse.json(),
      );

      expect(verificationBody).toMatchObject({ ...bookingData });
    });
  });
});
