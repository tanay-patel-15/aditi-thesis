import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PaytmQRCard from "@/components/PaytmQRCard";
import {
  fetchPayment,
  submitPaymentProof,
  type PendingPayment,
} from "@/lib/payment";

const PaymentPage = () => {
  const { refId } = useParams<{ refId: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<PendingPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [utr, setUtr] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!refId) return;
    let alive = true;
    fetchPayment(refId)
      .then((p) => {
        if (alive) setPayment(p);
      })
      .catch(() => {
        if (alive) toast.error("Could not load booking");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setScreenshot(f);
  };

  const handleSubmit = async () => {
    if (!refId || !screenshot) return;
    if (utr.trim().length < 6) {
      toast.error("Please enter a valid transaction ID (UTR)");
      return;
    }
    setSubmitting(true);
    try {
      await submitPaymentProof(refId, screenshot, utr);
      const updated = await fetchPayment(refId);
      setPayment(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-5 text-center">
        <XCircle className="w-12 h-12 text-muted-foreground mb-3" />
        <h1 className="text-lg font-display font-bold">Booking not found</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          The reference <code>{refId}</code> could not be found. It may have expired
          or been entered incorrectly.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-5 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Already confirmed — show success state.
  if (payment.status === "confirmed") {
    return (
      <PaymentStatusScreen
        icon={<CheckCircle2 className="w-10 h-10 text-primary" />}
        title="Booking Confirmed"
        message={`Your booking ${payment.ref_id} has been verified. A confirmation email was sent to ${payment.customer_email}.`}
        onHome={() => navigate("/")}
      />
    );
  }

  // Rejected.
  if (payment.status === "rejected") {
    return (
      <PaymentStatusScreen
        icon={<XCircle className="w-10 h-10 text-destructive" />}
        title="Payment Not Verified"
        message={
          payment.admin_notes ||
          "We couldn't verify your payment. Please contact us on WhatsApp at +91 99740 95435."
        }
        onHome={() => navigate("/")}
      />
    );
  }

  // Proof submitted, awaiting admin review.
  if (payment.status === "pending_verification") {
    return (
      <PaymentStatusScreen
        icon={<Clock className="w-10 h-10 text-heritage-terracotta" />}
        title="We've got your payment proof"
        message={`Reference ${payment.ref_id}. Our team will verify your payment and send a confirmation email to ${payment.customer_email} within 24 hours.`}
        onHome={() => navigate("/")}
      />
    );
  }

  // Default: awaiting_payment — show QR + upload form.
  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-12 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">
          Complete Payment
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Pay via Paytm and upload your screenshot to confirm booking
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 space-y-4"
      >
        <PaytmQRCard amount={payment.amount} refId={payment.ref_id} />

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5 uppercase tracking-wider">
              Screenshot of payment
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full flex items-center justify-center gap-2 border border-dashed rounded-lg py-5 text-sm transition-colors",
                screenshot
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30",
              )}
            >
              {screenshot ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{screenshot.name}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Tap to upload screenshot
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5 uppercase tracking-wider">
              Transaction ID (UTR)
            </label>
            <Input
              placeholder="e.g. 4578XXXX12345"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              maxLength={40}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Shown on the Paytm success screen after payment
            </p>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={!screenshot || utr.trim().length < 6 || submitting}
          className={cn(
            "w-full py-3.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2",
            screenshot && utr.trim().length >= 6 && !submitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Done"
          )}
        </button>
      </div>
    </div>
  );
};

interface PaymentStatusScreenProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  onHome: () => void;
}

const PaymentStatusScreen = ({ icon, title, message, onHome }: PaymentStatusScreenProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center px-5">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center max-w-sm"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground font-body mt-2 text-sm leading-relaxed">
        {message}
      </p>
      <Button
        onClick={onHome}
        className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Back to Home
      </Button>
    </motion.div>
  </div>
);

export default PaymentPage;
