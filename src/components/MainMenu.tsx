import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UpcomingEvents from "@/components/UpcomingEvents";
import {
  Navigation,
  CalendarCheck,
  UtensilsCrossed,
  Landmark,
  Map,
  Building2,
  BookOpen,
  Camera,
  Info,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  route: string;
}

const sections: { title: string; items: MenuItem[] }[] = [
  {
    title: "Experience",
    items: [
      { icon: <Navigation className="w-6 h-6" />, label: "Walk Now", description: "Start a guided heritage walk", route: "/walk-now" },
      { icon: <CalendarCheck className="w-6 h-6" />, label: "Experience Packages", description: "Stay & heritage bundles", route: "/plan-walk" },
      { icon: <UtensilsCrossed className="w-6 h-6" />, label: "Experience Walks", description: "Curated heritage & food walks", route: "/experience-walks" },
      { icon: <Landmark className="w-6 h-6" />, label: "Guided Tours", description: "Nearby major attractions", route: "/guided-tours" },
    ],
  },
  {
    title: "Explore",
    items: [
      { icon: <Map className="w-6 h-6" />, label: "Map", description: "GPS navigation & routes", route: "/map" },
      { icon: <Building2 className="w-6 h-6" />, label: "Building Catalogue", description: "All documented heritage buildings", route: "/houses" },
    ],
  },
  {
    title: "Shop & Bookings",
    items: [
      { icon: <ShoppingBag className="w-6 h-6" />, label: "Shop & Souvenirs", description: "Heritage merchandise & handcrafted gifts", route: "/shop" },
      { icon: <ClipboardList className="w-6 h-6" />, label: "My Bookings", description: "View your reservations", route: "/my-bookings" },
    ],
  },
  {
    title: "Learn",
    items: [
      { icon: <BookOpen className="w-6 h-6" />, label: "History of Vadodara", description: "Timeline & pol development", route: "/history" },
      { icon: <Camera className="w-6 h-6" />, label: "Photo Archive", description: "Visual documentation", route: "/photo-archive" },
      { icon: <Info className="w-6 h-6" />, label: "Grading System", description: "Documentation & identification methodology", route: "/grading-system" },
      { icon: <Info className="w-6 h-6" />, label: "About", description: "Heritage logic & thesis", route: "/about" },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-heritage-deep px-6 pt-10 pb-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--heritage-gold)),transparent_70%)]" />
        <div className="relative flex items-center gap-4">
          <img src={logo} alt="Pol Experience" className="w-16 h-16 object-contain rounded-lg" />
          <div>
            <h1 className="text-2xl font-bold text-heritage-cream">Pol Experience</h1>
            <p className="text-heritage-sand/80 text-sm font-body">વડની ડાળો · Heritage Walks</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <motion.div
        className="px-5 py-6 space-y-7 max-w-lg mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Upcoming Events Section */}
        <div>
          <motion.h2
            variants={item}
            className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3 px-1"
          >
            Upcoming Events & Workshops
          </motion.h2>
          <motion.div variants={item}>
            <UpcomingEvents />
            <div className="flex justify-center mt-3">
              <button
                onClick={() => navigate("/events")}
                className="text-xs font-medium text-heritage-terracotta hover:underline"
              >
                View all events →
              </button>
            </div>
          </motion.div>
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <motion.h2
              variants={item}
              className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3 px-1"
            >
              {section.title}
            </motion.h2>
            <div className="space-y-2.5">
              {section.items.map((menuItem) => (
                <motion.button
                  key={menuItem.route}
                  variants={item}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(menuItem.route)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-heritage-gold/50 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {menuItem.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-foreground">{menuItem.label}</p>
                    <p className="text-sm text-muted-foreground font-body">{menuItem.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default MainMenu;
