import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WalkStop } from "@/data/walkRoute";

interface StopInfoDialogProps {
  stop: WalkStop | null;
  isFinal: boolean;
  onContinue: () => void;
}

export function StopInfoDialog({ stop, isFinal, onContinue }: StopInfoDialogProps) {
  return (
    <AnimatePresence>
      {stop && (
        <motion.div
          key={`stop-${stop.number}`}
          className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-heritage-deep/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full sm:max-w-md mx-auto bg-heritage-cream rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
          >
            <div className="bg-heritage-deep px-6 pt-6 pb-5 flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-heritage-gold text-heritage-deep flex items-center justify-center font-display text-2xl font-bold shadow-md">
                {isFinal ? <Flag className="w-6 h-6" /> : stop.number}
              </div>
              <div className="min-w-0">
                <p className="text-heritage-sand/80 text-xs uppercase tracking-wider font-body">
                  {isFinal ? "End of walk" : `Stop ${stop.number} of 8`}
                </p>
                <h2 className="text-heritage-cream font-display text-2xl leading-tight truncate">
                  {stop.name}
                </h2>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-start gap-2 text-heritage-deep/80">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-heritage-terracotta" />
                <p className="text-sm font-body">{stop.subtitle}</p>
              </div>

              {stop.description && (
                <p className="text-heritage-deep/90 font-body text-[15px] leading-relaxed">
                  {stop.description}
                </p>
              )}

              <Button
                onClick={onContinue}
                className="w-full bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-heritage-cream font-body font-semibold py-6 rounded-xl text-base shadow-md"
              >
                {isFinal ? "Finish walk" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
