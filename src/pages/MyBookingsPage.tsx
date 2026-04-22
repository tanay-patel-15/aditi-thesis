import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast, isToday, parseISO } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Search,
  CalendarCheck,
  Laptop,
  Music,
  Clock,
  Users,
  MapPin,
  BedDouble,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoworkingBooking {
  id: string;
  name: string;
  date: string;
  duration_days: number;
  seats: number;
  created_at: string;
  status: "confirmed" | "pending_verification";
  ref_id?: string;
}

interface StayBooking {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  packageLabel: string;
  created_at: string;
  status: "confirmed" | "pending_verification";
  ref_id: string;
}

interface EventBooking {
  id: string;
  name: string;
  guests: number;
  created_at: string;
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
  } | null;
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [coworkingBookings, setCoworkingBookings] = useState<CoworkingBooking[]>([]);
  const [stayBookings, setStayBookings] = useState<StayBooking[]>([]);
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const handleSearch = async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const [cwRes, evRes, payRes] = await Promise.all([
        supabase
          .from("coworking_bookings")
          .select("id, name, date, duration_days, seats, created_at")
          .eq("phone", trimmed)
          .order("date", { ascending: false }),
        supabase
          .from("event_bookings")
          .select("id, name, guests, created_at, event_id")
          .eq("phone", trimmed)
          .order("created_at", { ascending: false }),
        supabase
          .from("pending_payments")
          .select("id, ref_id, booking_type, booking_details, customer_name, status, created_at")
          .eq("customer_phone", trimmed)
          .in("status", ["confirmed", "pending_verification"])
          .order("created_at", { ascending: false }),
      ]);

      // Legacy coworking_bookings (direct inserts from razorpay/old flow)
      const legacyCw: CoworkingBooking[] = (cwRes.data || []).map((b) => ({
        ...b,
        status: "confirmed" as const,
      }));

      // pending_payments — split by booking_type
      const paidCw: CoworkingBooking[] = [];
      const paidStay: StayBooking[] = [];
      for (const p of payRes.data || []) {
        const details = (p.booking_details || {}) as Record<string, unknown>;
        const status = p.status as "confirmed" | "pending_verification";
        if (p.booking_type === "coworking") {
          paidCw.push({
            id: p.id,
            name: p.customer_name,
            date: String(details.startDate ?? ""),
            duration_days: Number(details.durationDays ?? 1),
            seats: Number(details.seats ?? 1),
            created_at: p.created_at,
            status,
            ref_id: p.ref_id,
          });
        } else if (p.booking_type === "stay") {
          paidStay.push({
            id: p.id,
            name: p.customer_name,
            checkIn: String(details.checkIn ?? ""),
            checkOut: String(details.checkOut ?? ""),
            guests: Number(details.guests ?? 1),
            packageLabel: String(details.packageLabel ?? "Stay"),
            created_at: p.created_at,
            status,
            ref_id: p.ref_id,
          });
        }
      }

      setCoworkingBookings([...paidCw, ...legacyCw]);
      setStayBookings(paidStay);

      // Fetch event details for event bookings
      if (evRes.data && evRes.data.length > 0) {
        const eventIds = [...new Set(evRes.data.map((b) => b.event_id))];
        const { data: events } = await supabase
          .from("events")
          .select("id, title, date, time, location")
          .in("id", eventIds);

        const eventMap = new Map(events?.map((e) => [e.id, e]) || []);
        const enriched: EventBooking[] = evRes.data.map((b) => ({
          id: b.id,
          name: b.name,
          guests: b.guests,
          created_at: b.created_at,
          event: eventMap.get(b.event_id) || null,
        }));
        setEventBookings(enriched);
      } else {
        setEventBookings([]);
      }

      setSearched(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (dateStr: string) => {
    if (!dateStr) return false;
    const d = parseISO(dateStr);
    return !isPast(d) || isToday(d);
  };

  const upcomingCoworking = coworkingBookings.filter((b) => isUpcoming(b.date));
  const pastCoworking = coworkingBookings.filter((b) => !isUpcoming(b.date));
  const upcomingStay = stayBookings.filter((b) => isUpcoming(b.checkIn));
  const pastStay = stayBookings.filter((b) => !isUpcoming(b.checkIn));
  const upcomingEvents = eventBookings.filter((b) => b.event && isUpcoming(b.event.date));
  const pastEvents = eventBookings.filter((b) => !b.event || !isUpcoming(b.event.date));

  const hasUpcoming =
    upcomingCoworking.length > 0 || upcomingStay.length > 0 || upcomingEvents.length > 0;
  const hasPast = pastCoworking.length > 0 || pastStay.length > 0 || pastEvents.length > 0;
  const totalBookings =
    coworkingBookings.length + stayBookings.length + eventBookings.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-heritage-deep text-heritage-cream">
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-display font-bold">My Bookings</h1>
            <p className="text-xs text-heritage-sand/70 font-body">View your reservations</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground font-body">
            Enter the phone number you used while booking to find your reservations.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Search className="w-4 h-4" />
              {loading ? "..." : "Find"}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {searched && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {totalBookings === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <p className="text-muted-foreground font-body">No bookings found for this number.</p>
                  <div className="flex flex-col gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={() => navigate("/book-coworking")}>
                      Book Co-working Space
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/events")}>
                      Browse Events
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setTab("upcoming")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        tab === "upcoming"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      Upcoming {hasUpcoming && `(${upcomingCoworking.length + upcomingStay.length + upcomingEvents.length})`}
                    </button>
                    <button
                      onClick={() => setTab("past")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                        tab === "past"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      Past {hasPast && `(${pastCoworking.length + pastStay.length + pastEvents.length})`}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, x: tab === "upcoming" ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {tab === "upcoming" ? (
                        <>
                          {!hasUpcoming && (
                            <p className="text-center text-sm text-muted-foreground py-8">No upcoming bookings</p>
                          )}
                          {upcomingStay.map((b) => (
                            <StayCard key={b.id} booking={b} />
                          ))}
                          {upcomingCoworking.map((b) => (
                            <CoworkingCard key={b.id} booking={b} />
                          ))}
                          {upcomingEvents.map((b) => (
                            <EventCard key={b.id} booking={b} />
                          ))}
                        </>
                      ) : (
                        <>
                          {!hasPast && (
                            <p className="text-center text-sm text-muted-foreground py-8">No past bookings</p>
                          )}
                          {pastStay.map((b) => (
                            <StayCard key={b.id} booking={b} isPast />
                          ))}
                          {pastCoworking.map((b) => (
                            <CoworkingCard key={b.id} booking={b} isPast />
                          ))}
                          {pastEvents.map((b) => (
                            <EventCard key={b.id} booking={b} isPast />
                          ))}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: "confirmed" | "pending_verification" }) => {
  if (status === "confirmed") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        Confirmed
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
      Verifying
    </span>
  );
};

const StayCard = ({ booking, isPast }: { booking: StayBooking; isPast?: boolean }) => (
  <motion.div
    variants={item}
    initial="hidden"
    animate="show"
    className={`p-4 rounded-xl border bg-card space-y-2 ${isPast ? "opacity-60" : ""}`}
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-heritage-terracotta/10 flex items-center justify-center">
        <BedDouble className="w-4 h-4 text-heritage-terracotta" />
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-sm">{booking.packageLabel}</p>
        <p className="text-xs text-muted-foreground">{booking.name} · {booking.ref_id}</p>
      </div>
      {!isPast && <StatusBadge status={booking.status} />}
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <CalendarCheck className="w-3 h-3" />
        {format(parseISO(booking.checkIn), "dd MMM")} – {format(parseISO(booking.checkOut), "dd MMM yyyy")}
      </span>
      <span className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        {booking.guests} guest{booking.guests > 1 ? "s" : ""}
      </span>
    </div>
  </motion.div>
);

const CoworkingCard = ({ booking, isPast }: { booking: CoworkingBooking; isPast?: boolean }) => (
  <motion.div
    variants={item}
    initial="hidden"
    animate="show"
    className={`p-4 rounded-xl border bg-card space-y-2 ${isPast ? "opacity-60" : ""}`}
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Laptop className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-sm">Co-working Space</p>
        <p className="text-xs text-muted-foreground">
          {booking.name}{booking.ref_id ? ` · ${booking.ref_id}` : ""}
        </p>
      </div>
      {!isPast && <StatusBadge status={booking.status} />}
    </div>
    <div className="flex gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <CalendarCheck className="w-3 h-3" />
        {booking.date ? format(parseISO(booking.date), "dd MMM yyyy") : "—"}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {booking.duration_days} day{booking.duration_days > 1 ? "s" : ""}
      </span>
      <span className="flex items-center gap-1">
        <Users className="w-3 h-3" />
        {booking.seats} seat{booking.seats > 1 ? "s" : ""}
      </span>
    </div>
  </motion.div>
);

const EventCard = ({ booking, isPast }: { booking: EventBooking; isPast?: boolean }) => (
  <motion.div
    variants={item}
    initial="hidden"
    animate="show"
    className={`p-4 rounded-xl border bg-card space-y-2 ${isPast ? "opacity-60" : ""}`}
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
        <Music className="w-4 h-4 text-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-sm">{booking.event?.title || "Event"}</p>
        <p className="text-xs text-muted-foreground">{booking.name} · {booking.guests} guest{booking.guests > 1 ? "s" : ""}</p>
      </div>
      {!isPast && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Booked
        </span>
      )}
    </div>
    {booking.event && (
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarCheck className="w-3 h-3" />
          {format(parseISO(booking.event.date), "dd MMM yyyy")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {booking.event.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {booking.event.location}
        </span>
      </div>
    )}
  </motion.div>
);

export default MyBookingsPage;
