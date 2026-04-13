import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Locate,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  heritageHouses,
  gradeColors,
  getDistanceMeters,
  type HeritageHouse,
} from "@/data/heritageHouses";

// Only pol-house + landmark buildings in the walking precinct
const walkStops = heritageHouses.filter(
  (h) => h.category === "pol-house" || h.category === "landmark"
);

// Sort by rough walking order (south to north, west to east)
const sortedStops = [...walkStops].sort((a, b) => {
  const latDiff = a.lat - b.lat;
  if (Math.abs(latDiff) > 0.001) return latDiff;
  return a.lng - b.lng;
});

const ARRIVAL_RADIUS = 30; // meters

const stopIcon = (active: boolean, visited: boolean) =>
  new L.DivIcon({
    className: "",
    html: `<div style="width:${active ? 36 : 26}px;height:${active ? 36 : 26}px;border-radius:50%;background:${visited ? "#059669" : active ? "#D97706" : "#7C3AED"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);${active ? "animation:pulse 2s infinite;" : ""}display:flex;align-items:center;justify-content:center;color:white;font-size:${active ? 14 : 11}px;font-weight:bold;">${visited ? "✓" : ""}</div>`,
    iconSize: [active ? 36 : 26, active ? 36 : 26],
    iconAnchor: [active ? 18 : 13, active ? 18 : 13],
  });

const userIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  const normalized = (bearing + 360) % 360;
  if (normalized < 45 || normalized >= 315) return "North";
  if (normalized < 135) return "East";
  if (normalized < 225) return "South";
  return "West";
}

/** Keeps the map centered on the active stop or user */
const MapUpdater = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center[0], center[1], zoom]);
  return null;
};

const LocateOnMap = ({ onLocated }: { onLocated: () => void }) => {
  const map = useMap();
  return (
    <button
      onClick={() => {
        map.locate({ setView: true, maxZoom: 18 });
        onLocated();
      }}
      className="absolute bottom-28 right-4 z-[1000] w-11 h-11 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors"
      aria-label="My location"
    >
      <Locate className="w-5 h-5" />
    </button>
  );
};

type WalkState = "preview" | "active" | "complete";

const WalkNowPage = () => {
  const navigate = useNavigate();
  const [walkState, setWalkState] = useState<WalkState>("preview");
  const [currentStopIdx, setCurrentStopIdx] = useState(0);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState(false);

  const currentStop = sortedStops[currentStopIdx];
  const nextStop = currentStopIdx < sortedStops.length - 1 ? sortedStops[currentStopIdx + 1] : null;

  // GPS tracking
  useEffect(() => {
    if (walkState !== "active") return;
    if (!navigator.geolocation) {
      setGpsError(true);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(false);
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGpsError(true),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [walkState]);

  // Auto-detect arrival
  useEffect(() => {
    if (walkState !== "active" || !userPos) return;
    const dist = getDistanceMeters(userPos.lat, userPos.lng, currentStop.lat, currentStop.lng);
    if (dist <= ARRIVAL_RADIUS && !visitedIds.has(currentStop.id)) {
      setVisitedIds((prev) => new Set(prev).add(currentStop.id));
    }
  }, [userPos, currentStop, walkState]);

  const distanceToStop = useMemo(() => {
    if (!userPos) return null;
    return getDistanceMeters(userPos.lat, userPos.lng, currentStop.lat, currentStop.lng);
  }, [userPos, currentStop]);

  const directionToStop = useMemo(() => {
    if (!userPos) return null;
    return getBearing(userPos.lat, userPos.lng, currentStop.lat, currentStop.lng);
  }, [userPos, currentStop]);

  const routeLine: [number, number][] = sortedStops.map((s) => [s.lat, s.lng]);

  const mapCenter: [number, number] = useMemo(() => {
    if (walkState === "active" && userPos) return [userPos.lat, userPos.lng];
    return [currentStop.lat, currentStop.lng];
  }, [walkState, userPos, currentStop]);

  const goNext = useCallback(() => {
    if (currentStopIdx < sortedStops.length - 1) {
      setVisitedIds((prev) => new Set(prev).add(currentStop.id));
      setCurrentStopIdx((i) => i + 1);
    } else {
      setVisitedIds((prev) => new Set(prev).add(currentStop.id));
      setWalkState("complete");
    }
  }, [currentStopIdx, currentStop]);

  const goPrev = useCallback(() => {
    if (currentStopIdx > 0) setCurrentStopIdx((i) => i - 1);
  }, [currentStopIdx]);

  const startWalk = () => {
    setWalkState("active");
    setCurrentStopIdx(0);
    setVisitedIds(new Set());
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(217,119,6,0); }
        }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-10 pb-3 bg-background/95 backdrop-blur-sm z-[1001] relative">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {walkState === "active" && (
            <Badge variant="outline" className="text-xs font-semibold text-primary border-primary">
              {currentStopIdx + 1} / {sortedStops.length} stops
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-display font-bold text-foreground">
          {walkState === "complete" ? "Walk Complete! 🎉" : "Walk Now"}
        </h1>
        {walkState === "active" && gpsError && (
          <div className="flex items-center gap-1.5 mt-1 text-destructive text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            GPS unavailable — enable location access
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[22.2997, 73.2015]}
          zoom={walkState === "active" ? 17 : 15}
          className="h-full w-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapUpdater center={mapCenter} zoom={walkState === "active" ? 17 : 15} />

          {/* Route polyline */}
          <Polyline
            positions={routeLine}
            pathOptions={{ color: "#7C3AED", weight: 3, opacity: 0.5, dashArray: "8 6" }}
          />

          {/* Stop markers */}
          {sortedStops.map((stop, idx) => (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={stopIcon(idx === currentStopIdx && walkState === "active", visitedIds.has(stop.id))}
              eventHandlers={{
                click: () => {
                  if (walkState === "active") setCurrentStopIdx(idx);
                },
              }}
            />
          ))}

          {/* User position */}
          {userPos && <Marker position={[userPos.lat, userPos.lng]} icon={userIcon} />}

          <LocateOnMap onLocated={() => {}} />
        </MapContainer>

        {/* Bottom panel */}
        <AnimatePresence mode="wait">
          {walkState === "preview" && (
            <motion.div
              key="preview"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="absolute bottom-4 left-3 right-3 z-[1001] bg-card rounded-2xl border border-border shadow-2xl p-5"
            >
              <h2 className="font-display font-bold text-foreground text-lg">Heritage Precinct Walk</h2>
              <p className="text-sm text-muted-foreground font-body mt-1 mb-3">
                Step-by-step GPS navigation through {sortedStops.length} heritage buildings in the old city pol precinct.
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {sortedStops.length} stops</span>
                <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> ~1.5 km</span>
              </div>

              {/* Stop list preview */}
              <div className="space-y-1.5 mb-4 max-h-32 overflow-y-auto">
                {sortedStops.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground font-medium truncate">{s.name}</span>
                    <Badge className={`${gradeColors[s.grade]} text-[9px] ml-auto border-0 flex-shrink-0`}>{s.grade}</Badge>
                  </div>
                ))}
              </div>

              <Button onClick={startWalk} className="w-full gap-2">
                <Navigation className="w-4 h-4" />
                Start Walking
              </Button>
            </motion.div>
          )}

          {walkState === "active" && (
            <motion.div
              key="active"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="absolute bottom-4 left-3 right-3 z-[1001] bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            >
              {/* Direction bar */}
              {distanceToStop !== null && (
                <div className="bg-primary/10 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">
                      {distanceToStop <= ARRIVAL_RADIUS
                        ? "You've arrived! 🎉"
                        : `Head ${directionToStop} · ${formatDistance(distanceToStop)}`}
                    </span>
                  </div>
                  {visitedIds.has(currentStop.id) && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              )}

              {/* Stop info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {currentStopIdx + 1}
                  </span>
                  <h3 className="font-display font-bold text-foreground text-base leading-snug flex-1 truncate">
                    {currentStop.name}
                  </h3>
                  <Badge className={`${gradeColors[currentStop.grade]} text-xs border-0`}>{currentStop.grade}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">
                  {currentStop.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentStop.features.map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-medium">
                      {f}
                    </span>
                  ))}
                </div>

                {/* Nav buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentStopIdx === 0}
                    className="flex-1 gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    onClick={goNext}
                    className="flex-1 gap-1"
                  >
                    {currentStopIdx === sortedStops.length - 1 ? "Finish" : "Next"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1 mt-3">
                  {sortedStops.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStopIdx(i)}
                      className="p-0.5"
                    >
                      {visitedIds.has(s.id) ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : i === currentStopIdx ? (
                        <Circle className="w-3 h-3 text-primary fill-primary" />
                      ) : (
                        <Circle className="w-3 h-3 text-muted-foreground/40" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {walkState === "complete" && (
            <motion.div
              key="complete"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="absolute bottom-4 left-3 right-3 z-[1001] bg-card rounded-2xl border border-border shadow-2xl p-5 text-center"
            >
              <h2 className="font-display font-bold text-foreground text-xl mb-1">Walk Complete! 🎉</h2>
              <p className="text-sm text-muted-foreground mb-1">
                You visited {visitedIds.size} of {sortedStops.length} heritage buildings.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                  Home
                </Button>
                <Button onClick={startWalk} className="flex-1 gap-1">
                  <Navigation className="w-4 h-4" />
                  Walk Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WalkNowPage;
