import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface FigurineMarkerProps {
  position: [number, number];
  isMoving: boolean;
}

/**
 * A small SVG walker rendered as a Leaflet DivIcon. The marker is created
 * imperatively once and then updated via `setLatLng` on every position change,
 * avoiding DivIcon HTML re-creation (which would flicker during animation).
 */
const buildIconHtml = (isMoving: boolean) => {
  // Heritage-terracotta body + heritage-deep outline. Colors pulled from
  // tailwind tokens via inline hsl() so we don't depend on a stylesheet being
  // applied to the DivIcon HTML.
  const body = "hsl(18 60% 48%)"; // heritage-terracotta
  const stroke = "hsl(20 45% 22%)"; // heritage-deep
  const animClass = isMoving ? "walk-now-figurine-moving" : "";

  return `
    <div class="walk-now-figurine ${animClass}">
      <svg viewBox="0 0 32 44" width="32" height="44" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="16" cy="42" rx="9" ry="1.8" fill="rgba(0,0,0,0.22)" />
        <circle cx="16" cy="7" r="5" fill="${body}" stroke="${stroke}" stroke-width="1.5" />
        <path
          d="M16 12
             C 11 12, 9 16, 9 22
             L 9 28
             L 11 28
             L 11 22
             L 21 22
             L 21 28
             L 23 28
             L 23 22
             C 23 16, 21 12, 16 12 Z"
          fill="${body}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"
        />
        <g class="walk-now-figurine-legs">
          <rect class="leg leg-left" x="11.5" y="27" width="3.5" height="12" rx="1.5" fill="${body}" stroke="${stroke}" stroke-width="1.2" />
          <rect class="leg leg-right" x="17" y="27" width="3.5" height="12" rx="1.5" fill="${body}" stroke="${stroke}" stroke-width="1.2" />
        </g>
      </svg>
    </div>
  `;
};

export function FigurineMarker({ position, isMoving }: FigurineMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  // Create (and tear down) the marker once.
  useEffect(() => {
    const icon = L.divIcon({
      className: "walk-now-figurine-wrap",
      html: buildIconHtml(isMoving),
      iconSize: [32, 44],
      iconAnchor: [16, 40],
    });
    const marker = L.marker(position, { icon, zIndexOffset: 1000 }).addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update position imperatively on every prop change — smooth, no rerender.
  useEffect(() => {
    markerRef.current?.setLatLng(position);
  }, [position]);

  // Swap icon HTML when isMoving toggles so the walking animation pauses
  // cleanly at stops. Happens infrequently (~8 times per walk) so the
  // occasional DivIcon rebuild is fine.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setIcon(
      L.divIcon({
        className: "walk-now-figurine-wrap",
        html: buildIconHtml(isMoving),
        iconSize: [32, 44],
        iconAnchor: [16, 40],
      })
    );
  }, [isMoving]);

  return null;
}

/** Inject the walking-cycle CSS once. Rendered by WalkNowPage. */
export function FigurineStyles() {
  return (
    <style>{`
      .walk-now-figurine-wrap { background: transparent; border: none; }
      .walk-now-figurine { transform-origin: 50% 100%; will-change: transform; }
      .walk-now-figurine-moving { animation: walkNowBob 0.52s ease-in-out infinite; }
      .walk-now-figurine-moving .leg-left  { animation: walkNowLegL 0.52s ease-in-out infinite; transform-origin: 50% 0%; }
      .walk-now-figurine-moving .leg-right { animation: walkNowLegR 0.52s ease-in-out infinite; transform-origin: 50% 0%; }
      @keyframes walkNowBob {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-2px); }
      }
      @keyframes walkNowLegL {
        0%, 100% { transform: rotate(-14deg); }
        50%      { transform: rotate( 14deg); }
      }
      @keyframes walkNowLegR {
        0%, 100% { transform: rotate( 14deg); }
        50%      { transform: rotate(-14deg); }
      }
      @keyframes walkNowStopPulse {
        0%, 100% { box-shadow: 0 0 0 0 hsl(18 60% 48% / 0.55); }
        50%      { box-shadow: 0 0 0 14px hsl(18 60% 48% / 0); }
      }
    `}</style>
  );
}
