import { supabase } from "@/integrations/supabase/client";
import type { WalkStop } from "@/data/walkRoute";

export type WaypointMap = Record<string, [number, number][]>;

export interface SharedWalkRoute {
  routeKey: string;
  stops: WalkStop[];
  segmentWaypoints: WaypointMap;
  updatedAt: string;
}

export const HERITAGE_WALK_ROUTE_KEY = "heritage_walk";

const isLatLngTuple = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === "number" &&
  Number.isFinite(value[0]) &&
  typeof value[1] === "number" &&
  Number.isFinite(value[1]);

const isWalkStop = (value: unknown): value is WalkStop => {
  if (!value || typeof value !== "object") return false;
  const stop = value as Record<string, unknown>;
  return (
    typeof stop.number === "number" &&
    typeof stop.name === "string" &&
    typeof stop.subtitle === "string" &&
    typeof stop.lat === "number" &&
    typeof stop.lng === "number" &&
    (typeof stop.description === "string" || typeof stop.description === "undefined")
  );
};

const parseWaypointMap = (value: unknown): WaypointMap => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid segment waypoint data.");
  }

  const result: WaypointMap = {};
  for (const [key, points] of Object.entries(value)) {
    if (!Array.isArray(points) || !points.every(isLatLngTuple)) {
      throw new Error(`Invalid waypoint list for segment ${key}.`);
    }
    result[key] = points.map(([lat, lng]) => [lat, lng]);
  }
  return result;
};

export const fetchSharedWalkRoute = async (
  routeKey = HERITAGE_WALK_ROUTE_KEY
): Promise<SharedWalkRoute | null> => {
  const { data, error } = await supabase
    .from("walk_routes")
    .select("route_key, stops, segment_waypoints, updated_at")
    .eq("route_key", routeKey)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (!Array.isArray(data.stops) || !data.stops.every(isWalkStop)) {
    throw new Error("Invalid stop data returned from Supabase.");
  }

  return {
    routeKey: data.route_key,
    stops: data.stops.map((stop) => ({ ...stop })),
    segmentWaypoints: parseWaypointMap(data.segment_waypoints),
    updatedAt: data.updated_at,
  };
};

export const saveSharedWalkRoute = async (
  adminPassword: string,
  stops: WalkStop[],
  segmentWaypoints: WaypointMap,
  routeKey = HERITAGE_WALK_ROUTE_KEY
): Promise<{ updatedAt: string }> => {
  const { data, error } = await supabase.functions.invoke("save-walk-route", {
    body: { routeKey, adminPassword, stops, segmentWaypoints },
  });

  if (error) throw error;
  if (!data?.updatedAt || typeof data.updatedAt !== "string") {
    throw new Error("Invalid response from save-walk-route.");
  }

  return { updatedAt: data.updatedAt };
};
