'use client';

import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PLACE_TYPES, migrationRoute, type MapPlace } from '@/lib/mapPlaces';
import type { AlbumDesign } from '@/lib/albumDesigns';

/**
 * The Leaflet map (client-only; loaded via dynamic import with ssr:false). Pins
 * every place, draws the migration route as a line through chronological points,
 * and tints everything with the active design palette. Uses OpenStreetMap tiles
 * (no token); a Mapbox tile layer can swap in when NEXT_PUBLIC_MAPBOX_TOKEN is
 * set. Animated dashed routes come from CSS in globals.css (.ank-route).
 */
export default function FamilyMapView({
  places,
  design,
  onSelect,
}: {
  places: MapPlace[];
  design: AlbumDesign;
  onSelect?: (p: MapPlace) => void;
}) {
  const route = migrationRoute(places);
  const routeLatLngs = route.map((p) => [p.lat, p.lng] as [number, number]);
  const colorOf = (t: MapPlace['type']) =>
    PLACE_TYPES.find((pt) => pt.type === t)?.color ?? design.palette.accent;

  return (
    <MapContainer
      center={[28.6, 60]}
      zoom={3}
      style={{ height: 460, width: '100%', borderRadius: 'var(--rl)', background: design.palette.bg }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routeLatLngs.length > 1 && (
        <Polyline
          positions={routeLatLngs}
          pathOptions={{ color: design.palette.accent, weight: 2.5, dashArray: '6 8', className: 'ank-route' }}
        />
      )}

      {places.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={p.type === 'birth' ? 9 : 7}
          pathOptions={{
            color: colorOf(p.type),
            fillColor: colorOf(p.type),
            fillOpacity: 0.85,
            weight: 2,
          }}
          eventHandlers={{ click: () => onSelect?.(p) }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            {p.placeName} · {p.year}
          </Tooltip>
          <Popup>
            <div style={{ fontFamily: 'var(--font-jost), sans-serif' }}>
              <strong>{p.placeName}</strong> ({p.year})
              <br />
              <span style={{ textTransform: 'capitalize' }}>{p.type}</span>
              {p.story ? (
                <>
                  <br />
                  {p.story}
                </>
              ) : null}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
