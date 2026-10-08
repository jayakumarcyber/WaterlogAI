'use client';

import { useState, useEffect } from 'react';
import { Sliders, Play, RotateCcw, CloudRain, Users, DollarSign, Clock, ArrowRight } from 'lucide-react';

interface SimulatorProps {
  apiBaseUrl: string;
  onSimulationChange?: (simData: any) => void;
}

export default function WhatIfSimulatorPanel({ apiBaseUrl, onSimulationChange }: SimulatorProps) {
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [budget, setBudget] = useState<number>(50000);
  const [hours, setHours] = useState<number>(24);
  const [teams, setTeams] = useState<number>(3);
  const [presets, setPresets] = useState<any[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/v1/simulation/scenarios`)
      .then((res) => res.json())
      .then((data) => setPresets(data))
      .catch((err) => console.error('Failed to fetch simulation presets:', err));
    
    runSimulation(1.0, 50000, 24, 3);
  }, [apiBaseUrl]);

  const runSimulation = (
    rMult: number = rainMultiplier,
    bAmt: number = budget,
    hAmt: number = hours,
    tAmt: number = teams
  ) => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/v1/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall_multiplier: rMult,
        available_budget: bAmt,
        available_hours: hAmt,
        available_teams: tAmt,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSimResult(data);
        if (onSimulationChange) onSimulationChange(data);
      })
      .catch((err) => console.error('Failed to run simulation:', err))
      .finally(() => setLoading(false));
  };

  const applyPreset = (preset: any) => {
    setActivePreset(preset.preset_id);
    setRainMultiplier(preset.rainfall_multiplier);
    setBudget(preset.available_budget_inr);
    setHours(preset.available_hours);
    setTeams(preset.available_teams);
    runSimulation(preset.rainfall_multiplier, preset.available_budget_inr, preset.available_hours, preset.available_teams);
  };

  const handleReset = () => {
    setActivePreset(null);
    setRainMultiplier(1.0);
    setBudget(50000);
    setHours(24);
    setTeams(3);
    runSimulation(1.0, 50000, 24, 3);
  };

  const b = simResult?.baseline?.metrics || {};
  const s = simResult?.simulated_scenario_results || {};
  const delta = simResult?.comparison_delta || {};

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
            <Sliders className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">What-If Scenario Simulator</h3>
              <span className="text-[10px] text-amber-800 bg-amber-50 font-medium px-2 py-0.5 rounded border border-amber-200">
                Demo Scenario — Not an Official Municipal Forecast
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Test extreme rainfall intensity scenarios and resource constraints to evaluate municipal response capacity.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={handleReset}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-slate-300 transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Triggers */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Preset Scenario Triggers
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const isActive = activePreset === p.preset_id;
            return (
              <button
                key={p.preset_id}
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg">
        
        {/* Rainfall Multiplier */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 font-semibold">
            <span className="flex items-center space-x-1 text-xs">
              <CloudRain className="w-4 h-4 text-cyan-600" />
              <span>Rainfall Multiplier</span>
            </span>
            <span className="font-bold text-cyan-700">{rainMultiplier}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={rainMultiplier}
            onChange={(e) => setRainMultiplier(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
        </div>

        {/* Budget */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 font-semibold">
            <span className="flex items-center space-x-1 text-xs">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Budget (₹)</span>
            </span>
            <span className="font-bold text-emerald-700">₹{budget.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="5000"
            max="100000"
            step="5000"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Hours */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 font-semibold">
            <span className="flex items-center space-x-1 text-xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Working Hours</span>
            </span>
            <span className="font-bold text-blue-700">{hours} hrs</span>
          </div>
          <input
            type="range"
            min="6"
            max="48"
            step="6"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Teams */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 font-semibold">
            <span className="flex items-center space-x-1 text-xs">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Crews Available</span>
            </span>
            <span className="font-bold text-purple-700">{teams} Crews</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={teams}
            onChange={(e) => setTeams(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

      </div>

      <div className="flex justify-end">
        <button
          onClick={() => runSimulation(rainMultiplier, budget, hours, teams)}
          disabled={loading}
          className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition shadow-xs disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{loading ? 'Simulating Pipeline...' : 'RUN SIMULATION'}</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Grid: Baseline vs Scenario */}
      {simResult && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Baseline Observation vs. Simulated Scenario Comparison
            </h4>
            <span className="text-[10px] text-amber-800 bg-amber-50 font-medium px-2 py-0.5 rounded border border-amber-200">
              Demo Scenario — Not an Official Municipal Forecast
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            
            {/* High-Risk Wards */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">High-Risk Wards</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">{b.high_risk_wards_count || 0}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-red-700 font-bold text-sm">{s.high_risk_wards_count || 0}</span>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">{delta.high_risk_wards_delta} Δ</span>
            </div>

            {/* Critical P1 Wards */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">P1 Priority Wards</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">{b.critical_p1_wards_count || 0}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-amber-800 font-bold text-sm">{s.critical_p1_wards_count || 0}</span>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">{delta.critical_p1_wards_delta} Δ</span>
            </div>

            {/* Potential Pop Exposure */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Pop Exposure</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">~{(b.total_potential_exposure || 0).toLocaleString()}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-purple-800 font-bold text-sm">~{(s.total_potential_exposure || 0).toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">{delta.potential_exposure_delta} Δ</span>
            </div>

            {/* Selected Interventions */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Actions</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">{b.selected_actions_count || 0}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 font-bold text-sm">{s.selected_actions_count || 0}</span>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">{delta.selected_actions_delta} Δ</span>
            </div>

            {/* Used Budget */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Budget Used</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">₹{(b.used_budget_inr || 0).toLocaleString()}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-700 font-bold text-sm">₹{(s.used_budget_inr || 0).toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-semibold">{delta.used_budget_delta_inr} Δ</span>
            </div>

          </div>

          <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
            {simResult.assumptions_disclaimer}
          </p>
        </div>
      )}

    </div>
  );
}
