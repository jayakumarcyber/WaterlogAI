'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Phone,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  Edit3,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface OperationsComplaintQueueProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOnMap?: (coords: [number, number]) => void;
}

export default function OperationsComplaintQueue({
  isOpen,
  onClose,
  onSelectOnMap,
}: OperationsComplaintQueueProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  const [complaints, setComplaints] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  // Review Form state
  const [reviewForm, setReviewForm] = useState({
    status: '',
    verificationStatus: '',
    priority: '',
    assignedCrew: '',
    actionTaken: '',
    zoneId: '',
    wardId: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/complaints/operations/queue?status_filter=${statusFilter}&severity_filter=${severityFilter}`),
        fetch(`${API_BASE_URL}/api/v1/complaints/operations/summary`),
      ]);

      if (listRes.ok) {
        const listData = await listRes.json();
        setComplaints(listData);
      }
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to load complaints queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComplaints();
    }
  }, [isOpen, statusFilter, severityFilter]);

  if (!isOpen) return null;

  const handleOpenReview = (complaint: any) => {
    setSelectedComplaint(complaint);
    setReviewForm({
      status: complaint.status,
      verificationStatus: complaint.verification_status,
      priority: complaint.priority,
      assignedCrew: complaint.assigned_crew || '',
      actionTaken: complaint.action_taken || '',
      zoneId: complaint.zone_id ? complaint.zone_id.toString() : '',
      wardId: complaint.ward_id ? complaint.ward_id.toString() : '',
    });
    setReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);

    try {
      const payload: any = {
        status: reviewForm.status,
        verification_status: reviewForm.verificationStatus,
        priority: reviewForm.priority,
        assigned_crew: reviewForm.assignedCrew,
        action_taken: reviewForm.actionTaken,
      };
      if (reviewForm.zoneId) payload.zone_id = parseInt(reviewForm.zoneId);
      if (reviewForm.wardId) payload.ward_id = parseInt(reviewForm.wardId);

      const res = await fetch(`${API_BASE_URL}/api/v1/complaints/operations/${selectedComplaint.complaint_id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReviewModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      console.error('Failed to update complaint review:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'severe':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
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
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <ShieldAlert className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">GCC Municipal Complaints Queue</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Chennai Operations Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Citizen waterlogging reports triage, verification, crew assignment, and desilting/pumping dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-5 bg-slate-950/60 border-b border-slate-800">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-medium block">Total Reports</span>
              <span className="text-xl font-bold text-white mt-1 block">{summary.total_complaints}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-yellow-400 font-medium block">Unverified (🟡)</span>
              <span className="text-xl font-bold text-yellow-400 mt-1 block">{summary.unverified_count}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-blue-400 font-medium block">Under Review (🔵)</span>
              <span className="text-xl font-bold text-blue-400 mt-1 block">{summary.under_review_count}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-amber-400 font-medium block">Assigned / In Progress (🟠)</span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">{summary.assigned_action_count}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-emerald-400 font-medium block">Resolved (🟢)</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{summary.resolved_count}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-rose-400 font-medium block">Critical Priority</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block">{summary.active_critical_priority}</span>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <Filter className="h-3.5 w-3.5 text-blue-400" /> Filter Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACTION IN PROGRESS">Action In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <span className="text-slate-400 font-semibold ml-2">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Severities</option>
              <option value="Severe">Severe</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{complaints.length}</strong> real-world reports
          </div>
        </div>

        {/* Complaints Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {complaints.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-600" />
              <div className="text-base font-semibold text-slate-300">No Citizen Reports in Queue</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No real-world waterlogging complaints have been reported yet for this filter. The system does NOT seed
                fake complaints. Reports appear here as citizens submit them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-3">Complaint ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Area / Street</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Assigned Crew</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">{c.complaint_id}</td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(c.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        <br />
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-white block">{c.area}</span>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[150px]">
                          {c.street || 'No street spec'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getSeverityBadge(c.severity)}`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={
                            c.verification_status === 'VERIFIED INCIDENT'
                              ? 'text-emerald-400 font-semibold'
                              : 'text-amber-400'
                          }
                        >
                          {c.verification_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span
                          className={
                            c.priority === 'CRITICAL'
                              ? 'text-rose-400 font-bold'
                              : 'text-slate-300'
                          }
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px]">
                        {c.assigned_crew ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Truck className="h-3 w-3" />
                            {c.assigned_crew}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleOpenReview(c)}
                          className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          Review & Dispatch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Review & Dispatch Modal */}
        {reviewModalOpen && selectedComplaint && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Review Complaint: <span className="font-mono text-blue-400">{selectedComplaint.complaint_id}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedComplaint.area} {selectedComplaint.street ? `(${selectedComplaint.street})` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Citizen Contact Details (Authorized View) */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Authorized Dispatcher Contact View:</div>
                <div className="flex items-center gap-4 text-slate-200">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                    {selectedComplaint.citizen_name || 'Anonymous citizen'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    {selectedComplaint.citizen_contact || 'No phone provided'}
                  </span>
                </div>
                <div className="text-slate-300 mt-1">
                  <strong>Citizen Description:</strong> {selectedComplaint.description}
                </div>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Verification Status</label>
                    <select
                      value={reviewForm.verificationStatus}
                      onChange={(e) => setReviewForm({ ...reviewForm, verificationStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="UNVERIFIED">UNVERIFIED</option>
                      <option value="VERIFIED INCIDENT">VERIFIED INCIDENT</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Operational Progress Status</label>
                    <select
                      value={reviewForm.status}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER REVIEW">UNDER REVIEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="ACTION IN PROGRESS">ACTION IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Priority Rating</label>
                    <select
                      value={reviewForm.priority}
                      onChange={(e) => setReviewForm({ ...reviewForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="STANDARD">STANDARD</option>
                      <option value="ELEVATED">ELEVATED</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Assign Emergency Response Crew</label>
                    <input
                      type="text"
                      placeholder="e.g., GCC Zone 13 Pumping Crew 2"
                      value={reviewForm.assignedCrew}
                      onChange={(e) => setReviewForm({ ...reviewForm, assignedCrew: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Action Taken Log</label>
                  <textarea
                    rows={2}
                    placeholder="Log action (e.g., 100HP diesel pump deployed, drain inlet grate cleared of debris)"
                    value={reviewForm.actionTaken}
                    onChange={(e) => setReviewForm({ ...reviewForm, actionTaken: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl"
                  >
                    {updating ? 'Saving...' : 'Save & Dispatch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
