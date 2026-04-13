import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { value: "workshop", label: "Workshop" },
  { value: "music", label: "Music" },
  { value: "art", label: "Art" },
  { value: "craft", label: "Craft" },
  { value: "food", label: "Food" },
  { value: "flea-market", label: "Flea Market" },
  { value: "cultural", label: "Cultural" },
];

const SubmitEventForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    organizer: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time.trim() || !form.location.trim() || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic validation
    if (form.title.length > 200 || form.description.length > 1000 || form.location.length > 200) {
      toast.error("Input too long");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("events").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      time: form.time.trim(),
      location: form.location.trim(),
      organizer: form.organizer.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Could not submit event. Try again.");
      return;
    }

    toast.success("Event submitted! 🎉");
    setForm({ title: "", description: "", category: "", date: "", time: "", location: "", organizer: "" });
    setOpen(false);
    onSubmitted?.();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 border-dashed border-heritage-gold/50 text-heritage-terracotta hover:bg-heritage-gold/10"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        Host an Event
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-display font-bold text-lg text-foreground">Host Your Event</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <Input
                  placeholder="Event title *"
                  maxLength={200}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                />

                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Description"
                  maxLength={1000}
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                  <Input
                    placeholder="Time (e.g. 4 PM) *"
                    maxLength={50}
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                  />
                </div>

                <Input
                  placeholder="Location *"
                  maxLength={200}
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                />

                <Input
                  placeholder="Your name / organizer (optional)"
                  maxLength={100}
                  value={form.organizer}
                  onChange={(e) => update("organizer", e.target.value)}
                />

                <Button type="submit" disabled={loading} className="w-full gap-2 bg-heritage-terracotta hover:bg-heritage-terracotta/90">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Event
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SubmitEventForm;
