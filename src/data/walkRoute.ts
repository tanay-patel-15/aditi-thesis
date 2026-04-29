import { getDistanceMeters } from "@/data/heritageHouses";
import stop1Image from "@/assets/walk-stops/stop-1-lvp-gate.png";
import stop2Image from "@/assets/walk-stops/stop-2-kirti-stambh.png";
import stop3Image from "@/assets/walk-stops/stop-3-khanderao-statue.png";
import stop4Image from "@/assets/walk-stops/stop-4-bhagat-singh.png";
import stop5Image from "@/assets/walk-stops/stop-5-sursagar.png";
import stop6Image from "@/assets/walk-stops/stop-6-gandhi-statue.png";
import stop7Image from "@/assets/walk-stops/stop-7-buddha-statue.png";
import stop8Image from "@/assets/walk-stops/stop-8-gazra-cafe.png";

export interface WalkStop {
  number: number;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string;
}

export const walkStops: WalkStop[] = [
  {
    number: 1,
    name: "LVP Gate",
    subtitle: "Laxmi Vilas Palace Gate, Rajmahal Road",
    lat: 22.293943,
    lng: 73.194471,
    description:
      "The grand gateway to Laxmi Vilas Palace — the Gaekwad royal residence and one of the largest private dwellings built. The walk begins here where palace architecture meets the old-city artery.",
    image: stop1Image,
  },
  {
    number: 2,
    name: "Kirti Stambh",
    subtitle: "Kirti Stambh Circle, Palace Road",
    lat: 22.295754,
    lng: 73.197524,
    description:
      "A memorial column on Palace Road commemorating Vadodara's princely legacy. Pause here to take in the colonial-era civic planning that frames the approach into the old city.",
    image: stop2Image,
  },
  {
    number: 3,
    name: "Khanderao Statue",
    subtitle: "Khanderao Market Building, Kevdabaug",
    lat: 22.296196,
    lng: 73.201237,
    description:
      "A statue of Maharaja Khanderao Gaekwad outside the Indo-Saracenic Khanderao Market — a late 19th-century civic landmark that still anchors the market precinct.",
    image: stop3Image,
  },
  {
    number: 4,
    name: "Bhagat Singh Statue",
    subtitle: "Old Nyay Mandir, Mandvi (Bajwada)",
    lat: 22.303734,
    lng: 73.205420,
    description:
      "Standing in front of the Old Nyay Mandir in Mandvi, this statue of Shaheed Bhagat Singh marks the political heart of the old city, amid the dense Bajwada bazaar.",
    image: stop4Image,
  },
  {
    number: 5,
    name: "Sursagar Statue",
    subtitle: "Sursagar Lake",
    lat: 22.300821,
    lng: 73.203916,
    description:
      "The towering Shiva statue rising from the middle of Sursagar Lake — a signature image of Vadodara and a natural resting point along the walk.",
    image: stop5Image,
  },
  {
    number: 6,
    name: "Gandhi Statue",
    subtitle: "Jubilee Baugh",
    lat: 22.303055,
    lng: 73.204715,
    description:
      "A bronze of Mahatma Gandhi in Jubilee Baugh, the public garden laid out during Sayajirao III's reign — a green breathing space inside the walled city.",
    image: stop6Image,
  },
  {
    number: 7,
    name: "Buddha Statue",
    subtitle: "Mahatma Gandhi Nagar Gruh, Jubilee Baugh",
    lat: 22.302485,
    lng: 73.205135,
    description:
      "A seated Buddha outside the Mahatma Gandhi Nagar Gruh town hall — the civic auditorium that hosts the city's political and cultural gatherings.",
    image: stop7Image,
  },
  {
    number: 8,
    name: "Gazra Cafe",
    subtitle: "Chimnabai Stree Udyogalaya (End Point)",
    lat: 22.301854,
    lng: 73.203423,
    description:
      "The walk ends at Gazra Cafe, run out of the historic Chimnabai Stree Udyogalaya — a women's vocational institute founded by Maharani Chimnabai II. A fitting place to rest, reflect, and eat.",
    image: stop8Image,
  },
];

/**
 * Hand-curated intermediate waypoints per segment, indexed by "fromStop-toStop".
 * Empty array = straight line between stops. Add [lat, lng] tuples later to
 * bend the polyline around buildings / follow actual lanes.
 */
export const segmentWaypoints: Record<string, [number, number][]> = {
  "1-2": [],
  "2-3": [],
  "3-4": [],
  "4-5": [],
  "5-6": [],
  "6-7": [],
  "7-8": [],
};

export interface RouteGeometry {
  /** Flat LatLng list covering every stop + waypoints in order. */
  path: [number, number][];
  /** Indices into `path` that correspond to walkStops (length = 8). */
  stopIndices: number[];
  /** Cumulative distance from path[0] to path[i], in meters. */
  cumulativeMeters: number[];
  /** Total length of the route in meters. */
  totalMeters: number;
}

export function getRouteGeometry(
  stops: WalkStop[] = walkStops,
  customWaypoints: Record<string, [number, number][]> = segmentWaypoints
): RouteGeometry {
  const path: [number, number][] = [];
  const stopIndices: number[] = [];

  stops.forEach((stop, i) => {
    stopIndices.push(path.length);
    path.push([stop.lat, stop.lng]);

    const next = stops[i + 1];
    if (!next) return;
    const key = `${stop.number}-${next.number}`;
    const waypoints = customWaypoints[key] ?? [];
    waypoints.forEach((wp) => path.push(wp));
  });

  const cumulativeMeters: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const d = getDistanceMeters(prev[0], prev[1], curr[0], curr[1]);
    cumulativeMeters.push(cumulativeMeters[i - 1] + d);
  }
  const totalMeters = cumulativeMeters[cumulativeMeters.length - 1];

  return { path, stopIndices, cumulativeMeters, totalMeters };
}

/**
 * Interpolate a position along the route given meters travelled from the start.
 * Returns both the lat/lng and the path-index just before the position so the
 * caller can split the polyline into "walked" vs "remaining" portions.
 */
export function positionAtMeters(
  geo: RouteGeometry,
  meters: number
): { latlng: [number, number]; segmentIndex: number } {
  const { path, cumulativeMeters, totalMeters } = geo;
  if (meters <= 0) return { latlng: path[0], segmentIndex: 0 };
  if (meters >= totalMeters) {
    return { latlng: path[path.length - 1], segmentIndex: path.length - 1 };
  }

  // Binary search for the segment containing `meters`.
  let lo = 0;
  let hi = cumulativeMeters.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumulativeMeters[mid] <= meters) lo = mid;
    else hi = mid;
  }

  const segStart = cumulativeMeters[lo];
  const segEnd = cumulativeMeters[lo + 1];
  const segLen = segEnd - segStart || 1;
  const t = (meters - segStart) / segLen;

  const a = path[lo];
  const b = path[lo + 1];
  const latlng: [number, number] = [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  return { latlng, segmentIndex: lo };
}

/** Approx bounding box of the full route, used to fit the map on load. */
export function getRouteBounds(): {
  south: number;
  west: number;
  north: number;
  east: number;
} {
  return getEditableRouteBounds();
}

export function getEditableRouteBounds(
  stops: WalkStop[] = walkStops,
  customWaypoints: Record<string, [number, number][]> = segmentWaypoints
): {
  south: number;
  west: number;
  north: number;
  east: number;
} {
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;

  const includePoint = (lat: number, lng: number) => {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  };

  stops.forEach((stop, index) => {
    includePoint(stop.lat, stop.lng);

    const next = stops[index + 1];
    if (!next) return;

    const key = `${stop.number}-${next.number}`;
    (customWaypoints[key] ?? []).forEach(([lat, lng]) => includePoint(lat, lng));
  });

  return { south, west, north, east };
}
