'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Cpu, DollarSign, Clock, Users, CheckCircle, AlertTriangle, Sparkles, CloudRain, MapPin, ArrowRight } from 'lucide-react';

interface ResourcePlannerProps {
  apiBaseUrl: string;
  scenarioRainfall?: number;
  forecastHorizon?: number;
  selectedDistrict?: string;
  selectedPlaceId?: string;
  selectedWardId?: number | string | null;
  selectedFeature?: any;
  lastScenarioTimestamp?: number;
}

export default function ResourcePlannerPanel({
  apiBaseUrl,
  scenarioRainfall = 30,
  forecastHorizon = 12,
  selectedDistrict = 'Chennai',
  selectedPlaceId,
  selectedWardId,
  selectedFeature,
  lastScenarioTimestamp,
}: ResourcePlannerProps) {
  const [budget, setBudget] = useState<number>(85000);
  const [hours, setHours] = useState<number>(30);
  const [teamsCount, setTeamsCount] = useState<number>(5);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derive human-readable location label
  const locationLabel = (() => {
    if (selectedWardId) {
      return `Ward ${selectedWardId}${selectedFeature?.properties?.name ? ` (${selectedFeature.properties.name})` : ''}`;
    }
    if (selectedFeature?.properties?.name) {
      return selectedFeature.properties.name;
    }
    if (selectedPlaceId) {
      return selectedPlaceId.replace('-', ' ').toUpperCase();
    }
    return selectedDistrict || 'Chennai Metropolitan Area';
  })();

  const runOptimization = useCallback(async () => {
    setLoading(true);
    setError(null);

    const payload = {
      available_budget: budget,
      available_hours: hours,
      available_teams_count: teamsCount,
      scenario_rainfall_mm: scenarioRainfall,
      horizon_hours: forecastHorizon,
      district: selectedDistrict || 'Chennai',
      place_id: selectedPlaceId || null,
      ward_id: selectedWardId || null,
    };

    try {
      let res: Response;
      try {
        res = await fetch(`${apiBaseUrl}/api/v1/optimization/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (directErr) {
        // Fallback to Next.js proxy route
        res = await fetch('/api/v1/optimization/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setOptimizationResult(data);
    } catch (err: any) {
      console.error('Failed to run OR-Tools optimization:', err);
      setError(err.message || 'Optimization solver failed');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, budget, hours, teamsCount, scenarioRainfall, forecastHorizon, selectedDistrict, selectedPlaceId, selectedWardId]);

  // Re-run whenever scenario, constraints, or location changes
  useEffect(() => {
    runOptimization();
  }, [runOptimization, lastScenarioTimestamp]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs">
      
      {/* ─── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg shrink-0">
            <Cpu className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm tracking-tight">
                RESOURCE OPTIMIZATION ENGINE
              </h3>
              {/* Dynamic Accurate Scenario Tag */}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 uppercase">
                SCENARIO / WHAT-IF: User-defined rainfall input — not observed weather
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              OR-Tools Mixed-Integer Linear Programming (MILP) knapsack solver for crew dispatch and proactive flood mitigation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Google OR-Tools MILP</span>
          </span>
        </div>
      </div>

      {/* ─── Active What-If Scenario Banner (Connected to Top Bar) ───────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              ACTIVE WHAT-IF SCENARIO
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-400">Context:</span>
            <span className="font-bold text-blue-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400 inline" />
              <span>{locationLabel}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Scenario Rainfall</span>
            <span className="text-base font-black text-blue-400">{scenarioRainfall} mm</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Scenario Horizon</span>
            <span className="text-base font-black text-cyan-400">{forecastHorizon} Hours</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active District</span>
            <span className="text-sm font-bold text-slate-200 truncate block">{selectedDistrict || 'Chennai'}</span>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Solver Pipeline</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Synchronized</span>
              <ArrowRight className="w-3 h-3 text-emerald-400 inline" />
            </span>
          </div>
        </div>
      </div>

      {/* ─── Resource Constraint Controls (Configurable by User) ────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            RESOURCE CONSTRAINTS
          </span>
          <span className="text-[10px] text-slate-400">Adjust parameters to re-run constraint satisfaction</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
          
          {/* Available Budget Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1.5 font-bold">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Available Budget</span>
              </span>
              <span className="font-black text-emerald-700 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ₹{budget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>₹10,000</span>
              <span>₹85,000 (Target)</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          {/* Available Time Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1.5 font-bold">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Available Time</span>
              </span>
              <span className="font-black text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {hours} hrs
              </span>
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
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>6 hrs</span>
              <span>30 hrs (Target)</span>
              <span>48 hrs</span>
            </div>
          </div>

          {/* Available Crews Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1.5 font-bold">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Available Crews</span>
              </span>
              <span className="font-black text-purple-700 text-xs bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {teamsCount} Crews
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={teamsCount}
              onChange={(e) => setTeamsCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-medium">
              <span>1 Crew</span>
              <span>5 Crews (Target)</span>
              <span>10 Crews</span>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-[11px] text-slate-500">
          *Live mathematical computation updates automatically on constraint modification.
        </span>
        <button
          onClick={runOptimization}
          disabled={loading}
          className="bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-bold px-4 py-2 rounded-lg flex items-center space-x-2 text-xs transition shadow-sm cursor-pointer"
        >
          <Cpu className="w-4 h-4" />
          <span>{loading ? 'Solving MILP Knapsack...' : 'RE-RUN OPTIMIZATION'}</span>
        </button>
      </div>

      {/* Error / Infeasibility Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center space-x-2 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {optimizationResult?.optimization_status === 'NO_FEASIBLE_PLAN' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-lg flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">No Feasible Allocation Under Current Constraints</h4>
            <p className="text-[11px] text-amber-800 pt-0.5">{optimizationResult.infeasibility_reason}</p>
          </div>
        </div>
      )}

      {/* ─── Real Dynamic Calculations: Baseline vs Optimized Benefit ──────── */}
      {optimizationResult && optimizationResult.optimization_status !== 'NO_FEASIBLE_PLAN' && (
        <div className="space-y-4 pt-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            
            {/* Baseline Unplanned Benefit Card */}
            <div className="bg-slate-50 border border-slate-300 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold block tracking-wider">
                BASELINE UNPLANNED BENEFIT
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-black text-slate-800 text-xl">
                  {optimizationResult.comparison?.unplanned_baseline_benefit ?? 0}
                </span>
                <span className="text-xs font-semibold text-slate-500">pts</span>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Sequential first-come dispatch without MILP optimization.
              </p>
            </div>

            {/* OR-Tools Optimized Benefit Card */}
            <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-indigo-900 text-[10px] uppercase font-bold block tracking-wider">
                  OR-TOOLS OPTIMIZED BENEFIT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-900">
                  {optimizationResult.comparison?.estimated_potential_impact_reduction || 'OPTIMAL'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-black text-indigo-900 text-xl">
                  {optimizationResult.comparison?.optimized_plan_benefit ?? 0}
                </span>
                <span className="text-xs font-semibold text-indigo-700">pts</span>
              </div>
              <p className="text-[10px] text-indigo-700 font-medium">
                +{optimizationResult.comparison?.benefit_gain_points ?? 0} pts gain over baseline under same budget.
              </p>
            </div>

            {/* Optimized Resource Usage Card */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-1">
              <span className="text-emerald-900 text-[10px] uppercase font-bold block tracking-wider">
                OPTIMIZED RESOURCE USAGE
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-black text-emerald-900 text-base">
                  ₹{optimizationResult.used_budget_inr?.toLocaleString() ?? 0}
                </span>
                <span className="text-[11px] font-normal text-emerald-700">used</span>
              </div>
              <div className="text-[10.5px] font-bold text-emerald-800 flex items-center justify-between pt-0.5">
                <span>{optimizationResult.used_teams_count} of {teamsCount} Crews Assigned</span>
                <span>{hours} hrs limit</span>
              </div>
            </div>

          </div>

          {/* Context Confirmation Banner */}
          <div className="bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg flex items-center justify-between text-[11px] text-blue-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Optimization calculated for active <strong>{scenarioRainfall} mm / {forecastHorizon}h</strong> scenario at <strong>{locationLabel}</strong>.</span>
            </span>
            <span className="text-[10px] font-bold uppercase text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              Run ID: {optimizationResult.run_id}
            </span>
          </div>

          {/* ─── Recommended Crew Assignment & Intervention Sequence ───────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                RECOMMENDED CREW ASSIGNMENT & INTERVENTION SEQUENCE ({optimizationResult.selected_actions_count || 0} Actions Selected)
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">
                Remaining Budget: ₹{optimizationResult.remaining_budget_inr?.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              {optimizationResult.selected_actions?.map((act: any) => (
                <div key={act.action_id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 hover:border-slate-300 transition">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs">{act.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                        act.priority_level?.includes('CRITICAL') || act.priority_level?.includes('P1')
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : act.priority_level?.includes('HIGH') || act.priority_level?.includes('P2')
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {act.priority_level}
                      </span>
                    </div>
                    <span className="font-black text-emerald-800 text-xs shrink-0">
                      ₹{act.estimated_cost_inr?.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px] text-slate-600 pt-0.5">
                    <div>
                      Assigned: <strong className="text-purple-700 font-semibold">{act.assigned_team_name}</strong>
                    </div>
                    <div>
                      Est. Duration: <strong className="text-slate-800">{act.estimated_duration_hours} hrs</strong>
                    </div>
                    <div>
                      Expected Benefit: <strong className="text-indigo-700">+{act.expected_benefit} pts</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 leading-relaxed font-medium">
                    {act.recommendation_reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
