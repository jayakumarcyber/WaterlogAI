'use client';

import { Compass, Waves, CheckCircle2, Building2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ChennaiIdentitySection() {
  const { t, language } = useLanguage();

  return (
    <section
      id="chennai-identity"
      aria-label="Chennai Identity & About CivicPulse Monsoon"
      className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden text-slate-100 font-sans shadow-2xs"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        
        {/* Left Side: Supporting Visual (Namma Chennai Signage) (5 Cols) */}
        <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[260px] lg:min-h-full overflow-hidden">
          <img
            src="/images/chennai/namma-chennai.jpg"
            alt="Namma Chennai neon signage at Marina Beach, Tamil Nadu"
            className="w-full h-full object-cover object-center select-none"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="absolute bottom-2.5 left-3 z-10 text-[10px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            {language === 'ta' ? 'மெரினா கடற்கரை, சென்னை • நகர்ப்புற மையம்' : 'Marina Beach, Chennai • Urban Core'}
          </div>
        </div>

        {/* Right Side: CivicPulse Explanation & Civic Value (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-center space-y-3.5">
          
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-900/60 text-blue-300 border border-blue-500/30 w-max">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'ta' ? 'நகராட்சி நீரியல் கட்டமைப்பு • பெருநகர சென்னை மாநகராட்சி' : 'MUNICIPAL HYDRODYNAMICS • GREATER CHENNAI CORPORATION'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            {t('identity_title')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {t('identity_desc')}
          </p>

          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            {language === 'ta'
              ? 'சென்னையின் நிலப்பரப்பு ஒரு தனித்துவமான சவாலைக் கொண்டுள்ளது: மிகக் குறைந்த இயற்கை சாய்வு கொண்ட தட்டையான கடலோர சமவெளி, அடையாறு, கூவம் நதிப் படுகைகள் மற்றும் வரலாற்று பக்கிங்காம் கால்வாயை அதிகம் சார்ந்துள்ளது. பாரம்பரிய வெள்ள மேலாண்மை என்பது சாலைகள் மூழ்கிய பின் பம்புகளை இயக்குவதாக இருந்தது. CivicPulse இதனை முன்னெச்சரிக்கை தடுப்பு அமைப்பாக மாற்றுகிறது.'
              : "Chennai's terrain presents a distinctive hydrological challenge: an extraordinarily flat coastal plain with minimal natural slope, heavily reliant on the Adyar and Cooum river basins and the historical Buckingham Canal. Traditional municipal flood management has been reactive — dispatching suction pumps only after arterial roads and residential neighborhoods are already submerged. CivicPulse transforms operations into a preventive response network."}
          </p>

          {/* Key Municipal Pillars Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700/80">
              <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-200">
                {language === 'ta' ? 'கடலோர சமவெளி Micro-DEM' : 'Coastal Lowland Micro-DEM'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700/80">
              <Waves className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-200">
                {language === 'ta' ? 'அடையாறு & கூவம் வடிநில மாதிரி' : 'Adyar & Cooum Basin Modeling'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-200">
                {language === 'ta' ? '1,325 வரலாற்று சம்பவ தரவுகள்' : '1,325 Empirical Inundation Records'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-200">
                {language === 'ta' ? 'தடுப்பு முன்னுரிமை ஒதுக்கீடு' : 'Preventive Resource Optimization'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
