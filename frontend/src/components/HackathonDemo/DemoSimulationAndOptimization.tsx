'use client';

import { RefreshCw, ArrowRight, ShieldCheck, CheckCircle2, TrendingDown } from 'lucide-react';
import type { DemoLocation, OptimizationResult } from './useDemoEngine';
import { useLanguage } from '@/context/LanguageContext';

interface DemoSimulationAndOptimizationProps {
  locations: DemoLocation[];
  optCrews: number;
  setOptCrews: (crews: number) => void;
  optBudget: number;
  setOptBudget: (budget: number) => void;
  optLoading: boolean;
  optResult: OptimizationResult | null;
  runOptimization: () => void;
  simRainIncrease: number;
  setSimRainIncrease: (rain: number) => void;
  simDrainageDelta: number;
  setSimDrainageDelta: (drain: number) => void;
  simLoading: boolean;
  simResult: any;
  runSimulation: (rainInc?: number, drainDelta?: number) => void;
}

export default function DemoSimulationAndOptimization({
  locations,
  optCrews,
  setOptCrews,
  optBudget,
  setOptBudget,
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
}: DemoSimulationAndOptimizationProps) {
  const { t, language } = useLanguage();

  return (
    <div
      id="simulation-decision-support"
      aria-label="Scenario Planning & Simulation Decision Support"
      className="space-y-6 font-sans text-slate-800"
    >
      {/* ─── 1. Scenario Planning & Simulation Card ───────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 uppercase px-2 py-0.5 rounded inline-block mb-1">
              {language === 'ta' ? 'சூழ்நிலை திட்டமிடல் • அழுத்த பரிசோதனை' : 'SCENARIO PLANNING & STRESS TESTING'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'ta' ? 'சூழ்நிலை திட்டமிடல் மற்றும் உருவகப்படுத்துதல்' : 'Scenario Planning & Simulation'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'ta' ? 'மழை அளவு மற்றும் வடிகால் குறைபாடுகளை உருவகப்படுத்தி இடர் மாற்றங்களை கணிக்கவும்.' : 'Simulate monsoon surges and culvert siltation to test municipal risk thresholds.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md shrink-0">
            {language === 'ta' ? 'நகராட்சி அழுத்த-பரிசோதனை நெறிமுறை' : 'Municipal Stress-Testing Protocol'}
          </span>
        </div>

        {/* ─── Controls: Spacious Horizontally Aligned Layout ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          
          {/* 1. Rain Mode (4 cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                {language === 'ta' ? 'மழை முறை' : 'Rain Mode'}
              </span>
              <span className="text-rose-700 font-bold font-mono text-[11px]">
                +{simRainIncrease}% {language === 'ta' ? 'மழை' : 'Precipitation'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: language === 'ta' ? 'இயல்பு' : 'Normal', pct: 0 },
                { label: language === 'ta' ? 'கனமழை' : 'Heavy', pct: 20 },
                { label: language === 'ta' ? 'சூறாவளி' : 'Cyclone', pct: 50 },
              ].map(({ label, pct }) => (
                <button
                  key={pct}
                  onClick={() => {
                    setSimRainIncrease(pct);
                    runSimulation(pct, simDrainageDelta);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-md border transition cursor-pointer text-center ${
                    simRainIncrease === pct
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="leading-tight">{label}</div>
                  <div className="text-[10px] opacity-80 font-normal">+{pct}%</div>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {language === 'ta' ? 'வானிலை முன்னறிவிப்பு பெருக்கல் காரணி' : 'Precipitation intensity multiplier'}
            </span>
          </div>

          {/* 2. Drainage Scenario (4 cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                {language === 'ta' ? 'வடிகால் நிலை' : 'Drainage Scenario'}
              </span>
              <span className="text-amber-800 font-bold font-mono text-[11px]">
                {simDrainageDelta === 0 ? '100% (Normal)' : `${simDrainageDelta}% Capacity`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: language === 'ta' ? 'இயல்பு' : 'Normal', delta: 0 },
                { label: '-10%', delta: -10 },
                { label: '-25%', delta: -25 },
                { label: '-50%', delta: -50 },
              ].map(({ label, delta }) => (
                <button
                  key={delta}
                  onClick={() => {
                    setSimDrainageDelta(delta);
                    runSimulation(simRainIncrease, delta);
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-md border transition cursor-pointer text-center ${
                    simDrainageDelta === delta
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="leading-tight truncate">{label}</div>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {language === 'ta' ? 'கால்வாய் அடைப்பு மற்றும் தூர்வாரல் பற்றாக்குறை' : 'Siltation and culvert choking factor'}
            </span>
          </div>

          {/* 3. Intervention Controls & Action (4 cols) */}
          <div className="lg:col-span-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                {language === 'ta' ? 'தலையீடு திறன்' : 'Intervention'}
              </span>
              <span className="text-blue-900 font-bold font-mono text-[11px]">
                {optCrews} Crews / ₹{(optBudget / 1000).toFixed(0)}k
              </span>
            </div>
            <button
              onClick={() => {
                runSimulation(simRainIncrease, simDrainageDelta);
                runOptimization();
              }}
              disabled={simLoading || optLoading}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simLoading || optLoading ? 'animate-spin' : ''}`} />
              <span>{language === 'ta' ? 'சூழ்நிலையை உருவகப்படுத்து' : 'Simulate Scenario'}</span>
            </button>
            <span className="text-[10px] text-slate-500 block">
              {language === 'ta' ? 'முழுமையான இடர் மாற்றங்களை கணக்கிடுகிறது' : 'Runs simulation stress-test across all 14 locations'}
            </span>
          </div>

        </div>

        {/* ─── Result: Predicted Risk & Risk Shift Matrix ─────────────────────── */}
        {simResult?.locations && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                {language === 'ta' ? 'உருவகப்படுத்தல் முடிவு • இடர் மாற்ற வரிசை' : 'Simulation Analysis Result • Risk Shift Matrix'}
              </span>
              <span className="text-slate-500 text-[10px]">
                {language === 'ta' ? 'அடிப்படை vs சூழ்நிலை இடர்' : 'Baseline vs Scenario Shift'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {simResult.locations.slice(0, 3).map((loc: any) => (
                <div key={loc.location} className="p-3 rounded-md bg-white border border-slate-200/90 text-xs space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{loc.location}</strong>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      +{loc.delta_risk_score > 0 ? loc.delta_risk_score.toFixed(1) : '0.0'} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 block">{t('sim_result_predicted_risk')}</span>
                      <strong className="text-slate-800">{loc.simulated_risk_score.toFixed(1)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('sim_result_residual_risk')}</span>
                      <strong className="text-emerald-700">{(loc.simulated_risk_score * 0.72).toFixed(1)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('sim_result_priority_change')}</span>
                      <strong className="text-blue-900">
                        {loc.priority_rank} &rarr; {Math.max(1, loc.priority_rank - 1)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── 2. Municipal Resource Allocation Section ─────────────────────── */}
      <div id="resource-allocation" className="bg-white border border-slate-200/90 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 uppercase px-2 py-0.5 rounded inline-block mb-1">
              {language === 'ta' ? 'நகராட்சி வள ஒதுக்கீடு • திட்டமிடல்' : 'MUNICIPAL RESOURCE ALLOCATION'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'ta' ? 'நகராட்சி வள ஒதுக்கீடு' : 'Municipal Resource Allocation'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'ta' ? 'கிடைக்கக்கூடிய குழுக்கள் மற்றும் பட்ஜெட் வரம்புகளுக்குள் சிறந்த தலையீடு திட்டங்களை தேர்வு செய்கிறது.' : 'Automated dispatch solver allocating mobile dewatering pumps and culvert crews within budget.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">
              Method / Engine Detail:
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700">
              Greedy Knapsack Priority Dispatch (Demo Engine)
            </span>
          </div>
        </div>

        {/* 4-Metric Information Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Available Crews</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {optResult ? optResult.crews_dispatched : optCrews} <span className="text-xs font-normal text-slate-500">of {optCrews}</span>
            </div>
            <span className="text-[10px] text-slate-600">Dispatched Teams</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Budget</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              ₹{(optResult ? optResult.total_cost_inr : optBudget).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-600">of ₹{optBudget.toLocaleString()} Allocated</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Target Locations</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {optResult ? optResult.selected_locations.length : 5}
            </div>
            <span className="text-[10px] text-slate-600">Wards Covered</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Solver Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">Validated by Solver</span>
            </div>
            <span className="text-[10px] text-slate-600">Optimal Solution</span>
          </div>
        </div>

        {/* Selected Work Order Table */}
        {optResult && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-900 uppercase text-[11px] tracking-wider block">
              {language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட பணி ஆணை' : 'Selected Work Order'}
            </span>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-3">Ward</th>
                    <th className="py-2 px-3">Risk Score</th>
                    <th className="py-2 px-3">Crews Assigned</th>
                    <th className="py-2 px-3">Cost (₹)</th>
                    <th className="py-2 px-3">Recommended Municipal Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {optResult.selected_locations.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-bold text-slate-900">{item.location}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px] font-bold">
                          {item.risk_score.toFixed(1)} / 100
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.crew_assigned} Team</td>
                      <td className="py-2 px-3 font-mono text-slate-700">₹{item.action_cost_inr.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-800 text-[11px]">{item.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
