'use client';

import { PhoneCall, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface EmergencyCivicInfoSectionProps {
  onReportWaterlogging?: () => void;
  onTrackComplaint?: () => void;
}

export default function EmergencyCivicInfoSection({
  onReportWaterlogging,
  onTrackComplaint,
}: EmergencyCivicInfoSectionProps) {
  const { t, language } = useLanguage();

  const emergencyContacts = [
    {
      title: t('emergency_helpline_gcc'),
      number: '1913',
      dept: language === 'ta' ? 'பெருநகர சென்னை மாநகராட்சி 24x7 குடிமக்கள் உதவி மையம்' : 'Greater Chennai Corporation 24x7 Citizen Distress Line',
      type: language === 'ta' ? 'கட்டணமில்லா எண்' : 'Toll-Free Helpline',
    },
    {
      title: t('emergency_helpline_state'),
      number: '1070',
      dept: language === 'ta' ? 'தமிழ்நாடு மாநில அவசர கால செயல்பாட்டு மையம்' : 'Tamil Nadu State Emergency Operations Centre',
      type: language === 'ta' ? 'மாநில அவசர எண்' : 'State Emergency Line',
    },
    {
      title: t('emergency_helpline_district'),
      number: '1077',
      dept: language === 'ta' ? 'மாவட்ட பேரிடர் மேலாண்மை ஆணையம், சென்னை மாவட்ட ஆட்சியர் அலுவலகம்' : 'District Disaster Management Authority, Chennai Collectorate',
      type: language === 'ta' ? 'மாவட்ட அவசர எண்' : 'District Emergency Line',
    },
    {
      title: t('emergency_flood_control'),
      number: '044-25619206',
      dept: language === 'ta' ? 'ரிப்பன் மாளிகை பருவமழை கட்டுப்பாட்டு அறை மற்றும் பம்ப் ஒருங்கிணைப்பு' : 'Ripon Building Monsoon Control Room & Pump Coordination',
      type: language === 'ta' ? 'நேரடி தொலைபேசி' : 'Direct Landline',
    },
  ];

  return (
    <section
      id="emergency-civic-info"
      aria-label="Civic Response and Emergency Information"
      className="bg-white border border-slate-300 rounded-md p-5 sm:p-6 shadow-2xs font-sans text-slate-800 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 uppercase px-2 py-0.5 rounded inline-block mb-1">
            {language === 'ta' ? 'நகராட்சி அவசர உதவித் தொடர்பு பட்டியல் • பருவமழை தயார்நிலை' : 'MUNICIPAL DISTRESS DIRECTORY • MONSOON READINESS'}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {t('emergency_section_title')}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t('emergency_section_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{t('emergency_verified_badge')}</span>
        </div>
      </div>

      {/* Emergency Helpline Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.number}
            className="p-4 rounded-md border border-slate-300 bg-slate-50 flex flex-col justify-between space-y-2 hover:border-slate-400 transition"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {contact.type}
              </span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                {contact.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1 leading-tight line-clamp-2">
                {contact.dept}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-base font-black font-mono text-blue-900 tracking-tight">
                {contact.number}
              </span>
              <a
                href={`tel:${contact.number.replace(/-/g, '')}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-blue-800 hover:bg-blue-900 px-2.5 py-1 rounded transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>{language === 'ta' ? 'அழைக்கவும்' : 'Call'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
