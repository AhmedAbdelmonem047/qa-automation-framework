import type { APIResponse } from "@playwright/test";
import type {
  ApiClient,
  Booking,
  CreateBookingResponse,
} from "../../utils/api-client";
import {
  CreateBookingResponseSchema,
  type CreateBookingResponseData,
} from "../../utils/schemas/booking.schema";

export interface BookingCreationResult {
  response: APIResponse;
  responseBody: CreateBookingResponseData;
}

export async function createBooking(
  api: ApiClient,
  booking: Booking,
): Promise<BookingCreationResult> {
  const response = await api.createBooking(booking);

  if (!response.ok())
    throw new Error(
      `Booking creation failed (${response.status()}): ${await response.text()}`,
    );

  const responseBody = CreateBookingResponseSchema.parse(await response.json());

  return { response, responseBody };
}

export function getBookingId(responseBody: CreateBookingResponseData): number {
  return responseBody.bookingid;
}
