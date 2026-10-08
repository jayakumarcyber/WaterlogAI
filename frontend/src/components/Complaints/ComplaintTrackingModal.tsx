'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  X,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  CloudRain,
  ShieldCheck,
  Truck,
  Layers,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface ComplaintTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialComplaintId?: string | null;
}

export default function ComplaintTrackingModal({
  isOpen,
  onClose,
  initialComplaintId,
}: ComplaintTrackingModalProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  const [searchId, setSearchId] = useState<string>(initialComplaintId || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [complaintData, setComplaintData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      handleFetchStatus(initialComplaintId);
    }
  }, [initialComplaintId]);

  if (!isOpen) return null;

  const handleFetchStatus = async (idToFetch?: string) => {
    const cid = (idToFetch || searchId).trim();
    if (!cid) {
      setErrorMsg('Please enter a valid CivicPulse Complaint ID (e.g., CP-CHN-000001).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let res: Response;
      try {
        res = await fetch(`${API_BASE_URL}/api/v1/complaints/track/${encodeURIComponent(cid)}`);
      } catch {
        res = await fetch(`/api/v1/complaints/track/${encodeURIComponent(cid)}`);
      }
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || `Complaint '${cid}' not found.`);
      }

      setComplaintData(data);
    } catch (err: any) {
      setComplaintData(null);
      setErrorMsg(err.message || 'Unable to track complaint. Please verify the ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ASSIGNED':
      case 'ACTION IN PROGRESS':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'UNDER REVIEW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Search className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Track Waterlogging Complaint
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Citizen Waterlogging Tracking Portal
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live verification, municipal assignment, and pumping action tracking
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

        {/* Search Input Bar */}
        <div className="p-6 pb-2 border-b border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchStatus();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Enter CivicPulse Complaint ID (e.g., CP-CHN-000001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Complaint Details & Timeline */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!complaintData && !loading && !errorMsg && (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-slate-600" />
              <div className="text-sm font-medium text-slate-400">No complaint loaded</div>
              <div className="text-xs max-w-sm mx-auto">
                Enter your unique CivicPulse Complaint ID received upon reporting to inspect real-time municipal response.
              </div>
            </div>
          )}

          {complaintData && (
            <div className="space-y-6">
              {/* ID & Status Summary Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Complaint ID:</span>
                    <span className="text-base font-mono font-bold text-blue-400">
                      {complaintData.complaint_id}
                    </span>
                    <button
                      onClick={() => handleCopyId(complaintData.complaint_id)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                      title="Copy ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeColor(
                        complaintData.status
                      )}`}
                    >
                      ● {complaintData.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {complaintData.verification_status}
                    </span>
                  </div>
                </div>

                {/* Location & Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Area / Locality</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-red-400" />
                      {complaintData.area}
                    </span>
                    {complaintData.street && (
                      <span className="text-slate-400 block text-[11px] truncate">{complaintData.street}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-500 block">Severity</span>
                    <span className="font-semibold text-amber-400 mt-0.5 block">{complaintData.severity}</span>
                    <span className="text-slate-400 block text-[11px]">
                      Depth: {complaintData.water_depth || 'Not reported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Road Blocked</span>
                    <span className="font-semibold text-white mt-0.5 block">{complaintData.road_blocked}</span>
                    <span className="text-slate-400 block text-[11px]">
                      Emergency Access: {complaintData.emergency_access_affected}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reported At</span>
                    <span className="font-semibold text-white mt-0.5 block">
                      {new Date(complaintData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-400 block text-[11px]">
                      {new Date(complaintData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 font-semibold block mb-1">Citizen Description:</span>
                  <p className="text-slate-200">{complaintData.description}</p>
                </div>

                {complaintData.assigned_crew && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                    <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">Assigned Response Crew: </span>
                      <span>{complaintData.assigned_crew}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5-Step Operational Progression Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Resolution Lifecycle Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                  {complaintData.status_timeline.map((step: any) => {
                    const isDone = step.status === 'completed';
                    const isCurrent = step.status === 'current';
                    return (
                      <div key={step.step} className="relative group">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : isCurrent
                              ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20'
                              : 'bg-slate-800 border-slate-600'
                          }`}
                        >
                          {isDone && <CheckCircle className="h-2.5 w-2.5" />}
                        </div>

                        <div className="text-xs">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold ${
                                isDone ? 'text-emerald-300' : isCurrent ? 'text-blue-300' : 'text-slate-400'
                              }`}
                            >
                              {step.step}. {step.title}
                            </span>
                            {step.timestamp && (
                              <span className="text-[10px] text-slate-500">
                                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-World Local Rainfall & Risk Context */}
              {complaintData.risk_context && (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <CloudRain className="h-4 w-4 text-blue-400" />
                      Observed Chennai Climatological Context
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      Real Station Data
                    </span>
                  </div>

                  <p className="text-slate-400">{complaintData.risk_context.risk_assessment_note}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                    <div className="p-2 bg-slate-900/50 rounded-lg">
                      <span className="block text-slate-500">Stormwater Drainage GIS</span>
                      <span className="font-mono text-amber-400 font-medium">DATA UNAVAILABLE</span>
                    </div>
                    <div className="p-2 bg-slate-900/50 rounded-lg">
                      <span className="block text-slate-500">Waterbodies / Rivers GIS</span>
                      <span className="font-mono text-amber-400 font-medium">DATA UNAVAILABLE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Taken Section */}
              {complaintData.action_taken && (
                <div className="p-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-white block">Municipal Action Log:</span>
                  <p className="text-slate-300">{complaintData.action_taken}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Citizen Privacy: Personal identity and contact numbers remain confidential.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
