import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronRight,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Laptop,
  MessageCircle,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createPendingPayment, paymentMode } from "@/lib/payment";

interface CoworkingPlan {
  id: string;
  label: string;
  days: number;
  pricePerDay: number;
  total: number;
  popular?: boolean;
}

const plans: CoworkingPlan[] = [
  { id: "1day", label: "1 Day Pass", days: 1, pricePerDay: 200, total: 200 },
  { id: "3day", label: "3 Day Pass", days: 3, pricePerDay: 180, total: 540 },
  { id: "7day", label: "Weekly Pass", days: 7, pricePerDay: 150, total: 1050, popular: true },
  { id: "15day", label: "Bi-Weekly", days: 15, pricePerDay: 130, total: 1950 },
  { id: "1month", label: "Monthly Pass", days: 30, pricePerDay: 100, total: 3000 },
];

type Step = "plan" | "dates" | "details" | "confirm";

const steps: { key: Step; label: string }[] = [
  { key: "plan", label: "Plan" },
  { key: "dates", label: "Date" },
  { key: "details", label: "Details" },
  { key: "confirm", label: "Confirm" },
];

const CoworkingBookingPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<CoworkingPlan | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canProceed = () => {
    switch (step) {
      case "plan": return !!selectedPlan;
      case "dates": return !!startDate;
      case "details": return name.trim().length > 0 && phone.trim().length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
  };

  const prevStep = () => {
    const idx = steps.findIndex((s) => s.key === step);
    if (idx > 0) setStep(steps[idx - 1].key);
    else navigate("/plan-walk");
  };

  const handleConfirm = async () => {
    if (!selectedPlan || !startDate) return;
    setSubmitting(true);

    if (paymentMode === "manual") {
      try {
        const refId = await createPendingPayment({
          bookingType: "coworking",
          bookingDetails: {
            planId: selectedPlan.id,
            planLabel: selectedPlan.label,
            durationDays: selectedPlan.days,
            startDate: format(startDate, "yyyy-MM-dd"),
            seats,
            notes: notes || null,
          },
          customerName: name,
          customerEmail: email || "",
          customerPhone: phone,
          amount: selectedPlan.total * seats,
        });
        navigate(`/payment/${refId}`);
      } catch {
        toast.error("Could not start booking. Please try WhatsApp instead.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const { error } = await supabase.from("coworking_bookings").insert({
        name,
        phone,
        email: email || null,
        date: format(startDate, "yyyy-MM-dd"),
        duration_days: selectedPlan.days,
        seats,
        notes: notes || null,
      });
      if (error) throw error;
      setBooked(true);
      toast.success("Booking Confirmed! Your co-working space has been reserved.");
    } catch {
      toast.error("Booking failed. Something went wrong. Please try WhatsApp instead.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const lines = [
      `Hi! I'd like to book the Co-working Space.`,
      selectedPlan ? `Plan: ${selectedPlan.label} (₹${selectedPlan.total})` : "",
      startDate ? `Start Date: ${format(startDate, "d MMM yyyy")}` : "",
      seats > 1 ? `Seats: ${seats}` : "",
      name ? `Name: ${name}` : "",
    ].filter(Boolean);
    window.open(
      "https://wa.me/919974095435?text=" + encodeURIComponent(lines.join("\n")),
      "_blank"
    );
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Space Reserved!</h1>
          <p className="text-muted-foreground font-body mt-2 text-sm leading-relaxed">
            Your {selectedPlan?.label} starting{" "}
            {startDate ? format(startDate, "d MMM yyyy") : ""} is booked.
            {email && ` A confirmation will be sent to ${email}.`}
          </p>
          <div className="flex gap-3 mt-6 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <button
          onClick={prevStep}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Book Co-working Space</h1>
            <p className="text-xs text-muted-foreground font-body">Ground Floor, Heritage Pol House</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="flex items-center gap-1">
          {steps.map((s, i) => {
            const currentIdx = steps.findIndex((st) => st.key === step);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-full h-1.5 rounded-full transition-colors",
                    done ? "bg-primary" : active ? "bg-primary/50" : "bg-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] mt-1 font-semibold",
                    done || active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-28">
        <AnimatePresence mode="wait">
          {step === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground font-body mb-2">Choose your plan</p>
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedPlan?.id === plan.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-foreground">{plan.label}</span>
                      {plan.popular && (
                        <span className="bg-heritage-gold text-accent-foreground text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                          Best Value
                        </span>
                      )}
                    </div>
                    <span className="font-display font-bold text-foreground">
                      ₹{plan.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      ₹{plan.pricePerDay}/day
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {plan.days} {plan.days === 1 ? "day" : "days"}
                    </span>
                  </div>
                </button>
              ))}

              <div className="pt-3">
                <p className="text-[11px] text-muted-foreground text-center">
                  Includes high-speed WiFi, power outlets & quiet workspace
                </p>
              </div>
            </motion.div>
          )}

          {step === "dates" && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2 p-3 rounded-lg border text-left text-sm",
                        startDate ? "border-primary text-foreground" : "border-border text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {startDate && selectedPlan && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-body">Start</span>
                    <span className="font-semibold text-foreground">{format(startDate, "d MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-body">Duration</span>
                    <span className="font-semibold text-foreground">{selectedPlan.label}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Seats</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="w-10 h-10 rounded-lg border border-border bg-card text-foreground font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="font-display font-bold text-lg text-foreground w-8 text-center">{seats}</span>
                  <button
                    onClick={() => setSeats(Math.min(10, seats + 1))}
                    className="w-10 h-10 rounded-lg border border-border bg-card text-foreground font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground font-body mb-1">Your information</p>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                </div>
                <Textarea
                  placeholder="Any special requirements? (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </motion.div>
          )}

          {step === "confirm" && selectedPlan && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <h3 className="font-display font-bold text-foreground">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-semibold text-foreground">{selectedPlan.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-semibold text-foreground">
                      {startDate ? format(startDate, "d MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold text-foreground">{seats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                  {email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-semibold text-foreground text-xs">{email}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">
                    Total ({seats} {seats === 1 ? "seat" : "seats"})
                  </span>
                  <span className="text-2xl font-display font-bold text-foreground">
                    ₹{(selectedPlan.total * seats).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* WhatsApp alternative */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:border-primary/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                Or enquire via WhatsApp
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border">
        {selectedPlan && step !== "plan" && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-muted-foreground font-body">{selectedPlan.label} × {seats} seat{seats > 1 ? "s" : ""}</span>
            <span className="font-display font-bold text-foreground">
              ₹{(selectedPlan.total * seats).toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <button
          onClick={step === "confirm" ? handleConfirm : nextStep}
          disabled={!canProceed() || submitting}
          className={cn(
            "w-full py-3.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2",
            canProceed() && !submitting
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {submitting ? "Booking…" : step === "confirm" ? "Confirm & Pay" : "Continue"}
          {step !== "confirm" && !submitting && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default CoworkingBookingPage;
