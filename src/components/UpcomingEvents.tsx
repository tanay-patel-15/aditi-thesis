import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import SubmitEventForm from "@/components/SubmitEventForm";
import { categoryConfig } from "@/data/eventCategories";
import { toast } from "sonner";

type Event = Tables<"events">;

const item = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

const UpcomingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(6);
    if (!mountedRef.current) return;
    if (error) {
      toast.error("Could not load events");
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0)
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
        <SubmitEventForm onSubmitted={fetchEvents} />
      </div>
    );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory scrollbar-hide">
        {events.map((ev) => {
          const { day, month, weekday } = formatDate(ev.date);
          const cat = categoryConfig[ev.category] ?? categoryConfig.cultural;

          return (
            <motion.div
              key={ev.id}
              variants={item}
              className="flex-shrink-0 w-[280px] snap-start bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex items-stretch">
                <div className="w-16 flex-shrink-0 bg-heritage-terracotta/10 flex flex-col items-center justify-center py-3">
                  <span className="text-2xl font-display font-bold text-heritage-terracotta leading-none">{day}</span>
                  <span className="text-[10px] font-semibold text-heritage-terracotta uppercase">{month}</span>
                  <span className="text-[10px] text-muted-foreground">{weekday}</span>
                </div>
                <div className="flex-1 p-3 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5">
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
                  <h4 className="font-display font-semibold text-sm text-foreground leading-tight line-clamp-2">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 font-body leading-relaxed">
                    {ev.description}
                  </p>
                  <div className="flex flex-col gap-0.5 pt-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ev.time}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {ev.location}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-center pt-1">
        <SubmitEventForm onSubmitted={fetchEvents} />
      </div>
    </div>
  );
};

export default UpcomingEvents;
