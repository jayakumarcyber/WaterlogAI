'use client';

import { useState, useEffect } from 'react';
import { AlertOctagon, Users, Building2, Filter, Info, ShieldAlert } from 'lucide-react';

interface PriorityQueueProps {
  apiBaseUrl: string;
  selectedDistrict?: string;
  onSelectWard?: (wardId: number) => void;
}

export default function PriorityQueuePanel({ apiBaseUrl, selectedDistrict, onSelectWard }: PriorityQueueProps) {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'score' | 'exposure' | 'risk'>('score');

  useEffect(() => {
    setLoading(true);
    const dist = selectedDistrict && selectedDistrict !== 'ALL' ? selectedDistrict : 'ALL';
    fetch(`${apiBaseUrl}/api/v1/priority/rankings?district=${encodeURIComponent(dist)}`)
      .then((res) => res.json())
      .then((data) => {
        // Enforce strict geographic validation (Requirement 13)
        const validData = (data || []).filter((item: any) => {
          if (selectedDistrict && selectedDistrict !== 'ALL') {
            return item.district?.toLowerCase() === selectedDistrict.toLowerCase();
          }
          return true;
        });

        setRankings(validData);
        if (validData && validData.length > 0) {
          setSelectedAssessment(validData[0]);
        } else {
          setSelectedAssessment(null);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch priority rankings:', err);
        setRankings([]);
        setSelectedAssessment(null);
      })
      .finally(() => setLoading(false));
  }, [apiBaseUrl, selectedDistrict]);

  if (loading) {
    return <div className="text-xs font-sans text-slate-500 animate-pulse py-4">Calculating municipal priority rankings...</div>;
  }

  const sortedRankings = [...rankings].sort((a, b) => {
    if (sortBy === 'exposure') return (b.potential_population_exposure || 0) - (a.potential_population_exposure || 0);
    if (sortBy === 'risk') return (b.predicted_probability || 0) - (a.predicted_probability || 0);
    return (b.priority_score || 0) - (a.priority_score || 0);
  });

  const displayArea = selectedDistrict && selectedDistrict !== 'ALL' ? `${selectedDistrict} District` : 'Tamil Nadu State';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Priority Action Queue</h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                {displayArea}
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Demo Scenario — Not an Official Municipal Forecast
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Ranked municipal intervention priorities based on risk, population exposure, and critical infrastructure.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Sort by Priority Score</option>
            <option value="risk">Sort by Predicted Risk</option>
            <option value="exposure">Sort by Population Exposure</option>
          </select>
        </div>
      </div>

      {/* Risk vs Priority Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Risk vs. Action Priority: </strong>
          Risk indicates predicted probability of waterlogging. Priority ranks urgency of preventive municipal intervention based on Risk + Exposure + Critical Facilities.
        </div>
      </div>

      {/* Requirement 5: Professional empty state when verified data is unavailable */}
      {sortedRankings.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-600 space-y-1">
          <ShieldAlert className="w-6 h-6 mx-auto text-amber-600 mb-1" />
          <h4 className="font-bold text-sm text-slate-800">No verified priority actions available for this area</h4>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Run a clearly labelled demo scenario or connect verified municipal records to generate area-specific priorities.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRankings.map((item) => {
            const isSelected = selectedAssessment?.ward_id === item.ward_id;
            const prioLevel = (item.priority_level || 'P1').toUpperCase();

            let badgeColor = 'bg-red-100 text-red-700 border-red-300';
            if (prioLevel.includes('P2')) badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
            if (prioLevel.includes('P3')) badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={item.ward_id}
                onClick={() => {
                  setSelectedAssessment(item);
                  if (onSelectWard) onSelectWard(item.ward_id);
                }}
                className={`p-3.5 rounded-lg border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-50 border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 font-bold text-xs text-slate-700 flex items-center justify-center shrink-0">
                    #{item.rank}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{item.ward_name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {item.priority_level}
                      </span>
                      <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Demo scenario
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block pt-0.5">
                      Suggested Action: Inspect storm outfalls & clear drainage bottlenecks ({item.district || 'TN'}) &bull; Demo Scenario
                    </span>
                  </div>
                </div>

                {/* Exposure Summaries */}
                <div className="flex items-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>~{(item.potential_population_exposure || 0).toLocaleString()} Pot. Pop</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.critical_facilities?.total_count || 0} Facilities</span>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority Score</span>
                    <span className="font-bold text-blue-700 text-sm">{item.priority_score} / 100</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Priority Details Rationale Drawer */}
      {selectedAssessment && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="font-bold text-slate-900 text-xs">
              Priority Rationale: {selectedAssessment.ward_name} ({selectedAssessment.district})
            </h4>
            <span className="text-[11px] text-blue-700 font-bold">Priority Score: {selectedAssessment.priority_score} / 100</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Data-Driven Reasons:</span>
            <ul className="space-y-1 list-disc list-inside text-xs text-slate-700">
              {selectedAssessment.priority_reasons?.map((reason: string, i: number) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[10px] text-slate-500 gap-1">
            <span>District: {selectedAssessment.district} ({selectedAssessment.state})</span>
            <span className="font-semibold text-amber-800">Demo Scenario — Not an Official Municipal Forecast</span>
          </div>
        </div>
      )}

    </div>
  );
}
