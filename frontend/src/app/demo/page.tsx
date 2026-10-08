'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Play,
  MapPin,
  CheckSquare,
  AlertTriangle,
  FileSearch,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import GovUtilityBar from '@/components/Navigation/GovUtilityBar';
import GovHeader from '@/components/Navigation/GovHeader';
import GovFooter from '@/components/Navigation/GovFooter';
import LocationSelector from '@/components/Navigation/LocationSelector';
import HackathonDemoEngine from '@/components/HackathonDemo/HackathonDemoEngine';
import ReportWaterloggingModal from '@/components/Complaints/ReportWaterloggingModal';
import ComplaintTrackingModal from '@/components/Complaints/ComplaintTrackingModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function JuryDemoPage() {
  const { language, t } = useLanguage();

  // Location selector state (Tamil Nadu -> Chennai -> Perambur -> Ward 64)
  const [district, setDistrict] = useState<string>('Chennai');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>('perambur');
  const [selectedWardId, setSelectedWardId] = useState<string | number | null>(64);
  const [selectedPlace, setSelectedPlace] = useState<any>({
    id: 'perambur',
    name: 'Perambur',
    ward_number: 64,
  });

  // Complaint Modals state
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  const handleComplaintSuccess = (complaintId: string) => {
    setActiveTrackId(complaintId);
    setShowReportModal(false);
    setShowTrackModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* ── 1. Top Government Utility Bar ──────────────────────────────────── */}
      <GovUtilityBar systemOperational={true} />

      {/* ── 2. Official Municipal Header (Jury Demo Mode) ──────────────────── */}
      <GovHeader
        isDemo={true}
        onReportWaterlogging={() => setShowReportModal(true)}
        onTrackComplaint={() => {
          setActiveTrackId(null);
          setShowTrackModal(true);
        }}
      />

      {/* ── 3. Main Container (Responsive 95% width, max-w-[1600px]) ──────── */}
      <main className="max-w-[1600px] w-[95%] mx-auto px-3 sm:px-5 lg:px-6 py-5 space-y-6 w-full flex-1">
        
        {/* ── A. Public-Sector Hero Section with Real Kathipara Image ───────── */}
        <section
          aria-label="Jury Demonstration Hero"
          className="bg-white border border-slate-300 rounded-lg p-5 sm:p-7 shadow-xs relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#1b365d] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>CIVICPULSE MONSOON</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  JURY DEMO
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold uppercase tracking-wider">
                  DEMO DATA / SIMULATION
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {language === 'ta'
                  ? 'சென்னை நீர் தேங்கும் இடர் நுண்ணறிவு'
                  : 'Chennai Waterlogging Risk Intelligence'}
              </h1>

              <p className="text-sm sm:text-base font-bold text-blue-900 leading-snug">
                {language === 'ta'
                  ? 'செயற்கை நுண்ணறிவு அடிப்படையிலான நகர்ப்புற வெள்ள அபாய கணிப்பு மற்றும் தடுப்பு முடிவு ஆதரவு'
                  : 'AI-assisted urban waterlogging prediction and preventive decision support'}
              </p>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                {language === 'ta'
                  ? 'கட்டுப்படுத்தப்பட்ட நடுவர் செயல்விளக்கம்: சூழ்நிலை அடிப்படையிலான இடர் பகுப்பாய்வு மற்றும் நகராட்சி வள உகப்பாக்கம்.'
                  : 'Controlled jury demonstration using scenario-based risk and resource optimization across monitored Chennai wards and administrative corridors.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  id="hero-btn-scenario"
                  onClick={() => {
                    const el = document.getElementById('scenario-rainfall-input');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{language === 'ta' ? '30 மி.மீ சூழ்நிலையை இயக்கு' : 'Run 30 mm Scenario'}</span>
                </button>

                <button
                  type="button"
                  id="hero-btn-map"
                  onClick={() => {
                    const el = document.getElementById('current-risk-map');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1b365d] hover:bg-[#12243e] active:bg-[#0a1524] text-white rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'இடர் வரைபடத்தை ஆராய்க' : 'Explore Risk Map'}</span>
                </button>

                <button
                  type="button"
                  id="hero-btn-priority"
                  onClick={() => {
                    const el = document.getElementById('priority-actions');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
                  <span>{language === 'ta' ? 'முன்னுரிமை நடவடிக்கைகள்' : 'Priority Actions'}</span>
                </button>
              </div>
            </div>

            {/* Right Aerial Photo Column (5 cols) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-lg overflow-hidden border border-slate-300 shadow-md group bg-slate-900">
                <img
                  src="/images/chennai/hero-kathipara.jpg"
                  alt="Aerial view of Kathipara Urban Infrastructure and Drainage Corridor in Chennai, Tamil Nadu"
                  className="w-full h-56 sm:h-64 object-cover object-center select-none transition duration-300 group-hover:scale-102"
                  loading="eager"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-3 text-white">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Kathipara Infrastructure &amp; Urban Drainage Corridor &bull; Chennai</span>
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono hidden sm:inline-block">High-Res Aerial</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── B. Clean Civic Services / Quick Actions Row ────────────────────── */}
        <section
          aria-label="Civic Services and Quick Actions"
          className="bg-white border border-slate-300 rounded-lg p-3 sm:p-4 shadow-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {language === 'ta' ? 'நகராட்சி சேவைகள் / விரைவு நடவடிக்கைகள்' : 'CIVIC SERVICES / QUICK ACTIONS'}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                &bull; Municipal Operations &amp; Citizen Incident Handling
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="demo-btn-report-waterlogging"
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <span>🚨</span>
                <span>{language === 'ta' ? 'வெள்ளப் பதிவேற்றம்' : 'Report Waterlogging'}</span>
              </button>

              <button
                type="button"
                id="demo-btn-track-complaint"
                onClick={() => {
                  setActiveTrackId(null);
                  setShowTrackModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <span>🔎</span>
                <span>{language === 'ta' ? 'புகாரை கண்காணிக்க' : 'Track Complaint'}</span>
              </button>

              <button
                type="button"
                id="demo-btn-risk-map"
                onClick={() => {
                  const el = document.getElementById('current-risk-map');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1b365d] hover:bg-[#12243e] text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <span>🗺️</span>
                <span>{language === 'ta' ? 'இடர் வரைபடம்' : 'Risk Map'}</span>
              </button>

              <button
                type="button"
                id="demo-btn-ward-insights"
                onClick={() => {
                  const el = document.getElementById('place-inspector');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-md shadow-2xs transition cursor-pointer"
              >
                <span>📊</span>
                <span>{language === 'ta' ? 'வார்டு ஆய்வுகள்' : 'Ward Insights'}</span>
              </button>

              <button
                type="button"
                id="demo-btn-priority-actions"
                onClick={() => {
                  const el = document.getElementById('priority-actions');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-md shadow-xs transition cursor-pointer"
              >
                <span>⚙️</span>
                <span>{language === 'ta' ? 'முன்னுரிமை நடவடிக்கைகள்' : 'Priority Actions'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── C. Dynamic Location Hierarchy (Tamil Nadu -> District -> Place -> Ward) ── */}
        <LocationSelector
          district={district}
          selectedPlaceId={selectedPlaceId}
          selectedWardId={selectedWardId}
          onDistrictSelect={(newDistrict) => {
            setDistrict(newDistrict);
            if (newDistrict.toLowerCase() === 'chennai') {
              setSelectedPlaceId('perambur');
              setSelectedWardId(64);
              setSelectedPlace({ id: 'perambur', name: 'Perambur', ward_number: 64 });
            } else {
              setSelectedPlaceId(null);
              setSelectedWardId(null);
              setSelectedPlace(null);
            }
          }}
          onPlaceSelect={(place) => {
            setSelectedPlaceId(place?.id || null);
            setSelectedPlace(place);
          }}
          onWardSelect={(ward) => {
            setSelectedWardId(ward?.ward_number || ward?.id || null);
            if (ward) {
              setSelectedPlace({
                ...ward,
                name: `Ward ${ward.ward_number || ward.id}`,
                label: `Ward ${ward.ward_number || ward.id}`,
                ward_number: ward.ward_number || ward.id,
              });
            }
          }}
          apiBaseUrl={API_BASE_URL}
        />

        {/* Non-Chennai District Information Strip */}
        {district.toLowerCase() !== 'chennai' && (
          <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>{district} District Selected:</strong> Multi-factor simulation and OR-Tools resource models are calibrated for Chennai municipal telemetry. Other districts demonstrate spatial boundaries and administrative hierarchy.
              </span>
            </div>
            <button
              onClick={() => {
                setDistrict('Chennai');
                setSelectedPlaceId('perambur');
                setSelectedWardId(64);
                setSelectedPlace({ id: 'perambur', name: 'Perambur', ward_number: 64 });
              }}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap ml-3 cursor-pointer"
            >
              Return to Chennai GCC Core →
            </button>
          </div>
        )}

        {/* ── D. Core Public-Sector Demo Engine Workspace ─────────────────────── */}
        <HackathonDemoEngine
          apiBaseUrl={API_BASE_URL}
          externalSelectedPlace={selectedPlace}
        />

      </main>

      {/* ── 4. Citizen Complaint Handling Modals ────────────────────────────── */}
      <ReportWaterloggingModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={handleComplaintSuccess}
        selectedMapCoords={null}
      />

      <ComplaintTrackingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        initialComplaintId={activeTrackId}
      />

      {/* ── 5. Standard Institutional Footer with Demo Disclosure ────────────── */}
      <GovFooter />
    </div>
  );
}
