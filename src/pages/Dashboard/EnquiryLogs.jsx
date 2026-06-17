import React, { useState, useEffect, useCallback } from 'react';
import { enquiryAPI } from '../../api/services';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
const fmtDateShort = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    NEW:      { cls: 'bg-blue-50 border-blue-100 text-blue-700',     dot: 'bg-blue-500 animate-pulse' },
    READ:     { cls: 'bg-amber-50 border-amber-100 text-amber-700',  dot: 'bg-amber-500'              },
    RESOLVED: { cls: 'bg-emerald-50 border-emerald-100 text-emerald-700', dot: 'bg-emerald-500'       },
  }[status] || { cls: 'bg-slate-50 border-slate-200 text-slate-500', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Detail slide-in panel ─────────────────────────────────────────────────────
function EnquiryDetailPanel({ enquiry, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!enquiry) return null;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await enquiryAPI.updateStatus(enquiry._id, newStatus);
      onStatusChange(enquiry._id, newStatus);
    } catch {
      // silent — UI stays consistent
    } finally {
      setUpdating(false);
    }
  };

  const subjectColor = {
    'General Enquiry':  'bg-blue-50 text-blue-700 border-blue-100',
    'Scheme Related':   'bg-violet-50 text-violet-700 border-violet-100',
    'Technical Support':'bg-orange-50 text-orange-700 border-orange-100',
  }[enquiry.subject] || 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Enquiry Detail</p>
              <h2 className="text-xl font-black leading-tight truncate">{enquiry.name}</h2>
              <p className="text-white/70 text-sm mt-0.5 truncate">{enquiry.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0 mt-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Subject + status strip */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${subjectColor}`}>
              {enquiry.enquiryType === 'PROGRAM_APPLICATION' ? '📋 ' : ''}{enquiry.subject}
            </span>
            {enquiry.enquiryType === 'PROGRAM_APPLICATION' && (
              <span className="text-[10px] font-black bg-violet-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                Program Apply
              </span>
            )}
            <StatusBadge status={enquiry.status} />
            <span className="text-xs text-white/50 ml-auto">{fmtDateShort(enquiry.createdAt)}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Sender info */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sender Information</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              {[
                { label: 'Full Name',     value: enquiry.name  },
                { label: 'Email Address', value: enquiry.email },
                { label: 'Mobile Number', value: enquiry.phone },
              ].map((row) => (
                <div key={row.label} className="px-4 py-3 flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{row.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Application Fields — only shown when type is PROGRAM_APPLICATION */}
          {enquiry.enquiryType === 'PROGRAM_APPLICATION' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Program Application Details</p>
                <span className="text-[10px] font-black bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Program Apply
                </span>
              </div>
              <div className="bg-violet-50 rounded-xl border border-violet-100 divide-y divide-violet-100">
                {[
                  { label: 'Program Name', value: enquiry.programName },
                  { label: 'Address',      value: enquiry.address     },
                  { label: 'PIN Code',     value: enquiry.pinCode     },
                  { label: 'District',     value: enquiry.district    },
                ].map((row) => (
                  <div key={row.label} className="px-4 py-3 flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{row.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Message</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{enquiry.message || '—'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Timeline</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Submitted On</span>
                <span className="text-sm font-semibold text-slate-800">{fmtDate(enquiry.createdAt)}</span>
              </div>
              <div className="px-4 py-3 flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Updated</span>
                <span className="text-sm font-semibold text-slate-800">{fmtDate(enquiry.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Status actions */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {['NEW', 'READ', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  disabled={updating || enquiry.status === s}
                  onClick={() => handleStatus(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    enquiry.status === s
                      ? s === 'NEW'      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : s === 'READ'     ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {updating && enquiry.status !== s ? '...' : s}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EnquiryLogs() {
  const [enquiries,    setEnquiries]    = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected,     setSelected]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await enquiryAPI.getAll('', 200);
      if (data.success) {
        setEnquiries(data.data.enquiries || []);
        setSummary(data.data.summary);
      } else {
        setError('Failed to load enquiries.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Update status in local state after API call
  const handleStatusChange = (id, newStatus) => {
    setEnquiries((prev) =>
      prev.map((e) => e._id === id ? { ...e, status: newStatus, updatedAt: new Date().toISOString() } : e)
    );
    setSelected((prev) => prev?._id === id ? { ...prev, status: newStatus } : prev);
    setSummary((prev) => {
      if (!prev) return prev;
      // Recalculate counts from updated list
      return prev; // will refresh on next fetchData
    });
  };

  const filtered = enquiries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q) ||
      e.subject?.toLowerCase().includes(q) ||
      e.message?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Live counts from current list
  const liveCounts = {
    NEW:      enquiries.filter((e) => e.status === 'NEW').length,
    READ:     enquiries.filter((e) => e.status === 'READ').length,
    RESOLVED: enquiries.filter((e) => e.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Enquiries', value: summary?.total ?? enquiries.length,  color: 'text-slate-800'   },
            { label: 'New',             value: liveCounts.NEW,                       color: 'text-blue-600'    },
            { label: 'Read',            value: liveCounts.READ,                      color: 'text-amber-600'   },
            { label: 'Resolved',        value: liveCounts.RESOLVED,                  color: 'text-emerald-600' },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, subject, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'NEW', 'READ', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                statusFilter === s
                  ? s === 'NEW'      ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : s === 'READ'     ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : s === 'RESOLVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {s}
              {s === 'NEW' && liveCounts.NEW > 0 && (
                <span className="ml-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {liveCounts.NEW}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={fetchData}
            title="Refresh"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sender</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Preview</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((e) => (
                    <tr
                      key={e._id}
                      onClick={() => setSelected(e)}
                      className={`cursor-pointer transition-colors group hover:bg-blue-50/40 ${
                        e.status === 'NEW' ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <p className={`font-semibold group-hover:text-blue-700 transition-colors ${
                          e.status === 'NEW' ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {e.name}
                          {e.status === 'NEW' && (
                            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-blue-500 align-middle" />
                          )}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{e.phone} · {e.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                          e.subject === 'General Enquiry'   ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : e.subject === 'Scheme Related'  ? 'bg-violet-50 text-violet-700 border-violet-100'
                          : e.subject === 'Program Application' ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {e.enquiryType === 'PROGRAM_APPLICATION' ? '📋 ' : ''}{e.subject}
                        </span>
                        {e.programName && (
                          <p className="text-[11px] text-slate-400 mt-1 truncate max-w-[140px]">{e.programName}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs text-slate-500 truncate">{e.message}</p>
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-slate-500 whitespace-nowrap">
                        {fmtDateShort(e.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                      {enquiries.length === 0
                        ? 'No enquiries received yet.'
                        : 'No enquiries match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Click any row to view full details & update status</p>
            <p className="text-xs text-slate-400">Showing {filtered.length} of {enquiries.length}</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <EnquiryDetailPanel
          enquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

    </div>
  );
}
