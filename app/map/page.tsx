'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDesign } from '@/components/DesignProvider';
import {
  PLACE_TYPES,
  SEED_PLACES,
  geocodeLocal,
  type MapPlace,
  type PlaceType,
} from '@/lib/mapPlaces';
import { getFamilyContext, loadPlaces, addPlace as addPlaceDb } from '@/lib/familyStore';

// Leaflet touches `window`, so the map renders client-side only.
const FamilyMapView = dynamic(() => import('@/components/FamilyMapView'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: 460, borderRadius: 'var(--rl)', background: 'var(--paper2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)' }}
    >
      Loading the family map…
    </div>
  ),
});

/**
 * Feature Set H — Family Map. A visual world map of the family's geography
 * across generations: birthplaces, migration routes, homes, businesses, and
 * important places, with a time-slider that scrubs through the decades.
 */
export default function MapPage() {
  const router = useRouter();
  const { design } = useDesign();
  const [places, setPlaces] = useState<MapPlace[]>(SEED_PLACES);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // Load saved places from the database when signed in.
  useEffect(() => {
    let active = true;
    (async () => {
      const ctx = await getFamilyContext();
      if (!ctx || !active) return;
      setFamilyId(ctx.familyId);
      const rows = await loadPlaces();
      if (active) setPlaces(rows.length ? rows : []);
    })();
    return () => {
      active = false;
    };
  }, []);

  const years = places.map((p) => Number(p.year)).filter((n) => !Number.isNaN(n));
  const minYear = years.length ? Math.min(...years) : 1940;
  const maxYear = years.length ? Math.max(...years) : 2026;
  const [throughYear, setThroughYear] = useState(maxYear);

  const visible = useMemo(
    () => places.filter((p) => Number(p.year) <= throughYear || Number.isNaN(Number(p.year))),
    [places, throughYear],
  );

  // Add-place form.
  const [placeName, setPlaceName] = useState('');
  const [type, setType] = useState<PlaceType>('home');
  const [year, setYear] = useState('');
  const [story, setStory] = useState('');
  const [geoError, setGeoError] = useState('');

  function addPlace() {
    if (!placeName.trim()) return;
    const coords = geocodeLocal(placeName);
    if (!coords) {
      setGeoError(
        `Couldn't place "${placeName}" yet. Try a major city name, or a live geocoder resolves it once configured.`,
      );
      return;
    }
    setGeoError('');
    const place: MapPlace = {
      id: crypto.randomUUID(), lat: coords[0], lng: coords[1],
      placeName: placeName.trim(), type, year: year.trim() || String(maxYear), story: story.trim(),
    };
    setPlaces((ps) => [...ps, place]);
    setPlaceName('');
    setYear('');
    setStory('');
    // Persist to the database when signed in.
    if (familyId) {
      addPlaceDb(familyId, place).then((id) => {
        if (id) setPlaces((ps) => ps.map((p) => (p.id === place.id ? { ...p, id } : p)));
      });
    }
  }

  return (
    <div className="dash" style={{ maxWidth: 760 }}>
      <button className="bb" style={{ marginBottom: 16 }} onClick={() => router.push('/archive')}>
        ← Archive
      </button>
      <div className="dname serif" style={{ fontSize: 30, marginBottom: 2 }}>
        Your family across the world
      </div>
      <div className="dsub" style={{ marginBottom: 16 }}>
        Birthplaces, the homes you&apos;ve made, the routes you travelled — Lahore to Delhi to Dubai
        to Toronto. Drag the years to watch the family spread.
      </div>

      <FamilyMapView places={visible} design={design} />

      {/* Time slider */}
      <div className="tout" style={{ padding: 18, marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="slbl" style={{ margin: 0 }}>Through the years</span>
          <span className="serif" style={{ fontSize: 20, color: 'var(--g3)' }}>{throughYear}</span>
        </div>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={throughYear}
          onChange={(e) => setThroughYear(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--g)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink4)' }}>
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '4px 0 14px' }}>
        {PLACE_TYPES.map((pt) => (
          <span key={pt.type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink3)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: pt.color, display: 'inline-block' }} />
            {pt.label}
          </span>
        ))}
      </div>

      {/* Add place */}
      <div className="tout" style={{ padding: 18 }}>
        <div className="slbl" style={{ marginTop: 0 }}>Add a place</div>
        <div className="field">
          <label className="fl">Place name</label>
          <input className="fi2" placeholder="Lahore, Toronto, Nairobi…" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="fl">Type</label>
            <select className="fi2" value={type} onChange={(e) => setType(e.target.value as PlaceType)}>
              {PLACE_TYPES.map((pt) => (
                <option key={pt.type} value={pt.type}>{pt.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="fl">Year</label>
            <input className="fi2" placeholder="e.g. 1984" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="fl">Story (optional)</label>
          <textarea className="fta" rows={2} placeholder="What happened here…" value={story} onChange={(e) => setStory(e.target.value)} />
        </div>
        {geoError && <div className="enote" style={{ color: 'var(--g3)' }}><i className="ti ti-info-circle" /> {geoError}</div>}
        <button className="bp" onClick={addPlace} style={{ marginTop: 8 }}>
          Add to the map ✦
        </button>
      </div>
    </div>
  );
}
