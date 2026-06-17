import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../../api/services';

const fmt     = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtRs   = (n) => `₹${fmt(n)}`;
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
function StatusBadge({ status, size = 'sm' }) {
  const cfg = {
    SUCCESS: { dot: 'bg-emerald-500',      cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    PENDING: { dot: 'bg-amber-500 animate-pulse', cls: 'bg-amber-50 border-amber-100 text-amber-600' },
    FAILED:  { dot: 'bg-red-500',           cls: 'bg-red-50 border-red-100 text-red-600' },
  }[status] || { dot: 'bg-slate-400', cls: 'bg-slate-50 border-slate-200 text-slate-500' };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${cfg.cls} ${
      size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-1'
    }`}>
      <span className={`rounded-full shrink-0 ${cfg.dot} ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} />
      {status}
    </span>
  );
}

// ── Detail row helper ─────────────────────────────────────────────────────────
function DetailRow({ label, value, mono = false, highlight }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold break-all ${mono ? 'font-mono' : ''} ${highlight || 'text-slate-800'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// ── Slide-in detail panel ─────────────────────────────────────────────────────
function DonationDetailPanel({ donation, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!donation) return null;

  const statusColor = {
    SUCCESS: 'from-emerald-600 to-emerald-700',
    PENDING: 'from-amber-500 to-amber-600',
    FAILED:  'from-red-500 to-red-600',
  }[donation.status] || 'from-slate-700 to-slate-800';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className={`bg-gradient-to-r ${statusColor} px-6 py-5 text-white shrink-0`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                Donation Detail
              </p>
              <h2 className="text-xl font-black leading-tight">{donation.name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{donation.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0 mt-0.5"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Amount hero */}
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60 font-medium">Donation Amount</p>
              <p className="text-3xl font-black mt-0.5">{fmtRs(donation.amount)}</p>
            </div>
            <StatusBadge status={donation.status} size="lg" />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* Donor info section */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-2">
            Donor Information
          </p>
          <div className="bg-slate-50 rounded-xl px-4 border border-slate-100">
            <DetailRow label="Full Name"     value={donation.name} />
            <DetailRow label="Email Address" value={donation.email} />
            <DetailRow label="Mobile Number" value={donation.phone} />
            <DetailRow
              label="PAN Number"
              value={donation.pan || 'Not Provided'}
              mono
              highlight={donation.pan ? 'text-violet-700' : 'text-amber-600'}
            />
          </div>

          {/* Payment info section */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-5">
            Payment Information
          </p>
          <div className="bg-slate-50 rounded-xl px-4 border border-slate-100">
            <DetailRow
              label="Razorpay Order ID"
              value={donation.razorpayOrderId}
              mono
              highlight="text-slate-700"
            />
            <DetailRow
              label="Razorpay Payment ID"
              value={donation.razorpayPaymentId || 'Not captured yet'}
              mono
              highlight={donation.razorpayPaymentId ? 'text-slate-700' : 'text-slate-400'}
            />
            <DetailRow
              label="Payment Status"
              value={
                <StatusBadge status={donation.status} size="sm" />
              }
            />
            <DetailRow label="Initiated On"  value={fmtDate(donation.createdAt)} />
            <DetailRow label="Last Updated"  value={fmtDate(donation.updatedAt)} />
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

      {/* Slide-in animation */}
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'slate' }) {
  const colors = {
    slate:   'text-slate-800',
    emerald: 'text-emerald-600',
    amber:   'text-amber-600',
    red:     'text-red-500',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DonationLogs() {
  const [donations,    setDonations]    = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected,     setSelected]     = useState(null); // donation detail panel

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await analyticsAPI.getDonationStats(200);
      if (data.success) {
        setDonations(data.data.donations || []);
        setSummary(data.data.summary);
      } else {
        setError('Failed to load donation data.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = donations.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      d.name?.toLowerCase().includes(q) ||
      d.razorpayOrderId?.toLowerCase().includes(q) ||
      d.razorpayPaymentId?.toLowerCase().includes(q) ||
      d.pan?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <StatCard label="Total Collected"    value={fmtRs(summary?.totalAmount)}  color="emerald" />
          <StatCard label="Total Transactions" value={fmt(summary?.totalCount)}      color="slate"   />
          <StatCard label="Successful"         value={fmt(summary?.successCount)}    color="emerald" />
          <StatCard label="Pending / Failed"   value={`${fmt(summary?.pendingCount)} / ${fmt(summary?.failedCount)}`} color="amber" />
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
            placeholder="Search by name, order ID, payment ID, PAN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                statusFilter === s
                  ? s === 'SUCCESS' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : s === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : s === 'FAILED'  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {s}
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

      {/* Error state */}
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
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order / Payment ID</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Donor</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">PAN</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((d) => (
                    <tr
                      key={d._id}
                      onClick={() => setSelected(d)}
                      className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                      title="Click to view details"
                    >
                      <td className="py-4 px-4">
                        <p className="font-mono font-semibold text-slate-800 text-xs truncate max-w-[160px] group-hover:text-emerald-700 transition-colors" title={d.razorpayOrderId}>
                          {d.razorpayOrderId || '—'}
                        </p>
                        {d.razorpayPaymentId && (
                          <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]" title={d.razorpayPaymentId}>
                            {d.razorpayPaymentId}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">{d.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{d.phone} · {d.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-mono text-xs px-2 py-1 rounded-md font-medium ${
                          !d.pan
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-violet-50 text-violet-700 border border-violet-100'
                        }`}>
                          {d.pan || 'NOT PROVIDED'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-800">
                        {fmtRs(d.amount)}
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-slate-500">
                        {fmtDateShort(d.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={d.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 text-sm">
                      {donations.length === 0
                        ? 'No donations received yet.'
                        : 'No transactions match your search.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Click any row to view full details
            </p>
            <p className="text-xs text-slate-400">
              Showing {filtered.length} of {donations.length} transactions
            </p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <DonationDetailPanel
          donation={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </div>
  );
}
