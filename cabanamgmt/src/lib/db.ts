import { z } from "zod";
import { supabase } from "./supabase";

// =============================
// Zod Schemas
// =============================

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  license_id: z.string().optional(),
  selfie_url: z.string().url().optional(),
  verification_status: z.enum(["pending", "verified", "failed"]).default("pending"),
  screening_status: z.enum(["pending", "clear", "flagged"]).default("pending"),
});

export const bookingSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  slot: z.string().datetime().optional(),
  deposit_status: z.enum(["pending", "paid", "failed", "refunded"]).default("pending"),
  interview_status: z.enum(["pending", "scheduled", "completed", "failed"]).default("pending"),
  nda_signed: z.boolean().default(false),
  payment_intent_id: z.string().optional(),
  notes: z.string().optional(),
});

// =============================
// Types
// =============================

export type User = z.infer<typeof userSchema>;
export type Booking = z.infer<typeof bookingSchema>;

// =============================
// User Helpers
// =============================

export async function createUser(user: Omit<User, 'id'>) {
  const parsed = userSchema.parse(user);
  const { data, error } = await supabase
    .from("users")
    .insert(parsed)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function updateUserStatus(
  id: string,
  fields: Partial<Pick<User, "verification_status" | "screening_status">>
) {
  const { data, error } = await supabase
    .from("users")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================
// Booking Helpers
// =============================

export async function createBooking(booking: Omit<Booking, 'id'>) {
  const parsed = bookingSchema.parse(booking);
  const { data, error } = await supabase
    .from("bookings")
    .insert(parsed)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(
  id: string,
  fields: Partial<Pick<Booking, "deposit_status" | "interview_status" | "nda_signed" | "payment_intent_id">>
) {
  const { data, error } = await supabase
    .from("bookings")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookingsForUser(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}
