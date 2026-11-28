import { z } from "zod";

// Individual booking returned by GET /booking/:id
export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),

  bookingdates: z.object({
    checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),

  // Optional in the Restful Booker booking contract.
  additionalneeds: z.string().optional(),
});

// Response returned by POST /booking
export const CreateBookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

// Response returned by POST /auth
export const AuthTokenResponseSchema = z.object({
  token: z.string().min(1),
});

// Infer TypeScript types directly from the schemas.
export type BookingResponse = z.infer<typeof BookingSchema>;

export type CreateBookingResponseData = z.infer<
  typeof CreateBookingResponseSchema
>;

export type AuthTokenResponseData = z.infer<typeof AuthTokenResponseSchema>;
