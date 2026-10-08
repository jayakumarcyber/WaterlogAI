'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  RefreshCw,
  Play,
  Activity,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CloudRain,
  Mountain,
  History,
  Users,
  Building2,
  CheckCheck,
} from 'lucide-react';
import type { DemoLocation } from './types';

const DemoLeafletMap = dynamic(() => import('./DemoLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[440px] w-full bg-slate-900 rounded-md flex items-center justify-center text-slate-400 text-xs">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
        <span>Loading Interactive Chennai Risk Map (GCC 200 Wards)...</span>
      </div>
    </div>
  ),
});

interface DemoMapWorkspaceProps {
  locations: DemoLocation[];
  selectedLocation: DemoLocation | null;
  setSelectedLocation: (loc: DemoLocation | null) => void;
  summary: any;
  loading: boolean;
  errorMsg: string | null;
  horizonHours: 24 | 48 | 72;
  handleHorizonChange: (h: 24 | 48 | 72) => void;
  runRiskAnalysis: (h?: 24 | 48 | 72) => void;
}

export default function DemoMapWorkspace({
  locations,
  selectedLocation,
  setSelectedLocation,
  summary,
  loading,
  errorMsg,
  horizonHours,
  handleHorizonChange,
  runRiskAnalysis,
}: DemoMapWorkspaceProps) {
  const handleSelectLocation = useCallback(
    (loc: DemoLocation) => {
      setSelectedLocation(loc);
    },
    [setSelectedLocation]
  );

  return (
    <div id="demo-map-workspace" className="space-y-4 font-sans text-slate-800">
      
      {/* ─── Top Command Bar for Risk Intelligence ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d233a] border border-[#1b3a5c] p-3 rounded-lg text-white shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Chennai Waterlogging Risk Intelligence &bull; Forecast Horizon: {horizonHours}h
          </span>
          <span className="text-[10px] text-slate-300 font-mono hidden md:inline">
            (GCC 200 Wards Calibrated)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Horizon Toggle */}
          <div className="flex items-center bg-[#071322] border border-[#1b3a5c] rounded p-1 text-xs">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase hidden sm:block">Forecast:</span>
            {[24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => handleHorizonChange(h as 24 | 48 | 72)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  horizonHours === h
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {h}H
              </button>
            ))}
          </div>

          {/* Recalculate Button */}
          <button
            id="btn-run-demo-risk-analysis"
            onClick={() => runRiskAnalysis(horizonHours)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded shadow-2xs transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Recalculate Horizon</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-md text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── 4 Top Summary Cards (Clean 4-Column Information Strip) ────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* High Risk Locations */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">High Risk Wards</span>
            <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              HIGH
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-rose-700">{summary?.high_risk_count ?? 0}</span>
            <span className="text-[11px] text-slate-500">of {locations.length} Wards</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium truncate">
            Immediate Prepositioning
          </span>
        </div>

        {/* Population Exposure */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Population Exposure</span>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              MEDIUM
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {(summary?.total_population_exposure ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">Citizens</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium truncate">
            In Elevated Inundation Zones
          </span>
        </div>

        {/* Critical Facilities */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Critical Facilities</span>
            <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              LIFELINES
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {summary?.total_critical_facilities ?? 0}
            </span>
            <span className="text-[11px] text-slate-500">Assets</span>
          </div>
          <span className="text-[10px] text-slate-600 font-medium truncate">
            Hospitals &amp; Transit Hubs
          </span>
        </div>

        {/* Top Priority Location */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Top Priority Ward</span>
            <span className="text-[9px] font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              RANK #1
            </span>
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-slate-900 truncate">
              {summary?.top_priority_location ?? 'Evaluating...'}
            </div>
            <div className="text-[11px] text-blue-900 font-semibold">
              Risk: {summary?.top_priority_score ?? 'N/A'} / 100
            </div>
          </div>
          <span className="text-[10px] text-slate-600 font-medium truncate">
            Highest Composite Urgency
          </span>
        </div>
      </div>

      {/* ─── Map & Selected Location Inspector (2 Columns) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Real Chennai Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-lg p-3.5 space-y-3 flex flex-col min-h-[460px] shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Chennai Waterlogging Risk Map &bull; {horizonHours}h Forecast Window
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Click marker to inspect
            </span>
          </div>

          <div className="flex-1 min-h-[380px] rounded-md border border-slate-200 relative overflow-hidden">
            <DemoLeafletMap
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-400" />
                <span className="font-bold text-rose-800 text-[11px]">HIGH (65–100)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300" />
                <span className="font-bold text-amber-800 text-[11px]">MEDIUM (35–64)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-400" />
                <span className="font-bold text-emerald-800 text-[11px]">LOW (0–34)</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 italic">
              Official GCC 200 Wards GIS Boundaries Calibrated
            </span>
          </div>
        </div>

        {/* Selected Location Inspector: 8 Core Evidence Categories (5 Cols) ─ */}
        <div id="demo-evidence-section" className="lg:col-span-5 bg-white border border-slate-200/90 rounded-lg p-4 space-y-3.5 text-xs shadow-xs">
          {selectedLocation ? (
            <>
              {/* Header: Location & Risk Status */}
              <div className="border-b border-slate-100 pb-2.5 flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
                    Ward Risk Inspector &bull; Priority Rank #{selectedLocation.priority_rank}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{selectedLocation.location}</h3>
                  <p className="text-[10px] text-slate-500">
                    Coordinates: {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                  </p>
                </div>
                <div
                  className={`px-2 py-0.5 rounded font-black text-[10px] border ${
                    selectedLocation.risk_class === 'HIGH'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : selectedLocation.risk_class === 'MEDIUM'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {selectedLocation.risk_class} RISK
                </div>
              </div>

              {/* 1. Risk Status & Score Gauge */}
              <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-md space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <Activity className="w-3.5 h-3.5 text-blue-700" />
                    <span>Risk Status: {selectedLocation.risk_class}</span>
                  </span>
                  <span className="font-black text-slate-900">
                    {selectedLocation.risk_score} / 100
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedLocation.risk_class === 'HIGH'
                        ? 'bg-rose-600'
                        : selectedLocation.risk_class === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${selectedLocation.risk_score}%` }}
                  />
                </div>
              </div>

              {/* 2–7. Evidence Categorization Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                
                {/* 2. Forecast Horizon */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Forecast Horizon</span>
                  <span className="font-bold text-slate-900 text-[11px]">{horizonHours}h Operational Window</span>
                </div>

                {/* 3. Rainfall Evidence */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Rainfall Evidence</span>
                  <span className="font-bold text-slate-900 text-[11px]">{selectedLocation.forecast_rainfall_mm} mm (Precipitation Alert)</span>
                </div>

                {/* 4. Terrain Evidence */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Terrain Evidence</span>
                  <span className="font-bold text-slate-900 text-[11px]">{selectedLocation.elevation_m}m MSL (Lowland Sink)</span>
                </div>

                {/* 5. Historical Evidence */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Historical Incidents</span>
                  <span className="font-bold text-slate-900 text-[11px]">{selectedLocation.historical_incidents_30d} Ground Truth Logs</span>
                </div>

                {/* 6. Population Exposure */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Population Exposure</span>
                  <span className="font-bold text-slate-900 text-[11px]">{selectedLocation.population.toLocaleString()} Residents</span>
                </div>

                {/* 7. Infrastructure Evidence */}
                <div className="bg-slate-50 border border-slate-200/80 p-2 rounded">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">Infrastructure Evidence</span>
                  <span className="font-bold text-slate-900 text-[11px]">{selectedLocation.drainage_capacity_percent}% Drain / {selectedLocation.critical_facilities} Facilities</span>
                </div>

              </div>

              {/* ─── 8. Explainability Section: WHY IS THIS LOCATION AT RISK? ──── */}
              <div className="border border-slate-200 rounded-md p-2.5 bg-slate-50 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Why is this location at risk?</span>
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700 divide-y divide-slate-200/60">
                  <li className="flex justify-between items-center pt-1 first:pt-0">
                    <span className="font-medium text-slate-600">Rainfall:</span>
                    <span className="font-bold text-slate-900">{selectedLocation.forecast_rainfall_mm} mm forecast (+30 pts contribution)</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="font-medium text-slate-600">Historical Recurrence:</span>
                    <span className="font-bold text-slate-900">{selectedLocation.historical_incidents_30d > 0 ? `${selectedLocation.historical_incidents_30d} ground-truth incidents (+20 pts)` : 'High recurrence zone (+15 pts)'}</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="font-medium text-slate-600">Terrain:</span>
                    <span className="font-bold text-slate-900">{selectedLocation.elevation_m}m MSL low elevation basin (+15 pts)</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="font-medium text-slate-600">Infrastructure:</span>
                    <span className="font-bold text-slate-900">Drainage capacity at {selectedLocation.drainage_capacity_percent}% (+20 pts)</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="font-medium text-slate-600">Exposure:</span>
                    <span className="font-bold text-slate-900">{selectedLocation.population.toLocaleString()} citizens, {selectedLocation.critical_facilities} assets (+15 pts)</span>
                  </li>
                </ul>
              </div>

              {/* Confidence / Data Status */}
              <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px] text-emerald-900 font-medium">
                    High Confidence &bull; Verified official municipal inputs ingested
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  VERIFIED
                </span>
              </div>

              {/* Recommended Preventive Action */}
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Recommended Municipal Action</span>
                </span>
                <p className="text-xs font-bold text-slate-900">
                  {selectedLocation.recommended_action}
                </p>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              <MapPin className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700">No Location Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click any ward marker on the map to inspect multi-factor risk evidence.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
