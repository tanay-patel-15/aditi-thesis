// deno-lint-ignore-file
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const isLatLngTuple = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  typeof value[0] === "number" &&
  Number.isFinite(value[0]) &&
  typeof value[1] === "number" &&
  Number.isFinite(value[1]);

const isValidStop = (value: unknown) => {
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

const isValidWaypointMap = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every(
    (points) => Array.isArray(points) && points.every((point) => isLatLngTuple(point))
  );
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const routeKey = typeof body?.routeKey === "string" ? body.routeKey : "heritage_walk";
    const adminPassword =
      typeof body?.adminPassword === "string" ? body.adminPassword : "";
    const stops = body?.stops;
    const segmentWaypoints = body?.segmentWaypoints;

    if (!adminPassword) {
      throw new Error("Missing admin password");
    }
    if (!Array.isArray(stops) || stops.length === 0 || !stops.every(isValidStop)) {
      throw new Error("Invalid stops payload");
    }
    if (!isValidWaypointMap(segmentWaypoints)) {
      throw new Error("Invalid segment waypoints payload");
    }

    const expectedPassword =
      Deno.env.get("ADMIN_PASSWORD") ??
      Deno.env.get("WALK_ROUTE_ADMIN_PASSWORD");
    if (!expectedPassword) {
      throw new Error(
        "Admin password secret not configured. Set ADMIN_PASSWORD in Supabase secrets."
      );
    }
    if (adminPassword !== expectedPassword) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Supabase env vars not configured on the function");
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("walk_routes")
      .upsert(
        {
          route_key: routeKey,
          stops,
          segment_waypoints: segmentWaypoints,
          updated_at: new Date().toISOString(),
          updated_by: "admin",
        },
        { onConflict: "route_key" }
      )
      .select("updated_at")
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, updatedAt: data.updated_at }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("save-walk-route error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
