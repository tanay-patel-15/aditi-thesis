# Payment Flow — Testing Guide

End-to-end manual payment loop: Paytm QR → screenshot upload → admin confirmation → Resend email. Toggle with `VITE_PAYMENT_MODE=manual|razorpay`.

---

## What Landed This Turn

### New files
| File | Purpose |
|---|---|
| `supabase/migrations/20260420175541_pending_payments.sql` | `pending_payments` table + RLS + Storage bucket |
| `supabase/functions/send-booking-confirmed/index.ts` | Deno Edge Function calling Resend |
| `src/lib/payment.ts` | `paymentMode`, `generateRefId`, `createPendingPayment`, `submitPaymentProof`, `fetchPayment`, `listPaymentsByStatus`, `confirmPayment`, `rejectPayment` |
| `src/pages/PaymentPage.tsx` | QR + screenshot upload + UTR + status screens (`/payment/:refId`) |
| `src/pages/AdminPage.tsx` | Password gate + pending/confirmed/rejected tabs + confirm/reject actions (`/admin`) |
| `src/components/PaytmQRCard.tsx` | Reusable QR block with amount + instructions |
| `src/assets/paytm-qr.svg` | Placeholder QR — **Aditi replaces with real Paytm QR** |

### Modified files
| File | Change |
|---|---|
| `src/App.tsx` | Added `/payment/:refId` and `/admin` routes |
| `src/pages/BookingPage.tsx` | `handleConfirm` creates pending payment and routes to `/payment/<refId>` in manual mode |
| `src/pages/CoworkingBookingPage.tsx` | Same pattern — in manual mode writes to `pending_payments` instead of `coworking_bookings` |
| `.env` | Added `VITE_PAYMENT_MODE=manual`, `VITE_ADMIN_PASSWORD=pol2026` |
| `eslint.config.js` | Excluded `supabase/functions/**` from lint (Deno runtime, not Vite) |

---

## One-Time Setup

### 1. Apply the Supabase migration
From the repo root:
```bash
supabase db push
```
Or paste the SQL from `supabase/migrations/20260420175541_pending_payments.sql` into the Supabase dashboard → SQL Editor → Run.

### 2. Deploy the Edge Function
```bash
supabase functions deploy send-booking-confirmed
```

### 3. Get a Resend API key
- Sign up at [resend.com](https://resend.com) (free tier, no card required)
- Dashboard → API Keys → Create → copy the `re_...` key

### 4. Set the secret on the Edge Function
```bash
supabase secrets set RESEND_API_KEY=re_xxx
```

### 5. Replace the placeholder QR
Drop the real Paytm QR image at `src/assets/paytm-qr.svg` (or swap to `.png` and update `PaytmQRCard.tsx:2`).

### 6. Start the dev server
```bash
npm run dev
# http://localhost:8080
```

---

## Feature Tests

### Test 1 — Stay booking → payment flow

1. Go to `http://localhost:8080/plan-walk` and tap **Book Your Stay** (or navigate to `/booking`).
2. Walk through: Package → Dates → Details → Confirm. Enter real-looking `name`, `email`, `phone`.
3. On the confirm step, tap **Confirm & Pay** — button should briefly say "Processing…" then navigate.

**Expected:**
- URL changes to `/payment/PEX-XXXXXX` (6 uppercase chars after the dash)
- Page shows Paytm QR card with the correct amount and ref ID
- Screenshot upload slot + UTR input visible
- **Done** button disabled until screenshot + valid UTR (≥ 6 chars)

**Verify in Supabase:**
- `pending_payments` table has a new row
- `status = 'awaiting_payment'`
- `booking_details` JSONB contains `packageId`, `packageLabel`, `checkIn`, `checkOut`, `guests`

---

### Test 2 — Coworking booking → payment flow

1. Go to `/book-coworking`
2. Walk through: Plan → Date → Details → Confirm. Name + phone required (email optional).
3. Tap **Confirm & Pay**.

**Expected:**
- URL changes to `/payment/PEX-XXXXXX`
- QR amount = `selectedPlan.total * seats`
- Row in `pending_payments` with `booking_type = 'coworking'`, `booking_details` containing `planId`, `planLabel`, `startDate`, `seats`, `notes`

---

### Test 3 — Screenshot upload + UTR submission

From a payment page:
1. Tap the dashed upload area → pick any image under 5 MB.
2. Enter a fake UTR like `123456789012`.
3. Tap **Done**.

**Expected:**
- Button shows "Submitting…" briefly
- Screen changes to **We've got your payment proof** with the ref ID and customer email

**Verify:**
- Supabase Storage → `payment-screenshots` bucket → `PEX-XXXXXX.<ext>` exists
- `pending_payments` row updated: `screenshot_url` populated, `utr` populated, `status = 'pending_verification'`

**Edge cases to check:**
- Upload a non-image file → toast: "Please upload an image file"
- Upload a 6+ MB image → toast: "Image must be under 5MB"
- Type fewer than 6 chars in UTR and tap Done → toast: "Please enter a valid transaction ID (UTR)"

---

### Test 4 — Payment page status routing

Open `/payment/<refId>` directly for rows in different statuses. The page picks the screen based on `payment.status`:

| Status | Screen shown |
|---|---|
| `awaiting_payment` | QR + upload form |
| `pending_verification` | "We've got your payment proof" (clock icon) |
| `confirmed` | "Booking Confirmed" (check icon) |
| `rejected` | "Payment Not Verified" + `admin_notes` fallback |

Also:
- Navigate to `/payment/PEX-NOTREAL` → "Booking not found" screen with **Back to Home**

---

### Test 5 — Admin password gate

1. Go to `/admin` in an incognito window (or after `sessionStorage.clear()`).
2. You should see the **Admin Access** card.
3. Wrong password → inline "Incorrect password" error, no session set.
4. Correct password (default: `pol2026`) → panel renders.

**Verify:** `sessionStorage.getItem("admin_authed") === "1"`.

**Sign-out test:** Click **Sign out** → `sessionStorage` cleared, routed to `/`.

**Missing env test:** Temporarily comment out `VITE_ADMIN_PASSWORD` in `.env`, restart dev server → submitting shows "Admin password not configured."

---

### Test 6 — Admin panel: list + tabs

After signing in at `/admin`:

- **Pending** tab (default): rows where `status = 'pending_verification'` — these have Confirm / Reject buttons.
- **Confirmed** tab: past confirmations (read-only).
- **Rejected** tab: past rejections, shows `admin_notes` reason.

Each row shows: customer name + email + phone, ref ID, amount, booking type badge, booking detail summary, screenshot link (opens in new tab), UTR, timestamp.

**Refresh** button top-right reloads the current tab.

---

### Test 7 — Admin confirm → email sent

From **Pending** tab, on a real `pending_verification` row:

1. Open the screenshot link → verify the image loaded correctly.
2. Click **Confirm** → browser confirmation dialog.
3. Accept.

**Expected:**
- Button shows spinner briefly
- Toast: "PEX-XXXXXX confirmed — email sent"
- Row disappears from Pending, appears under **Confirmed**

**Verify:**
- `pending_payments` row: `status = 'confirmed'`, `confirmed_at` set
- Customer email inbox: "Booking confirmed — PEX-XXXXXX" from `onboarding@resend.dev`
  - Email shows: booking reference, amount, package/plan label, dates, guests/seats
- Resend dashboard → Emails → delivery log shows the send

**If email fails:**
- Toast shows the error from `supabase.functions.invoke("send-booking-confirmed")`
- Common causes: `RESEND_API_KEY` not set, customer email invalid, Resend rate limit

---

### Test 8 — Admin reject

From **Pending** tab:
1. Click **Reject** → dialog opens.
2. Type an optional reason (e.g. "Amount doesn't match").
3. Click **Reject booking**.

**Expected:**
- Toast: "PEX-XXXXXX rejected"
- Row moves from Pending → Rejected tab
- `pending_payments` row: `status = 'rejected'`, `admin_notes` populated
- If the customer reloads `/payment/PEX-XXXXXX` they see the rejection screen with the admin notes

---

### Test 9 — RLS policies

These are the quiet guardrails. Worth spot-checking in the SQL Editor:

**Customer cannot self-confirm:**
```sql
-- As anon role, this should fail:
update pending_payments
set status = 'confirmed'
where ref_id = 'PEX-XXXXXX';
```
RLS rejects because the UPDATE policy requires `status = 'awaiting_payment'` and `WITH CHECK (status = 'pending_verification')`.

**Customer cannot read other rows in bulk:**
Anon SELECT is allowed but ref IDs are random enough that enumeration is impractical (26-char alphabet excluding 0/O/1/I, 6 chars → ~308M combos). For production, tighten to `USING (ref_id = current_setting('request.jwt.claim.ref_id'))` or similar.

---

### Test 10 — Feature flag toggle

Simulate a future flip to Razorpay:

1. Edit `.env` → `VITE_PAYMENT_MODE="razorpay"`
2. Restart dev server (`npm run dev`).
3. Complete a stay booking.

**Expected:**
- `handleConfirm` skips the payment navigation
- Shows the old "Booking Confirmed!" screen (stub behavior preserved)
- For coworking, it falls back to inserting into `coworking_bookings` directly

Flip back to `"manual"` for normal operation.

---

## Quick Smoke Test (60 seconds)

If you just want to sanity-check the whole loop:

```
1. /booking → pick any package → tap through → Confirm & Pay
2. Upload any image, type "TEST123456" for UTR → Done
3. Open /admin in new tab → sign in
4. Confirm the row → check your email
```

If all four steps pass, the feature works.

---

## Gotchas

- **Email goes to the address typed in the booking form** — use your own during testing.
- **Resend free tier:** can only send to the email you signed up with until you verify a sending domain. If testing from a second address, you'll see a 403 from Resend.
- **Types not regenerated:** `src/lib/payment.ts` casts `pending_payments` as `any` because the auto-generated Supabase types are stale. Run `npx supabase gen types typescript --project-id nztkfxqsypxlgqqzkpjx > src/integrations/supabase/types.ts` after the migration applies, then remove the `as any` casts.
- **Admin password is in the bundle.** Anyone who inspects the compiled JS can see `VITE_ADMIN_PASSWORD`. Acceptable for thesis demo. Not for real deployment.
- **Placeholder QR won't scan.** Drop in the real Paytm QR before any live demo.
