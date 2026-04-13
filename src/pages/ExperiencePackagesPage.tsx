import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Coffee,
  Wifi,
  BedDouble,
  Clock,
  Music,
  ChefHat,
  ShoppingBag,
  Laptop,
  MapPin,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stayPackages } from "@/data/stayPackages";

interface IndividualExperience {
  id: string;
  icon: React.ReactNode;
  title: string;
  location: string;
  description: string;
  price?: string;
  route?: string;
  whatsapp?: string;
}

const individualExperiences: IndividualExperience[] = [
  {
    id: "coworking",
    icon: <Laptop className="w-5 h-5" />,
    title: "Co-working Space",
    location: "Ground Floor, Heritage Pol House",
    description: "High-speed WiFi, power outlets, quiet workspace in a restored pol house setting",
    price: "₹200/day",
    route: "/book-coworking",
  },
  {
    id: "concerts",
    icon: <Music className="w-5 h-5" />,
    title: "Live Music & Skill Concerts",
    location: "Dharmik Lal Pandya House, Mama Ji ni Pol",
    description: "Intimate acoustic sessions, classical music evenings & skill-sharing workshops in a heritage courtyard",
    price: "₹150–₹300",
    whatsapp: "Hi! I'm interested in the music concerts at Dharmik Lal Pandya House. When is the next one?",
  },
  {
    id: "cafe",
    icon: <ChefHat className="w-5 h-5" />,
    title: "Local Kitchen & Café",
    location: "Zaveri Enterprise Building, Ghadiyali ni Pol",
    description: "Home-cooked Gujarati meals & chai by local women — a cloud kitchen in a heritage setting",
    price: "₹80–₹200",
    whatsapp: "Hi! I'd like to know today's menu at the local kitchen in Zaveri Enterprise Building.",
  },
  {
    id: "souvenirs",
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Souvenir & Merchandise Shop",
    location: "Heritage Precinct",
    description: "Handcrafted postcards, tote bags, keychains & local art — take a piece of heritage home",
    route: "/shop",
  },
];

const stayAmenities = [
  { icon: <BedDouble className="w-5 h-5" />, label: "Heritage Stay", desc: "Rooms in a restored pol house", whatsapp: "Hi! I'm interested in a heritage stay at the pol house. Please share availability and rates." },
  { icon: <Wifi className="w-5 h-5" />, label: "Co-working Space", desc: "Ground floor workspace", linkedExp: "coworking" },
  { icon: <Coffee className="w-5 h-5" />, label: "Brewery & Café", desc: "In-house craft brewery", linkedExp: "cafe" },
  { icon: <Clock className="w-5 h-5" />, label: "Flexible Duration", desc: "3 days to 1 month", whatsapp: "Hi! I'd like to know about flexible stay durations (3 days to 1 month). What are the options?" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const ExperiencePackagesPage = () => {
  const navigate = useNavigate();

  const handleExperienceClick = (exp: IndividualExperience) => {
    if (exp.route) {
      navigate(exp.route);
    } else if (exp.whatsapp) {
      window.open(
        "https://wa.me/919974095435?text=" + encodeURIComponent(exp.whatsapp),
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Stay & Experience
        </h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Live in a heritage pol house — work, brew, explore
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ─── Individual Experiences ─── */}
        <div className="px-5 pb-2">
          <motion.h2
            variants={item}
            className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground"
          >
            Individual Experiences
          </motion.h2>
        </div>

        <div className="px-5 space-y-2.5 mt-2 mb-6">
          {individualExperiences.map((exp) => (
            <motion.button
              key={exp.id}
              variants={item}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleExperienceClick(exp)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group"
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {exp.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-sm text-foreground">{exp.title}</p>
                  {exp.price && <span className="text-xs font-bold text-primary flex-shrink-0 ml-2">{exp.price}</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground font-body truncate">{exp.location}</p>
                </div>
                <p className="text-[11px] text-muted-foreground/80 font-body mt-0.5 line-clamp-1">{exp.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
            </motion.button>
          ))}
        </div>

        {/* ─── Stay Amenities ─── */}
        <div className="px-5 pb-2">
          <motion.h2
            variants={item}
            className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground"
          >
            Stay Amenities
          </motion.h2>
        </div>

        <div className="px-5 pb-5 mt-2">
          <div className="grid grid-cols-2 gap-2.5">
            {stayAmenities.map((a) => {
              const handleClick = () => {
                if (a.linkedExp) {
                  const matched = individualExperiences.find((e) => e.id === a.linkedExp);
                  if (matched) handleExperienceClick(matched);
                } else if (a.whatsapp) {
                  window.open(
                    "https://wa.me/919974095435?text=" + encodeURIComponent(a.whatsapp),
                    "_blank"
                  );
                }
              };
              return (
                <motion.button
                  key={a.label}
                  variants={item}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClick}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight">{a.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{a.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ─── Stay Packages ─── */}
        <div className="px-5 pb-2">
          <motion.h2
            variants={item}
            className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground"
          >
            Choose your stay
          </motion.h2>
        </div>

        <div className="px-5 pb-8 space-y-4 mt-2">
          {stayPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={item}
              className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                pkg.popular
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-display font-bold text-lg ${
                          pkg.popular ? "text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        {pkg.duration}
                      </h3>
                      {pkg.popular && (
                        <Badge className="bg-heritage-gold text-accent-foreground border-0 text-[10px] font-bold uppercase tracking-wider">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      ₹{pkg.pricePerDay.toLocaleString("en-IN")}/day
                    </p>
                  </div>
                  <p
                    className={`font-display font-bold text-xl ${
                      pkg.popular ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    ₹{pkg.totalPrice.toLocaleString("en-IN")}
                  </p>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          pkg.popular ? "text-heritage-gold" : "text-primary"
                        }`}
                      />
                      <span
                        className={`text-xs font-body ${
                          pkg.popular
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(`/booking?package=${pkg.id}`)}
                  className={`w-full mt-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    pkg.popular
                      ? "bg-heritage-gold text-accent-foreground hover:bg-heritage-gold/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Book {pkg.duration}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ExperiencePackagesPage;
