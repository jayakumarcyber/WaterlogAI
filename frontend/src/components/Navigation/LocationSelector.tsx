'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, MapPin, Building, Navigation, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getDistrictsForState, getCitiesForDistrict } from '@/data/locationHierarchy';
import { getApiBaseUrl } from '@/lib/api';

export interface LocationSelectorProps {
  district: string;
  selectedPlaceId?: string | null;
  selectedWardId?: string | number | null;
  onDistrictSelect: (district: string, distObj?: any) => void;
  onPlaceSelect: (place: any) => void;
  onWardSelect: (ward: any) => void;
  apiBaseUrl?: string;
}

export default function LocationSelector({
  district = 'Chennai',
  selectedPlaceId = null,
  selectedWardId = null,
  onDistrictSelect,
  onPlaceSelect,
  onWardSelect,
  apiBaseUrl = getApiBaseUrl(),
}: LocationSelectorProps) {
  const { t } = useLanguage();

  // State lists
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [placesList, setPlacesList] = useState<any[]>([]);
  const [wardsList, setWardsList] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);

  // Active selections
  const [currentDistrict, setCurrentDistrict] = useState<string>(district);
  const [currentPlaceId, setCurrentPlaceId] = useState<string>(selectedPlaceId || '');
  const [currentWardId, setCurrentWardId] = useState<string>(selectedWardId ? String(selectedWardId) : '');

  // Keep local state synchronized if props change externally
  useEffect(() => {
    if (district && district !== currentDistrict) {
      setCurrentDistrict(district);
    }
  }, [district]);

  useEffect(() => {
    if (selectedPlaceId !== undefined) {
      setCurrentPlaceId(selectedPlaceId || '');
    }
  }, [selectedPlaceId]);

  useEffect(() => {
    if (selectedWardId !== undefined) {
      setCurrentWardId(selectedWardId ? String(selectedWardId) : '');
    }
  }, [selectedWardId]);

  const safeFetch = useCallback(
    async (endpoint: string) => {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      try {
        const res = await fetch(`${apiBaseUrl}${cleanEndpoint}`);
        if (res.ok) return res;
        return await fetch(cleanEndpoint);
      } catch {
        return await fetch(cleanEndpoint);
      }
    },
    [apiBaseUrl]
  );

  // 1. Fetch all 38 Tamil Nadu districts on mount
  useEffect(() => {
    let isMounted = true;
    safeFetch('/api/v1/locations/districts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setDistrictsList(data);
        }
      })
      .catch((err) => {
        console.warn('[LocationSelector] Falling back to offline districts:', err);
        // Fallback to static locationHierarchy
        const fallback = getDistrictsForState('Tamil Nadu').map((d) => ({
          id: d.id,
          name: d.name,
          state: 'Tamil Nadu',
          centroid_lat: d.coordinates[0],
          centroid_lon: d.coordinates[1],
          centroid: { lat: d.coordinates[0], lon: d.coordinates[1] },
          bounds: [
            [d.coordinates[0] - 0.2, d.coordinates[1] - 0.2],
            [d.coordinates[0] + 0.2, d.coordinates[1] + 0.2],
          ],
          data_status: d.id === 'chennai' ? 'REAL' : 'OFFICIAL DATA',
        }));
        if (isMounted) setDistrictsList(fallback);
      });

    return () => {
      isMounted = false;
    };
  }, [safeFetch]);

  // 2. Load places dynamically when currentDistrict changes
  const loadPlacesForDistrict = useCallback(
    async (distName: string) => {
      if (!distName) return;
      setLoadingPlaces(true);
      const distSlug = distName.toLowerCase().replace(/\s+/g, '-');

      try {
        const res = await safeFetch(`/api/v1/locations/districts/${distSlug}/places`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlacesList(data);
          return data;
        }
      } catch (err) {
        console.warn(`[LocationSelector] Falling back to offline places for ${distName}:`, err);
        const offlineCities = getCitiesForDistrict('Tamil Nadu', distName);
        const fallback = offlineCities.map((c) => ({
          id: c.id,
          name: c.name,
          district_id: distSlug,
          district_name: distName,
          type: 'Administrative Area',
          centroid_lat: c.coordinates ? c.coordinates[0] : 11.0,
          centroid_lon: c.coordinates ? c.coordinates[1] : 78.0,
          centroid: {
            lat: c.coordinates ? c.coordinates[0] : 11.0,
            lon: c.coordinates ? c.coordinates[1] : 78.0,
          },
          bounds: c.coordinates
            ? [
                [c.coordinates[0] - 0.025, c.coordinates[1] - 0.025],
                [c.coordinates[0] + 0.025, c.coordinates[1] + 0.025],
              ]
            : null,
          has_geometry: false,
          ward_count: 0,
          data_status: distSlug === 'chennai' ? 'REAL' : 'DATA UNAVAILABLE',
        }));
        setPlacesList(fallback);
        return fallback;
      } finally {
        setLoadingPlaces(false);
      }
      return [];
    },
    [safeFetch]
  );

  useEffect(() => {
    loadPlacesForDistrict(currentDistrict);
  }, [currentDistrict, loadPlacesForDistrict]);

  // 3. Load wards when currentPlaceId changes
  const loadWardsForPlace = useCallback(
    async (placeId: string) => {
      if (!placeId) {
        setWardsList([]);
        return;
      }
      setLoadingWards(true);
      try {
        const res = await safeFetch(`/api/v1/locations/places/${placeId}/wards`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setWardsList(data);
          return;
        }
      } catch (err) {
        console.warn(`[LocationSelector] Could not load wards for ${placeId}:`, err);
      } finally {
        setLoadingWards(false);
      }
      setWardsList([]);
    },
    [safeFetch]
  );

  useEffect(() => {
    if (currentPlaceId) {
      loadWardsForPlace(currentPlaceId);
    } else {
      setWardsList([]);
      setCurrentWardId('');
    }
  }, [currentPlaceId, loadWardsForPlace]);

  // Handlers
  const handleDistrictChange = (newDistName: string) => {
    setCurrentDistrict(newDistName);
    setCurrentPlaceId('');
    setCurrentWardId('');
    setWardsList([]);

    const distObj = districtsList.find(
      (d) => d.name.toLowerCase() === newDistName.toLowerCase() || d.id === newDistName.toLowerCase()
    );
    onDistrictSelect(newDistName, distObj);
  };

  const handlePlaceChange = async (newPlaceId: string) => {
    setCurrentPlaceId(newPlaceId);
    setCurrentWardId('');

    if (!newPlaceId) {
      setWardsList([]);
      return;
    }

    // Fetch place details with geometry, bounds, and metrics
    try {
      const res = await safeFetch(`/api/v1/locations/places/${newPlaceId}`);
      if (res.ok) {
        const placeDetails = await res.json();
        onPlaceSelect(placeDetails);
        return;
      }
    } catch {
      // Fallback to local place object from placesList
    }

    const localPlace = placesList.find((p) => p.id === newPlaceId);
    if (localPlace) {
      onPlaceSelect(localPlace);
    }
  };

  const handleWardChange = (newWardId: string) => {
    setCurrentWardId(newWardId);
    if (!newWardId) return;

    const wardObj = wardsList.find(
      (w) => String(w.id) === newWardId || String(w.ward_number) === newWardId
    );
    if (wardObj) {
      onWardSelect(wardObj);
    }
  };

  const isChennai = currentDistrict.toLowerCase() === 'chennai';

  return (
    <div
      aria-label="CivicPulse Administrative Location Hierarchy Selector"
      className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm font-sans text-slate-800 transition"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Hierarchy Dropdowns: State -> District -> Administrative Area / Place -> Ward / Local Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 text-xs">
          {/* 1. State (Preset: Tamil Nadu) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-600" />
              <span>State</span>
            </label>
            <div className="relative">
              <div
                id="selector-state"
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-800 text-xs flex items-center justify-between select-none"
              >
                <span>Tamil Nadu</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  38 Dists
                </span>
              </div>
            </div>
          </div>

          {/* 2. District (Tamil Nadu Districts) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>District</span>
              </span>
              <span className="text-[9px] text-blue-700 font-extrabold uppercase">Step 1</span>
            </label>
            <div className="relative">
              <select
                id="selector-district"
                value={currentDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition pr-8 cursor-pointer shadow-2xs"
              >
                {districtsList.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} {d.name.toLowerCase() === 'chennai' ? '★ (GCC 200 Wards)' : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. Administrative Area / Place */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Building className="w-3 h-3 text-blue-600" />
                <span>Administrative Area / Place</span>
              </span>
              <span className="text-[9px] text-emerald-700 font-extrabold uppercase">Step 2</span>
            </label>
            <div className="relative">
              <select
                id="selector-place"
                value={currentPlaceId}
                onChange={(e) => handlePlaceChange(e.target.value)}
                disabled={loadingPlaces || placesList.length === 0}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition pr-8 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed shadow-2xs"
              >
                <option value="">
                  {loadingPlaces
                    ? 'Loading Places...'
                    : placesList.length > 0
                    ? `-- Select Place in ${currentDistrict} --`
                    : 'No Places Mapped'}
                </option>
                {placesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.ward_count ? `(${p.ward_count} Wards)` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 4. Ward / Local Area */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-600" />
                <span>Ward / Local Area</span>
              </span>
              <span className="text-[9px] text-purple-700 font-extrabold uppercase">Step 3</span>
            </label>
            <div className="relative">
              <select
                id="selector-ward"
                value={currentWardId}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={loadingWards || wardsList.length === 0}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition pr-8 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed shadow-2xs"
              >
                <option value="">
                  {loadingWards
                    ? 'Loading Wards...'
                    : wardsList.length > 0
                    ? `-- Select Ward (${wardsList.length} available) --`
                    : currentPlaceId
                    ? 'No sub-wards mapped'
                    : 'Select Place First'}
                </option>
                {wardsList.map((w) => (
                  <option key={w.id} value={String(w.id)}>
                    {w.name || `Ward ${w.ward_number}`} {w.risk_level ? `[${w.risk_level}]` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Status & Real Data Indicator */}
        <div className="flex items-center gap-2 pt-1 lg:pt-0 shrink-0">
          {isChennai ? (
            <div
              id="status-badge-chennai"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <div className="leading-tight">
                <span className="block text-emerald-950 font-black">GCC Active GIS</span>
                <span className="text-[10px] text-emerald-700 font-normal">200 Wards • Verified Telemetry</span>
              </div>
            </div>
          ) : (
            <div
              id="status-badge-statewide"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold shadow-2xs"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
              <div className="leading-tight">
                <span className="block text-blue-950 font-black">Official Admin Unit</span>
                <span className="text-[10px] text-blue-700 font-normal">{currentDistrict} District GIS</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
