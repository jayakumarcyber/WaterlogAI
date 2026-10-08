'use client';

import { Filter, Layers, Eye, EyeOff, Globe, MapPin, Compass, Navigation, Building2, AlertTriangle } from 'lucide-react';
import {
  getAvailableStates,
  getDistrictsForState,
  getCitiesForDistrict,
  isLocationOperational,
} from '@/data/locationHierarchy';

interface FilterPanelProps {
  layers: {
    wards: boolean;
    roads: boolean;
    drains: boolean;
    waterbodies: boolean;
    incidents: boolean;
    facilities: boolean;
    population: boolean;
    districts?: boolean;
    state?: boolean;
  };
  onToggleLayer: (layerName: string) => void;
  filters: {
    stateId: string;
    districtId: string;
    cityId?: string;
    adminType: string;
    localBody: string;
    wardId: string;
    incidentType: string;
    severity: string;
    facilityType: string;
  };
  onFilterChange: (key: string, value: string) => void;
  wardsList: Array<{ id: number; name: string; district?: string; local_body?: string; administrative_type?: string }>;
  onFocusCamera: (type: 'india' | 'tn' | 'district' | 'ward') => void;
}

export default function FilterPanel({
  layers,
  onToggleLayer,
  filters,
  onFilterChange,
  wardsList,
  onFocusCamera,
}: FilterPanelProps) {
  const states = getAvailableStates();
  const districts = getDistrictsForState(filters.stateId);
  const cities = getCitiesForDistrict(filters.stateId, filters.districtId);
  const isOperational = isLocationOperational(filters.stateId, filters.districtId, filters.cityId);

  // Filter Wards List by selected District & Admin Type
  const filteredWards = wardsList.filter((w) => {
    if (filters.districtId !== 'ALL' && w.district && w.district.toLowerCase() !== filters.districtId.toLowerCase()) {
      return false;
    }
    if (filters.adminType !== 'ALL' && w.administrative_type && w.administrative_type.toLowerCase() !== filters.adminType.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm text-xs font-sans">
      
      {/* 1. Quick Navigation Focus Controls */}
      <div>
        <h3 className="font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center space-x-1.5 text-[11px]">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Quick Map View Focus</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={() => onFocusCamera('india')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-1.5 px-2 rounded-lg border border-slate-300 transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>🇮🇳 Focus India</span>
          </button>

          <button
            onClick={() => onFocusCamera('tn')}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold py-1.5 px-2 rounded-lg border border-blue-200 transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Focus State</span>
          </button>

          <button
            onClick={() => onFocusCamera('district')}
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold py-1.5 px-2 rounded-lg border border-amber-200 transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Focus District</span>
          </button>

          <button
            onClick={() => onFocusCamera('ward')}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold py-1.5 px-2 rounded-lg border border-emerald-200 transition flex items-center justify-center space-x-1 cursor-pointer"
          >
            <span>Focus Ward</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 2. Cascading Administrative Hierarchy Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 text-[11px]">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>Administrative Hierarchy</span>
          </h3>
          {isOperational ? (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active
            </span>
          ) : (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              Unavailable
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          
          {/* Level 1: Country */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
            <input
              type="text"
              readOnly
              value="🇮🇳 India"
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 text-xs font-semibold cursor-not-allowed"
            />
          </div>

          {/* Level 2: State */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
            <select
              value={filters.stateId}
              onChange={(e) => {
                const newState = e.target.value;
                onFilterChange('stateId', newState);
                const newDists = getDistrictsForState(newState);
                const firstDist = newDists.length > 0 ? newDists[0].name : '';
                onFilterChange('districtId', firstDist);
                const firstCities = firstDist ? getCitiesForDistrict(newState, firstDist) : [];
                onFilterChange('cityId', firstCities.length > 0 ? firstCities[0].name : '');
                onFilterChange('wardId', 'ALL');
                onFilterChange('localBody', 'ALL');
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {states.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.isOperational ? '★ (Active Focus)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Level 1: District */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center justify-between">
              <span>District</span>
              {filters.districtId !== 'ALL' && (
                <span className="text-[9px] text-blue-700 font-extrabold uppercase">{filters.districtId}</span>
              )}
            </label>
            <select
              value={filters.districtId}
              onChange={(e) => {
                const newDist = e.target.value;
                onFilterChange('districtId', newDist);
                const newCities = getCitiesForDistrict('Tamil Nadu', newDist);
                onFilterChange('cityId', newCities.length > 0 ? newCities[0].name : '');
                onFilterChange('localBody', 'ALL');
                onFilterChange('wardId', 'ALL');
                onFocusCamera('district');
              }}
              disabled={districts.length === 0}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} {d.name.toLowerCase() === 'chennai' ? '★ (Active GCC)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Level 2: Administrative Area / Place */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Area / Place</label>
            <select
              value={filters.cityId || ''}
              onChange={(e) => {
                onFilterChange('cityId', e.target.value);
                onFilterChange('wardId', 'ALL');
              }}
              disabled={cities.length === 0}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">-- All Areas in {filters.districtId} --</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>


          {/* Level 5: Ward Selection (When in Chennai / operational) */}
          {isOperational && filteredWards.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Ward Number / Locality
              </label>
              <select
                value={filters.wardId}
                onChange={(e) => {
                  onFilterChange('wardId', e.target.value);
                  if (e.target.value !== 'ALL') onFocusCamera('ward');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Wards (Chennai 200 Wards)</option>
                {filteredWards.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 3. Layer Visibility Controls */}
      <div>
        <h3 className="font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center space-x-1.5 text-[11px]">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Geographic Layer Controls</span>
        </h3>
        <div className="space-y-1.5">
          {[
            { key: 'districts', label: 'District Boundaries', color: 'bg-amber-500' },
            { key: 'wards', label: 'Wards & Localities (Risk Layer)', color: 'bg-red-500' },
            { key: 'population', label: 'Population & Exposure Zones', color: 'bg-blue-600' },
            { key: 'roads', label: 'Road Network', color: 'bg-orange-500' },
            { key: 'drains', label: 'Drainage Outfalls', color: 'bg-sky-500' },
            { key: 'waterbodies', label: 'Rivers & Waterbodies', color: 'bg-blue-700' },
            { key: 'incidents', label: 'Waterlogging Incidents', color: 'bg-red-600' },
            { key: 'facilities', label: 'Facilities (Hospitals, POIs)', color: 'bg-emerald-500' },
          ].map((item) => {
            const active = (layers as any)[item.key];
            return (
              <button
                key={item.key}
                onClick={() => onToggleLayer(item.key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition border text-xs font-medium cursor-pointer ${
                  active
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {active ? <Eye className="w-3.5 h-3.5 text-blue-600 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
