'use client';

import {
  CloudRain,
  HelpCircle,
  BarChart3,
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DecisionPipelineSection() {
  const steps = [
    {
      step: '01',
      id: 'predict',
      name: 'PREDICT',
      title: 'Hydrodynamic Risk Index',
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/40 bg-blue-950/30 text-blue-300',
      badge: 'Multi-Horizon Forecasts',
      description:
        'Calculates 0–100 risk score across all 200 GCC wards by modeling forecast rainfall (24h/48h/72h), micro-elevation (SRTM DEM), terrain slope, and storm drain capacity.',
    },
    {
      step: '02',
      id: 'explain',
      name: 'EXPLAIN',
      title: 'Transparent XAI Attribution',
      icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
      badge: 'Explainable AI Factor Points',
      description:
        'Deconstructs why each specific ward is vulnerable into transparent point contributions: rainfall load, elevation deficit, silted drainage, and historical waterlogging frequency.',
    },
    {
      step: '03',
      id: 'prioritize',
      name: 'PRIORITIZE',
      title: 'Vulnerability Ranking',
      icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
      badge: 'Composite Priority Score',
      description:
        'Ranks wards by combining predicted waterlogging probability (40%), exposed citizen population (30%), critical hospitals/substations (15%), and past incident density (15%).',
    },
    {
      step: '04',
      id: 'optimize',
      name: 'OPTIMIZE',
      title: 'Resource Allocation Solver',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
      badge: 'Knapsack Priority Dispatch',
      description:
        'Algorithmic solver assigns available suction pumps, super-sucker trucks, and emergency response crews to maximize risk reduction within municipal budget constraints.',
    },
    {
      step: '05',
      id: 'simulate',
      name: 'SIMULATE',
      title: 'What-If Resilience Testing',
      icon: <Sliders className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-950/30 text-rose-300',
      badge: 'Dynamic Sensitivity Engine',
      description:
        'Empowers disaster managers to simulate climate extremes (+10% to +50% precipitation) and pre-monsoon desilting impacts (+/-20% drain capacity) dynamically.',
    },
  ];

  return (
    <section
      id="decision-pipeline"
      aria-label="CivicPulse End-to-End Decision Pipeline"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl text-slate-100 font-sans space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 inline-block mb-1.5">
            DECISION SUPPORT WORKFLOW ARCHITECTURE
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Predict &rarr; Explain &rarr; Prioritize &rarr; Optimize &rarr; Simulate
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A closed-loop AI operations pipeline transforming raw meteorology and elevation terrain into verified municipal actions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full Operations Stack</span>
        </div>
      </div>

      {/* 5-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {steps.map((s, idx) => (
          <div
            key={s.id}
            className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 relative group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${s.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white">
                {s.step}
              </span>
              <div className="p-2 rounded-lg bg-black/30 border border-white/10">{s.icon}</div>
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-wider opacity-80">{s.name}</div>
              <h3 className="text-sm font-bold text-white mt-0.5">{s.title}</h3>
              <p className="text-[11px] text-slate-300/90 mt-2 leading-relaxed font-normal">
                {s.description}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] font-semibold text-slate-300 flex items-center justify-between">
              <span>{s.badge}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
