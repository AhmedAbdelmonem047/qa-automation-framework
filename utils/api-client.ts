import type { APIRequestContext, APIResponse } from "@playwright/test";

// Booking request structure
export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

// Partial update structure
export type BookingPatch = Partial<Omit<Booking, "bookingdates">> & {
  bookingdates?: Partial<BookingDates>;
};

// API response structures
export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface BookingId {
  bookingid: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token?: string;
  reason?: string;
}

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // Health check
  async healthCheck(): Promise<APIResponse> {
    return this.request.get("/ping");
  }

  // Retrieve booking IDs
  async getBookingIds(): Promise<APIResponse> {
    return this.request.get("/booking");
  }

  // Create booking
  async createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post("/booking", {
      data: { ...booking },
      headers: {
        Accept: "application/json",
      },
    });
  }

  // Retrieve booking by ID
  async getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`, {
      headers: {
        Accept: "application/json",
      },
    });
  }

  // Generate authentication token
  async createToken(credentials: AuthCredentials): Promise<APIResponse> {
    return this.request.post("/auth", {
      data: { ...credentials },
      headers: {
        Accept: "application/json",
      },
    });
  }

  // Full booking update
  async updateBooking(
    id: number,
    booking: Booking,
    token: string,
  ): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: { ...booking },
      headers: {
        Accept: "application/json",
        Cookie: `token=${token}`,
      },
    });
  }

  // Partial booking update
  async partialUpdateBooking(
    id: number,
    booking: BookingPatch,
    token: string,
  ): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, {
      data: { ...booking },
      headers: {
        Accept: "application/json",
        Cookie: `token=${token}`,
      },
    });
  }

  // Delete booking
  async deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
  }
}
