import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Minus, Plus, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventBookingDialogProps {
  open: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

const EventBookingDialog = ({ open, onClose, event }: EventBookingDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    if (name.length > 100 || phone.length > 20) {
      toast.error("Input too long");
      return;
    }
    const phoneClean = phone.replace(/\s/g, "");
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("event_bookings").insert({
      event_id: event.id,
      name: name.trim(),
      phone: phoneClean,
      guests,
    });
    setLoading(false);

    if (error) {
      toast.error("Could not book. Please try again.");
      return;
    }

    setConfirmed(true);
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setGuests(1);
    setConfirmed(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-lg text-foreground">
                {confirmed ? "Booking Confirmed!" : "Book Event"}
              </h3>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmed ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-foreground">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.date} · {event.time}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p className="text-foreground font-medium">{name}</p>
                  <p className="text-muted-foreground">{guests} guest{guests !== 1 ? "s" : ""}</p>
                </div>
                <Button onClick={handleClose} className="w-full bg-heritage-terracotta hover:bg-heritage-terracotta/90">
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 space-y-0.5">
                  <p className="font-display font-semibold text-sm text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} · {event.time} · {event.location}</p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name *"
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Phone number *"
                      maxLength={20}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground font-medium">Number of guests</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.min(10, g + 1))}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2 bg-heritage-terracotta hover:bg-heritage-terracotta/90">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirm Booking
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventBookingDialog;
