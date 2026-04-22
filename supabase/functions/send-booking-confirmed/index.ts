// Deno Edge Function: send-booking-confirmed
// Called from the admin panel to confirm or reject a pending payment.
// Uses service_role to bypass RLS (anon has no UPDATE policy for admin transitions).
// On confirm, also emails the customer via Resend.

// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const formatBookingDetails = (type: string, details: Record<string, unknown>): string => {
  if (type === "stay") {
    const lines = [
      details.packageLabel && `Package: ${details.packageLabel}`,
      details.checkIn && `Check-in: ${details.checkIn}`,
      details.checkOut && `Check-out: ${details.checkOut}`,
      details.guests && `Guests: ${details.guests}`,
    ].filter(Boolean);
    return lines.join("\n");
  }
  if (type === "coworking") {
    const lines = [
      details.planLabel && `Plan: ${details.planLabel}`,
      details.startDate && `Start Date: ${details.startDate}`,
      details.seats && `Seats: ${details.seats}`,
    ].filter(Boolean);
    return lines.join("\n");
  }
  return "";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const refId = body?.refId;
    const action = body?.action ?? "confirm";
    const adminNotes = typeof body?.adminNotes === "string" ? body.adminNotes : null;

    if (!refId || typeof refId !== "string") {
      throw new Error("Missing or invalid refId");
    }
    if (action !== "confirm" && action !== "reject") {
      throw new Error(`Invalid action: ${action}. Expected "confirm" or "reject".`);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase env vars not configured on the function");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const updatePayload = action === "confirm"
      ? { status: "confirmed", confirmed_at: new Date().toISOString() }
      : { status: "rejected", admin_notes: adminNotes?.trim() || null };

    const { data: updated, error: updateErr } = await supabase
      .from("pending_payments")
      .update(updatePayload)
      .eq("ref_id", refId)
      .select()
      .maybeSingle();

    if (updateErr) throw updateErr;
    if (!updated) throw new Error(`No payment found for ref_id ${refId}`);

    if (action === "reject") {
      return new Response(JSON.stringify({ success: true, status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // action === "confirm": send the email
    if (!resendKey) {
      throw new Error("RESEND_API_KEY not set. Run: supabase secrets set RESEND_API_KEY=<key>");
    }

    const detailsText = formatBookingDetails(
      updated.booking_type,
      updated.booking_details ?? {},
    );
    const detailsHtml = detailsText
      .split("\n")
      .map((line) => `<div>${line}</div>`)
      .join("");

    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; color: #3a2e1f; max-width: 600px; margin: 0 auto; padding: 24px; background: #faf6ed;">
        <h2 style="color: #a94e2a; margin-bottom: 8px;">Your booking is confirmed</h2>
        <p style="font-size: 14px; color: #7a6b57; margin-top: 0;">વડની ડાળો · Pol Experience</p>

        <p>Dear ${updated.customer_name},</p>
        <p>Thank you — we've verified your payment and your booking at our heritage pol house is confirmed.</p>

        <div style="background: #f5efdf; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #a94e2a;">
          <div style="margin-bottom: 8px;"><strong>Booking reference:</strong> ${updated.ref_id}</div>
          <div style="margin-bottom: 8px;"><strong>Amount paid:</strong> \u20B9${Number(updated.amount).toLocaleString("en-IN")}</div>
          ${detailsHtml}
        </div>

        <p>Please keep this email for your records. If you have any questions, reach us on WhatsApp at <a href="https://wa.me/919974095435" style="color: #a94e2a;">+91 99740 95435</a>.</p>

        <p style="margin-top: 32px; color: #7a6b57; font-size: 13px; border-top: 1px solid #e5dcc3; padding-top: 16px;">
          — The Pol Experience team<br/>
          Heritage Walks, Vadodara
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pol Experience <onboarding@resend.dev>",
        to: [updated.customer_email],
        subject: `Booking confirmed — ${updated.ref_id}`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error(`Resend API failed (${emailRes.status}): ${errText}`);
    }

    return new Response(JSON.stringify({ success: true, status: "confirmed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-booking-confirmed error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
