/** Types + offline geocoding for the Family Map (Feature Set H). */

export type PlaceType = 'birth' | 'home' | 'migration' | 'business' | 'important';

export interface MapPlace {
  id: string;
  profileId?: string;
  lat: number;
  lng: number;
  placeName: string;
  type: PlaceType;
  year: string;
  story?: string;
  photoPath?: string;
}

export const PLACE_TYPES: { type: PlaceType; label: string; icon: string; color: string }[] = [
  { type: 'birth', label: 'Birthplace', icon: 'ti-baby-carriage', color: '#3E7C5B' },
  { type: 'home', label: 'Family home', icon: 'ti-home', color: '#B8935A' },
  { type: 'migration', label: 'Migration', icon: 'ti-plane', color: '#4E5FAB' },
  { type: 'business', label: 'Business', icon: 'ti-building-store', color: '#8A6B34' },
  { type: 'important', label: 'Important place', icon: 'ti-map-pin', color: '#B05E72' },
];

/**
 * A small built-in gazetteer so place names resolve to coordinates without a
 * geocoding key (degraded mode). When a geocoding service is configured later,
 * `geocode()` calls it first and falls back to this list.
 */
const GAZETTEER: Record<string, [number, number]> = {
  lahore: [31.5204, 74.3587], delhi: [28.6139, 77.209], 'new delhi': [28.6139, 77.209],
  mumbai: [19.076, 72.8777], bombay: [19.076, 72.8777], dubai: [25.2048, 55.2708],
  toronto: [43.6532, -79.3832], london: [51.5074, -0.1278], 'new york': [40.7128, -74.006],
  karachi: [24.8607, 67.0011], nairobi: [-1.2921, 36.8219], bristol: [51.4545, -2.5879],
  bangalore: [12.9716, 77.5946], bengaluru: [12.9716, 77.5946], chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639], hyderabad: [17.385, 78.4867], ahmedabad: [23.0225, 72.5714],
  singapore: [1.3521, 103.8198], 'hong kong': [22.3193, 114.1694], sydney: [-33.8688, 151.2093],
  'san francisco': [37.7749, -122.4194], chicago: [41.8781, -87.6298], paris: [48.8566, 2.3522],
  manila: [14.5995, 120.9842], lisbon: [38.7223, -9.1393], cairo: [30.0444, 31.2357],
  istanbul: [41.0082, 28.9784], dhaka: [23.8103, 90.4125], colombo: [6.9271, 79.8612],
};

/** Resolve a place name to [lat, lng]; null when unknown in degraded mode. */
export function geocodeLocal(name: string): [number, number] | null {
  const key = name.trim().toLowerCase();
  if (GAZETTEER[key]) return GAZETTEER[key];
  // Try the first comma-separated token (e.g. "Bristol, UK" → "bristol").
  const first = key.split(',')[0].trim();
  return GAZETTEER[first] ?? null;
}

/** Seed journey — a family spreading across the world, with a migration route. */
export const SEED_PLACES: MapPlace[] = [
  { id: 'p1', lat: 31.5204, lng: 74.3587, placeName: 'Lahore', type: 'birth', year: '1942', story: 'Where the family began.' },
  { id: 'p2', lat: 28.6139, lng: 77.209, placeName: 'Delhi', type: 'migration', year: '1965', story: 'Moved after partition, started again.' },
  { id: 'p3', lat: 25.2048, lng: 55.2708, placeName: 'Dubai', type: 'migration', year: '1984', story: 'Work took the family to the Gulf.' },
  { id: 'p4', lat: 43.6532, lng: -79.3832, placeName: 'Toronto', type: 'home', year: '2003', story: 'The family home today.' },
  { id: 'p5', lat: 28.6139, lng: 77.209, placeName: 'The Delhi shop', type: 'business', year: '1974', story: 'The family business opened here.' },
];

/** Migration route is the migration/birth/home points in chronological order. */
export function migrationRoute(places: MapPlace[]): MapPlace[] {
  return places
    .filter((p) => p.type === 'migration' || p.type === 'birth' || p.type === 'home')
    .sort((a, b) => Number(a.year) - Number(b.year));
}
