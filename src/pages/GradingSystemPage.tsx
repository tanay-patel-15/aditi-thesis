import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, Hammer, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const gradeColors: Record<string, string> = {
  I: "bg-heritage-terracotta text-white",
  II: "bg-heritage-gold text-accent-foreground",
  III: "bg-heritage-olive text-white",
  IV: "bg-muted text-muted-foreground",
};

const grades = [
  {
    grade: "I",
    title: "Exceptional Significance",
    definition:
      "Structures of exceptional historical cultural importance (monumental). Those which have been prime landmarks of the region, holding architectural and historical significance.",
    objective: "Preserve and conserve authenticity of the living-heritage.",
    elements: [
      "Buildings of national or historical importance, embodying great architectural design style, forming prime landmarks of the region.",
      "Presence of original spatial hierarchy — otla, parsal, courtyard, khadki, etc.",
    ],
    scope: "Necessary restoration required for preservation of the building.",
  },
  {
    grade: "II",
    title: "High Architectural Value",
    definition:
      "Buildings with high architectural value, retaining significant traditional features and craftsmanship. Original timber structural systems or architectural elements such as columns, brackets, doors, windows with intricate wooden carvings or decorative façade moulding designs remain clearly identifiable.",
    objective: "Conservation of architectural features and craftsmanship.",
    elements: [
      "Original timber structural system intact and visible.",
      "Intricate carving details visible on columns, brackets, doors, windows.",
      "Intricately articulated façade with decorative mouldings or carving details.",
      "Spatial hierarchy — otla, parsal, courtyard, khadki — largely intact.",
      "Original massing, proportions and typological characteristics clearly identifiable.",
      "Traditional pol khadkis with intricate architectural elements and details.",
    ],
    scope:
      "Necessary changes encouraged for conservation and adaptive reuse, while retaining key architectural elements and spatial features.",
  },
  {
    grade: "III",
    title: "Retains Characteristics",
    definition:
      "Buildings that have undergone modifications over time but continue to retain basic spatial, typological, and architectural characteristics. The original timber structural framework of beams and columns remains identifiable.",
    objective: "Maintain and enhance architectural and spatial character of the pol.",
    elements: [
      "Original timber structural system intact and visible, with necessary modifications.",
      "Few architectural elements, mouldings or carvings may still be visible.",
      "Façade with traces of traditional articulation, featuring simplified or modified decorative elements.",
      "Original massing, proportions and typological characteristics acknowledging the precinct.",
      "Spatial organisation and hierarchy remain identifiable though adapted to changing use or new functions.",
    ],
    scope:
      "Adaptive reuse and guided transformation encouraged, retaining spatial organisation and architectural character while accommodating necessary functions.",
  },
  {
    grade: "IV",
    title: "Recent Origin",
    definition:
      "Buildings of recent origin or those that have undergone transformation. While noticeable traditional architectural features may not be retained, these structures respond to the scale, proportions, and typological character of the pol, ensuring contextual continuity.",
    objective: "Ensure contextual continuity within the evolving precinct.",
    elements: [
      "Contemporary structures with similar proportions.",
      "Original timber structural system intact and visible with necessary modifications.",
      "Reflects contemporary interpretation with elements of traditional articulation or modern influence.",
      "Façade responding to the street rhythm, alignment, proportions and following the spatial hierarchy of a traditional pol house.",
      "Contemporary or simplified expression of detailing, while maintaining continuity.",
    ],
    scope:
      "Guided transformation encouraged, acknowledging typology, scale and spatial features of the precinct, with scope for reimagining of existing structures.",
  },
];

const vennFactors = [
  { label: "Context\n& Location", size: 56, top: "8%", left: "22%" },
  { label: "Significance", size: 52, top: "28%", left: "62%" },
  { label: "Age", size: 52, top: "58%", left: "15%" },
  { label: "Extent of\nModification", size: 52, top: "58%", left: "55%" },
  { label: "Existing\nCondition", size: 52, top: "78%", left: "35%" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const GradingSystemPage = () => {
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
            Grading System
          </h1>
        </div>
        <p className="text-heritage-sand/80 text-sm font-body pl-8">
          Documentation & identification methodology for pols of old city, Vadodara
        </p>
      </div>

      <motion.div
        className="px-5 py-6 space-y-8 max-w-lg mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Documentation Section */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-heritage-terracotta" />
            Why Documentation?
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm text-foreground font-semibold font-body leading-relaxed italic">
              "Documentation enables design to begin with understanding, allowing existing structures to be reused, repurposed, and meaningfully transformed rather than replaced."
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              The pols of Vadodara have evolved over time, where many traditional houses have been modified, partially occupied, or simply abandoned, while new constructions continue to gradually replace this living heritage. In many cases, interventions happen without fully understanding the existing structure, leading to a loss of character and continuity.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              This grading system is developed to recognise and acknowledge these existing structures, guiding how they can be retained, repurposed, or reimagined rather than replaced.
            </p>
          </div>
        </motion.section>

        {/* Why Grading */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <List className="w-5 h-5 text-heritage-terracotta" />
            Why is Grading Necessary?
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Documentation is necessary to understand what already exists before any intervention is made. Documentation, along with grading, becomes a combined toolkit that allows each structure to be carefully understood and identified.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Through this process, it becomes possible to recognise architectural and spatial qualities, understand the degree of transformation over time, and acknowledge each building as part of the larger pol fabric. This also enables proper identification and recognition of individual houses, giving them a clearer presence within the pol precinct.
            </p>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Rather than starting from scratch, design begins with understanding and valuing what already exists. By forming a proper system, each building can be understood as a layered system of structure, space, and detail. This helps in evaluating its potential and guiding the type of intervention and functions it can accommodate.
            </p>
          </div>
        </motion.section>

        {/* Venn Diagram — Evaluation Factors */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-heritage-terracotta" />
            Evaluation Factors
          </h2>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-5">
              The grading considers the presence of original structural systems, architectural features, façade details, intricate wooden carvings, decorative moulding designs, and the retention of traditional spatial characteristics.
            </p>

            {/* Venn Diagram */}
            <div className="relative w-full aspect-square max-w-[300px] mx-auto">
              {/* Central large circle */}
              <div
                className="absolute rounded-full bg-heritage-gold/30 border-2 border-heritage-gold/50 flex items-center justify-center"
                style={{
                  width: "55%",
                  height: "55%",
                  top: "22%",
                  left: "22%",
                }}
              >
                <span className="text-xs font-display font-bold text-foreground text-center leading-tight px-2">
                  Unique<br />Architectural<br />Value
                </span>
              </div>

              {/* Surrounding circles */}
              {vennFactors.map((factor) => (
                <div
                  key={factor.label}
                  className="absolute rounded-full bg-heritage-gold/20 border border-heritage-gold/40 flex items-center justify-center"
                  style={{
                    width: `${factor.size}px`,
                    height: `${factor.size}px`,
                    top: factor.top,
                    left: factor.left,
                  }}
                >
                  <span className="text-[9px] font-semibold text-foreground text-center leading-tight whitespace-pre-line">
                    {factor.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Grade Details */}
        <motion.section variants={item} className="space-y-4">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <Hammer className="w-5 h-5 text-heritage-terracotta" />
            Grade Classification
          </h2>

          {grades.map((g) => (
            <motion.div
              key={g.grade}
              variants={item}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              {/* Grade header */}
              <div className="px-4 py-3 bg-muted/50 flex items-center gap-2">
                <Badge className={`${gradeColors[g.grade]} text-xs font-bold border-0`}>
                  {g.grade}
                </Badge>
                <span className="font-display font-semibold text-sm text-foreground">
                  Grade {g.grade} · {g.title}
                </span>
              </div>

              <div className="p-4 space-y-3 text-sm font-body">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Definition</h4>
                  <p className="text-muted-foreground leading-relaxed">{g.definition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Objective</h4>
                  <p className="text-muted-foreground leading-relaxed">{g.objective}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Identifying Elements</h4>
                  <ul className="space-y-1.5">
                    {g.elements.map((el, i) => (
                      <li key={i} className="text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-heritage-terracotta font-semibold mt-0.5 flex-shrink-0">•</span>
                        <span>{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Scope for Changes</h4>
                  <p className="text-muted-foreground leading-relaxed">{g.scope}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>
      </motion.div>
    </div>
  );
};

export default GradingSystemPage;
