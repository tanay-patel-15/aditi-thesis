import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Camera, UtensilsCrossed, Footprints, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Walk {
  id: number;
  name: string;
  type: string;
  description: string[];
  time: "Day" | "Night" | "Day + Night";
  price: number;
}

const walks: Walk[] = [
  {
    id: 1,
    name: "Ghadiyali Pol Heritage Walk",
    type: "Cultural + Architectural",
    description: [
      "Walk through the whole pol",
      "Observing surroundings and the traditional pol houses",
      "Daily activities and pol lifestyle understanding",
      "Religious and institutional spaces visit during the day",
      "Observing the architectural elements of the pol houses",
    ],
    time: "Day",
    price: 500,
  },
  {
    id: 2,
    name: "Food & Heritage Night Walk",
    type: "Cultural + Culinary",
    description: [
      "Walk through the whole pol",
      "Observing the surroundings and activities",
      "Pol night life understanding",
      "Exploring famous local street food",
    ],
    time: "Night",
    price: 500,
  },
  {
    id: 3,
    name: "Food Walk",
    type: "Culinary",
    description: [
      "Exploring famous local street food",
    ],
    time: "Day",
    price: 700,
  },
  {
    id: 4,
    name: "Pol Heritage Photography Walk",
    type: "Cultural + Experiential + Photography",
    description: [
      "Capturing the character of pols live",
      "Exploring light, shadow and spatial qualities during day and night",
      "Documenting textures, activities and pol lifestyle in true sense",
      "Understanding visual storytelling through built heritage",
      "Experiencing the contrast between active daytime life and calm night ambience",
    ],
    time: "Day + Night",
    price: 500,
  },
];

const timeIcon = (time: string) => {
  if (time === "Night") return <Moon className="w-3.5 h-3.5" />;
  if (time === "Day + Night") return <><Sun className="w-3.5 h-3.5" /><span>+</span><Moon className="w-3.5 h-3.5" /></>;
  return <Sun className="w-3.5 h-3.5" />;
};

const typeIcon = (type: string) => {
  if (type.includes("Photography")) return <Camera className="w-5 h-5" />;
  if (type.includes("Culinary")) return <UtensilsCrossed className="w-5 h-5" />;
  return <Footprints className="w-5 h-5" />;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const ExperienceWalksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-heritage-deep px-5 pt-10 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-heritage-cream/80 hover:text-heritage-cream">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-heritage-cream">Experience Walks</h1>
        </div>
        <p className="text-heritage-sand/70 text-sm font-body">
          Curated heritage walks through the pol precincts of Vadodara
        </p>
      </div>

      <motion.div
        className="max-w-lg mx-auto px-5 py-6 space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {walks.map((walk) => (
          <motion.div
            key={walk.id}
            variants={item}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="flex items-stretch">
              <div className="w-14 flex-shrink-0 bg-primary/10 flex flex-col items-center justify-center py-4">
                <div className="text-primary">{typeIcon(walk.type)}</div>
                <span className="text-[10px] font-bold text-primary mt-1">{walk.id}</span>
              </div>
              <div className="flex-1 p-4 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-sm text-foreground leading-tight">
                    {walk.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    {walk.type}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-1 flex items-center">
                    {timeIcon(walk.time)}
                    {walk.time}
                  </Badge>
                </div>
                <div className="mt-2 mb-1">
                  <span className="text-sm font-semibold text-primary">₹{walk.price}/-</span>
                  <span className="text-xs text-muted-foreground ml-1">per person</span>
                </div>
                <ul className="space-y-1">
                  {walk.description.map((point, i) => (
                    <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="text-xs h-8 gap-1.5 bg-[#25D366] hover:bg-[#1ebe57] text-white"
                    onClick={() => {
                      const text = `Hi Aditi! I'm interested in the *${walk.name}* (${walk.type}, ${walk.time}).\n\nCould you share more details about availability and pricing?\n\n— via Pol Experience`;
                      window.open(`https://wa.me/919974095435?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enquire on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ExperienceWalksPage;
