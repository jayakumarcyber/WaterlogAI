'use client';

import { ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { DemoLocation } from './useDemoEngine';
import { useLanguage } from '@/context/LanguageContext';

interface DemoPriorityTableProps {
  locations: DemoLocation[];
  selectedLocation: DemoLocation | null;
  onSelectLocation: (loc: DemoLocation) => void;
}

export default function DemoPriorityTable({
  locations,
  selectedLocation,
  onSelectLocation,
}: DemoPriorityTableProps) {
  const { t, language } = useLanguage();

  const handleInspect = (loc: DemoLocation) => {
    onSelectLocation(loc);
    const mapSection = document.getElementById('current-risk-map');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="priority-actions"
      aria-label="Priority Areas for Preventive Action"
      className="bg-white border border-slate-200/90 rounded-lg p-5 shadow-xs space-y-4 font-sans text-slate-800"
    >
      {/* Administrative Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 uppercase px-2 py-0.5 rounded inline-block mb-1">
            {language === 'ta' ? 'செயல்பாட்டு வரிசை • நகராட்சி களம்' : 'OPERATIONAL QUEUE • MUNICIPAL DISPATCH'}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {language === 'ta' ? 'தடுப்பு நடவடிக்கைக்கான முன்னுரிமைப் பகுதிகள்' : 'Priority Areas for Preventive Action'}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {language === 'ta' ? 'அதிக இடர் உள்ள வார்டுகளை வரிசைப்படுத்தி நகராட்சி தலையீடுகளை திட்டமிடுங்கள்.' : 'Rank-ordered municipal wards prioritized by composite flood risk and exposure index.'}
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md shrink-0">
          {locations.length} {language === 'ta' ? 'இடங்கள் மதிப்பீடு செய்யப்பட்டன' : 'Administrative Locations Evaluated'}
        </span>
      </div>

      {/* Administrative Monitoring Table */}
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-3">{language === 'ta' ? 'வார்டு' : 'Ward'}</th>
              <th className="py-2.5 px-3">{language === 'ta' ? 'இடர்' : 'Risk'}</th>
              <th className="py-2.5 px-3">{language === 'ta' ? 'வெளிப்பாடு' : 'Exposure'}</th>
              <th className="py-2.5 px-3">{language === 'ta' ? 'வரலாற்று சான்றுகள்' : 'Historical Evidence'}</th>
              <th className="py-2.5 px-3">{language === 'ta' ? 'முன்னுரிமை' : 'Priority'}</th>
              <th className="py-2.5 px-3">{language === 'ta' ? 'பரிந்துரைக்கப்பட்ட நடவடிக்கை' : 'Recommended Action'}</th>
              <th className="py-2.5 px-3 text-right">
                {language === 'ta' ? 'ஆய்வு' : 'Inspect'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {locations.map((loc) => {
              const isSelected = selectedLocation?.location === loc.location;
              return (
                <tr
                  key={loc.location}
                  onClick={() => handleInspect(loc)}
                  className={`cursor-pointer transition hover:bg-blue-50/70 ${
                    isSelected ? 'bg-blue-50 font-medium' : ''
                  }`}
                >
                  {/* 1. Ward */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-900 block">{loc.location}</span>
                    <span className="text-[10px] text-slate-500 font-mono">GCC Zone {loc.location.includes('1') ? 'Central' : 'South'}</span>
                  </td>

                  {/* 2. Risk */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
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
                        {loc.risk_score.toFixed(1)}/100
                      </span>
                    </div>
                  </td>

                  {/* 3. Exposure */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-mono text-[11px]">
                    <div>{loc.population.toLocaleString()} {language === 'ta' ? 'மக்கள்' : 'citizens'}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{loc.critical_facilities} {language === 'ta' ? 'முக்கிய இடங்கள்' : 'facilities'}</div>
                  </td>

                  {/* 4. Historical Evidence */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>{loc.historical_incidents_30d > 0 ? `${loc.historical_incidents_30d} ${language === 'ta' ? 'நிகழ்வுகள்' : 'Recorded Incidents'}` : (language === 'ta' ? 'சரிபார்க்கப்பட்ட சான்றுகள்' : 'Verified Event Evidence')}</span>
                    </span>
                  </td>

                  {/* 5. Priority */}
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[11px]">
                      {language === 'ta' ? `வரிசை #${loc.priority_rank}` : `Rank #${loc.priority_rank}`}
                    </span>
                  </td>

                  {/* 6. Action Status */}
                  <td className="py-2.5 px-3 text-slate-700 text-[11px] max-w-xs">
                    <span className="font-medium text-slate-900 block truncate">
                      {loc.recommended_action}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {language === 'ta' ? 'நிலை: களப்பணிக்குத் தயார்' : 'Status: Ready for Field Prepositioning'}
                    </span>
                  </td>

                  {/* 7. Action Button */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspect(loc);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-100/60 transition cursor-pointer"
                    >
                      <span>{language === 'ta' ? 'வரைபடம்' : 'Map'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
