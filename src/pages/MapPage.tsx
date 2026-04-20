import { useNavigate } from "react-router-dom";
import { ArrowLeft, Locate, MapPin, Star, X, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  heritageHouses,
  gradeLabels,
  gradeColors,
  getDistanceMeters,
  type HeritageHouse,
} from "@/data/heritageHouses";

// Fix default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const categoryColors: Record<string, string> = {
  landmark: "#D97706",
  "pol-house": "#7C3AED",
  temple: "#DC2626",
  tour: "#059669",
};

const categoryLabels: Record<string, string> = {
  landmark: "Landmarks",
  "pol-house": "Pol Buildings",
  temple: "Temples",
  tour: "Tour Stops",
};

const createIcon = (category: string, isNearby = false) =>
  new L.DivIcon({
    className: "",
    html: `<div style="width:${isNearby ? 34 : 28}px;height:${isNearby ? 34 : 28}px;border-radius:50%;background:${categoryColors[category]};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,${isNearby ? 0.5 : 0.35});${isNearby ? "animation:pulse 2s infinite;" : ""}"></div>`,
    iconSize: [isNearby ? 34 : 28, isNearby ? 34 : 28],
    iconAnchor: [isNearby ? 17 : 14, isNearby ? 17 : 14],
    popupAnchor: [0, -18],
  });

const PROXIMITY_RADIUS = 80; // meters

// --- Sub-components ---

// LocateButton only triggers the map to pan/zoom to the user — UserLocationTracker
// handles the locationfound event for proximity logic to avoid double-firing.
const LocateButton = () => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 17 });
    map.once("locationfound", () => setLocating(false));
    map.once("locationerror", () => setLocating(false));
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-24 right-4 z-[1000] w-11 h-11 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors"
      aria-label="My location"
    >
      <Locate className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`} />
    </button>
  );
};

const UserLocationTracker = ({
  onLocationUpdate,
}: {
  onLocationUpdate: (lat: number, lng: number) => void;
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    const onFound = (e: L.LocationEvent) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    };
    map.on("locationfound", onFound);
    return () => { map.off("locationfound", onFound); };
  }, [map, onLocationUpdate]);

  // Continuous tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        onLocationUpdate(latitude, longitude);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [onLocationUpdate]);

  if (!position) return null;

  const icon = new L.DivIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return <Marker position={position} icon={icon} />;
};

/** Bottom sheet showing nearby house detail */
const NearbyHouseCard = ({
  house,
  distance,
  onClose,
}: {
  house: HeritageHouse;
  distance: number;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ y: 200, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 200, opacity: 0 }}
    transition={{ type: "spring", damping: 25, stiffness: 300 }}
    className="absolute bottom-4 left-3 right-3 z-[1001] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
  >
    {/* Proximity indicator */}
    <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Navigation className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-semibold text-primary">
          {distance < 10 ? "You're here!" : `${Math.round(distance)}m away`}
        </span>
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </div>

    {/* Grade ribbon */}
    <div className="px-4 py-2 flex items-center justify-between bg-muted/50">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-heritage-gold" />
        <span className="text-xs font-semibold text-muted-foreground">
          {gradeLabels[house.grade]}
        </span>
      </div>
      <Badge className={`${gradeColors[house.grade]} text-xs font-bold border-0`}>
        {house.grade}
      </Badge>
    </div>

    <div className="p-4">
      <h3 className="font-display font-bold text-foreground text-lg leading-snug">
        {house.name}
      </h3>
      <div className="flex items-center gap-1.5 mt-1 mb-2">
        <MapPin className="w-3.5 h-3.5 text-heritage-terracotta" />
        <span className="text-xs text-muted-foreground font-body">{house.location}</span>
      </div>
      <p className="text-sm text-muted-foreground font-body leading-relaxed">
        {house.description}
      </p>
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
);

// --- Main Page ---

const MapPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [walkMode, setWalkMode] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHouse, setNearbyHouse] = useState<HeritageHouse | null>(null);
  const [nearbyDistance, setNearbyDistance] = useState(0);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const prevNearbyRef = useRef<string | null>(null);

  const filtered = activeFilter
    ? heritageHouses.filter((s) => s.category === activeFilter)
    : heritageHouses;

  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      setUserPos({ lat, lng });
      if (!walkMode) return;

      // Find closest house within proximity
      let closest: HeritageHouse | null = null;
      let closestDist = Infinity;
      for (const h of heritageHouses) {
        const d = getDistanceMeters(lat, lng, h.lat, h.lng);
        if (d < PROXIMITY_RADIUS && d < closestDist) {
          closest = h;
          closestDist = d;
        }
      }

      if (closest && closest.id !== dismissedId) {
        if (closest.id !== prevNearbyRef.current) {
          setDismissedId(null);
        }
        prevNearbyRef.current = closest.id;
        setNearbyHouse(closest);
        setNearbyDistance(closestDist);
      } else if (!closest) {
        prevNearbyRef.current = null;
        setNearbyHouse(null);
      }
    },
    [walkMode, dismissedId]
  );

  const toggleWalkMode = () => {
    setWalkMode((prev) => !prev);
    if (walkMode) {
      setNearbyHouse(null);
      setDismissedId(null);
    }
  };

  const nearbyIds = useMemo(() => {
    const ids = new Set<string>();
    if (walkMode && userPos) {
      for (const h of heritageHouses) {
        if (getDistanceMeters(userPos.lat, userPos.lng, h.lat, h.lng) < PROXIMITY_RADIUS) {
          ids.add(h.id);
        }
      }
    }
    return ids;
  }, [walkMode, userPos]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse { 
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(217,119,6,0); }
        }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-10 pb-3 bg-background/95 backdrop-blur-sm z-[1001] relative">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {/* Walk Mode Toggle */}
          <button
            onClick={toggleWalkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              walkMode
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {walkMode ? "Walking" : "Walk Mode"}
          </button>
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">Heritage Map</h1>

        {walkMode && (
          <p className="text-xs text-primary font-body mt-1">
            Walk near heritage buildings to discover their details automatically
          </p>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              !activeFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            All
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(activeFilter === key ? null : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: categoryColors[key] }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[22.2997, 73.2015]}
          zoom={16}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={createIcon(spot.category, nearbyIds.has(spot.id))}
              eventHandlers={{
                click: () => {
                  setNearbyHouse(spot);
                  setNearbyDistance(
                    userPos
                      ? getDistanceMeters(userPos.lat, userPos.lng, spot.lat, spot.lng)
                      : 0
                  );
                  setDismissedId(null);
                },
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{spot.name}</h3>
                    {spot.grade && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Grade {spot.grade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{spot.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {spot.features.map((f) => (
                      <span key={f} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <UserLocationTracker onLocationUpdate={handleLocationUpdate} />
          <LocateButton />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm rounded-lg border border-border p-2.5 shadow-md">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
            Legend
          </p>
          <div className="space-y-1">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: categoryColors[key] }}
                />
                <span className="text-[11px] text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby House Card */}
        <AnimatePresence>
          {nearbyHouse && (
            <NearbyHouseCard
              house={nearbyHouse}
              distance={nearbyDistance}
              onClose={() => {
                setDismissedId(nearbyHouse.id);
                setNearbyHouse(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapPage;
