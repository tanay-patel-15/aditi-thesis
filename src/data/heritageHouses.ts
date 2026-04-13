export interface HeritageHouse {
  id: string;
  name: string;
  grade: "I" | "II" | "III" | "IV";
  location: string;
  lat: number;
  lng: number;
  description: string;
  features: string[];
  category: "landmark" | "pol-house" | "temple" | "tour";
}

// Accurate GPS coordinates centered on Mama Ji ni Pol & Ghadiyali ni Pol, Vadodara old city
export const heritageHouses: HeritageHouse[] = [
  {
    id: "1",
    name: "Jama Masjid",
    grade: "I",
    location: "Mandvi, Vadodara",
    lat: 22.30045,
    lng: 73.20120,
    description:
      "A structure of exceptional historical and cultural importance, representing monumental heritage with outstanding architectural and artistic significance.",
    features: ["Monumental", "Islamic architecture", "Historic landmark"],
    category: "landmark",
  },
  {
    id: "2",
    name: "Central Library",
    grade: "I",
    location: "Kothi, Vadodara",
    lat: 22.30720,
    lng: 73.19450,
    description:
      "An iconic Grade I heritage building of exceptional cultural importance, showcasing grand colonial-era architecture and serving as a monumental civic landmark.",
    features: ["Colonial architecture", "Civic landmark", "Grand facade"],
    category: "landmark",
  },
  {
    id: "3",
    name: "Tambekar Wada",
    grade: "I",
    location: "Raopura, Vadodara",
    lat: 22.29970,
    lng: 73.20050,
    description:
      "A magnificent wada of exceptional historical significance, renowned for its elaborate wall paintings, ornate woodwork, and monumental Maratha-era architecture.",
    features: ["Wall paintings", "Ornate woodwork", "Maratha-era"],
    category: "landmark",
  },
  {
    id: "4",
    name: "Zaveri Enterprise Building",
    grade: "II",
    location: "Ghadiyali ni Pol, Vadodara",
    lat: 22.30015,
    lng: 73.20185,
    description:
      "A Grade II heritage structure with remarkable stone masonry, decorative brackets, and an intact multi-level pol residence.",
    features: ["Stone masonry", "Decorative brackets", "Multi-level"],
    category: "pol-house",
  },
  {
    id: "5",
    name: "Mehta Pol Residency",
    grade: "II",
    location: "Mama Ji ni Pol, Vadodara",
    lat: 22.29925,
    lng: 73.20095,
    description:
      "An outstanding example of pol architecture with elaborate jharokhas, carved wooden balconies, and a shared community courtyard.",
    features: ["Jharokhas", "Carved balconies", "Community courtyard"],
    category: "pol-house",
  },
  {
    id: "6",
    name: "Dharmik Lal Pandya House",
    grade: "III",
    location: "Mama Ji ni Pol, Vadodara",
    lat: 22.29940,
    lng: 73.20110,
    description:
      "A traditional pol house modified over time but retaining basic spatial and architectural characteristics of Gujarat's vernacular style.",
    features: ["Wooden carvings", "Courtyard", "Traditional layout"],
    category: "pol-house",
  },
  {
    id: "7",
    name: "Vaakil ni Khadki Building",
    grade: "III",
    location: "Ghadiyali ni Pol, Vadodara",
    lat: 22.30030,
    lng: 73.20170,
    description:
      "Known for its ornamental khadki entrance and well-preserved facade, retaining essential architectural characteristics despite modifications.",
    features: ["Khadki entrance", "Lime plaster", "Ornamental facade"],
    category: "pol-house",
  },
  {
    id: "8",
    name: "Laxmi Vilas Palace",
    grade: "I",
    location: "J.N. Marg, Vadodara",
    lat: 22.29390,
    lng: 73.19140,
    description:
      "Indo-Saracenic palace — one of the world's largest private residences, built by Maharaja Sayajirao Gaekwad III.",
    features: ["Indo-Saracenic", "Royal heritage", "Grand architecture"],
    category: "tour",
  },
  {
    id: "9",
    name: "Nyay Mandir",
    grade: "I",
    location: "Raopura, Vadodara",
    lat: 22.30650,
    lng: 73.19600,
    description:
      "Iconic court building with Mughal-Gothic architecture, serving as a key civic landmark.",
    features: ["Mughal-Gothic", "Civic building", "Grand dome"],
    category: "landmark",
  },
  {
    id: "10",
    name: "Mandvi Gate",
    grade: "I",
    location: "Mandvi, Vadodara",
    lat: 22.29990,
    lng: 73.20250,
    description:
      "Historic gateway to the old city walled area, a key entry point into the pol precinct.",
    features: ["Historic gateway", "Old city entrance", "Fortification"],
    category: "landmark",
  },
  {
    id: "11",
    name: "Sursagar Lake",
    grade: "I",
    location: "Sursagar, Vadodara",
    lat: 22.30500,
    lng: 73.19850,
    description:
      "Scenic lake with a towering Shiva statue at its center, a beloved public space in the heart of the city.",
    features: ["Shiva statue", "Public space", "Scenic lake"],
    category: "landmark",
  },
  {
    id: "12",
    name: "EME Temple",
    grade: "I",
    location: "Fatehgunj, Vadodara",
    lat: 22.31350,
    lng: 73.18200,
    description:
      "Unique aluminum-covered temple inside the military campus, dedicated to all faiths.",
    features: ["Aluminum structure", "Multi-faith", "Military campus"],
    category: "temple",
  },
  {
    id: "13",
    name: "Kirti Mandir",
    grade: "I",
    location: "Kirti Stambh, Vadodara",
    lat: 22.30100,
    lng: 73.18800,
    description:
      "Memorial temple dedicated to the Gaekwad royal family, featuring beautiful murals by Nandalal Bose.",
    features: ["Royal memorial", "Murals", "Gaekwad dynasty"],
    category: "temple",
  },
];

export const gradeLabels: Record<string, string> = {
  I: "Grade I · Exceptional Significance",
  II: "Grade II · High Architectural Value",
  III: "Grade III · Retains Characteristics",
  IV: "Grade IV · Recent Origin",
};

export const gradeColors: Record<string, string> = {
  I: "bg-heritage-terracotta text-white",
  II: "bg-heritage-gold text-accent-foreground",
  III: "bg-heritage-olive text-white",
  IV: "bg-muted text-muted-foreground",
};

/** Haversine distance in meters */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
