'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, BarChart3, Database, ShieldCheck, Flame, Waves, Clock, Layers } from 'lucide-react';

export default function AnalyticsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  const [rainfallStats, setRainfallStats] = useState<any>(null);
  const [incidentStats, setIncidentStats] = useState<any>(null);
  const [recurrenceList, setRecurrenceList] = useState<any[]>([]);
  const [splitsData, setSplitsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const [rainRes, incRes, recRes, splitRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/analytics/rainfall`),
          fetch(`${API_BASE_URL}/api/v1/analytics/incidents`),
          fetch(`${API_BASE_URL}/api/v1/analytics/recurrence`),
          fetch(`${API_BASE_URL}/api/v1/analytics/splits`),
        ]);

        const [rain, inc, rec, splits] = await Promise.all([
          rainRes.json(),
          incRes.json(),
          recRes.json(),
          splitRes.json(),
        ]);

        setRainfallStats(rain);
        setIncidentStats(inc);
        setRecurrenceList(rec);
        setSplitsData(splits);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [API_BASE_URL]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-mono">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Phase 5 &bull; Historical Pattern Analysis</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-slate-100">
              Rainfall & Waterlogging Recurrence Engine
            </h1>
          </div>
        </div>

        {/* Data Provenance Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-amber-950/60 border border-amber-800/60 text-amber-300 px-3 py-1.5 rounded-lg">
            Label: <strong>HISTORICAL ANALYSIS</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg">
            <span>DATA STATUS &bull; <strong className="text-teal-400">Public + Demo/Synthetic</strong></span>
          </div>
        </div>
      </header>

      {/* Top Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider">Total Historical Incidents</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-100 font-sans">
              {loading ? '...' : incidentStats?.total_incidents || 0}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Waterlogging: {incidentStats?.waterlogging_count || 0}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider">High Recurrence Hotspots</span>
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-red-400 font-sans">
              {loading ? '...' : recurrenceList.filter((r) => r.recurring_hotspot === 'HIGH').length}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Wards with &ge;10 incidents</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider">Monsoon 24h Rainfall</span>
            <Waves className="w-5 h-5 text-teal-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-teal-300 font-sans">
              {loading ? '...' : `${rainfallStats?.rainfall_24h || 0} mm`}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Rolling 72h: {rainfallStats?.rainfall_72h || 0} mm</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs uppercase tracking-wider">ML Chronological Split</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-purple-300 font-sans">
              60% Train / 20% Val / 20% Test
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Data leakage safeguards active</p>
          </div>
        </div>
      </section>

      {/* Ward Recurrence Table */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 font-sans flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Ward Recurrence Analysis & Hotspot Classification</span>
          </h2>
          <span className="text-xs text-slate-500">Thresholds: High (&ge;10), Med (&ge;4), Low (&lt;4)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Ward Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Total Incidents</th>
                <th className="py-2.5 px-3">Waterlogging</th>
                <th className="py-2.5 px-3">Density (/sqkm)</th>
                <th className="py-2.5 px-3">Avg Interval (Days)</th>
                <th className="py-2.5 px-3">Hotspot Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500">Loading recurrence data...</td>
                </tr>
              ) : (
                recurrenceList.map((r) => (
                  <tr key={r.ward_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-slate-200">{r.ward_name}</td>
                    <td className="py-3 px-3 text-slate-400">{r.ward_code}</td>
                    <td className="py-3 px-3 text-slate-200">{r.total_incidents}</td>
                    <td className="py-3 px-3 text-red-400 font-bold">{r.waterlogging_count}</td>
                    <td className="py-3 px-3 text-teal-300">{r.incident_density_per_sqkm}</td>
                    <td className="py-3 px-3 text-slate-300">{r.average_days_between_incidents || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.recurring_hotspot === 'HIGH'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : r.recurring_hotspot === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {r.recurring_hotspot}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chronological Dataset Splits */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-200 font-sans flex items-center space-x-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Chronological Time-Series Data Splits (Phase 6 ML Preparation)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-blue-400 font-bold uppercase text-[10px]">Train Split (60%)</span>
            <p className="text-slate-300">Earliest historical observations used for feature learning.</p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              Records: <strong className="text-slate-200">{splitsData?.splits?.train?.records || 0}</strong>
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-teal-400 font-bold uppercase text-[10px]">Validation Split (20%)</span>
            <p className="text-slate-300">Sequential validation window for hyperparameter tuning.</p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              Records: <strong className="text-slate-200">{splitsData?.splits?.validation?.records || 0}</strong>
            </div>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <span className="text-purple-400 font-bold uppercase text-[10px]">Test Split (20%)</span>
            <p className="text-slate-300">Latest temporal window for final ML evaluation.</p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              Records: <strong className="text-slate-200">{splitsData?.splits?.test?.records || 0}</strong>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
