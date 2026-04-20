import { Hammer, Music, ShoppingBag, Paintbrush, Sparkles, UtensilsCrossed } from "lucide-react";

export const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  workshop: { icon: <Hammer className="w-3.5 h-3.5" />, color: "bg-heritage-olive text-white", label: "Workshop" },
  music: { icon: <Music className="w-3.5 h-3.5" />, color: "bg-heritage-terracotta text-white", label: "Music" },
  "flea-market": { icon: <ShoppingBag className="w-3.5 h-3.5" />, color: "bg-heritage-gold text-accent-foreground", label: "Flea Market" },
  art: { icon: <Paintbrush className="w-3.5 h-3.5" />, color: "bg-purple-600 text-white", label: "Art" },
  craft: { icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-heritage-olive text-white", label: "Craft" },
  cultural: { icon: <Sparkles className="w-3.5 h-3.5" />, color: "bg-heritage-deep text-white", label: "Cultural" },
  food: { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: "bg-orange-600 text-white", label: "Food" },
};

export const allCategories = Object.entries(categoryConfig).map(([k, v]) => ({ value: k, ...v }));
