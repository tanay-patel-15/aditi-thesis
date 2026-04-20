import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronRight,
  User,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { stayPackages, type StayPackage } from "@/data/stayPackages";
import { toast } from "sonner";

type Step = "package" | "dates" | "details" | "confirm";

const steps: { key: Step; label: string }[] = [
  { key: "package", label: "Package" },
  { key: "dates", label: "Dates" },
  { key: "details", label: "Details" },
  { key: "confirm", label: "Confirm" },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("package");

  const [step, setStep] = useState<Step>(preselected ? "dates" : "package");
  const [selectedPkg, setSelectedPkg] = useState<StayPackage | null>(
    preselected ? stayPackages.find((p) => p.id === preselected) ?? null : null
  );
  const [checkIn, setCheckIn] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [booked, setBooked] = useState(false);

  const checkOut = checkIn && selectedPkg ? addDays(checkIn, selectedPkg.days) : undefined;

  const canProceed = () => {
    switch (step) {
      case "package":
        return !!selectedPkg;
      case "dates":
        return !!checkIn;
      case "details":
        return name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;
      default:
        return true;
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

  const handleConfirm = () => {
    setBooked(true);
    toast.success("Booking Confirmed!");
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
          <h1 className="text-2xl font-display font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground font-body mt-2 text-sm leading-relaxed">
            Your {selectedPkg?.duration} stay starting{" "}
            {checkIn ? format(checkIn, "d MMM yyyy") : ""} has been booked. A confirmation will be sent to {email}.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </button>
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
        <h1 className="text-xl font-display font-bold text-foreground">Book Your Stay</h1>
      </div>

      {/* Progress Steps */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1">
          {steps.map((s, i) => {
            const currentIdx = steps.findIndex((st) => st.key === step);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5 pb-28">
        <AnimatePresence mode="wait">
          {step === "package" && (
            <motion.div
              key="package"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground font-body mb-2">Select a package</p>
              {stayPackages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedPkg?.id === pkg.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-foreground">{pkg.duration}</span>
                      {pkg.popular && (
                        <Badge className="bg-heritage-gold text-accent-foreground border-0 text-[9px] font-bold uppercase">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <span className="font-display font-bold text-foreground">
                      ₹{pkg.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₹{pkg.pricePerDay.toLocaleString("en-IN")}/day · {pkg.features.length} inclusions
                  </p>
                </button>
              ))}
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
                <label className="text-sm font-semibold text-foreground block mb-2">
                  Check-in Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center gap-2 p-3 rounded-lg border text-left text-sm",
                        checkIn
                          ? "border-primary text-foreground"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      {checkIn ? format(checkIn, "PPP") : "Select a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {checkIn && checkOut && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-body">Check-in</span>
                    <span className="font-semibold text-foreground">{format(checkIn, "d MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-body">Check-out</span>
                    <span className="font-semibold text-foreground">{format(checkOut, "d MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-body">Duration</span>
                    <span className="font-semibold text-foreground">{selectedPkg?.duration}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-foreground block mb-2">Guests</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-lg border border-border bg-card text-foreground font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="font-display font-bold text-lg text-foreground w-8 text-center">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(6, guests + 1))}
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
                  <Input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === "confirm" && selectedPkg && (
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
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-semibold text-foreground">{selectedPkg.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-semibold text-foreground">
                      {checkIn ? format(checkIn, "d MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-semibold text-foreground">
                      {checkOut ? format(checkOut, "d MMM yyyy") : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-semibold text-foreground">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guest</span>
                    <span className="font-semibold text-foreground">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold text-foreground text-xs">{email}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Included
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedPkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-body">Total</span>
                  <span className="text-2xl font-display font-bold text-foreground">
                    ₹{selectedPkg.totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background border-t border-border">
        {selectedPkg && step !== "package" && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-muted-foreground font-body">{selectedPkg.duration}</span>
            <span className="font-display font-bold text-foreground">
              ₹{selectedPkg.totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <button
          onClick={step === "confirm" ? handleConfirm : nextStep}
          disabled={!canProceed()}
          className={cn(
            "w-full py-3.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2",
            canProceed()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {step === "confirm" ? "Confirm Booking" : "Continue"}
          {step !== "confirm" && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
