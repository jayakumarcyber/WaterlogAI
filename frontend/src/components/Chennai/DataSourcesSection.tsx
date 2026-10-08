'use client';

import { Database, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function DataSourcesSection() {
  const { t, language } = useLanguage();

  const dataRows = [
    {
      source: language === 'ta' ? 'GCC GIS (வார்டு எல்லைகள்)' : 'GCC GIS (Ward Boundaries)',
      year: '2023',
      status: t('status_verified'),
      statusType: 'verified',
      provenance: language === 'ta'
        ? 'மண்டலங்கள் 1–15 (200 வார்டுகள்) பெருநகர சென்னை மாநகராட்சியின் அதிகாரப்பூர்வ நிர்வாக எல்லைகள். GeoJSON வடிவம்.'
        : 'Official Greater Chennai Corporation municipal administrative boundaries for Zones 1–15 (200 Wards). GeoJSON format.',
    },
    {
      source: language === 'ta' ? 'மக்கள் தொகை கணக்கெடுப்பு 2011' : 'Census 2011 (Demographics)',
      year: '2011 / 2021 Proj.',
      status: t('status_verified'),
      statusType: 'verified',
      provenance: language === 'ta'
        ? 'இந்திய மக்கள் தொகை கணக்கெடுப்பு ஆணையத்தின் அதிகாரப்பூர்வ வார்டு மக்கள் தொகை மற்றும் பாதிப்பு அளவீடு.'
        : 'Official Office of the Registrar General & Census Commissioner, India. Granular ward population totals and vulnerability exposure.',
    },
    {
      source: language === 'ta' ? 'மழைப்பொழிவு தரவு (IMD / AWS)' : 'Rainfall Data (IMD / AWS)',
      year: '1993–2023 / Live',
      status: t('status_verified'),
      statusType: 'verified',
      provenance: language === 'ta'
        ? 'இந்திய வானிலை ஆய்வுத் துறை (IMD) தினசரி அறிக்கைகள், நுங்கம்பாக்கம் மற்றும் மீனம்பாக்கம் நிலையங்கள் மற்றும் தானியங்கி வானிலை நிலையங்கள் (AWS).'
        : 'India Meteorological Department (IMD) daily bulletin, Nungambakkam & Meenambakkam observatories, and AWS sensor network.',
    },
    {
      source: language === 'ta' ? 'நிலப்பரப்பு மாதிரி (DEM / Terrain)' : 'DEM / Terrain (Elevation Model)',
      year: '2021',
      status: t('status_derived'),
      statusType: 'derived',
      provenance: language === 'ta'
        ? 'Copernicus 30m Global DEM மற்றும் SRTM தரவுகள், பள்ளமான பகுதிகள் மற்றும் சாய்வு சதவீதங்களுக்கு செயலாக்கப்பட்டது.'
        : 'Copernicus 30m Global DEM & SRTM tiles, processed for topographic depression sinks, slope percentages, and coastal lowlands.',
    },
    {
      source: language === 'ta' ? 'வரலாற்று நிகழ்வுகள் (வெள்ளப் பதிவுகள்)' : 'Historical Incidents (Flood Logs)',
      year: '2015, 2020, 2023',
      status: t('status_verified'),
      statusType: 'verified',
      provenance: language === 'ta'
        ? 'GCC 1913 புகார்கள், CMWSSB தூர்வாரல் பதிவுகள் மற்றும் அதிகாரப்பூர்வ பேரிடர் அறிக்கைகளிலிருந்து 185 வார்டுகளில் பெறப்பட்ட 1,325 வெள்ள நிகழ்வுகள்.'
        : '1,325 geo-located inundation events across 185 wards compiled from GCC 1913 complaints, CMWSSB desilting logs, and official disaster reports.',
    },
    {
      source: language === 'ta' ? 'வடிகால் / உள்கட்டமைப்பு (SWD Grid)' : 'Drainage / Infrastructure (SWD Grid)',
      year: '2023',
      status: t('status_derived'),
      statusType: 'derived',
      provenance: language === 'ta'
        ? 'GCC மழைநீர் வடிகால் (SWD) திட்ட வரைபடம், கால்வாய்கள், பக்கிங்காம் கால்வாய் மற்றும் ஓபன்ஸ்ட்ரீட்மேப் நீர்வழி கட்டமைப்பு.'
        : 'GCC Storm Water Drainage (SWD) master plan, canal outfalls, Buckingham Canal, and OpenStreetMap waterway network topology.',
    },
    {
      source: language === 'ta' ? 'இரண்டாம் நிலை ஆதாரங்கள் (குடிமக்கள் அறிக்கைகள்)' : 'Secondary Evidence (Citizen Reports)',
      year: 'Real-Time Live',
      status: t('status_secondary'),
      statusType: 'secondary',
      provenance: language === 'ta'
        ? 'CivicPulse குறைதீர்ப்பு தளம் வழியாக குடிமக்கள் பதிவு செய்யும் புவிக்குறியிடப்பட்ட வெள்ளப் புகார்கள், நகராட்சி சரிபார்ப்புக்கு உட்பட்டது.'
        : 'CivicPulse Citizen Grievance Portal crowd-sourced geo-tagged flood reports, pending municipal verification and officer dispatch.',
    },
    {
      source: language === 'ta' ? 'பிற மாநிலங்கள் / சென்னை அல்லாத பகுதிகள்' : 'Other States / Non-Chennai DEM',
      year: 'N/A',
      status: t('status_unavailable'),
      statusType: 'unavailable',
      provenance: language === 'ta'
        ? 'சென்னைக்கு வெளியே உள்ள பகுதிகளுக்கு டிஜிட்டல் உயர மாதிரிகள், வடிகால் கட்டமைப்புகள் மற்றும் வரலாற்று நிகழ்வுகள் இன்னும் சேர்க்கப்படவில்லை.'
        : 'Digital elevation models, SWD topologies, and historical ground truth have not been ingested for jurisdictions outside Chennai.',
    },
  ];

  return (
    <section
      id="data-sources"
      aria-label="CivicPulse Geospatial Data Sources & Methodology"
      className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 shadow-2xs font-sans text-slate-800 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
            {language === 'ta' ? 'தரவு வெளிப்படைத்தன்மை • முறைமை • தணிக்கை தயார்நிலை' : 'DATA TRANSPARENCY • METHODOLOGY • AUDIT-READY PROVENANCE'}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t('data_sources_title')}
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('data_sources_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shrink-0">
          <Database className="w-3.5 h-3.5 text-blue-800" />
          <span>{language === 'ta' ? '8 தணிக்கை தரவுத் தொடர்கள்' : '8 Audited Data Layers'}</span>
        </div>
      </div>

      {/* Structured Governance Matrix Table */}
      <div className="overflow-x-auto rounded-md border border-slate-300">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2.5 px-3 w-1/4">{t('col_source')}</th>
              <th className="py-2.5 px-3 w-24">{t('col_year')}</th>
              <th className="py-2.5 px-3 w-32">{t('col_status')}</th>
              <th className="py-2.5 px-3">{t('col_provenance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {dataRows.map((row) => (
              <tr key={row.source} className="hover:bg-slate-50 transition">
                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                  {row.source}
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                  {row.year}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      row.statusType === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : row.statusType === 'derived'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : row.statusType === 'secondary'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {row.statusType === 'verified' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                    {row.statusType === 'derived' && <ShieldCheck className="w-3 h-3 text-blue-700" />}
                    {row.statusType === 'secondary' && <FileText className="w-3 h-3 text-purple-700" />}
                    {row.statusType === 'unavailable' && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                    <span>{row.status}</span>
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                  {row.provenance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
