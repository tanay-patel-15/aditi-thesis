import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Home,
  Locate,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Save,
  Wrench,
  X,
} from "lucide-react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L, { type LeafletMouseEvent, type Polyline as LeafletPolyline } from "leaflet";
import "leaflet/dist/leaflet.css";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getEditableRouteBounds,
  getRouteGeometry,
  positionAtMeters,
  segmentWaypoints,
  walkStops,
  type WalkStop,
} from "@/data/walkRoute";
import { getDistanceMeters } from "@/data/heritageHouses";
import { FigurineMarker, FigurineStyles } from "@/components/walk/FigurineMarker";
import { StopInfoDialog } from "@/components/walk/StopInfoDialog";
import {
  fetchSharedWalkRoute,
  HERITAGE_WALK_ROUTE_KEY,
  saveSharedWalkRoute,
  type WaypointMap,
} from "@/lib/walkRouteConfig";

type Mode = "idle" | "preview" | "live" | "complete";

const PREVIEW_DURATION_MS = 30_000;
const LIVE_ARRIVAL_RADIUS_M = 30;
const ADMIN_SESSION_KEY = "admin_authed";

const stopMarkerIcon = (
  stop: WalkStop,
  state: "pending" | "active" | "visited",
  editable = false
) => {
  const fill =
    state === "visited"
      ? "hsl(90 20% 35%)"
      : state === "active"
        ? "hsl(43 80% 55%)"
        : editable
          ? "hsl(18 60% 48%)"
          : "hsl(40 50% 95%)";
  const stroke = "hsl(20 45% 22%)";
  const textColor = editable ? "hsl(40 50% 95%)" : "hsl(20 45% 22%)";
  const size = editable ? 30 : state === "active" ? 34 : 28;
  const pulse =
    state === "active"
      ? "animation: walkNowStopPulse 1.8s ease-out infinite; border-radius: 50%;"
      : "";

  return L.divIcon({
    className: "walk-now-stop-marker",
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${fill};border:2.5px solid ${stroke};
        box-shadow:0 2px 6px rgba(0,0,0,0.25);
        display:flex;align-items:center;justify-content:center;
        font-family:'Playfair Display',serif;font-weight:700;
        color:${textColor};font-size:${editable ? 12 : state === "active" ? 15 : 13}px;
        ${pulse}
      ">${stop.number}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const waypointMarkerIcon = new L.DivIcon({
  className: "walk-now-waypoint-marker",
  html: `
    <div style="
      width:16px;height:16px;border-radius:999px;
      background:hsl(43 80% 55%);
      border:2px solid hsl(20 45% 22%);
      box-shadow:0 2px 6px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const midpointMarkerIcon = new L.DivIcon({
  className: "walk-now-midpoint-marker",
  html: `
    <div style="
      width:12px;height:12px;border-radius:999px;
      background:hsl(40 50% 95%);
      border:2px solid hsl(20 45% 22%);
      box-shadow:0 1px 4px rgba(0,0,0,0.16);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function getSegmentKey(fromStop: WalkStop, toStop: WalkStop) {
  return `${fromStop.number}-${toStop.number}`;
}

function formatLatLng([lat, lng]: [number, number]) {
  return `[${lat.toFixed(6)}, ${lng.toFixed(6)}]`;
}

function cloneWaypoints(source: WaypointMap) {
  return Object.fromEntries(
    Object.entries(source).map(([key, points]) => [key, points.map(([lat, lng]) => [lat, lng] as [number, number])])
  ) as WaypointMap;
}

function cloneStops(source: WalkStop[]) {
  return source.map((stop) => ({ ...stop }));
}

function pointToSegmentDistance(
  point: [number, number],
  start: [number, number],
  end: [number, number]
) {
  const [px, py] = point;
  const [ax, ay] = start;
  const [bx, by] = end;

  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function getInsertionIndex(points: [number, number][], candidate: [number, number]) {
  let bestIndex = 1;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < points.length - 1; index += 1) {
    const distance = pointToSegmentDistance(candidate, points[index], points[index + 1]);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index + 1;
    }
  }

  return bestIndex;
}

function FitRouteBounds({
  bounds,
  fitSignal,
}: {
  bounds: { south: number; west: number; north: number; east: number };
  fitSignal: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(
      [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ],
      { padding: [60, 60], animate: false }
    );
  }, [fitSignal, map]);

  return null;
}

export default function WalkNowPage() {
  const navigate = useNavigate();
  const adminPasswordRef = useRef<string>("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editableStops, setEditableStops] = useState<WalkStop[]>(() =>
    cloneStops(walkStops)
  );
  const [editableWaypoints, setEditableWaypoints] = useState<WaypointMap>(() =>
    cloneWaypoints(segmentWaypoints)
  );
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isLoadingSharedRoute, setIsLoadingSharedRoute] = useState(true);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isJsonVisible, setIsJsonVisible] = useState(false);

  const geometry = useMemo(
    () => getRouteGeometry(editableStops, editableWaypoints),
    [editableStops, editableWaypoints]
  );
  const routeBounds = useMemo(
    () => getEditableRouteBounds(editableStops, editableWaypoints),
    [editableStops, editableWaypoints]
  );

  const [mode, setMode] = useState<Mode>("idle");
  const [figurinePos, setFigurinePos] = useState<[number, number]>([
    editableStops[0].lat,
    editableStops[0].lng,
  ]);
  const [isMoving, setIsMoving] = useState(false);
  const [activeStop, setActiveStop] = useState<WalkStop | null>(null);
  const [visitedStopNumbers, setVisitedStopNumbers] = useState<Set<number>>(new Set());
  const [progressMeters, setProgressMeters] = useState(0);
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        routeKey: HERITAGE_WALK_ROUTE_KEY,
        stops: editableStops,
        segmentWaypoints: editableWaypoints,
      }),
    [editableStops, editableWaypoints]
  );

  const previewPausedRef = useRef(true);
  const baselineMetersRef = useRef(0);
  const baselineTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const activeStopRef = useRef<WalkStop | null>(null);

  useEffect(() => {
    activeStopRef.current = activeStop;
  }, [activeStop]);

  const stopPreviewLoop = () => {
    previewPausedRef.current = true;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsMoving(false);
  };

  const stopLiveWatch = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const resetWalk = () => {
    stopPreviewLoop();
    stopLiveWatch();
    setMode("idle");
    setFigurinePos([editableStops[0].lat, editableStops[0].lng]);
    setActiveStop(null);
    setVisitedStopNumbers(new Set());
    setProgressMeters(0);
    baselineMetersRef.current = 0;
  };

  useEffect(() => {
    setFitSignal((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSharedRoute = async () => {
      try {
        const sharedRoute = await fetchSharedWalkRoute();
        if (cancelled) return;

        if (sharedRoute) {
          const mergedStops = cloneStops(sharedRoute.stops).map((stop) => {
            const local = walkStops.find((s) => s.number === stop.number);
            return local?.image ? { ...stop, image: local.image } : stop;
          });
          setEditableStops(mergedStops);
          setEditableWaypoints(cloneWaypoints(sharedRoute.segmentWaypoints));
          setLastSavedAt(sharedRoute.updatedAt);
          setSavedSnapshot(
            JSON.stringify({
              routeKey: sharedRoute.routeKey,
              stops: sharedRoute.stops,
              segmentWaypoints: sharedRoute.segmentWaypoints,
            })
          );
        } else {
          setSavedSnapshot(
            JSON.stringify({
              routeKey: HERITAGE_WALK_ROUTE_KEY,
              stops: walkStops,
              segmentWaypoints,
            })
          );
        }
        setFitSignal((value) => value + 1);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load saved route.";
        toast.error(message);
        setSavedSnapshot(
          JSON.stringify({
            routeKey: HERITAGE_WALK_ROUTE_KEY,
            stops: walkStops,
            segmentWaypoints,
          })
        );
      } finally {
        if (!cancelled) {
          setIsLoadingSharedRoute(false);
        }
      }
    };

    loadSharedRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setSelectedSegmentKey(null);
      setIsEditorCollapsed(false);
      return;
    }

    setSelectedSegmentKey((current) => {
      if (current && editableWaypoints[current] !== undefined) return current;
      if (routeSegments[0]) return routeSegments[0].key;
      return null;
    });
  }, [editableWaypoints, isEditMode]);

  useEffect(() => {
    return () => {
      stopPreviewLoop();
      stopLiveWatch();
    };
  }, []);

  const setStopPosition = (stopNumber: number, latlng: [number, number]) => {
    setEditableStops((current) =>
      current.map((stop) =>
        stop.number === stopNumber ? { ...stop, lat: latlng[0], lng: latlng[1] } : stop
      )
    );
  };

  const setWaypointPosition = (
    key: string,
    waypointIndex: number,
    latlng: [number, number]
  ) => {
    setEditableWaypoints((current) => ({
      ...current,
      [key]: (current[key] ?? []).map((point, index) => (index === waypointIndex ? latlng : point)),
    }));
  };

  const insertWaypoint = (key: string, latlng: [number, number], points: [number, number][]) => {
    const insertAt = getInsertionIndex(points, latlng);
    setSelectedSegmentKey(key);
    setEditableWaypoints((current) => {
      const next = [...(current[key] ?? [])];
      next.splice(Math.max(0, insertAt - 1), 0, latlng);
      return { ...current, [key]: next };
    });
  };

  const removeWaypoint = (key: string, waypointIndex: number) => {
    setEditableWaypoints((current) => ({
      ...current,
      [key]: (current[key] ?? []).filter((_, index) => index !== waypointIndex),
    }));
  };

  const resetEditedRoute = () => {
    setEditableStops(cloneStops(walkStops));
    setEditableWaypoints(cloneWaypoints(segmentWaypoints));
    toast.success("Route reset to the saved defaults.");
  };

  const getAdminPasswordForSave = (): string | null => {
    if (adminPasswordRef.current) return adminPasswordRef.current;

    const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!expectedPassword) {
      toast.error("Admin password not configured. Set VITE_ADMIN_PASSWORD in .env");
      return null;
    }

    const enteredPassword = window.prompt("Enter admin password to save the shared route:");
    if (enteredPassword == null) return null;
    if (enteredPassword !== expectedPassword) {
      toast.error("Incorrect admin password.");
      return null;
    }

    adminPasswordRef.current = enteredPassword;
    return enteredPassword;
  };

  const saveEditedRoute = async () => {
    const adminPassword = getAdminPasswordForSave();
    if (!adminPassword) return;

    try {
      const { updatedAt } = await saveSharedWalkRoute(
        adminPassword,
        editableStops,
        editableWaypoints
      );
      setLastSavedAt(updatedAt);
      setSavedSnapshot(currentSnapshot);
      toast.success("Route changes saved for everyone.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save route.";
      toast.error(message);
    }
  };

  const startPreview = () => {
    setMode("preview");
    setFigurinePos([editableStops[0].lat, editableStops[0].lng]);
    setVisitedStopNumbers(new Set());
    setProgressMeters(0);
    baselineMetersRef.current = 0;
    setActiveStop(editableStops[0]);
    setIsMoving(false);
  };

  const runPreviewTowardsNextStop = (fromStopNumber: number) => {
    const nextStop = editableStops.find((stop) => stop.number === fromStopNumber + 1);
    if (!nextStop) {
      setMode("complete");
      setIsMoving(false);
      return;
    }

    const nextStopMeters = geometry.cumulativeMeters[geometry.stopIndices[nextStop.number - 1]];

    previewPausedRef.current = false;
    setIsMoving(true);
    baselineTimeRef.current = performance.now();
    const speed = geometry.totalMeters / PREVIEW_DURATION_MS;

    const tick = () => {
      if (previewPausedRef.current) return;

      const elapsed = performance.now() - baselineTimeRef.current;
      let meters = baselineMetersRef.current + elapsed * speed;

      if (meters >= nextStopMeters) {
        meters = nextStopMeters;
        baselineMetersRef.current = meters;
        setProgressMeters(meters);
        setFigurinePos([nextStop.lat, nextStop.lng]);
        previewPausedRef.current = true;
        setIsMoving(false);
        setActiveStop(nextStop);
        rafRef.current = null;
        return;
      }

      const { latlng } = positionAtMeters(geometry, meters);
      setFigurinePos(latlng);
      setProgressMeters(meters);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const startLiveWalk = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not available on this device. Try Preview Walk instead.");
      return;
    }

    setMode("live");
    setVisitedStopNumbers(new Set());
    setProgressMeters(0);
    setActiveStop(null);
    setIsMoving(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFigurinePos([latitude, longitude]);

        setVisitedStopNumbers((current) => {
          if (activeStopRef.current) return current;

          for (const stop of editableStops) {
            if (current.has(stop.number)) continue;
            const distance = getDistanceMeters(latitude, longitude, stop.lat, stop.lng);
            if (distance <= LIVE_ARRIVAL_RADIUS_M) {
              setIsMoving(false);
              setActiveStop(stop);
              const index = geometry.stopIndices[stop.number - 1];
              setProgressMeters(geometry.cumulativeMeters[index]);
              return new Set(current).add(stop.number);
            }
          }

          return current;
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Use Preview Walk to see the route instead.");
        } else {
          toast.error("Couldn't get your location. Try Preview Walk instead.");
        }
        resetWalk();
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
  };

  const handleContinueFromStop = () => {
    if (!activeStop) return;

    const stopNumber = activeStop.number;
    setVisitedStopNumbers((current) => new Set(current).add(stopNumber));
    setActiveStop(null);

    if (stopNumber === editableStops.length) {
      stopPreviewLoop();
      stopLiveWatch();
      setMode("complete");
      setIsMoving(false);
      setProgressMeters(geometry.totalMeters);
      return;
    }

    if (mode === "preview") {
      runPreviewTowardsNextStop(stopNumber);
    } else if (mode === "live") {
      setIsMoving(true);
    }
  };

  const walkedPath = useMemo(() => {
    const { path, cumulativeMeters } = geometry;
    if (mode === "idle") return [] as [number, number][];

    let index = 0;
    while (index < cumulativeMeters.length - 1 && cumulativeMeters[index + 1] <= progressMeters) {
      index += 1;
    }

    const prefix = path.slice(0, index + 1);
    if (mode === "preview") return [...prefix, figurinePos];
    return prefix;
  }, [figurinePos, geometry, mode, progressMeters]);

  const routeSegments = useMemo(
    () =>
      editableStops.slice(0, -1).map((fromStop, index) => {
        const toStop = editableStops[index + 1];
        const key = getSegmentKey(fromStop, toStop);
        const waypoints = editableWaypoints[key] ?? [];
        return {
          key,
          fromStop,
          toStop,
          waypoints,
          points: [
            [fromStop.lat, fromStop.lng],
            ...waypoints,
            [toStop.lat, toStop.lng],
          ] as [number, number][],
        };
      }),
    [editableStops, editableWaypoints]
  );

  const selectedSegment = routeSegments.find((segment) => segment.key === selectedSegmentKey) ?? null;

  const exportJson = useMemo(() => {
    const stopsString = editableStops
      .map(
        (stop) =>
          `  {\n    number: ${stop.number},\n    name: ${JSON.stringify(stop.name)},\n    subtitle: ${JSON.stringify(stop.subtitle)},\n    lat: ${stop.lat.toFixed(6)},\n    lng: ${stop.lng.toFixed(6)},\n    description: ${JSON.stringify(stop.description ?? "")},\n  },`
      )
      .join("\n");

    const waypointKeys = routeSegments.map((segment) => segment.key);
    const waypointString = waypointKeys
      .map((key) => {
        const points = editableWaypoints[key] ?? [];
        const formatted = points.length === 0 ? "[]" : `[${points.map((point) => formatLatLng(point)).join(", ")}]`;
        return `  ${JSON.stringify(key)}: ${formatted},`;
      })
      .join("\n");

    return `export const walkStops = [\n${stopsString}\n];\n\nexport const segmentWaypoints = {\n${waypointString}\n};`;
  }, [editableStops, editableWaypoints, routeSegments]);

  const copyExportJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      toast.success("Route JSON copied.");
    } catch {
      toast.error("Couldn't copy automatically. You can still select the JSON below.");
    }
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      if (!expectedPassword) {
        toast.error("Admin password not configured. Set VITE_ADMIN_PASSWORD in .env");
        return;
      }

      const alreadyAuthed =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";

      if (!alreadyAuthed) {
        const enteredPassword = window.prompt("Enter admin password to edit the route:");
        if (enteredPassword == null) return;
        if (enteredPassword !== expectedPassword) {
          toast.error("Incorrect admin password.");
          return;
        }
        adminPasswordRef.current = enteredPassword;
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      }
    }

    if (mode !== "idle") resetWalk();
    setIsEditMode((current) => !current);
    setFitSignal((value) => value + 1);
  };

  const stopMarkerState = (stop: WalkStop): "pending" | "active" | "visited" => {
    if (visitedStopNumbers.has(stop.number)) return "visited";
    if (activeStop?.number === stop.number) return "active";
    return "pending";
  };

  const visitedCount = visitedStopNumbers.size;
  const showFigurine = mode !== "idle" && !isEditMode;
  const hasUnsavedChanges = savedSnapshot !== null && currentSnapshot !== savedSnapshot;
  const savedLabel = lastSavedAt
    ? new Date(lastSavedAt).toLocaleString()
    : "Not saved yet";

  return (
    <div className="min-h-screen bg-heritage-cream relative">
      <FigurineStyles />

      <div className="fixed inset-0 z-0">
        <MapContainer
          center={[editableStops[0].lat, editableStops[0].lng]}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={!isEditMode}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitRouteBounds bounds={routeBounds} fitSignal={fitSignal} />

          {routeSegments.map((segment) => (
            <Polyline
              key={`base-${segment.key}`}
              positions={segment.points}
              pathOptions={{
                color: isEditMode
                  ? segment.key === selectedSegmentKey
                    ? "hsl(18 60% 48%)"
                    : "hsl(210 12% 40%)"
                  : "hsl(18 60% 48%)",
                weight: isEditMode ? (segment.key === selectedSegmentKey ? 8 : 6) : 4,
                opacity: isEditMode ? (segment.key === selectedSegmentKey ? 0.95 : 0.7) : 0.75,
                dashArray: isEditMode ? undefined : "2 10",
                lineCap: "round",
              }}
              eventHandlers={
                isEditMode
                  ? {
                      click: (event: LeafletMouseEvent) => {
                        insertWaypoint(segment.key, [event.latlng.lat, event.latlng.lng], segment.points);
                      },
                      mousedown: () => {
                        setSelectedSegmentKey(segment.key);
                      },
                    }
                  : undefined
              }
            />
          ))}

          {walkedPath.length > 1 && !isEditMode && (
            <Polyline
              positions={walkedPath}
              pathOptions={{
                color: "hsl(43 80% 55%)",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
              }}
            />
          )}

          {editableStops.map((stop) => (
            <Marker
              key={`stop-${stop.number}`}
              position={[stop.lat, stop.lng]}
              icon={stopMarkerIcon(
                stop,
                isEditMode ? "pending" : stopMarkerState(stop),
                isEditMode
              )}
              draggable={isEditMode}
              eventHandlers={
                isEditMode
                  ? {
                      dragend: (event) => {
                        const marker = event.target as L.Marker;
                        const latlng = marker.getLatLng();
                        setStopPosition(stop.number, [latlng.lat, latlng.lng]);
                      },
                    }
                  : undefined
              }
            />
          ))}

          {isEditMode &&
            routeSegments.flatMap((segment) =>
              segment.waypoints.map((waypoint, waypointIndex) => (
                <Marker
                  key={`waypoint-${segment.key}-${waypointIndex}`}
                  position={waypoint}
                  icon={waypointMarkerIcon}
                  draggable
                  eventHandlers={{
                    click: () => setSelectedSegmentKey(segment.key),
                    dragend: (event) => {
                      const marker = event.target as L.Marker;
                      const latlng = marker.getLatLng();
                      setWaypointPosition(segment.key, waypointIndex, [latlng.lat, latlng.lng]);
                    },
                    dblclick: () => removeWaypoint(segment.key, waypointIndex),
                  }}
                />
              ))
            )}

          {isEditMode &&
            selectedSegment &&
            selectedSegment.points.slice(0, -1).map((point, index) => {
              const nextPoint = selectedSegment.points[index + 1];
              const midpoint: [number, number] = [
                (point[0] + nextPoint[0]) / 2,
                (point[1] + nextPoint[1]) / 2,
              ];

              return (
                <Marker
                  key={`midpoint-${selectedSegment.key}-${index}`}
                  position={midpoint}
                  icon={midpointMarkerIcon}
                  eventHandlers={{
                    click: () => insertWaypoint(selectedSegment.key, midpoint, selectedSegment.points),
                  }}
                />
              );
            })}

          {showFigurine && <FigurineMarker position={figurinePos} isMoving={isMoving} />}
        </MapContainer>
      </div>

      <div className="relative z-[1001] px-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-heritage-cream/95 shadow-md hover:bg-heritage-cream transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-heritage-deep" />
          </button>

          <div className="flex-1 bg-heritage-cream/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display text-heritage-deep text-base leading-tight truncate">
                  Heritage Walk
                </p>
                <p className="text-heritage-deep/60 text-xs font-body">
                  {isLoadingSharedRoute && "Loading shared route..."}
                  {isEditMode && "Edit mode · select a segment, drag points, click line or midpoint to shape it"}
                  {!isLoadingSharedRoute && !isEditMode && mode === "idle" && "8 stops · LVP Gate → Gazra Cafe"}
                  {!isLoadingSharedRoute && !isEditMode && mode === "preview" && `Preview · ${visitedCount}/8 stops`}
                  {!isLoadingSharedRoute && !isEditMode && mode === "live" && `Live · ${visitedCount}/8 stops`}
                  {!isLoadingSharedRoute && !isEditMode && mode === "complete" && "Walk complete"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {!isEditMode && mode === "live" && (
                  <span className="inline-flex items-center gap-1 text-xs font-body text-heritage-terracotta">
                    <Locate className="w-3 h-3" />
                    GPS
                  </span>
                )}
                {!isEditMode && mode === "preview" && (
                  <button
                    onClick={resetWalk}
                    className="p-1 rounded-full hover:bg-heritage-sand/60"
                    aria-label="Exit preview"
                  >
                    <X className="w-4 h-4 text-heritage-deep" />
                  </button>
                )}
                <button
                  onClick={toggleEditMode}
                  className={`p-2 rounded-full transition-colors ${
                    isEditMode
                      ? "bg-heritage-deep text-heritage-cream"
                      : "hover:bg-heritage-sand/60 text-heritage-deep"
                  }`}
                  aria-label="Toggle edit mode"
                >
                  <Wrench className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditMode && isEditorCollapsed && (
        <div className="fixed right-4 bottom-4 z-[1001]">
          <button
            onClick={() => setIsEditorCollapsed(false)}
            className="rounded-full bg-heritage-deep text-heritage-cream shadow-2xl border border-heritage-sand/20 px-4 py-3 flex items-center gap-2"
            aria-label="Expand route editor"
          >
            <Wrench className="w-4 h-4" />
            <span className="text-sm font-body font-semibold">Route editor</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-heritage-gold" aria-hidden="true" />
            )}
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isEditMode && !isEditorCollapsed && (
        <div className="fixed inset-x-4 bottom-4 z-[1001]">
          <div className="max-w-2xl mx-auto bg-heritage-cream/97 backdrop-blur rounded-3xl shadow-2xl border border-heritage-deep/10 overflow-hidden">
            <div className="bg-heritage-deep px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-heritage-sand/80 text-xs uppercase tracking-wider font-body">
                  Route editor
                </p>
                <p className="text-heritage-cream font-body text-sm">
                  Drag numbered stops. Select a segment, click the line or midpoint to add a vertex, drag vertices onto roads, and double-click a waypoint to remove it.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditorCollapsed(true)}
                  className="border-heritage-sand/40 bg-transparent text-heritage-cream hover:bg-heritage-sand hover:text-heritage-deep"
                >
                  <Minimize2 className="w-4 h-4" />
                  Minimize
                </Button>
                <Button
                  variant="outline"
                  onClick={resetEditedRoute}
                  className="border-heritage-sand/40 bg-transparent text-heritage-cream hover:bg-heritage-sand hover:text-heritage-deep"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                <Button
                  onClick={saveEditedRoute}
                  disabled={isLoadingSharedRoute}
                  className="bg-heritage-terracotta text-heritage-cream hover:bg-heritage-terracotta/90"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  onClick={copyExportJson}
                  className="bg-heritage-gold text-heritage-deep hover:bg-heritage-gold/90"
                >
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-body text-heritage-deep/70">
                <div className="rounded-2xl bg-heritage-sand/45 px-3 py-2">
                  Stops: {editableStops.length} · Waypoints:{" "}
                  {Object.values(editableWaypoints).reduce((sum, points) => sum + points.length, 0)}
                </div>
                <div className="rounded-2xl bg-heritage-sand/45 px-3 py-2">
                  Current route length: {(geometry.totalMeters / 1000).toFixed(2)} km
                </div>
              </div>

              <div className="rounded-2xl bg-heritage-sand/45 px-3 py-2 text-xs font-body text-heritage-deep/80">
                {isLoadingSharedRoute
                  ? "Loading shared route..."
                  : hasUnsavedChanges
                    ? "Unsaved changes"
                    : "Saved"}{" "}
                · Last saved: {savedLabel}
              </div>

              {selectedSegment && (
                <div className="rounded-2xl bg-heritage-sand/45 px-3 py-2 text-xs font-body text-heritage-deep/80">
                  Editing segment {selectedSegment.key}: {selectedSegment.fromStop.name} to {selectedSegment.toStop.name}
                </div>
              )}

              <button
                onClick={() => setIsJsonVisible((v) => !v)}
                className="w-full flex items-center justify-between rounded-2xl bg-heritage-sand/45 px-3 py-2 text-xs font-body text-heritage-deep/80 hover:bg-heritage-sand/60 transition-colors"
              >
                <span>Route JSON</span>
                <span className="text-heritage-deep/50">{isJsonVisible ? "Hide ▲" : "Show ▼"}</span>
              </button>

              {isJsonVisible && (
                <textarea
                  readOnly
                  value={exportJson}
                  className="w-full h-56 rounded-2xl border border-heritage-deep/15 bg-white/85 px-4 py-3 text-xs font-mono text-heritage-deep resize-none"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {!isEditMode && (
        <AnimatePresence mode="wait">
          {mode === "idle" && (
            <motion.div
              key="idle"
              className="fixed bottom-0 inset-x-0 z-[1001] px-4 pb-6"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
            >
              <div className="max-w-md mx-auto bg-heritage-cream/98 backdrop-blur rounded-3xl shadow-2xl border border-heritage-deep/10 overflow-hidden">
                <div className="bg-heritage-deep px-6 py-5">
                  <p className="text-heritage-sand/80 text-xs uppercase tracking-wider font-body">
                    Guided route
                  </p>
                  <h1 className="text-heritage-cream font-display text-2xl leading-tight mt-1">
                    Palace to Pol — a statues walk
                  </h1>
                  <p className="text-heritage-sand/90 text-sm font-body mt-2">
                    Eight landmarks from Laxmi Vilas Palace through the old-city markets, ending at Gazra Cafe in the
                    Stree Udyogalaya.
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <Button
                    onClick={startPreview}
                    className="w-full bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-heritage-cream font-body font-semibold py-6 rounded-xl text-base shadow-md flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Preview walk
                    <span className="text-heritage-cream/70 text-xs font-normal">· 30s</span>
                  </Button>
                  <Button
                    onClick={startLiveWalk}
                    variant="outline"
                    className="w-full border-heritage-deep/30 text-heritage-deep hover:bg-heritage-deep hover:text-heritage-cream font-body font-semibold py-6 rounded-xl text-base flex items-center justify-center gap-2"
                  >
                    <Locate className="w-4 h-4" />
                    Start live walk
                  </Button>
                  <p className="text-heritage-deep/50 text-[11px] text-center font-body">
                    Preview plays an animated walkthrough. Edit mode lets you reshape each segment so the path can trace the roads manually.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {(mode === "preview" || mode === "live") && (
            <motion.div
              key="walking"
              className="fixed bottom-0 inset-x-0 z-[1001] px-4 pb-6"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
            >
              <div className="max-w-md mx-auto bg-heritage-cream/98 backdrop-blur rounded-3xl shadow-2xl border border-heritage-deep/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-heritage-gold text-heritage-deep flex items-center justify-center font-display text-lg font-bold">
                    {visitedCount === 0 ? 1 : Math.min(visitedCount + 1, editableStops.length)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-heritage-deep/60 text-[11px] uppercase tracking-wider font-body">
                      {mode === "preview" ? "Next stop" : "Head toward"}
                    </p>
                    <p className="font-display text-heritage-deep text-base leading-tight truncate">
                      {editableStops[Math.min(visitedCount, editableStops.length - 1)]?.name}
                    </p>
                    <div className="mt-2 h-1.5 bg-heritage-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-heritage-terracotta transition-all duration-500"
                        style={{ width: `${(visitedCount / editableStops.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={resetWalk}
                    className="flex-shrink-0 p-2 rounded-full bg-heritage-sand/70 hover:bg-heritage-sand"
                    aria-label="End walk"
                  >
                    <Pause className="w-4 h-4 text-heritage-deep" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === "complete" && (
            <motion.div
              key="complete"
              className="fixed bottom-0 inset-x-0 z-[1001] px-4 pb-6"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
            >
              <div className="max-w-md mx-auto bg-heritage-cream/98 backdrop-blur rounded-3xl shadow-2xl border border-heritage-deep/10 overflow-hidden">
                <div className="bg-heritage-deep px-6 py-5">
                  <p className="text-heritage-sand/80 text-xs uppercase tracking-wider font-body">
                    Walk complete
                  </p>
                  <h2 className="text-heritage-cream font-display text-2xl leading-tight mt-1">
                    You finished the heritage walk
                  </h2>
                  <p className="text-heritage-sand/90 text-sm font-body mt-2">
                    All {editableStops.length} landmarks covered — palace gates, statues, the lake, and the old-city
                    cafe.
                  </p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <Button
                    onClick={startPreview}
                    variant="outline"
                    className="border-heritage-deep/30 text-heritage-deep hover:bg-heritage-sand font-body py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Replay
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-heritage-terracotta hover:bg-heritage-terracotta/90 text-heritage-cream font-body py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!isEditMode && (
        <StopInfoDialog
          stop={activeStop}
          isFinal={activeStop?.number === editableStops.length}
          onContinue={handleContinueFromStop}
        />
      )}
    </div>
  );
}
