import React, { useState, useEffect, useCallback } from 'react';
import { deliveryAPI, geoAPI } from '../../api/services';

/* ─── helpers ────────────────────────────────────────────────── */
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function getDateRange(filter) {
  const now  = new Date();
  const to   = now.toISOString().split('T')[0];
  const from = new Date(now);
  switch (filter) {
    case 'today':   return { from: to, to };
    case 'week':    from.setDate(now.getDate() - 7);        return { from: from.toISOString().split('T')[0], to };
    case 'month':   from.setMonth(now.getMonth() - 1);      return { from: from.toISOString().split('T')[0], to };
    case '3months': from.setMonth(now.getMonth() - 3);      return { from: from.toISOString().split('T')[0], to };
    case 'year':    from.setFullYear(now.getFullYear() - 1); return { from: from.toISOString().split('T')[0], to };
    default:        return { from: '', to: '' };
  }
}

const DATE_FILTERS = [
  { id: 'all',     label: 'All Time'      },
  { id: 'today',   label: 'Today'         },
  { id: 'week',    label: 'Last 1 Week'   },
  { id: 'month',   label: 'Last 1 Month'  },
  { id: '3months', label: 'Last 3 Months' },
  { id: 'year',    label: 'Last 1 Year'   },
];

const STATUS_STYLES = {
  pending:    { badge: 'bg-amber-50 text-amber-700 border-amber-100',       dot: 'bg-amber-400',             label: 'Pending'    },
  emergency:  { badge: 'bg-red-50 text-red-700 border-red-100',             dot: 'bg-red-500 animate-pulse', label: 'Emergency'  },
  on_the_way: { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500',              label: 'On the Way' },
  delivered:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500',           label: 'Delivered'  },
  failed:     { badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400',             label: 'Failed'     },
};

/* ════════════════════════════════════════════════════════════════
   DELIVERY DETAIL SLIDE-OVER
════════════════════════════════════════════════════════════════ */
function DeliveryDetail({ delivery: d, onClose }) {
  if (!d) return null;
  const s        = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
  const district = d.blockId?.districtId || d.memberId?.districtId;

  const Row = ({ label, value, mono = false, accent = '' }) => (
    <div className="flex items-start justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 gap-3">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${mono ? 'font-mono' : ''} ${accent || 'text-slate-800'}`}>{value ?? '—'}</span>
    </div>
  );
  const SL = ({ children }) => (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1">{children}</p>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Delivery Details</p>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5">#{d._id?.slice(-10).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Status hero */}
          <div className={`mx-4 mt-4 rounded-xl border-2 p-4 flex items-center gap-3 ${
            d.status === 'delivered' ? 'bg-emerald-50 border-emerald-200'
            : d.status === 'failed'  ? 'bg-red-50 border-red-200'
            : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-3xl">
              {d.status === 'delivered' ? '✅' : d.status === 'failed' ? '❌' : d.status === 'emergency' ? '🚨' : d.status === 'on_the_way' ? '🚚' : '📋'}
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency delivery' : '📅 Regular delivery'}
              </p>
            </div>
          </div>

          {/* Location */}
          <SL>Location</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Row label="State"    value={district?.state || '—'} />
            <Row label="District" value={district?.name  || '—'} />
            <Row label="Block"    value={d.blockId?.name || '—'} />
          </div>

          {/* Member */}
          <SL>Member</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Row label="Name"      value={d.memberId?.name} />
            <Row label="Member ID" value={d.memberId?.memberId} mono accent="text-emerald-700" />
            <Row label="Phone"     value={d.memberId?.phone} />
          </div>

          {/* Associate */}
          <SL>Assigned Associate</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {d.associateId ? (
              <>
                <Row label="Name"        value={d.associateId.name} />
                <Row label="Employee ID" value={d.associateId.employeeId} mono accent="text-violet-700" />
                <Row label="Phone"       value={d.associateId.phone} />
              </>
            ) : (
              <div className="px-4 py-3 text-xs text-amber-600 font-medium">⚠ Not yet assigned</div>
            )}
          </div>

          {/* Service */}
          <SL>Service / Product</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {d.services?.map((sv, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-600">{sv.serviceId?.name || '—'}</span>
                <span className="text-xs font-semibold text-slate-800">× {sv.quantity}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <SL>Timeline</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Row label="Order Created"      value={fmtTime(d.createdAt)} />
            <Row label="Est. Delivery Date" value={d.estimatedDeliveryDate ? fmt(d.estimatedDeliveryDate) : '—'} />
            <Row label="Dispatched At"      value={d.dispatchedAt ? fmtTime(d.dispatchedAt) : '—'} />
            <Row label="Claimed At"         value={d.claimedAt    ? fmtTime(d.claimedAt)    : '—'} />
            <Row label="Delivered At"       value={d.deliveredAt  ? fmtTime(d.deliveredAt)  : '—'} accent={d.deliveredAt ? 'text-emerald-700' : ''} />
          </div>

          {d.failReason && (
            <>
              <SL>Failure Reason</SL>
              <div className="mx-4 bg-red-50 rounded-xl border border-red-200 px-4 py-3">
                <p className="text-xs text-red-700 font-medium">❌ {d.failReason}</p>
              </div>
            </>
          )}
          {d.notes && (
            <>
              <SL>Notes</SL>
              <div className="mx-4 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-600 italic">"{d.notes}"</p>
              </div>
            </>
          )}

          <div className="h-6" />
        </div>

        <div className="px-4 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function SuperAdminDeliveries() {
  const [deliveries,    setDeliveries]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selected,      setSelected]      = useState(null);
  const [districts,     setDistricts]     = useState([]);

  // Filters
  const [dateFilter,    setDateFilter]    = useState('all');
  const [search,        setSearch]        = useState('');
  const [stateFilter,   setStateFilter]   = useState('');
  const [distFilter,    setDistFilter]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('delivered');
  const [typeFilter,    setTypeFilter]    = useState('');

  useEffect(() => {
    geoAPI.getDistricts().then(r => setDistricts(r.data.data || [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateRange(dateFilter);
      const params = {};
      if (from)          params.from          = from;
      if (to)            params.to            = to;
      if (stateFilter)   params.state         = stateFilter;
      if (distFilter)    params.districtId    = distFilter;
      if (statusFilter)  params.status        = statusFilter;
      if (typeFilter)    params.deliveryType  = typeFilter;
      params.limit = 500;

      const res = await deliveryAPI.getSuperDeliveries(params);
      setDeliveries(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load deliveries.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, stateFilter, distFilter, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const states = [...new Set(districts.map(d => d.state).filter(Boolean))].sort();

  /* ── search ─────────────────────────────────────────────────── */
  const filtered = deliveries.filter(d => {
    if (!search.trim()) return true;
    const q   = search.toLowerCase();
    const dist = d.blockId?.districtId || d.memberId?.districtId;
    return (
      d.memberId?.name?.toLowerCase().includes(q) ||
      d.memberId?.memberId?.toLowerCase().includes(q) ||
      d.memberId?.phone?.includes(q) ||
      d.associateId?.name?.toLowerCase().includes(q) ||
      d.associateId?.employeeId?.toLowerCase().includes(q) ||
      d.blockId?.name?.toLowerCase().includes(q) ||
      dist?.name?.toLowerCase().includes(q) ||
      d._id?.slice(-8).toLowerCase().includes(q) ||
      d.services?.some(sv => sv.serviceId?.name?.toLowerCase().includes(q))
    );
  });

  /* ── KPIs ─────────────────────────────────────────────────────── */
  const kDelivered = deliveries.filter(d => d.status === 'delivered').length;
  const kFailed    = deliveries.filter(d => d.status === 'failed').length;
  const kEmergency = deliveries.filter(d => d.deliveryType === 'EMERGENCY').length;

  return (
    <>
      <div className="space-y-5">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">All Deliveries — System Wide</h2>
            <p className="text-xs text-slate-400 mt-0.5">Click any row to view full delivery details</p>
          </div>
          <button onClick={load} className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 transition self-start sm:self-auto">
            ↻ Refresh
          </button>
        </div>

        {/* Date pills */}
        <div className="flex flex-wrap gap-2">
          {DATE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                dateFilter === f.id
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Filter By</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* State */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">State</label>
              <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setDistFilter(''); }}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* District */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">District</label>
              <select value={distFilter} onChange={e => setDistFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">All Districts</option>
                {(stateFilter ? districts.filter(d => d.state === stateFilter) : districts).map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Delivery Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="on_the_way">On the Way</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            {/* Type */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">All Types</option>
                <option value="REGULAR">Regular</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            {/* Clear */}
            <div className="flex items-end">
              <button onClick={() => { setStateFilter(''); setDistFilter(''); setStatusFilter('delivered'); setTypeFilter(''); setDateFilter('all'); setSearch(''); }}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50 transition">
                ✕ Clear All
              </button>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Records', value: deliveries.length, color: 'text-slate-800'   },
            { label: 'Delivered',     value: kDelivered,        color: 'text-emerald-700' },
            { label: 'Failed',        value: kFailed,           color: 'text-red-600'     },
            { label: 'Emergency',     value: kEmergency,        color: 'text-amber-600'   },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Search */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
              </svg>
              <input type="text" placeholder="Search by member, associate, district, block, service, or ID…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white text-slate-700 placeholder-slate-400" />
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3 mb-2" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-red-500 font-medium">⚠ {error}</p>
              <button onClick={load} className="mt-3 text-xs text-emerald-600 underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm text-slate-400">{search ? 'No deliveries match your search.' : 'No deliveries found for selected filters.'}</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Delivery ID', 'Member', 'District', 'Associate', 'Service', 'Block', 'Type', 'Status', 'Order Date', 'Delivery Date'].map(h => (
                        <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(d => {
                      const s    = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
                      const dist = d.blockId?.districtId || d.memberId?.districtId;
                      return (
                        <tr key={d._id} onClick={() => setSelected(d)} className="hover:bg-emerald-50/40 cursor-pointer transition-colors group">
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 group-hover:text-emerald-700">
                            #{d._id?.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-semibold text-slate-800">{d.memberId?.name || '—'}</p>
                            {d.memberId?.memberId && <p className="text-[10px] font-mono text-emerald-600">{d.memberId.memberId}</p>}
                            {d.memberId?.phone && <p className="text-[10px] text-slate-400">{d.memberId.phone}</p>}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-semibold text-slate-800">{dist?.name || '—'}</p>
                            {dist?.state && <p className="text-[10px] text-slate-400">{dist.state}</p>}
                          </td>
                          <td className="py-3.5 px-4">
                            {d.associateId ? (
                              <>
                                <p className="text-xs font-semibold text-slate-800">{d.associateId.name}</p>
                                {d.associateId.employeeId && <p className="text-[10px] font-mono text-violet-600">{d.associateId.employeeId}</p>}
                              </>
                            ) : (
                              <span className="text-[10px] text-amber-500 font-medium">⚠ Unassigned</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {d.services?.map((sv, i) => (
                                <p key={i} className="text-xs text-slate-700">
                                  {sv.serviceId?.name || '—'}<span className="text-slate-400"> ×{sv.quantity}</span>
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">{d.blockId?.name || '—'}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                              d.deliveryType === 'EMERGENCY' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${s.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{fmt(d.createdAt)}</td>
                          <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                            {d.deliveredAt
                              ? <span className="text-emerald-600 font-medium">✅ {fmt(d.deliveredAt)}</span>
                              : d.estimatedDeliveryDate
                              ? <span className="text-amber-500">🗓 {fmt(d.estimatedDeliveryDate)}</span>
                              : <span className="text-slate-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-100 max-h-[65vh] overflow-y-auto">
                {filtered.map(d => {
                  const s    = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
                  const dist = d.blockId?.districtId || d.memberId?.districtId;
                  return (
                    <button key={d._id} onClick={() => setSelected(d)} className="w-full text-left px-4 py-4 hover:bg-emerald-50/40 transition">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{d.memberId?.name || '—'}</p>
                          {dist?.name && <p className="text-[10px] text-slate-500">📍 {dist.name}{dist.state ? `, ${dist.state}` : ''}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${s.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
                        </span>
                      </div>
                      {d.associateId && (
                        <p className="text-[10px] text-violet-600 mb-1">
                          👤 {d.associateId.name}{d.associateId.employeeId ? ` (${d.associateId.employeeId})` : ''}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-mono">#{d._id?.slice(-8).toUpperCase()}</span>
                        {d.services?.map((sv, i) => <span key={i} className="text-slate-700">{sv.serviceId?.name || '—'}</span>)}
                        {d.blockId?.name && <span>📍 {d.blockId.name}</span>}
                        <span className={d.deliveryType === 'EMERGENCY' ? 'text-red-500' : ''}>
                          {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-400">
                        <span>📅 {fmt(d.createdAt)}</span>
                        {d.deliveredAt && <span className="text-emerald-600">✅ {fmt(d.deliveredAt)}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
                Showing {filtered.length} of {deliveries.length} record{deliveries.length !== 1 ? 's' : ''}
                {statusFilter && ` · ${STATUS_STYLES[statusFilter]?.label || statusFilter}`}
                {dateFilter !== 'all' && ` · ${DATE_FILTERS.find(f => f.id === dateFilter)?.label}`}
              </div>
            </>
          )}
        </div>

      </div>

      {selected && <DeliveryDetail delivery={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
