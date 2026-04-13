import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import statueOfUnity from "@/assets/tours/statue-of-unity.jpg";
import laxmiVilasPalace from "@/assets/tours/laxmi-vilas-palace.jpg";
import sevasiVav from "@/assets/tours/sevasi-vav.jpg";
import pavagadhHill from "@/assets/tours/pavagadh-hill.jpg";

interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  origin: string;
  price: number;
  rating: number;
  image: string;
}

const tours: Tour[] = [
  {
    id: "1",
    name: "Statue of Unity",
    description: "Viewing deck, Valley of Flowers, guided experience at the world's tallest statue.",
    duration: "Full Day",
    origin: "From Vadodara",
    price: 2500,
    rating: 4.8,
    image: statueOfUnity,
  },
  {
    id: "2",
    name: "Laxmi Vilas Palace",
    description: "Palace tour, museum visit, and royal heritage experience.",
    duration: "Half Day",
    origin: "From Vadodara",
    price: 1200,
    rating: 4.9,
    image: laxmiVilasPalace,
  },
  {
    id: "3",
    name: "Sevasi Vav",
    description: "Stepwell exploration and architectural study of this hidden gem.",
    duration: "3 Hours",
    origin: "From Vadodara",
    price: 800,
    rating: 4.5,
    image: sevasiVav,
  },
  {
    id: "4",
    name: "Pavagadh Hill",
    description: "Temple visit, ropeway trek, and a blend of heritage and spiritual experience.",
    duration: "Full Day",
    origin: "From Vadodara",
    price: 2000,
    rating: 4.7,
    image: pavagadhHill,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const GuidedToursPage = () => {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-display font-bold text-foreground">Guided Tours</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Explore iconic attractions near Vadodara
        </p>
      </div>

      {/* Tour Cards */}
      <motion.div
        className="px-5 pb-8 space-y-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {tours.map((tour) => (
          <motion.div
            key={tour.id}
            variants={item}
            className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={tour.image}
              alt={tour.name}
              className="w-full h-40 object-cover"
              loading="lazy"
              width={768}
              height={512}
            />
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-bold text-foreground text-lg leading-snug">
                  {tour.name}
                </h3>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <Star className="w-4 h-4 text-heritage-gold fill-heritage-gold" />
                  <span className="text-sm font-semibold text-heritage-gold">{tour.rating}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-body mt-1.5 leading-relaxed">
                {tour.description}
              </p>

              <div className="flex items-center gap-3 mt-2.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {tour.duration}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {tour.origin}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="font-display font-bold text-foreground text-lg">
                  ₹{tour.price.toLocaleString("en-IN")}
                </span>
                <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GuidedToursPage;
