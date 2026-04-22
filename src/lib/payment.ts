import { supabase } from "@/integrations/supabase/client";

type PendingPaymentStatus =
  | "awaiting_payment"
  | "pending_verification"
  | "confirmed"
  | "rejected";

export type BookingType = "stay" | "coworking";

export interface PendingPayment {
  id: string;
  ref_id: string;
  booking_type: BookingType;
  booking_details: Record<string, unknown>;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  screenshot_url: string | null;
  utr: string | null;
  status: PendingPaymentStatus;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export const paymentMode = (import.meta.env.VITE_PAYMENT_MODE ?? "manual") as
  | "manual"
  | "razorpay";

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes 0/O/1/I to reduce transcription errors
export const generateRefId = (): string => {
  let body = "";
  for (let i = 0; i < 6; i++) {
    body += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `PEX-${body}`;
};

interface CreatePendingPaymentInput {
  bookingType: BookingType;
  bookingDetails: Record<string, unknown>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
}

export const createPendingPayment = async (
  input: CreatePendingPaymentInput,
): Promise<string> => {
  const refId = generateRefId();

  const { error } = await supabase.from("pending_payments").insert({
    ref_id: refId,
    booking_type: input.bookingType,
    booking_details: input.bookingDetails as never,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    amount: input.amount,
    status: "awaiting_payment",
  });

  if (error) throw error;
  return refId;
};

export const fetchPayment = async (
  refId: string,
): Promise<PendingPayment | null> => {
  const { data, error } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("ref_id", refId)
    .maybeSingle();

  if (error) throw error;
  return (data as PendingPayment | null) ?? null;
};

export const submitPaymentProof = async (
  refId: string,
  screenshot: File,
  utr: string,
): Promise<void> => {
  const ext = screenshot.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${refId}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("payment-screenshots")
    .upload(path, screenshot, { upsert: true, contentType: screenshot.type });
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage
    .from("payment-screenshots")
    .getPublicUrl(path);
  const screenshotUrl = urlData.publicUrl;

  const { error: updateErr } = await supabase
    .from("pending_payments")
    .update({
      screenshot_url: screenshotUrl,
      utr: utr.trim(),
      status: "pending_verification",
    })
    .eq("ref_id", refId);

  if (updateErr) throw updateErr;
};

export const listPaymentsByStatus = async (
  status: PendingPaymentStatus,
): Promise<PendingPayment[]> => {
  const { data, error } = await supabase
    .from("pending_payments")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as PendingPayment[] | null) ?? [];
};

// Admin transitions (pending_verification → confirmed / rejected) are blocked
// by RLS for anon users, so we route them through the Edge Function which runs
// with service_role. The function also sends the confirmation email.
export const confirmPayment = async (refId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke(
    "send-booking-confirmed",
    { body: { refId, action: "confirm" } },
  );
  if (error) throw error;
};

export const rejectPayment = async (
  refId: string,
  adminNotes?: string,
): Promise<void> => {
  const { error } = await supabase.functions.invoke(
    "send-booking-confirmed",
    { body: { refId, action: "reject", adminNotes: adminNotes ?? null } },
  );
  if (error) throw error;
};
