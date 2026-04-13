import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-heritage-deep px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="text-heritage-cream">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-heritage-cream">
            History
          </h1>
        </div>
        <p className="text-heritage-sand/80 text-sm font-body pl-8">
          Vadodara's heritage — from the city to the pols
        </p>
      </div>

      <motion.div
        className="px-5 py-6 space-y-8 max-w-lg mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* History of Vadodara */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-heritage-terracotta" />
            History of Vadodara
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Welcome to Vadodara, historically known as Baroda, a city rich in cultural heritage and historical significance. Situated on the banks of the Vishwamitri River in Gujarat, Vadodara is the third largest and most populous city in the state, following Ahmedabad and Surat.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              The origins of Vadodara trace back to the 9th century when it was known as Ankottaka, located near present-day Akota, renowned as a center of Jainism during the 5th and 6th centuries AD. Over the centuries, the city evolved under various rulers, including the Dor tribe's Raja Chandan, who renamed it Chandanavati. Later, it became known as Virakshetra or Virawati, emphasizing its valorous history as a land of warriors. The name Vadodara itself derives from the Sanskrit word 'Vatodar,' meaning 'in the heart of the banyan tree,' reflecting its deep-rooted cultural significance.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              During the era of the British Raj, Vadodara was the capital of the princely state of Baroda, ruled by the illustrious Gaekwad dynasty, honored with a 21 Gun Salute. It was one of the largest and wealthiest princely states in India, renowned for its patronage of arts, education, and culture.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Today, Vadodara is known as the 'Sanskari Nagari' or 'City of Culture,' a title earned due to its vibrant cultural scene and historical prominence. It holds a special place as the cultural capital of Gujarat, a hub of art, music, and intellectual pursuits.
            </p>

            <a
              href="https://historyofvadodara.in/the-history/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-heritage-terracotta hover:underline mt-2"
            >
              Read more on History of Vadodara
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.section>

        {/* History of the Pols */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-heritage-terracotta" />
            History of the Pols
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              The pols of Vadodara are among the city's most distinctive urban formations — tightly knit residential clusters that evolved organically within the walled city over centuries. Each pol functioned as a self-contained neighbourhood, defined by community, caste, and trade, with a single entrance gate (khadki) that could be closed at night for security.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Pol houses are characterised by a distinctive spatial hierarchy: the otla (raised front platform), the parsal (semi-covered transition space), the central courtyard bringing in light and ventilation, and the khadki (narrow shared lane). These elements created a layered progression from public to private space, reflecting a sophisticated understanding of climate, community, and daily life.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              The timber structural systems, intricate wooden carvings on columns, brackets, doors, and windows, and the decorative façade mouldings all speak to a rich tradition of craftsmanship passed down through generations. Each pol house was not merely a dwelling but a cultural artifact — expressing identity, status, and belonging.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Over time, many pols have undergone significant transformation. Families have migrated, traditional occupations have shifted, and modern constructions have gradually replaced heritage structures. Yet the essential fabric — the narrow lanes, shared walls, and communal spaces — continues to define these neighbourhoods and offer a living record of Vadodara's urban history.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Understanding and documenting this living heritage is the first step toward meaningful conservation — ensuring that these irreplaceable urban landscapes are not lost to unchecked development but are instead celebrated, adapted, and carried forward.
            </p>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
