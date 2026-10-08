'use client';

import { useState, useEffect, useMemo } from 'react';
import { CloudRain, Database, Calendar, BarChart2, CheckCircle, Info, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface RainfallAnalyticsPanelProps {
  selectedDistrict: string;
  apiBaseUrl: string;
}

export default function RainfallAnalyticsPanel({
  selectedDistrict,
  apiBaseUrl,
}: RainfallAnalyticsPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  useEffect(() => {
    const fetchDistrictRainfall = async () => {
      try {
        setLoading(true);
        setError(null);
        const dist = selectedDistrict && selectedDistrict !== 'ALL' ? selectedDistrict : 'Chennai';
        
        let res: Response;
        try {
          res = await fetch(`${apiBaseUrl}/api/v1/rainfall/historical/district/${encodeURIComponent(dist)}`);
        } catch {
          res = await fetch(`/api/v1/rainfall/historical/district/${encodeURIComponent(dist)}`);
        }

        if (!res.ok) throw new Error('Failed to load historical rainfall data');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Error fetching rainfall');
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictRainfall();
  }, [selectedDistrict, apiBaseUrl]);

  const displayDistrict = selectedDistrict && selectedDistrict !== 'ALL' ? selectedDistrict : 'Chennai';
  const sourceLabel = data?.data_source_label || 'OGD TAMIL NADU OPEN DATA';

  // Prepare chart items from real records
  const chartRecords = useMemo(() => {
    if (!data?.historical_records) return [];
    // Take a representative sample of up to 12 records with actual values
    return data.historical_records.slice(0, 12);
  }, [data]);

  const maxChartVal = useMemo(() => {
    if (!chartRecords.length) return 400;
    const maxVal = Math.max(...chartRecords.map((r: any) => r.actual_rainfall_mm || 0));
    return Math.max(maxVal * 1.1, 100);
  }, [chartRecords]);

  // Display rows (paginated vs all)
  const displayedRows = useMemo(() => {
    if (!data?.historical_records) return [];
    return showAllRows ? data.historical_records : data.historical_records.slice(0, 8);
  }, [data, showAllRows]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5 font-sans text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg">
            <CloudRain className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-slate-900 tracking-tight">
                Historical Rainfall Analytics &amp; Cloudburst Records
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
                {displayDistrict}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verified ground-truth rainfall observations from official Tamil Nadu meteorology stations.
            </p>
          </div>
        </div>

        {/* Data Provenance Badge */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 shrink-0 self-start sm:self-auto">
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>PROVENANCE: {sourceLabel}</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium animate-pulse space-y-2">
          <CloudRain className="w-8 h-8 mx-auto text-blue-400 animate-bounce" />
          <p>Loading {displayDistrict} historical rainfall dataset...</p>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-amber-800 bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-1">
          <AlertCircle className="w-5 h-5 mx-auto text-amber-600" />
          <span className="font-semibold block">Historical dataset is available for Chennai District.</span>
          <span className="text-[11px] text-amber-700">For {displayDistrict}, digitized historical station CSVs are currently being integrated.</span>
        </div>
      ) : data ? (
        <div className="space-y-5">
          
          {/* 1. Summary Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-800">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Rainfall</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-black text-blue-900">{data.avg_rainfall_mm}</span>
                <span className="text-xs font-semibold text-slate-500">mm</span>
              </div>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">Annual / seasonal mean</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Max Observed</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-black text-rose-700">{data.max_rainfall_mm}</span>
                <span className="text-xs font-semibold text-slate-500">mm</span>
              </div>
              <span className="text-[9.5px] text-rose-600/80 font-medium block mt-0.5">Peak extreme observation</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Station Records</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-xl font-black text-slate-900">{data.total_records}</span>
                <span className="text-xs font-semibold text-slate-500">entries</span>
              </div>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">Surveyed gauge stations</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Datasets Integrated</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-base font-bold text-indigo-900 truncate block">
                  {data.sources_used?.length || 1} Official CSVs
                </span>
              </div>
              <span className="text-[9.5px] text-slate-400 block mt-0.5">OGD Tamil Nadu Portal</span>
            </div>
          </div>

          {/* 2. Visual Rainfall Trend Chart (Real Observations) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">
                  Historical Cloudburst &amp; Seasonal Precipitation Trend ({chartRecords.length} Key Observations)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Station Gauge Readings (mm)</span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 overflow-x-auto">
              {chartRecords.map((rec: any, idx: number) => {
                const heightPercent = Math.max(12, Math.min(100, (rec.actual_rainfall_mm / maxChartVal) * 100));
                const isExtreme = rec.actual_rainfall_mm > 200;
                return (
                  <div key={idx} className="flex-1 min-w-[38px] flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9.5px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-20 shadow-md">
                      <strong>{rec.actual_rainfall_mm} mm</strong> ({rec.year || 'Historic'})
                      <div className="text-slate-300 text-[8.5px]">{rec.period_or_season}</div>
                    </div>

                    <span className="text-[9px] font-bold text-slate-700 mb-1 group-hover:text-blue-700 transition">
                      {Math.round(rec.actual_rainfall_mm)}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all ${
                        isExtreme
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400 group-hover:from-rose-700 group-hover:to-rose-500'
                          : 'bg-gradient-to-t from-blue-600 to-sky-400 group-hover:from-blue-700 group-hover:to-sky-500'
                      }`}
                    />
                    <span className="text-[8.5px] font-semibold text-slate-500 mt-1 truncate max-w-[42px] text-center" title={rec.period_or_season}>
                      {rec.year || idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
                <span>Heavy Monsoon Rain (&lt;200mm)</span>
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block ml-3" />
                <span>Extreme Cloudburst (&gt;200mm)</span>
              </span>
              <span className="italic">*Hover over bars for station gauge telemetry details.</span>
            </div>
          </div>

          {/* 3. Historical Records Table (Responsive with sticky header & toggle) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">
                Detailed Station Gauge Observations Table ({data.historical_records?.length || 0} Total Records)
              </span>
              <button
                onClick={() => setShowAllRows(!showAllRows)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded border border-blue-200 transition"
              >
                <span>{showAllRows ? 'Show Top 8 Records' : `Show All ${data.historical_records?.length} Records`}</span>
                {showAllRows ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[340px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-100 z-10">
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                    <th className="p-2.5">Period / Station Observation</th>
                    <th className="p-2.5">Year</th>
                    <th className="p-2.5">Recorded Rainfall</th>
                    <th className="p-2.5">Normal Benchmark</th>
                    <th className="p-2.5">Deviation</th>
                    <th className="p-2.5">Source Dataset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-medium text-slate-700">
                  {displayedRows.map((rec: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-bold text-slate-900">{rec.period_or_season}</td>
                      <td className="p-2.5 text-slate-600">{rec.year || 'Recorded'}</td>
                      <td className="p-2.5 font-black text-blue-900">{rec.actual_rainfall_mm} mm</td>
                      <td className="p-2.5 text-slate-500">{rec.normal_rainfall_mm ? `${rec.normal_rainfall_mm} mm` : 'N/A'}</td>
                      <td className="p-2.5">
                        {rec.percentage_deviation !== null && rec.percentage_deviation !== undefined ? (
                          <span className={`font-bold ${rec.percentage_deviation >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {rec.percentage_deviation > 0 ? `+${rec.percentage_deviation}%` : `${rec.percentage_deviation}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-2.5 text-[10px] text-slate-500 font-mono truncate max-w-[200px]" title={rec.source_file}>
                        {rec.source_file}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
