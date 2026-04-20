import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, parseISO } from "date-fns";
import {
  ArrowLeft, MapPin, Clock, RefreshCw, CalendarDays, List, Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import SubmitEventForm from "@/components/SubmitEventForm";
import EventBookingDialog from "@/components/EventBookingDialog";
import { cn } from "@/lib/utils";
import { categoryConfig, allCategories } from "@/data/eventCategories";
import { toast } from "sonner";

type Event = Tables<"events">;

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [bookingEvent, setBookingEvent] = useState<Event | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });
    if (!mountedRef.current) return;
    if (error) {
      toast.error("Could not load events");
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = useMemo(() => {
    let result = events;
    if (activeCategory) result = result.filter((e) => e.category === activeCategory);
    if (selectedDate) result = result.filter((e) => isSameDay(parseISO(e.date), selectedDate));
    return result;
  }, [events, activeCategory, selectedDate]);

  // Dates that have events (for calendar dot indicators)
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    const source = activeCategory ? events.filter((e) => e.category === activeCategory) : events;
    source.forEach((e) => dates.add(e.date));
    return dates;
  }, [events, activeCategory]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      full: format(d, "d MMM yyyy"),
    };
  };

  const clearFilters = () => {
    setActiveCategory(null);
    setSelectedDate(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-heritage-deep px-5 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-heritage-cream/80 hover:text-heritage-cream">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-heritage-cream">Events & Workshops</h1>
        </div>
        <p className="text-heritage-sand/70 text-sm font-body">
          Community events, workshops, music nights & flea markets in the pol network
        </p>
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 space-y-4">
        {/* View toggle + Submit */}
        <div className="flex items-center justify-between">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                view === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
          <SubmitEventForm onSubmitted={fetchEvents} />
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              !activeCategory
                ? "bg-heritage-terracotta text-white border-heritage-terracotta"
                : "bg-card text-muted-foreground border-border hover:border-heritage-gold/50"
            )}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? null : cat.value)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                activeCategory === cat.value
                  ? `${cat.color} border-transparent`
                  : "bg-card text-muted-foreground border-border hover:border-heritage-gold/50"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Calendar view */}
        <AnimatePresence mode="wait">
          {view === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl border border-border p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d || undefined)}
                  className={cn("p-3 pointer-events-auto")}
                  modifiers={{ hasEvent: (date) => eventDates.has(format(date, "yyyy-MM-dd")) }}
                  modifiersClassNames={{ hasEvent: "bg-heritage-terracotta/20 font-bold text-heritage-terracotta" }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
                {selectedDate && (
                  <div className="flex justify-center pb-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedDate(undefined)}>
                      Clear date filter
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters indicator */}
        {(activeCategory || selectedDate) && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
              {selectedDate && ` on ${format(selectedDate, "d MMM")}`}
              {activeCategory && ` in ${categoryConfig[activeCategory]?.label}`}
            </p>
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Events list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No events match your filters</p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Show all events</Button>
          </div>
        ) : (
          <motion.div className="space-y-3" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
            {filtered.map((ev) => {
              const { day, month, weekday } = formatDate(ev.date);
              const cat = categoryConfig[ev.category] ?? categoryConfig.cultural;

              return (
                <motion.div
                  key={ev.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <div className="flex items-stretch">
                    <div className="w-16 flex-shrink-0 bg-heritage-terracotta/10 flex flex-col items-center justify-center py-3">
                      <span className="text-2xl font-display font-bold text-heritage-terracotta leading-none">{day}</span>
                      <span className="text-[10px] font-semibold text-heritage-terracotta uppercase">{month}</span>
                      <span className="text-[10px] text-muted-foreground">{weekday}</span>
                    </div>
                    <div className="flex-1 p-3 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`${cat.color} text-[10px] border-0 gap-1 px-1.5 py-0.5`}>
                          {cat.icon}
                          {cat.label}
                        </Badge>
                        {ev.is_recurring && (
                          <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0.5">
                            <RefreshCw className="w-2.5 h-2.5" />
                            {ev.recurrence_label}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-display font-semibold text-sm text-foreground leading-tight">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-body leading-relaxed">
                        {ev.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.time}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {ev.location}
                          </span>
                          {ev.organizer && (
                            <span className="text-[11px] text-muted-foreground/70 italic">
                              by {ev.organizer}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              const text = `🏛️ *${ev.title}*\n📅 ${formatDate(ev.date).full}\n🕐 ${ev.time}\n📍 ${ev.location}\n\n${ev.description}\n\nBook now on Pol Experience!`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                            }}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-7 px-3 bg-heritage-terracotta hover:bg-heritage-terracotta/90"
                            onClick={() => setBookingEvent(ev)}
                          >
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      {bookingEvent && (
        <EventBookingDialog
          open={!!bookingEvent}
          onClose={() => setBookingEvent(null)}
          event={{
            id: bookingEvent.id,
            title: bookingEvent.title,
            date: formatDate(bookingEvent.date).full,
            time: bookingEvent.time,
            location: bookingEvent.location,
          }}
        />
      )}
    </div>
  );
};

export default EventsPage;
