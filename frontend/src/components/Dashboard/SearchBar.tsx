'use client';

import { useState } from 'react';
import { Search, MapPin, Building2, Globe, Flag } from 'lucide-react';
import { searchAllLocations, SearchableLocation } from '@/data/locationHierarchy';
import { getApiBaseUrl } from '@/lib/api';

interface SearchBarProps {
  geoData: {
    wards: any;
    roads: any;
    drains: any;
    facilities: any;
    incidents: any;
    districts?: any;
    state?: any;
  };
  onSelectSearchResult: (feature: any) => void;
  onSelectLocation?: (loc: { country: string; state: string; district: string; city: string }) => void;
  apiBaseUrl?: string;
  selectedDistrict?: string;
}

export default function SearchBar({
  geoData,
  onSelectSearchResult,
  onSelectLocation,
  apiBaseUrl = getApiBaseUrl(),
  selectedDistrict = 'ALL',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim() || text.length < 2) {
      setResults([]);
      return;
    }

    const term = text.toLowerCase().trim();
    const matches: any[] = [];

    // 1. Search Hierarchical India Locations (Country, State/UT, District, City/Town)
    const locMatches = searchAllLocations(term, 8);
    locMatches.forEach((loc: SearchableLocation) => {
      matches.push({
        label: loc.label,
        type: loc.type,
        location: {
          country: loc.country,
          state: loc.state,
          district: loc.district,
          city: loc.city,
        },
        feature: {
          id: `loc-${loc.type}-${loc.name}`,
          type: 'Feature',
          geometry: { type: 'Point', coordinates: loc.coordinates },
          properties: {
            name: loc.name,
            state: loc.state,
            district: loc.district,
            city: loc.city,
            type: loc.type,
            level: loc.level,
            isOperational: loc.isOperational,
          },
        },
      });
    });

    // 2. Query dynamic locations search endpoint
    try {
      const qParams = `?q=${encodeURIComponent(text)}${
        selectedDistrict && selectedDistrict !== 'ALL' ? `&district=${selectedDistrict}` : ''
      }`;
      let response: Response;
      try {
        response = await fetch(`${apiBaseUrl}/api/v1/locations/search${qParams}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined });
      } catch {
        response = await fetch(`/api/v1/locations/search${qParams}`);
      }
      if (response.ok) {
        const apiMatches = await response.json();
        if (Array.isArray(apiMatches) && apiMatches.length > 0) {
          apiMatches.slice(0, 6).forEach((am: any) => {
            matches.push({
              label: am.label || am.name,
              type: am.type || 'place',
              location: {
                country: 'India',
                state: 'Tamil Nadu',
                district: am.district_name || 'Chennai',
                city: am.place_id || am.district_name,
                place_id: am.place_id,
                ward_id: am.ward_id,
              },
              feature: {
                id: am.id,
                type: 'Feature',
                geometry: am.geometry || {
                  type: 'Point',
                  coordinates: [am.centroid?.lon || 80.24, am.centroid?.lat || 13.11],
                },
                properties: {
                  id: am.ward_id || am.place_id || am.id,
                  name: am.label,
                  district: am.district_name,
                  district_id: am.district_id,
                  type: am.type,
                  bounds: am.bounds,
                  centroid_lat: am.centroid?.lat,
                  centroid_lon: am.centroid?.lon,
                  data_status: am.data_status || 'REAL',
                },
              },
            });
          });
        }
      }
    } catch {
      // Backend search optional; fallback to hierarchical & local features
    }

    // 3. Search operational GCC Wards if loaded
    if (geoData.wards?.features) {
      geoData.wards.features.forEach((f: any) => {
        const name = f.properties?.name || '';
        const city = f.properties?.city || f.properties?.district || 'Chennai';
        const code = f.properties?.ward_code || '';
        const zone = f.properties?.zone_name || '';
        if (
          name.toLowerCase().includes(term) ||
          city.toLowerCase().includes(term) ||
          code.toLowerCase().includes(term) ||
          zone.toLowerCase().includes(term)
        ) {
          matches.push({
            label: `GCC Ward: ${name} (${zone || city})`,
            type: 'ward',
            location: {
              country: 'India',
              state: 'Tamil Nadu',
              district: 'Chennai',
              city: 'Chennai',
            },
            feature: f,
          });
        }
      });
    }

    setResults(matches.slice(0, 8));
  };

  const handleSelect = (item: any) => {
    setQuery(item.label);
    setResults([]);

    // 1. If location is attached, trigger hierarchical selector update
    if (item.location && onSelectLocation) {
      onSelectLocation(item.location);
    }

    // 2. Pan camera / select feature
    if (item.feature) {
      onSelectSearchResult(item.feature);
    }
  };

  return (
    <div className="relative w-full max-w-sm font-sans">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search India, Tamil Nadu, Chennai, Kochi, Mumbai..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-2xs transition"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 text-xs divide-y divide-slate-100">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 text-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2 truncate">
                {r.type === 'country' ? (
                  <Flag className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : r.type === 'state' ? (
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                ) : r.type === 'district' ? (
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                ) : r.type === 'ward' ? (
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="truncate font-medium">{r.label}</span>
              </div>
              {r.location?.isOperational && (
                <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Operational
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
