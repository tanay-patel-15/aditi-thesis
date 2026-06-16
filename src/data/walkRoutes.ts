import type { WalkStop } from "@/data/walkRoute";
import { walkStops, segmentWaypoints as moortiswarWaypoints } from "@/data/walkRoute";

export type { WalkStop };
export {
  getRouteGeometry,
  positionAtMeters,
  getRouteBounds,
  getEditableRouteBounds,
} from "@/data/walkRoute";

export interface WalkRoute {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  stops: WalkStop[];
  segmentWaypoints: Record<string, [number, number][]>;
}

export const walkRoutes: WalkRoute[] = [
  {
    id: "moortiswar",
    name: "Moortiswar Walk",
    subtitle: "Palace to Pol",
    description:
      "Eight landmarks from Laxmi Vilas Palace through the old-city markets, ending at Gazra Cafe in the Stree Udyogalaya.",
    accentColor: "hsl(18 60% 48%)",
    stops: walkStops,
    segmentWaypoints: moortiswarWaypoints,
  },
  {
    id: "ghadiyali",
    name: "Ghadiyali Pol Walk",
    subtitle: "Ghadiyali Pol neighbourhood",
    description:
      "A 2 km walk through Ghadiyali Pol's historic lanes — from a Padma Shri's living house museum through pol gateways, sacred temples, a mosque with one of Asia's largest handwritten Qurans, and ornate courtyard houses, ending at the Pol Heritage Café.",
    accentColor: "hsl(90 20% 35%)",
    stops: [
      {
        number: 1,
        name: "Dharmik Lal Pandya House Museum",
        subtitle: "Start Point · Ghadiyali Pol",
        lat: 22.298558,
        lng: 73.207339,
        description:
          "The journey begins at the residence of Padma Shri awardee Dharmik Lal Pandya, one of Gujarat's most respected Manbhatt artists. The house museum preserves traditional musical instruments, awards and photographs, while music classes conducted by Mayankbhai Pandya continue this living legacy. Visitors are welcomed with an audio-guided introduction to Ghadiyali Pol and its heritage.",
      },
      {
        number: 2,
        name: "Sultanpura Lane",
        subtitle: "Sultanpura, Ghadiyali Pol",
        lat: 22.299478,
        lng: 73.208478,
        description:
          "Known for its footwear shops and local businesses, Sultanpura Lane offers a glimpse into the bustling everyday life of the old city. Traditional houses and vibrant street life showcase the close relationship between commerce and community that has defined this lane for generations.",
      },
      {
        number: 3,
        name: "Sadhana Talkies Lane",
        subtitle: "Old City, Vadodara",
        lat: 22.299322,
        lng: 73.207372,
        description:
          "This lane gets its name from the Sadhana Talkies, a single-screen cinema that was once an important cultural landmark in Vadodara. The cinema drew crowds from across the old city and gave the lane its identity. Today it is one of the busiest, most bustling streets in the area.",
      },
      {
        number: 4,
        name: "Amba Mata Temple",
        subtitle: "Amba Mata Lane, Ghadiyali Pol",
        lat: 22.300000,
        lng: 73.209381,
        description:
          "The famous Amba Mata Temple has long served as a place of faith, celebration and community gathering. Deeply woven into local life, the temple continues to be an important spiritual landmark within the pol, drawing devotees daily and hosting vibrant festivals throughout the year.",
      },
      {
        number: 5,
        name: "Mandvi Gate",
        subtitle: "Mandvi, Old City",
        lat: 22.300122,
        lng: 73.210661,
        description:
          "Mandvi Gate is one of the main gateways of Vadodara's old city, part of the early settlement of Kila-e-Daulatabad developed around 1511 during the Gujarat Sultanate. During the Gaekwad period, the gate was expanded and a clock tower was added in 1856. Today it connects major markets and historic neighbourhoods, lined with textile stores, jewellery shops and long-established businesses.",
      },
      {
        number: 6,
        name: "Jama Masjid",
        subtitle: "Mandvi, Old City",
        lat: 22.299556,
        lng: 73.210578,
        description:
          "One of the most important religious landmarks of the old city, Jama Masjid is renowned for its beautiful architecture and a rare handwritten Quran — often described as one of the largest in Asia. It continues to serve as a centre of faith, learning and community life for the neighbourhood.",
      },
      {
        number: 7,
        name: "Patolia Pol",
        subtitle: "Patolia Pol Gate, Ghadiyali Pol",
        lat: 22.298950,
        lng: 73.210608,
        description:
          "Patolia Pol offers a glimpse into the unique planning of traditional pol neighbourhoods, where narrow lanes, heritage houses and shared spaces create a strong sense of community. Named after the famed patola silk weaving tradition, the pol gate marks the entrance to this characterful cluster of homes.",
      },
      {
        number: 8,
        name: "P.C. Shroff Ni Khadki",
        subtitle: "Ghadiyali Pol",
        lat: 22.298800,
        lng: 73.210494,
        description:
          "Next to Saroj Gandhi House is the P.C. Shroff Ni Khadki, named after a trader who once lived here. The khadki showcases beautifully carved wooden facades, traditional entrances and intricate architectural details that highlight the craftsmanship of old Vadodara.",
      },
      {
        number: 9,
        name: "Visalad no Khacho",
        subtitle: "Ghadiyali Pol",
        lat: 22.298192,
        lng: 73.208014,
        description:
          "Visalad no Khacho is a characterful courtyard deep within the pol fabric. Like many such khachos (cul-de-sac courtyards), it was once a semi-private shared space for a cluster of families — offering glimpses of daily pol life, traditional doorways with hand-carved wooden details, and the intimate scale that defines Ghadiyali Pol's urban grain.",
      },
      {
        number: 10,
        name: "Vaaki Sheri",
        subtitle: "Ghadiyali Pol",
        lat: 22.299006,
        lng: 73.210097,
        description:
          "Vaaki Sheri is an internal lane known for its narrow, zig-zag movement within the old city fabric. In Gujarati, 'vaaki' means winding or zig-zag, and locals say the lane takes its name from this twisting path. It connects different parts of the neighbourhood, linking towards Amba Mata Lane through the Zaveri Bazaar saree shops complex, and towards Patolia Pol via Jamadar no Khacho.",
      },
      {
        number: 11,
        name: "Vakil Ni Khadki",
        subtitle: "Co-working Space, Ghadiyali Pol",
        lat: 22.298969,
        lng: 73.209864,
        description:
          "Once home to a practising advocate's office, this heritage house shows how traditional structures can be adapted for contemporary use. The facade displays Art Deco influence alongside a traditional otla and hand pump. It also preserves the old underground drainage system common to pol houses, and has been converted into a co-working space for tourists and locals alike.",
      },
      {
        number: 12,
        name: "Shree Sayaji High School",
        subtitle: "Ghadiyali Pol",
        lat: 22.298672,
        lng: 73.209486,
        description:
          "Named after Maharaja Sayajirao Gaekwad III, the school reflects Vadodara's rich educational legacy. The site once housed the historic Tankshal (Mint) of the Gaekwad State, where Babashahi coins were produced. Historical accounts also connect the area with the Ghadial (time bell) that gave Ghadiyali Pol its name.",
      },
      {
        number: 13,
        name: "Kuberchand Ni Pol",
        subtitle: "Ghadiyali Pol",
        lat: 22.298506,
        lng: 73.209156,
        description:
          "Beautiful examples of pol architecture are concentrated here — the Zaveri ni Haveli, Mansiben House and several other residences showcase rich intricate wooden carvings, decorative balconies and the architectural richness of the traditional pol house form.",
      },
      {
        number: 14,
        name: "Desai No Khacho",
        subtitle: "Ghadiyali Pol",
        lat: 22.297867,
        lng: 73.207303,
        description:
          "Another set of beautifully preserved houses — including the Urmilaben ni Haveli and Chintamani House — known for their architectural features, offering insight into the social history, craftsmanship and community life of the pol.",
      },
      {
        number: 15,
        name: "Pol Heritage Café",
        subtitle: "Zaveri Enterprise House · End Point",
        lat: 22.298225,
        lng: 73.209072,
        description:
          "The walk concludes at the Pol Heritage Café, a community-led heritage destination celebrating local food, crafts and stories. Once a traditional pol house, the space has been thoughtfully adapted into a café where visitors can enjoy homemade food products, traditional pickles, handicrafts and the living heritage of Ghadiyali Pol.",
      },
    ],
    segmentWaypoints: {
      "1-2": [],
      "2-3": [],
      "3-4": [],
      "4-5": [],
      "5-6": [],
      "6-7": [],
      "7-8": [],
      "8-9": [],
      "9-10": [],
      "10-11": [],
      "11-12": [],
      "12-13": [],
      "13-14": [],
      "14-15": [],
    },
  },
];
