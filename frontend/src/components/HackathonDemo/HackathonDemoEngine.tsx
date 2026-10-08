'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  Layers,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Users,
  Building2,
  DollarSign,
  Clock,
  Sliders,
  BarChart3,
  Info,
  Calendar,
  CheckSquare,
  TrendingDown,
  Activity,
  FileText,
  Search,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDemoEngine } from './useDemoEngine';
import type { DemoLocation, OptimizationResult } from './types';

// Dynamic import for Leaflet map to guarantee SSR safety
const DemoLeafletMap = dynamic(() => import('./DemoLeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[540px] w-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs border border-slate-200">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-700" />
        <span className="font-semibold">Loading Interactive Chennai GIS Risk Map...</span>
      </div>
    </div>
  ),
});

interface HackathonDemoEngineProps {
  apiBaseUrl?: string;
  externalSelectedPlace?: any;
}

export default function HackathonDemoEngine({
  apiBaseUrl = 'http://127.0.0.1:8000',
  externalSelectedPlace,
}: HackathonDemoEngineProps) {
  const { language, t } = useLanguage();

  const {
    horizonHours,
    handleHorizonChange,
    scenarioRainfall,
    handleScenarioRainfallChange,
    locations,
    selectedLocation,
    setSelectedLocation,
    summary,
    loading,
    analyzed,
    errorMsg,
    runRiskAnalysis,
    optCrews,
    setOptCrews,
    optBudget,
    setOptBudget,
    optTimeWindow,
    setOptTimeWindow,
    optLoading,
    optResult,
    runOptimization,
    simRainIncrease,
    setSimRainIncrease,
    simDrainageDelta,
    setSimDrainageDelta,
    simLoading,
    simResult,
    runSimulation,
  } = useDemoEngine(apiBaseUrl);

  const [inputRainfall, setInputRainfall] = useState<number>(scenarioRainfall || 30);
  const [activeTab, setActiveTab] = useState<'map' | 'priority' | 'simulation'>('map');

  // Sync external selected place from LocationSelector with demo locations
  useEffect(() => {
    if (!externalSelectedPlace || !locations || locations.length === 0) return;

    const placeName = String(
      externalSelectedPlace.name ||
      externalSelectedPlace.id ||
      externalSelectedPlace.label ||
      ''
    ).toLowerCase();

    const wardNum = externalSelectedPlace.ward_number ? String(externalSelectedPlace.ward_number) : '';

    // Look for a matching demo location
    const matched = locations.find((l) => {
      const locLower = l.location.toLowerCase();
      if (wardNum && (locLower.includes(`ward ${wardNum}`) || locLower.includes(`(${wardNum})`))) return true;
      return (
        locLower.includes(placeName) ||
        placeName.includes(locLower.split(' ')[0]) ||
        (externalSelectedPlace.id && locLower.includes(externalSelectedPlace.id.toLowerCase()))
      );
    });

    if (matched) {
      setSelectedLocation(matched);
    }
  }, [externalSelectedPlace, locations, setSelectedLocation]);

  // Handle manual scenario run
  const handleExecuteScenario = () => {
    handleScenarioRainfallChange(inputRainfall);
    // Also re-run optimization with the active scenario parameters
    runOptimization(optCrews, optBudget, inputRainfall, horizonHours);
  };

  return (
    <div className="space-y-8 font-sans text-slate-800">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. MAIN DEMO SECTION: WATERLOGGING RISK SCENARIO INPUT
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="scenario-rainfall-input"
        aria-label="Waterlogging Risk Scenario Planning"
        className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                {language === 'ta' ? 'சூழ்நிலை மாதிரி திட்டமிடல்' : 'SCENARIO PLANNING CONTROL'}
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">
                DEMO DATA / SIMULATION
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'ta' ? 'நீர் தேங்கும் இடர் மாதிரி கணிப்பு' : 'Waterlogging Risk Scenario'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'ta'
                ? 'சென்னை GCC வார்டுகளுக்கான மழை அளவு மற்றும் முன்னறிவிப்பு கால அளவை உள்ளிட்டு இடர் பகுப்பாய்வை இயக்கவும்.'
                : 'Configure rainfall scenario and forecast horizon to compute multi-factor waterlogging risk and prioritized dispatch across monitored Chennai wards.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-mono">
              Calibrated GCC Model &bull; 14 Sample Localities
            </span>
          </div>
        </div>

        {/* Interactive Controls Bar: Scenario Rainfall + Forecast Horizon + Run Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 border border-slate-200 p-4 rounded-lg">
          
          {/* 1. Scenario Rainfall Input (4 cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label htmlFor="scenario-rainfall-input-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              {language === 'ta' ? 'எதிர்பார்க்கப்படும் மழை அளவு' : 'Scenario Rainfall'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="scenario-rainfall-input-field"
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  value={inputRainfall}
                  onChange={(e) => setInputRainfall(Math.max(5, Math.min(300, parseFloat(e.target.value) || 0)))}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">mm</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 shrink-0">
                {[20, 30, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setInputRainfall(preset)}
                    className={`px-2 py-1.5 rounded text-xs font-bold border transition cursor-pointer ${
                      inputRainfall === preset
                        ? 'bg-blue-700 text-white border-blue-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Default benchmark: <strong>30 mm</strong> scenario precipitation
            </span>
          </div>

          {/* 2. Forecast Horizon Selector (4 cols) */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              {language === 'ta' ? 'முன்னறிவிப்பு கால அளவு' : 'Forecast Horizon'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {([12, 24, 48, 72] as const).map((h) => (
                <button
                  key={h}
                  type="button"
                  id={`btn-horizon-${h}h`}
                  onClick={() => handleHorizonChange(h)}
                  className={`py-2 px-1 rounded-md text-xs font-bold border text-center transition cursor-pointer ${
                    horizonHours === h
                      ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {h} Hours
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block">
              Active Horizon: <strong>{horizonHours} Hours</strong> window
            </span>
          </div>

          {/* 3. Action Execution Button (4 cols) */}
          <div className="md:col-span-4">
            <button
              id="btn-run-prediction-scenario"
              type="button"
              onClick={handleExecuteScenario}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-bold text-xs sm:text-sm text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 border border-blue-600 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${loading ? 'animate-spin' : ''}`} />
              <span>
                {loading
                  ? (language === 'ta' ? 'மாதிரி கணக்கிடப்படுகிறது...' : 'Computing Scenario...')
                  : (language === 'ta' ? 'இடர் மாதிரியை இயக்கு' : 'RUN PREDICTION SCENARIO')}
              </span>
            </button>
            <span className="text-[10px] text-slate-500 text-center block mt-1.5">
              Executes deterministic multi-factor decision model
            </span>
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            2. RISK SUMMARY CARDS (High, Medium, Low, Citizen Reports)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          
          {/* HIGH RISK */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-pulse" />
                <span>{language === 'ta' ? 'அதிக இடர்' : 'HIGH RISK'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">
                {summary?.high_risk_count ?? 3} <span className="text-xs font-semibold text-rose-700">Wards</span>
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5 font-medium">
                Immediate intervention recommended
              </div>
            </div>
            <div className="p-2.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* MEDIUM RISK */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>{language === 'ta' ? 'மிதமான இடர்' : 'MEDIUM RISK'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
                {summary?.medium_risk_count ?? 3} <span className="text-xs font-semibold text-amber-700">Wards</span>
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5 font-medium">
                Preventive clearing scheduled
              </div>
            </div>
            <div className="p-2.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* LOW RISK */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>{language === 'ta' ? 'குறைந்த இடர்' : 'LOW RISK'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
                {summary?.low_risk_count ?? 2} <span className="text-xs font-semibold text-emerald-700">Wards</span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                Standard monitoring routine
              </div>
            </div>
            <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* CITIZEN REPORTS */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-900 text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                <span>{language === 'ta' ? 'குடிமக்கள் புகார்கள்' : 'CITIZEN REPORTS'}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                0 <span className="text-xs font-semibold text-blue-800">Active</span>
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5 font-medium">
                Portal intake queue monitored
              </div>
            </div>
            <div className="p-2.5 rounded-full bg-blue-100 text-blue-800 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. CENTER STAGE: LARGE CHENNAI GIS RISK MAP + PLACE INSPECTOR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="current-risk-map"
        aria-label="Chennai Waterlogging Risk Intelligence Map & Place Inspector"
        className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[#1b365d] text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                {language === 'ta' ? 'சென்னை நீர் தேங்கும் இடர் வரைபடம்' : 'CHENNAI WATERLOGGING RISK MAP'}
              </h2>
              <p className="text-xs text-slate-600">
                {language === 'ta'
                  ? 'கள இடர் அளவீடுகள், இடப்பரப்பு நிலப்பரப்பு மற்றும் நகராட்சி வார்டு கண்காணிப்பு.'
                  : 'Interactive geospatial risk assessment, elevation contours, and municipal ward risk points.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              Active Scenario: {inputRainfall} mm &bull; {horizonHours}h Horizon
            </span>
          </div>
        </div>

        {/* 12-Column Responsive Layout: 8 cols Map + 4 cols Place Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Map Column (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="border border-slate-300 rounded-md overflow-hidden shadow-2xs relative">
              <DemoLeafletMap
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                cameraCoords={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : undefined}
                heightClass="h-[540px] min-h-[500px]"
              />

              {/* In-Map Floating Legend */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md p-2.5 shadow-md text-[10px] z-[1000] space-y-1.5 font-sans">
                <span className="font-extrabold uppercase text-slate-700 block tracking-wider">
                  Risk Legend
                </span>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0 inline-block" />
                  <span>High Risk (&ge; 60 pts)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 inline-block" />
                  <span>Medium Risk (35 - 59 pts)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0 inline-block" />
                  <span>Low Risk (&lt; 35 pts)</span>
                </div>
              </div>
            </div>

            {/* Quick helper caption */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Click on any marker on the map to inspect its municipal data profile.</span>
              <span className="font-medium">Total Monitored Localities: {locations.length}</span>
            </div>
          </div>

          {/* Place Inspector Column (4 cols) */}
          <div id="place-inspector" className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
            
            {/* Inspector Header */}
            <div className="border-b border-slate-200 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                  PLACE INSPECTOR
                </span>
                {selectedLocation && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      selectedLocation.risk_class === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : selectedLocation.risk_class === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {selectedLocation.risk_class} RISK
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-slate-900 mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{selectedLocation?.location || 'Select Location on Map'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">Greater Chennai Corporation (GCC) &bull; Zone Telemetry</p>
            </div>

            {selectedLocation ? (
              <div className="space-y-4">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Risk Score</span>
                    <span className="text-base font-black text-slate-900">{selectedLocation.risk_score} / 100</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Rainfall</span>
                    <span className="text-base font-black text-blue-900">{selectedLocation.forecast_rainfall_mm} mm</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Terrain Elevation</span>
                    <span className="text-base font-black text-slate-900">{selectedLocation.elevation_m} m MSL</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Population</span>
                    <span className="text-base font-black text-slate-900">{selectedLocation.population.toLocaleString()}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Historical Incidents</span>
                    <span className="text-base font-black text-slate-900">{selectedLocation.historical_incidents_30d} (30d)</span>
                  </div>

                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Drainage Capacity</span>
                    <span className="text-base font-black text-slate-900">{selectedLocation.drainage_capacity_percent}%</span>
                  </div>

                </div>

                {/* Recommended Municipal Action */}
                <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-xs">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block mb-0.5">
                    Recommended Action:
                  </span>
                  <p className="text-slate-800 font-semibold leading-snug">
                    {selectedLocation.recommended_action}
                  </p>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    EXPLAINABILITY: Why is this area at risk?
                ═══════════════════════════════════════════════════════════════ */}
                <div className="bg-white border border-slate-200 rounded p-3 space-y-2.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-700" />
                    <span>Why is this area at risk?</span>
                  </h4>

                  {/* Bullet Summary */}
                  <ul className="text-[11px] text-slate-700 space-y-1 list-disc pl-4 font-medium">
                    <li>High scenario rainfall volume ({selectedLocation.forecast_rainfall_mm} mm over {horizonHours}h)</li>
                    <li>Terrain elevation at {selectedLocation.elevation_m}m MSL relative to coastal runoff grade</li>
                    <li>Historical recurring incidents recorded: {selectedLocation.historical_incidents_30d} events</li>
                    <li>Vulnerable population density: {selectedLocation.population.toLocaleString()} citizens</li>
                  </ul>

                  {/* Factor Contribution Bars */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Factor Contribution Breakdown:
                    </span>
                    {selectedLocation.risk_factor_contributions.map((fc) => (
                      <div key={fc.factor} className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between text-slate-700 font-semibold">
                          <span>{fc.factor}</span>
                          <span className="font-mono text-slate-900">{fc.contribution_points} pts</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-700 h-full rounded-full"
                            style={{ width: `${Math.min(100, (fc.contribution_points / 30) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Click a marker on the map to view data profile.
              </div>
            )}

          </div>

        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. PREVENTIVE RESOURCE OPTIMIZATION MODULE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="resource-optimization"
        aria-label="Preventive Resource Optimization"
        className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[#1b365d] text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                Preventive Resource Optimization
              </h2>
              <p className="text-xs text-slate-600">
                Operations research mathematical knapsack dispatch matching equipment and municipal crews to active risk.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => runOptimization(optCrews, optBudget, inputRainfall, horizonHours)}
            disabled={optLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optLoading ? 'animate-spin' : ''}`} />
            <span>{optLoading ? 'Optimizing...' : 'Recompute Optimization'}</span>
          </button>
        </div>

        {/* Configuration Strip: Active Scenario + Available Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs">
          
          {/* Active Scenario Box */}
          <div className="space-y-2">
            <span className="font-extrabold text-blue-900 uppercase text-[10px] tracking-wider block">
              ACTIVE SCENARIO CONTEXT
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-800 font-semibold">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Scenario Rainfall</span>
                <span className="text-base font-black text-blue-900">{inputRainfall} mm</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Forecast Horizon</span>
                <span className="text-base font-black text-slate-900">{horizonHours} Hours</span>
              </div>
            </div>
          </div>

          {/* Available Resources Box */}
          <div className="space-y-2">
            <span className="font-extrabold text-slate-700 uppercase text-[10px] tracking-wider block">
              AVAILABLE MUNICIPAL RESOURCES
            </span>
            <div className="grid grid-cols-3 gap-2 text-slate-800 font-semibold">
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Budget</span>
                <span className="text-sm font-black text-emerald-800">₹{optBudget.toLocaleString()}</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Time Window</span>
                <span className="text-sm font-black text-slate-900">{optTimeWindow} hrs</span>
              </div>
              <div className="bg-white p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Crews</span>
                <span className="text-sm font-black text-slate-900">{optCrews}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Benefit Comparison Strip */}
        {optResult && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                BASELINE UNPLANNED BENEFIT
              </span>
              <div className="text-2xl font-black text-slate-700 mt-1">
                {optResult.baseline_unplanned_benefit ?? 142.0} <span className="text-xs font-semibold">pts</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard unprioritized first-come dispatch</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
              <span className="text-[10px] font-black text-emerald-800 uppercase block">
                OPTIMIZED BENEFIT (OR-TOOLS / KNAPSACK)
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {optResult.optimized_benefit ?? 295.0} <span className="text-xs font-semibold">pts</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Maximum risk mitigation per rupee spent</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <span className="text-[10px] font-black text-blue-900 uppercase block">
                EFFICIENCY GAIN / BENEFIT DELTA
              </span>
              <div className="text-2xl font-black text-blue-900 mt-1">
                +{optResult.benefit_delta ?? 153.0} <span className="text-xs font-semibold">pts (+108%)</span>
              </div>
              <span className="text-[10px] text-blue-700 mt-0.5 block">Mathematical optimization dividend</span>
            </div>

          </div>
        )}

        {/* Recommended Preventive Actions Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Recommended Preventive Actions
            </h3>
            <span className="text-[11px] text-slate-500">
              Allocated Cost: ₹{optResult?.total_cost_inr?.toLocaleString() ?? '72,000'} &bull; Remaining: ₹{optResult?.remaining_budget_inr?.toLocaleString() ?? '13,000'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Recommended Intervention</th>
                  <th className="py-2.5 px-3">Assigned Crew</th>
                  <th className="py-2.5 px-3 text-right">Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {optResult?.selected_locations && optResult.selected_locations.length > 0 ? (
                  optResult.selected_locations.map((loc, idx) => (
                    <tr key={loc.location} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">#{loc.priority_rank || idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{loc.location}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            loc.risk_class === 'HIGH'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : loc.risk_class === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {loc.risk_class} ({loc.risk_score})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{loc.recommended_action}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{loc.crew_assigned} Crew Unit</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">₹{loc.action_cost_inr.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400">
                      No optimization assignments computed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. WHAT-IF FLOOD SCENARIO PLANNING
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="simulation-decision-support"
        aria-label="What-If Flood Scenario Simulation"
        className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              What-If Flood Scenario
            </h2>
            <p className="text-xs text-slate-600">
              Municipal planning tool for evaluating monsoon surge thresholds and culvert capacity reduction.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            Municipal Stress-Testing Protocol
          </span>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          
          {/* Rainfall Increase Slider/Buttons */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Rainfall Increase</span>
              <span className="text-rose-800 font-bold font-mono text-xs">+{simRainIncrease}% Surge</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 10, 20, 30, 50].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => {
                    setSimRainIncrease(inc);
                    runSimulation(inc, simDrainageDelta);
                  }}
                  className={`py-1.5 text-xs font-bold rounded border transition cursor-pointer text-center ${
                    simRainIncrease === inc
                      ? 'bg-rose-700 text-white border-rose-800 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {inc === 0 ? '0%' : `+${inc}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Drainage Capacity Delta */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Drainage Capacity</span>
              <span className="text-amber-800 font-bold font-mono text-xs">
                {simDrainageDelta === 0 ? 'Current (100%)' : `${simDrainageDelta}% Capacity`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[-20, -10, 0, 10, 20].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => {
                    setSimDrainageDelta(delta);
                    runSimulation(simRainIncrease, delta);
                  }}
                  className={`py-1.5 text-xs font-bold rounded border transition cursor-pointer text-center ${
                    simDrainageDelta === delta
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {delta === 0 ? 'Current' : delta > 0 ? `+${delta}%` : `${delta}%`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Simulation Outcome Card */}
        {simResult && (
          <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-xs">
                Current Risk &rarr; Simulated Risk Outcome:
              </span>
              <span className="text-xs font-bold text-rose-800">
                High-Risk Wards: {simResult.baseline_high_risk_count} &rarr; {simResult.simulated_high_risk_count} ({simResult.high_risk_delta >= 0 ? `+${simResult.high_risk_delta}` : simResult.high_risk_delta} Wards)
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Under this simulated scenario (+{simRainIncrease}% rainfall surge and {simDrainageDelta}% drainage delta), runoff accumulation exceeds drainage throughput in {simResult.simulated_high_risk_count} monitored localities. Preventive pre-positioning of heavy dewatering assets is recommended in Perambur, Velachery, and Vyasarpadi.
            </p>
          </div>
        )}

      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. PRIORITY ACTION QUEUE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="priority-actions"
        aria-label="Priority Action Queue"
        className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
              Priority Action Queue
            </h2>
            <p className="text-xs text-slate-600">
              Rank-ordered municipal wards prioritized by composite flood risk, population exposure, and critical facility density.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md shrink-0">
            {locations.length} Locations Monitored
          </span>
        </div>

        {/* Priority Table */}
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Population</th>
                <th className="py-2.5 px-3">Facilities</th>
                <th className="py-2.5 px-3">Recommended Action</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {locations.map((loc) => {
                const isSelected = selectedLocation?.location === loc.location;
                return (
                  <tr
                    key={loc.location}
                    onClick={() => {
                      setSelectedLocation(loc);
                      const mapEl = document.getElementById('current-risk-map');
                      if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`cursor-pointer transition hover:bg-blue-50/70 ${
                      isSelected ? 'bg-blue-50 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[11px]">
                        #{loc.priority_rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{loc.location}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            loc.risk_class === 'HIGH'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : loc.risk_class === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {loc.risk_class}
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-xs">
                          {loc.risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                      {loc.population.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700">
                      {loc.critical_facilities}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">
                      {loc.recommended_action}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        loc.risk_class === 'HIGH'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {loc.risk_class === 'HIGH' ? 'Scheduled' : 'Standby'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </section>

    </div>
  );
}
