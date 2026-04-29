import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const gradeColors: Record<string, string> = {
  I:   "bg-heritage-terracotta text-white",
  II:  "bg-heritage-gold text-heritage-deep",
  III: "bg-heritage-olive text-white",
  IV:  "bg-muted text-muted-foreground",
};

const conditionColors: Record<string, string> = {
  Good: "text-green-600 font-semibold",
  Fair: "text-amber-600 font-semibold",
  Poor: "text-red-500 font-semibold",
};

// ── Table 1: Heritage structures (walled-city exclusion list) ─────────────────
const gradeI = [
  { sr: 1,  name: "Laxmi Vilas Palace",                          location: "Moti Baug, Chamaraja Wodeyar Road, Vadodara" },
  { sr: 2,  name: "Sursagar Lake",                               location: "Wadi, Near Mandvi Gate, Vadodara" },
  { sr: 4,  name: "Baroda Central Library",                      location: "Bank Road, beside Bank of Bajwada, Vadodara" },
  { sr: 5,  name: "Khanderao Market",                            location: "Rajmahal Road, Vadodara" },
  { sr: 6,  name: "Nyay Mandir",                                 location: "Nyay Mandir Road, Mandvi, Vadodara" },
  { sr: 7,  name: "Kirti Mandir",                                location: "Kothi Road, Sayajigunj, Vadodara" },
  { sr: 8,  name: "Baroda Museum and Picture Gallery",           location: "Sayaji Baug, Sayajigunj, Vadodara" },
  { sr: 9,  name: "Maharaja Sayaji Rao University",              location: "Main building, Sayajigunj, Vadodara" },
  { sr: 10, name: "Faculty of Performing Arts (Music College)",  location: "Opposite Sursagar Lake, near Nyay Mandir, Dandia Bazar, Vadodara" },
  { sr: 11, name: "Sevasi Vav",                                  location: "Sevasi, Vadodara" },
  { sr: 13, name: "Mandvi Gate",                                 location: "Mandvi Circle, Mandvi, Vadodara" },
  { sr: 14, name: "Lehripura Gate",                              location: "Lehripura, MG Road, Vadodara" },
  { sr: 15, name: "Gendi Gate",                                  location: "Gendi Gate Road, Vadodara" },
  { sr: 16, name: "Champaner Gate",                              location: "Champaner Gate, Vadodara" },
  { sr: 17, name: "Pani Gate",                                   location: "Pani Gate, Vadodara" },
  { sr: 19, name: "Raopura Clock Tower",                         location: "Raopura, Vadodara" },
];

const gradeII = [
  { sr: 3, name: "Tambekar Wada", location: "Dandia Bazar, Jambubet, Vadodara" },
];

const gradeIII = [
  { sr: 12, name: "Dada Mandir",                             location: "Laxmi Kunj, 17 Mama Ni pol, Raopura, Vadodara" },
  { sr: 18, name: "EME Temple",                              location: "Fatehgunj, Vadodara" },
  { sr: 20, name: "Shree Chimnabai Stree Udhyogalay",       location: "Opposite Sursagar Lake, Mandvi, Vadodara" },
  { sr: 21, name: "Madhav Bagh – Royal Heritage Stay",      location: "Makarpura, Vadodara" },
  { sr: 22, name: "Sardar Patel Planetorium",                location: "Sayaji Baug, Vadodara" },
  { sr: 23, name: "Sri Aurobindo Ashram",                    location: "Dandia Bazaar, Vadodara" },
  { sr: 24, name: "Khanqah-e-Rifaiya",                      location: "Mandvi, Vadodara" },
  { sr: 25, name: "Lal Court",                               location: "Nyay Mandir Road, Mandvi, Vadodara" },
];

const maxRows = Math.max(gradeI.length, gradeII.length, gradeIII.length);

// ── Table 2: Pol Houses ───────────────────────────────────────────────────────
interface PolEntry {
  id: string; name: string; location: string;
  use: string; condition: string; floors: string; grade: string;
}

const polHouses: PolEntry[] = [
  { id: "H1",  name: "Saroj Gandhi House",                    location: "P.C Shroff Ni Khadki, Ghadiyali Pol, Vadodara",              use: "Ol",                              condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H2",  name: "Hasmukhlal Ratanlal Vavadia House",     location: "P.C Shroff Ni Khadki, Ghadiyali Pol, Vadodara",              use: "Abandoned",                       condition: "Poor", floors: "G + 2", grade: "II"  },
  { id: "H3",  name: "Jain Derasar Ni Khadki",                location: "Jain Derasar Ni Khadki, Ghadiyali Pol, Vadodara",            use: "Fully occupied (Residential)",    condition: "Good", floors: "—",    grade: "II"  },
  { id: "H4",  name: "Vaakil Ni Khadki",                      location: "Vaakil Ni Khadki, Ghadiyali Pol, Vadodara",                  use: "Fully occupied (Residential)",    condition: "Good", floors: "—",    grade: "III" },
  { id: "H5",  name: "Vaakil Ni Khadki House",                location: "Vaakil Ni Khadki, Ghadiyali Pol, Vadodara",                  use: "Ground floor used as office",     condition: "Good", floors: "G + 2", grade: "III" },
  { id: "H6",  name: "H62026",                                location: "Beside Baroda Tankshal, Ghadiyali Pol, Vadodara",             use: "Residential",                     condition: "Poor", floors: "G + 1", grade: "II"  },
  { id: "H7",  name: "Zaveri Ni Haveli",                      location: "Kuberchand Ni Pol, Ghadiyali Pol, Vadodara",                 use: "Abandoned",                       condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H8",  name: "Mansi Ben House",                       location: "Kuberchand Ni Pol, Ghadiyali Pol, Vadodara",                 use: "Residential",                     condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H9",  name: "Shashtri Ni Haveli",                    location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Abandoned",                       condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H10", name: "Zaveri Enterprise House",               location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Ground floor used as office",     condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H11", name: "K12026",                                location: "Khadki, Shashtri No Khacho, Ghadiyali Pol, Vadodara",        use: "Fully occupied (Residential)",    condition: "Poor", floors: "—",    grade: "II"  },
  { id: "H12", name: "H122026",                               location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Residential",                     condition: "Fair", floors: "G + 2", grade: "III" },
  { id: "H13", name: "Hansa Gori House",                      location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Residential",                     condition: "Poor", floors: "G + 3", grade: "III" },
  { id: "H14", name: "Hira Niwas",                            location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Abandoned",                       condition: "Poor", floors: "G + 2", grade: "III" },
  { id: "H15", name: "H152026",                               location: "Shashtri No Khacho, Ghadiyali Pol, Vadodara",                use: "Abandoned",                       condition: "Poor", floors: "G + 2", grade: "II"  },
  { id: "H16", name: "H162026",                               location: "Vishalad No Khacho, Ghadiyali Pol, Vadodara",                use: "Residential",                     condition: "Poor", floors: "G + 2", grade: "II"  },
  { id: "H17", name: "H172026",                               location: "Vishalad No Khacho, Ghadiyali Pol, Vadodara",                use: "Abandoned",                       condition: "Poor", floors: "G + 1", grade: "II"  },
  { id: "H18", name: "Hansa Jani House",                      location: "Vishalad No Khacho, Ghadiyali Pol, Vadodara",                use: "Abandoned",                       condition: "Poor", floors: "G + 1", grade: "II"  },
  { id: "H19", name: "H192026",                               location: "Sultanpura, Ghadiyali Pol, Vadodara",                        use: "Abandoned",                       condition: "Poor", floors: "G + 1", grade: "III" },
  { id: "H20", name: "H202026",                               location: "Sultanpura, Ghadiyali Pol, Vadodara",                        use: "Residential",                     condition: "Poor", floors: "G + 1", grade: "II"  },
  { id: "H21", name: "Dharmik Lal Pandya House",              location: "Chaitanya Sheri, Punit Ashram Khacho, Sultanpura, Vadodara", use: "Ground floor used as music class", condition: "Good", floors: "G + 2", grade: "III" },
  { id: "H22", name: "H222026",                               location: "Sadhana talkies lane, Sultanpura, Vadodara",                 use: "Residential",                     condition: "Poor", floors: "G + 3", grade: "III" },
  { id: "H23", name: "K22026",                                location: "Khadki, Sadhana talkies lane, Sultanpura, Vadodara",         use: "Residential",                     condition: "Poor", floors: "—",    grade: "II"  },
  { id: "H24", name: "Urmila Ben House",                      location: "Desai No Khacho, Sultanpura, Vadodara",                      use: "Residential",                     condition: "Good", floors: "G + 2", grade: "II"  },
  { id: "H25", name: "Chintamani House",                      location: "Desai No Khacho, Sultanpura, Vadodara",                      use: "Residential",                     condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H26", name: "H262026",                               location: "Choksi Bazaar, Sultanpura, Vadodara",                        use: "Residential",                     condition: "Fair", floors: "G + 2", grade: "II"  },
  { id: "H27", name: "H272026",                               location: "Choksi Bazaar, Sultanpura, Vadodara",                        use: "Abandoned",                       condition: "Poor", floors: "G + 2", grade: "III" },
  { id: "H28", name: "Kach Wala Manzil",                      location: "Fhakri Mohalla-2, Mandvi, Vadodara",                         use: "Abandoned",                       condition: "Poor", floors: "G + 2", grade: "II"  },
  { id: "H29", name: "Ali Manzil",                            location: "Fhakri Mohalla-2, Mandvi, Vadodara",                         use: "Residential",                     condition: "Good", floors: "G + 2", grade: "II"  },
  { id: "H30", name: "Kuberchand Ni Khadki",                  location: "Kuberchand Ni Khadki, Kuberchand Ni Pol, Ghadiyali Pol, Vadodara", use: "Residential",              condition: "Good", floors: "—",    grade: "III" },
];

// ── Table 3: Shops ────────────────────────────────────────────────────────────
const shops: PolEntry[] = [
  { id: "S1",    name: "Shri Jayantibhai Bhagwandas Patel shop", location: "Prabhu Kesi Haveli, Gendi Gate Road, Vadodara",                    use: "Arms & Ammunition Dealers & Repairers", condition: "Poor", floors: "G + 2", grade: "II"  },
  { id: "S2",    name: "Sharma Dudhalay",                        location: "Gendi Gate road, Vadodara",                                         use: "Ol",                                   condition: "Good", floors: "G + 3", grade: "III" },
  { id: "S3",    name: "Provision Shop",                         location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Small provisions shop",                condition: "Good", floors: "G",     grade: "IV"  },
  { id: "S4",    name: "Shivkrupa Provision Store",              location: "Saroj Gandhi House, P.C Shroff Ni Khadki, Patolia Pol, Ghadiyali Pol, Vadodara", use: "Ol",                    condition: "Fair", floors: "G + 2", grade: "IV"  },
  { id: "S5,6",  name: "Jalaram Pasti & Stationery Mart",        location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Ol",                                   condition: "Poor", floors: "G + 2", grade: "III" },
  { id: "S7",    name: "Asopalav Jwellers",                      location: "Jamadar No Khacho, Patolia Pol, Ghadiyali Pol, Vadodara",             use: "Ol",                                   condition: "Good", floors: "G + 2", grade: "III" },
  { id: "S8",    name: "Shri Mahalaxmi Gold",                    location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Commercial complex with multiple shops", condition: "Good", floors: "G + 3", grade: "IV"  },
  { id: "S9",    name: "Mehta Electricals",                      location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Ol",                                   condition: "Good", floors: "G + 3", grade: "IV"  },
  { id: "S10,11",name: "Darshan Store",                          location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Ol",                                   condition: "Good", floors: "G + 2", grade: "IV"  },
  { id: "S12,13",name: "Saree Shops",                            location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Ol",                                   condition: "Good", floors: "G + 2", grade: "IV"  },
  { id: "S14",   name: "Pan Shop",                               location: "Patolia Pol, Ghadiyali Pol, Vadodara",                               use: "Pan shop",                             condition: "Good", floors: "G",     grade: "IV"  },
  { id: "S15",   name: "Fashion Boutique",                       location: "Jay Ranchod building, Shashtri No Khacho, Ghadiyali Pol, Vadodara",  use: "Ol",                                   condition: "Good", floors: "G + 2", grade: "IV"  },
  { id: "S16",   name: "Barber Shop",                            location: "Sultanpura, Ghadiyali Pol, Vadodara",                                use: "Ol",                                   condition: "Poor", floors: "G + 3", grade: "II"  },
  { id: "S17",   name: "Shakti Tailoring Firm",                  location: "Sultanpura, Ghadiyali Pol, Vadodara",                                use: "Ol",                                   condition: "Good", floors: "G + 2", grade: "III" },
  { id: "S18",   name: "Mahalaxmi Bangles Store",                location: "Sadhana talkies lane, Sultanpura, Vadodara",                         use: "Bangles store",                        condition: "Good", floors: "G + 3", grade: "IV"  },
];

// ── Table 4: Religious Places ─────────────────────────────────────────────────
const religiousPlaces: PolEntry[] = [
  { id: "R1",  name: "Jamma Masjid",                              location: "Gendi Gate Road, Vadodara",                        use: "Mosque",       condition: "Good", floors: "G",     grade: "I"   },
  { id: "R2",  name: "Shri Ranchodji Mandir",                     location: "Gendi Gate Road, Vadodara",                        use: "Hindu Temple", condition: "Good", floors: "G + 3", grade: "II"  },
  { id: "R3",  name: "Shree Manmohan Parshwanath Jain Derasar (old)", location: "Patolia Pol, Ghadiyali Pol, Vadodara",         use: "Jain Temple",  condition: "Good", floors: "G",     grade: "II"  },
  { id: "R4",  name: "Shri Kunthunath Jain Temple",               location: "Ghadiyali Pol, Vadodara",                          use: "Jain Temple",  condition: "Good", floors: "G",     grade: "II"  },
  { id: "R5",  name: "Amba Mata Temple",                          location: "MG Road, Ghadiyali Pol, Vadodara",                 use: "Hindu Temple", condition: "Good", floors: "G",     grade: "III" },
  { id: "R6",  name: "Shri Shatrunjay Tirthavatar Prasad",        location: "MG Road, Ghadiyali Pol, Vadodara",                 use: "Hindu Temple", condition: "Good", floors: "G",     grade: "II"  },
  { id: "R7",  name: "Shri Raj Rajeshwar Mahadev Temple",         location: "MG Road, Ghadiyali Pol, Vadodara",                 use: "Hindu Temple", condition: "Good", floors: "G",     grade: "II"  },
  { id: "R8",  name: "Shri Mahalakshmi Mandir",                   location: "Ghadiyali Pol, Vadodara",                          use: "Hindu Temple", condition: "Good", floors: "G",     grade: "II"  },
  { id: "R9",  name: "Shri Ranchodji Temple",                     location: "Ghadiyali Pol, Vadodara",                          use: "Hindu Temple", condition: "Good", floors: "G + 2", grade: "IV"  },
  { id: "R10", name: "Shri Shurpaneshwar Mahadev Mandir",         location: "Vishalad No Khacho, Ghadiyali Pol, Vadodara",      use: "Hindu Temple", condition: "Good", floors: "G + 2", grade: "IV"  },
];

// ── Table 5: Educational Institution ─────────────────────────────────────────
const educational: PolEntry[] = [
  { id: "E1", name: "Shri Sayani High School (Originally; Mint Tankshal)", location: "Ghadiyali Pol, Vadodara", use: "Educational Institute", condition: "Good", floors: "G + 2", grade: "II" },
];

// ── Reusable detail table component ──────────────────────────────────────────
function DetailTable({ rows }: { rows: PolEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[600px] text-xs font-body border-collapse">
        <thead>
          <tr className="bg-heritage-deep text-heritage-cream">
            <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">No.</th>
            <th className="px-3 py-2.5 text-left font-semibold">Name</th>
            <th className="px-3 py-2.5 text-left font-semibold">Location</th>
            <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Current Use</th>
            <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Condition</th>
            <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Floors</th>
            <th className="px-3 py-2.5 text-left font-semibold">Grade</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
              <td className="px-3 py-2.5 font-bold text-heritage-terracotta whitespace-nowrap border-t border-border align-top">
                {row.id}
              </td>
              <td className="px-3 py-2.5 text-foreground border-t border-border align-top leading-snug">
                {row.name}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground border-t border-border align-top leading-snug">
                {row.location}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground border-t border-border align-top leading-snug whitespace-nowrap">
                {row.use}
              </td>
              <td className={`px-3 py-2.5 border-t border-border align-top whitespace-nowrap ${conditionColors[row.condition] ?? "text-muted-foreground"}`}>
                {row.condition}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground border-t border-border align-top whitespace-nowrap">
                {row.floors}
              </td>
              <td className="px-3 py-2.5 border-t border-border align-top">
                <Badge className={`${gradeColors[row.grade]} text-[10px] font-bold border-0 px-1.5 py-0`}>
                  {row.grade}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
          Listing and grading of heritage structures of Vadodara
        </p>
        <p className="text-heritage-sand/60 text-xs font-body pl-8 mt-0.5">
          Excluding the walled-city of Vadodara
        </p>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-6">

        {/* Source note */}
        <p className="text-xs text-muted-foreground font-body leading-relaxed italic px-1">
          The grading framework is developed by the author and is inspired by the Heritage listing
          and grading system of the Ahmedabad Municipal Corporation (AMC), adapted to suit the
          scope of this study.{" "}
          <span className="not-italic font-semibold text-foreground">Source: Author</span>
        </p>

        {/* Grade legend */}
        <div className="flex flex-wrap gap-2">
          {(["I", "II", "III", "IV"] as const).map((g) => (
            <span key={g} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${gradeColors[g]}`}>
              Grade {g}
            </span>
          ))}
        </div>

        {/* ── Section 1: Heritage structures (excl. walled-city) ── */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Listing and Grading of Heritage Structures of Vadodara
          </h2>
          <p className="text-xs text-muted-foreground font-body italic">(Excluding the walled-city of Vadodara)</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[520px] text-xs font-body border-collapse">
              <thead>
                <tr>
                  <th className="bg-heritage-terracotta text-white px-3 py-3 text-left font-display font-bold">
                    Grade I
                    <span className="block text-[10px] font-body font-normal opacity-80 mt-0.5">{gradeI.length} structures</span>
                  </th>
                  <th className="bg-heritage-gold text-heritage-deep px-3 py-3 text-left font-display font-bold border-l border-white/20">
                    Grade II
                    <span className="block text-[10px] font-body font-normal opacity-70 mt-0.5">{gradeII.length} structure</span>
                  </th>
                  <th className="bg-heritage-olive text-white px-3 py-3 text-left font-display font-bold border-l border-white/20">
                    Grade III
                    <span className="block text-[10px] font-body font-normal opacity-80 mt-0.5">{gradeIII.length} structures</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }).map((_, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                    <td className="px-3 py-2.5 align-top border-t border-border">
                      {gradeI[i] && (
                        <div>
                          <span className="text-[10px] font-semibold text-heritage-terracotta mr-1">{gradeI[i].sr}.</span>
                          <span className="text-xs text-foreground leading-snug">{gradeI[i].name}</span>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{gradeI[i].location}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top border-t border-l border-border">
                      {gradeII[i] && (
                        <div>
                          <span className="text-[10px] font-semibold text-heritage-gold mr-1">{gradeII[i].sr}.</span>
                          <span className="text-xs text-foreground leading-snug">{gradeII[i].name}</span>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{gradeII[i].location}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top border-t border-l border-border">
                      {gradeIII[i] && (
                        <div>
                          <span className="text-[10px] font-semibold text-heritage-olive mr-1">{gradeIII[i].sr}.</span>
                          <span className="text-xs text-foreground leading-snug">{gradeIII[i].name}</span>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{gradeIII[i].location}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 2: Pol Houses ── */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Listing and Grading of Identified Pol Houses
          </h2>
          <p className="text-xs text-muted-foreground font-body italic">Selected area — {polHouses.length} buildings</p>
          <DetailTable rows={polHouses} />
        </section>

        {/* ── Section 3: Shops ── */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Listing and Grading of Identified Shops
          </h2>
          <p className="text-xs text-muted-foreground font-body italic">Selected area — {shops.length} buildings</p>
          <DetailTable rows={shops} />
        </section>

        {/* ── Section 4: Religious Places ── */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Listing and Grading of Identified Religious Places
          </h2>
          <p className="text-xs text-muted-foreground font-body italic">Selected area — {religiousPlaces.length} buildings</p>
          <DetailTable rows={religiousPlaces} />
        </section>

        {/* ── Section 5: Educational Institution ── */}
        <section className="space-y-3">
          <h2 className="font-display font-bold text-base text-foreground">
            Listing and Grading of Identified Educational Institution
          </h2>
          <p className="text-xs text-muted-foreground font-body italic">Selected area — {educational.length} building</p>
          <DetailTable rows={educational} />
        </section>

        {/* Shared source note */}
        <p className="text-xs text-muted-foreground font-body leading-relaxed italic px-1 pb-4">
          The grading framework is developed by the author and is inspired by the Heritage listing
          and grading system of the Ahmedabad Municipal Corporation (AMC), adapted to suit the
          scope of this study.{" "}
          <span className="not-italic font-semibold text-foreground">Source: Author</span>
        </p>
      </div>
    </div>
  );
};

export default GradingSystemPage;
