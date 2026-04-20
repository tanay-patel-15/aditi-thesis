import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, SlidersHorizontal, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { heritageHouses, gradeLabels, gradeColors } from "@/data/heritageHouses";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GradeInfo {
  definition: string;
  objective: string;
  identifyingElements: string[];
  scopeForChanges: string;
}

const gradeDetails: Record<string, GradeInfo> = {
  I: {
    definition:
      "Structures of exceptional historical cultural importance (monumental). Those which have been prime landmarks of the region, holding architectural and historical significance.",
    objective: "Preserve and conserve authenticity of the living-heritage.",
    identifyingElements: [
      "Buildings of national or historical importance, embodying great architectural design style, forming prime landmarks of the region.",
      "Presence of original spatial hierarchy characteristics of a traditional pol house including otla, parsal, courtyard, khadki, etc.",
      "Original massing, proportions and typological characteristics clearly identifiable.",
      "Traditional pol khadkis with intricate architectural elements and details.",
      "Intricately articulated façade with decorative mouldings or carving details.",
      "Original timber structural system intact and visible.",
    ],
    scopeForChanges:
      "Necessary restoration required for preservation of the building.",
  },
  II: {
    definition:
      "Buildings with high architectural value, retaining significant traditional features and craftsmanship. Original timber structural systems or architectural elements such as columns, brackets, doors, windows with intricate wooden carvings or decorative façade moulding designs remain clearly identifiable.",
    objective:
      "Conservation of architectural features and craftsmanship.",
    identifyingElements: [
      "Original timber structural system intact and visible.",
      "Intricate carving details visible on columns, brackets, doors, windows.",
      "Intricately articulated façade with decorative mouldings or carving details.",
      "Presence of original spatial hierarchy characteristics of a traditional pol house, like otla, parsal, courtyard, khadki, etc. is largely intact.",
      "Original massing, proportions and typological characteristics clearly identifiable.",
      "Traditional pol khadkis with intricate architectural elements and details.",
    ],
    scopeForChanges:
      "Necessary changes encouraged for conservation and adaptive reuse, while retaining the key architectural elements and spatial features.",
  },
  III: {
    definition:
      "Buildings that have undergone modifications over time but continue to retain basic spatial, typological, and architectural characteristics. The original timber structural framework of beams and columns remains identifiable.",
    objective:
      "Maintain and enhance architectural and spatial character of the pol.",
    identifyingElements: [
      "Original timber structural system intact and visible, with necessary modifications.",
      "Few architectural elements, mouldings or carvings may still be visible.",
      "Façade with traces of traditional articulation, featuring simplified or modified decorative elements.",
      "Original massing, proportions and typological characteristics acknowledging the precinct.",
      "Spatial organisation and hierarchy remain identifiable though adapted to changing use or new functions.",
    ],
    scopeForChanges:
      "Adaptive reuse and guided transformation encouraged, retaining spatial organisation and architectural character while accommodating necessary functions.",
  },
  IV: {
    definition:
      "Buildings of recent origin or those that have undergone transformation. While noticeable traditional architectural features may not be retained, these structures respond to the scale, proportions, and typological character of the pol, ensuring contextual continuity.",
    objective:
      "Ensure contextual continuity within the evolving precinct.",
    identifyingElements: [
      "Contemporary structures with similar proportions.",
      "Original timber structural system intact and visible with necessary modifications.",
      "Reflects contemporary interpretation with elements of traditional articulation or modern influence.",
      "Façade responding to the street rhythm, alignment, proportions and following the spatial hierarchy of a traditional pol house.",
      "Contemporary or simplified expression of detailing, while maintaining continuity.",
    ],
    scopeForChanges:
      "Guided transformation encouraged, acknowledging typology, scale and spatial features of the precinct, with scope for reimagining of existing structures.",
  },
};


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

type GradeFilter = "all" | "I" | "II" | "III" | "IV";

const HousesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return heritageHouses.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.location.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === "all" || h.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [search, gradeFilter]);

  const grades: GradeFilter[] = ["all", "I", "II", "III", "IV"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-heritage-deep px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="text-heritage-cream">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-heritage-cream">
            Heritage Buildings
          </h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-sand/60" />
          <Input
            placeholder="Search buildings or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-heritage-deep/50 border-heritage-sand/20 text-heritage-cream placeholder:text-heritage-sand/50 focus-visible:ring-heritage-gold"
          />
        </div>
      </div>

      {/* Grade Filter */}
      <div className="px-5 py-3 flex items-center gap-2 border-b border-border overflow-x-auto">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {grades.map((g) => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              gradeFilter === g
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {g === "all" ? "All Grades" : `Grade ${g}`}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs text-muted-foreground font-body">
          {filtered.length} {filtered.length === 1 ? "building" : "buildings"} found
        </p>
      </div>

      {/* Houses List */}
      <motion.div
        className="px-5 pb-8 space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
        key={`${search}-${gradeFilter}`}
      >
        {filtered.map((house) => (
          <motion.div
            key={house.id}
            variants={item}
            className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Grade ribbon */}
            <div className="px-4 py-2.5 flex items-center justify-between bg-muted/50">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-heritage-gold" />
                <span className="text-xs font-semibold text-muted-foreground">
                  {gradeLabels[house.grade]}
                </span>
              </div>
              <Badge
                className={`${gradeColors[house.grade]} text-xs font-bold border-0 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setSelectedGrade(house.grade)}
              >
                {house.grade}
              </Badge>
            </div>

            <div className="p-4">
              <h3 className="font-display font-bold text-foreground text-lg leading-snug">
                {house.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-heritage-terracotta" />
                <span className="text-xs text-muted-foreground font-body">
                  {house.location}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                {house.description}
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {house.features.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">No buildings match your search.</p>
          </div>
        )}
      </motion.div>
      {/* Grade Detail Dialog */}
      <Dialog open={!!selectedGrade} onOpenChange={(open) => !open && setSelectedGrade(null)}>
        {selectedGrade && gradeDetails[selectedGrade] && (
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <Badge className={`${gradeColors[selectedGrade]} text-xs font-bold border-0`}>
                  {selectedGrade}
                </Badge>
                {gradeLabels[selectedGrade]}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Details about Grade {selectedGrade} heritage classification
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm font-body">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Definition</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {gradeDetails[selectedGrade].definition}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Objective</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {gradeDetails[selectedGrade].objective}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Identifying Elements</h4>
                <ul className="space-y-1.5">
                  {gradeDetails[selectedGrade].identifyingElements.map((el, i) => (
                    <li key={i} className="text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-heritage-terracotta font-semibold mt-0.5">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-1">Scope for Changes</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {gradeDetails[selectedGrade].scopeForChanges}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default HousesPage;
