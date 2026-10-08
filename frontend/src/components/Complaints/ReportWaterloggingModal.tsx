'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Send,
  X,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';

interface ReportWaterloggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaintId: string) => void;
  selectedMapCoords?: [number, number] | null;
}

// Verified Chennai Major Localities with Bounding Coordinates for Easy Selection
const CHENNAI_PRESET_LOCALITIES: Record<string, [number, number]> = {
  'Velachery (Vijayanagar)': [12.9815, 80.2180],
  'T. Nagar (Usman Road / Panagal Park)': [13.0418, 80.2341],
  'Madipakkam (Balaiah Nagar)': [12.9650, 80.1980],
  'Anna Nagar (Roundtana / 2nd Ave)': [13.0850, 80.2120],
  'Mylapore (Kutchery Road)': [13.0330, 80.2680],
  'Adyar (LB Road / Depot)': [13.0060, 80.2570],
  'Kolathur (Red Hills Road)': [13.1230, 80.2080],
  'Guindy (Kathipara / Estate)': [13.0080, 80.2050],
  'Tambaram (Sanatorium / GST Rd)': [12.9249, 80.1180],
  'Pallavaram (Radha Nagar)': [12.9680, 80.1450],
  'Sholinganallur (OMR Junction)': [12.9010, 80.2280],
  'Perambur (Barracks Road)': [13.1110, 80.2440],
  'Royapuram (Kalmandapam)': [13.1140, 80.2980],
  'Thiruvanmiyur (ECR Junction)': [12.9830, 80.2590],
};

export default function ReportWaterloggingModal({
  isOpen,
  onClose,
  onSuccess,
  selectedMapCoords,
}: ReportWaterloggingModalProps) {
  const API_BASE_URL = getApiBaseUrl();

  const [formData, setFormData] = useState({
    area: '',
    street: '',
    latitude: selectedMapCoords ? selectedMapCoords[0].toString() : '13.0827',
    longitude: selectedMapCoords ? selectedMapCoords[1].toString() : '80.2707',
    severity: 'Moderate',
    waterDepth: '',
    duration: '',
    description: '',
    roadBlocked: 'Unknown',
    emergencyAccessAffected: 'Unknown',
    citizenName: '',
    citizenContact: '',
  });

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'detected' | 'failed'>('idle');
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number;
    longitude: number;
    place?: string;
    district?: string;
    ward?: string;
    displayName?: string;
  } | null>(null);
  const [submittedLocationSummary, setSubmittedLocationSummary] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successComplaintId, setSuccessComplaintId] = useState<string | null>(null);

  // Sync coords if user selected on map
  useEffect(() => {
    if (selectedMapCoords && selectedMapCoords[0] && selectedMapCoords[1]) {
      const lat = Number(selectedMapCoords[0].toFixed(5));
      const lon = Number(selectedMapCoords[1].toFixed(5));
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lon.toString(),
      }));

      fetch(`${API_BASE_URL}/api/v1/locations/reverse-geocode?lat=${lat}&lon=${lon}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) {
            setDetectedLocation({
              latitude: lat,
              longitude: lon,
              place: data.place,
              district: data.district,
              ward: data.ward,
              displayName: data.display_name,
            });
            setFormData((prev) => ({
              ...prev,
              area: data.place || data.district || prev.area || 'Selected Location',
              street: data.ward || prev.street,
            }));
            setGpsStatus('detected');
          }
        })
        .catch(() => {});
    }
  }, [selectedMapCoords, API_BASE_URL]);

  if (!isOpen) return null;

  // Handle Locality preset selection
  const handleLocalitySelect = (localityName: string) => {
    const coords = CHENNAI_PRESET_LOCALITIES[localityName];
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        area: localityName.split(' (')[0],
        latitude: coords[0].toString(),
        longitude: coords[1].toString(),
      }));
      setDetectedLocation({
        latitude: coords[0],
        longitude: coords[1],
        place: localityName.split(' (')[0],
        district: 'Chennai',
      });
      setGpsStatus('detected');
    }
  };

  // Browser HTML5 Geolocation with dynamic reverse geocoding across Tamil Nadu & beyond
  const handleDetectGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('failed');
      setErrorMsg('Unable to detect current location. Please select the location manually on the map.');
      return;
    }
    setGpsStatus('detecting');
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));

        try {
          let res: Response;
          try {
            res = await fetch(`${API_BASE_URL}/api/v1/locations/reverse-geocode?lat=${lat}&lon=${lon}`);
          } catch {
            res = await fetch(`/api/v1/locations/reverse-geocode?lat=${lat}&lon=${lon}`);
          }
          if (res.ok) {
            const data = await res.json();
            setDetectedLocation({
              latitude: lat,
              longitude: lon,
              place: data.place,
              district: data.district,
              ward: data.ward,
              displayName: data.display_name,
            });
            setFormData((prev) => ({
              ...prev,
              latitude: lat.toString(),
              longitude: lon.toString(),
              area: data.place || data.district || prev.area || 'Detected Location',
              street: data.ward || prev.street,
            }));
            setGpsStatus('detected');
            return;
          }
        } catch {
          // Fallback if reverse geocode fails
        }

        setDetectedLocation({
          latitude: lat,
          longitude: lon,
          place: 'Current GPS Location',
          district: 'Tamil Nadu',
        });
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lon.toString(),
          area: prev.area || 'Current GPS Location',
        }));
        setGpsStatus('detected');
      },
      () => {
        setGpsStatus('failed');
        setErrorMsg('Unable to detect current location. Please select the location manually on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Photo/Video attachment
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      if (file.type.startsWith('image/')) {
        setMediaPreview(URL.createObjectURL(file));
      } else {
        setMediaPreview(null);
      }
    }
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      setSubmitting(false);
      return;
    }

    if (!formData.area.trim()) {
      setErrorMsg('Please provide the area, neighborhood, or locality name.');
      setSubmitting(false);
      return;
    }

    if (!formData.description.trim()) {
      setErrorMsg('Please describe the waterlogging situation.');
      setSubmitting(false);
      return;
    }

    try {
      let uploadedPhotoUrl: string | null = null;

      // 1. Upload photo if provided
      if (mediaFile) {
        const uploadData = new FormData();
        uploadData.append('file', mediaFile);
        const upRes = await fetch(`${API_BASE_URL}/api/v1/complaints/upload-media`, {
          method: 'POST',
          body: uploadData,
        });
        if (upRes.ok) {
          const upJson = await upRes.json();
          uploadedPhotoUrl = upJson.media_url;
        }
      }

      // 2. Submit complaint record
      const payload = {
        latitude: lat,
        longitude: lon,
        area: formData.area.trim(),
        street: formData.street.trim() || null,
        severity: formData.severity,
        water_depth: formData.waterDepth.trim() || null,
        duration: formData.duration.trim() || null,
        description: formData.description.trim(),
        road_blocked: formData.roadBlocked,
        emergency_access_affected: formData.emergencyAccessAffected,
        citizen_name: formData.citizenName.trim() || null,
        citizen_contact: formData.citizenContact.trim() || null,
      };

      let res: Response;
      try {
        res = await fetch(`${API_BASE_URL}/api/v1/complaints/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        res = await fetch('/api/v1/complaints/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit waterlogging complaint.');
      }

      setSubmittedLocationSummary(
        detectedLocation?.displayName ||
        `${formData.area}${formData.street ? ` (${formData.street})` : ''}`
      );
      setSuccessComplaintId(data.complaint_id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Report Waterlogging
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Citizen Waterlogging Report
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Submit live waterlogging reports across Tamil Nadu with GPS or manual location selection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {successComplaintId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Complaint Submitted Successfully</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your report has been received and logged in the municipal operations queue for verification and dispatch.
              </p>

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2.5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Complaint ID:
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-blue-400 tracking-wider">
                    {successComplaintId}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Location:
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {submittedLocationSummary || `${formData.area} (${formData.latitude}°N, ${formData.longitude}°E)`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Status:
                  </div>
                  <div className="text-xs font-bold text-amber-400">
                    Submitted
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    onSuccess(successComplaintId);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className="h-4 w-4" />
                  Track Complaint Now
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Location Selection */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    1. Location / Area *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={gpsStatus === 'detecting'}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 transition cursor-pointer"
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{gpsStatus === 'detecting' ? 'Detecting location...' : '📍 Use My Current Location'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 transition cursor-pointer"
                    >
                      <span>🗺️ Select on Map</span>
                    </button>
                  </div>
                </div>

                {/* GPS Detecting Indicator */}
                {gpsStatus === 'detecting' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2 animate-pulse">
                    <Navigation className="h-4 w-4 text-blue-400 animate-spin" />
                    <span>Detecting location...</span>
                  </div>
                )}

                {/* GPS Detected Success Card */}
                {gpsStatus === 'detected' && detectedLocation && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle className="h-4 w-4" />
                      <span>✓ Current location detected</span>
                    </div>
                    <div className="font-mono text-slate-300 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                      <div>Latitude: <strong className="text-white">{detectedLocation.latitude.toFixed(5)}</strong></div>
                      <div>Longitude: <strong className="text-white">{detectedLocation.longitude.toFixed(5)}</strong></div>
                    </div>
                    <div className="pt-1 border-t border-emerald-500/20 text-slate-200">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Detected Place:</span>
                      {detectedLocation.place && <div className="font-bold text-white text-sm">{detectedLocation.place}</div>}
                      {detectedLocation.district && <div className="text-slate-300">{detectedLocation.district}</div>}
                      {detectedLocation.ward && <div className="text-emerald-300 font-semibold">{detectedLocation.ward}</div>}
                    </div>
                  </div>
                )}

                {/* GPS Failed Fallback Card */}
                {gpsStatus === 'failed' && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">Unable to detect current location.</div>
                        <div>Please select the location manually on the map.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>🗺️ Select Location on Map</span>
                    </button>
                  </div>
                )}

                {/* Quick Locality Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.keys(CHENNAI_PRESET_LOCALITIES).slice(0, 7).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleLocalitySelect(loc)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      {loc.split(' (')[0]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <input
                      type="text"
                      placeholder="Area / Neighborhood / Town (e.g., Perambur, Gandhipuram)"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Street / Ward / Landmark (optional)"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Coordinates:</span>
                  <span className="font-mono text-slate-300">{formData.latitude}° N, {formData.longitude}° E</span>
                  <span className="text-blue-400 text-xs">
                    {detectedLocation?.district ? `✓ ${detectedLocation.district} Resolved` : '✓ Valid Coordinates'}
                  </span>
                </div>
              </div>

              {/* 2. Waterlogging Severity & Depth */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low (Puddles / Slow drainage)</option>
                    <option value="Moderate">Moderate (Ankle to shin deep)</option>
                    <option value="Severe">Severe (Knee deep / Submerged)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Approx Depth (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1.5 ft, Knee deep"
                    value={formData.waterDepth}
                    onChange={(e) => setFormData({ ...formData, waterDepth: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Duration (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours, Overnight"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 3. Description */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Waterlogging Details / Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe where water is accumulating, blocked storm drains, nearby affected landmarks, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* 4. Road Block & Emergency Access Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Is the road blocked for vehicles?
                  </label>
                  <div className="flex gap-4 text-xs text-slate-300">
                    {['Yes', 'No', 'Unknown'].map((val) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="roadBlocked"
                          value={val}
                          checked={formData.roadBlocked === val}
                          onChange={(e) => setFormData({ ...formData, roadBlocked: e.target.value })}
                          className="text-blue-500"
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Is emergency / hospital access affected?
                  </label>
                  <div className="flex gap-4 text-xs text-slate-300">
                    {['Yes', 'No', 'Unknown'].map((val) => (
                      <label key={val} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="emergencyAccessAffected"
                          value={val}
                          checked={formData.emergencyAccessAffected === val}
                          onChange={(e) => setFormData({ ...formData, emergencyAccessAffected: e.target.value })}
                          className="text-blue-500"
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Photo / Video Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Attach Photo / Evidence (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-2 transition">
                    <Camera className="h-4 w-4 text-blue-400" />
                    <span>{mediaFile ? 'Change File' : 'Upload Image / Video'}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                  </label>
                  {mediaFile && (
                    <span className="text-xs text-slate-300 truncate max-w-xs font-mono">
                      {mediaFile.name} ({(mediaFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  )}
                </div>
                {mediaPreview && (
                  <div className="mt-2 relative w-32 h-24 rounded-lg overflow-hidden border border-slate-700">
                    <img src={mediaPreview} alt="Evidence preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* 6. Contact Information & Privacy Notice */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Privacy Protected: Contact details are never shown on public maps. Only GCC response crews can view this for follow-up.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={formData.citizenName}
                    onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone or Email for status alerts (optional)"
                    value={formData.citizenContact}
                    onChange={(e) => setFormData({ ...formData, citizenContact: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  {submitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
