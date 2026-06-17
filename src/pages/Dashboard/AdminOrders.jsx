import React, { useState, useEffect, useCallback } from 'react';
import { deliveryAPI } from '../../api/services';

/* ─── helpers ─────────────────────────────────────────────────── */
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getDateRange(filter) {
  const now = new Date();
  const to  = now.toISOString().split('T')[0];
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

const TYPE_BADGE = {
  SUBSCRIPTION: { cls: 'bg-violet-50 text-violet-700 border-violet-100', label: 'Subscription' },
  ON_DEMAND:    { cls: 'bg-green-50  text-green-700  border-green-100',  label: 'On-Demand'    },
};

/* ════════════════════════════════════════════════════════════════
   ORDER DETAIL SLIDE-OVER
════════════════════════════════════════════════════════════════ */
function OrderDetail({ order: o, onClose }) {
  if (!o) return null;

  const isActive   = o.expiresAt && new Date(o.expiresAt) > new Date();
  const typeBadge  = TYPE_BADGE[o.serviceType] || TYPE_BADGE.SUBSCRIPTION;
  const isTree     = o.serviceType === 'ON_DEMAND';
  const total      = o.totalUnitsEntitled || 0;
  const claimed    = o.unitsClaimed       || 0;
  const remaining  = Math.max(0, total - claimed);
  const pct        = total > 0 ? Math.round((claimed / total) * 100) : 0;
  const daysLeft   = o.expiresAt ? Math.max(0, Math.ceil((new Date(o.expiresAt) - new Date()) / 86400000)) : 0;
  const associate  = o.memberId?.associateId;

  const Row = ({ label, value, mono = false, accent = '' }) => (
    <div className="flex items-start justify-between px-4 py-2.5 border-b border-slate-100 last:border-0 gap-3">
      <span className="text-xs text-slate-400 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${mono ? 'font-mono' : ''} ${accent || 'text-slate-800'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
  const SL = ({ children }) => (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 pt-4 pb-1">{children}</p>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Order Details</p>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5 truncate">
              {o.serviceId?.name || 'Order'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Status hero */}
          <div className={`mx-4 mt-4 rounded-xl border-2 p-4 flex items-center gap-3 ${
            isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
              isTree ? 'bg-green-50 border-green-200' : 'bg-pink-50 border-pink-200'
            }`}>
              {isTree ? '🌳' : '🩹'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{o.serviceId?.name}</p>
              <p className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                {isActive
                  ? `● Active · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
                  : '○ Expired'}
              </p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeBadge.cls} mt-1 inline-block`}>
                {typeBadge.label}
              </span>
            </div>
          </div>

          {/* Member */}
          <SL>Member Information</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Row label="Name"      value={o.memberId?.name} />
            <Row label="Member ID" value={o.memberId?.memberId}  mono accent="text-emerald-700" />
            <Row label="Phone"     value={o.memberId?.phone} />
          </div>

          {/* Associate */}
          <SL>Assigned Associate</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {associate ? (
              <>
                <Row label="Name"        value={associate.name} />
                <Row label="Employee ID" value={associate.employeeId} mono accent="text-violet-700" />
                <Row label="Phone"       value={associate.phone} />
              </>
            ) : (
              <div className="px-4 py-3 text-xs text-amber-600 font-medium">⚠ No associate assigned to this member</div>
            )}
          </div>

          {/* Order information */}
          <SL>Order Information</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <Row label="Order ID"     value={o._id?.slice(-12).toUpperCase()} mono />
            <Row label="Service"      value={o.serviceId?.name} />
            <Row label="Service Type" value={isTree ? '🌳 On-Demand' : '📦 Subscription'} />
            <Row label="Order Date"   value={fmtTime(o.createdAt)} />
            {!isTree && o.expiresAt && (
              <Row label="Validity" value={`${fmt(o.createdAt)} → ${fmt(o.expiresAt)}`} />
            )}
            <Row label="Status" value={isActive ? '✅ Active' : '○ Expired'} accent={isActive ? 'text-emerald-600' : 'text-slate-500'} />
          </div>

          {/* Pricing */}
          <SL>Pricing & Payment</SL>
          <div className="mx-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
            {isTree ? (
              <>
                <Row label="Qty Ordered"    value={`${total} tree${total !== 1 ? 's' : ''}`} />
                <Row label="Rate — 1st"     value={`₹${o.serviceId?.baseFee?.toLocaleString('en-IN')}`} />
                {total > 1 && (
                  <Row label={`Rate — Extra ×${total - 1}`} value={`₹${o.serviceId?.subsequentFee?.toLocaleString('en-IN')} × ${total - 1}`} />
                )}
              </>
            ) : (
              <>
                <Row label="Units Included" value={`${total} (1/month)`} />
              </>
            )}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
              <span className="text-xs font-bold text-emerald-800">Amount Paid</span>
              <span className="text-base font-bold text-emerald-700">₹{o.amountPaid?.toLocaleString('en-IN')}</span>
            </div>
            <Row label="Payment Status" value={o.paymentStatus === 'success' ? '✅ Successful' : '❌ Failed'}
              accent={o.paymentStatus === 'success' ? 'text-emerald-600' : 'text-red-500'} />
            <Row label="Payment Ref"    value={o.paymentRef} mono />
          </div>

          {/* Delivery quota — subscription only */}
          {!isTree && total > 0 && (
            <>
              <SL>Delivery Quota</SL>
              <div className="mx-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Total',   v: total,     c: 'text-slate-800'   },
                    { label: 'Used',    v: claimed,   c: 'text-emerald-600' },
                    { label: 'Left',    v: remaining, c: remaining <= 2 ? 'text-red-600' : 'text-blue-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-lg border border-slate-100 py-2">
                      <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                      <p className="text-[9px] text-slate-400">{s.label}</p>
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-lg border border-slate-100 py-2">
                    <p className={`text-base font-bold ${pct >= 90 ? 'text-red-500' : pct >= 60 ? 'text-amber-500' : 'text-emerald-600'}`}>{pct}%</p>
                    <p className="text-[9px] text-slate-400">Used</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {remaining <= 2 && remaining > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5">
                    ⚠ Only <strong>{remaining}</strong> unit{remaining > 1 ? 's' : ''} remaining.
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-6" />
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
          >
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
export default function AdminOrders() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null); // detail slide-over

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateRange(dateFilter);
      const res = await deliveryAPI.getDistrictOrders(from, to);
      setOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => { load(); }, [load]);

  /* ── search ──────────────────────────────────────────────────── */
  const filtered = orders.filter(o => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const assoc = o.memberId?.associateId;
    return (
      o.memberId?.name?.toLowerCase().includes(q) ||
      o.memberId?.memberId?.toLowerCase().includes(q) ||
      o.memberId?.phone?.includes(q) ||
      assoc?.name?.toLowerCase().includes(q) ||
      assoc?.employeeId?.toLowerCase().includes(q) ||
      o.serviceId?.name?.toLowerCase().includes(q) ||
      o._id?.slice(-8).toLowerCase().includes(q)
    );
  });

  /* ── KPIs ─────────────────────────────────────────────────────── */
  const totalRevenue  = orders.reduce((s, o) => s + (o.amountPaid || 0), 0);
  const subscriptions = orders.filter(o => o.serviceType === 'SUBSCRIPTION').length;
  const onDemand      = orders.filter(o => o.serviceType === 'ON_DEMAND').length;

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">District Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">Click any row to view full order details</p>
          </div>
          <button
            onClick={load}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 transition self-start sm:self-auto"
          >
            ↻ Refresh
          </button>
        </div>

        {/* ── Date filter pills ────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {DATE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                dateFilter === f.id
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── KPIs ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders',  value: orders.length,                              color: 'text-slate-800'   },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-700' },
            { label: 'Subscriptions', value: subscriptions,                              color: 'text-violet-700'  },
            { label: 'On-Demand',     value: onDemand,                                   color: 'text-green-700'   },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

          {/* Search */}
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by member, associate, service, or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white text-slate-700 placeholder-slate-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
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
              <div className="text-3xl mb-2">🛒</div>
              <p className="text-sm text-slate-400">
                {search ? 'No orders match your search.' : 'No orders found for the selected period.'}
              </p>
            </div>
          ) : (
            <>
              {/* ── Desktop table ─────────────────────────────── */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Order ID', 'Member', 'Associate', 'Service', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                        <th
                          key={h}
                          className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(o => {
                      const tb       = TYPE_BADGE[o.serviceType] || TYPE_BADGE.SUBSCRIPTION;
                      const isActive = o.expiresAt && new Date(o.expiresAt) > new Date();
                      const assoc    = o.memberId?.associateId;
                      return (
                        <tr
                          key={o._id}
                          onClick={() => setSelected(o)}
                          className="hover:bg-emerald-50/40 cursor-pointer transition-colors group"
                        >
                          {/* Order ID */}
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-500 group-hover:text-emerald-700">
                            #{o._id?.slice(-8).toUpperCase()}
                          </td>

                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-semibold text-slate-800">{o.memberId?.name || '—'}</p>
                            {o.memberId?.memberId && (
                              <p className="text-[10px] font-mono text-emerald-600">{o.memberId.memberId}</p>
                            )}
                            {o.memberId?.phone && (
                              <p className="text-[10px] text-slate-400">{o.memberId.phone}</p>
                            )}
                          </td>

                          {/* Associate ← NEW */}
                          <td className="py-3.5 px-4">
                            {assoc ? (
                              <>
                                <p className="text-xs font-semibold text-slate-800">{assoc.name}</p>
                                {assoc.employeeId && (
                                  <p className="text-[10px] font-mono text-violet-600">{assoc.employeeId}</p>
                                )}
                                {assoc.phone && (
                                  <p className="text-[10px] text-slate-400">{assoc.phone}</p>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-amber-500 font-medium">⚠ Unassigned</span>
                            )}
                          </td>

                          {/* Service */}
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                            {o.serviceId?.name || '—'}
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tb.cls}`}>
                              {tb.label}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-semibold text-emerald-700 text-xs">
                            ₹{o.amountPaid?.toLocaleString('en-IN')}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                            {fmt(o.createdAt)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {isActive ? '● Active' : '○ Expired'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile cards ──────────────────────────────── */}
              <div className="sm:hidden divide-y divide-slate-100 max-h-[65vh] overflow-y-auto">
                {filtered.map(o => {
                  const tb       = TYPE_BADGE[o.serviceType] || TYPE_BADGE.SUBSCRIPTION;
                  const isActive = o.expiresAt && new Date(o.expiresAt) > new Date();
                  const assoc    = o.memberId?.associateId;
                  return (
                    <button
                      key={o._id}
                      onClick={() => setSelected(o)}
                      className="w-full text-left px-4 py-4 hover:bg-emerald-50/40 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{o.memberId?.name || '—'}</p>
                          {o.memberId?.memberId && (
                            <p className="text-[10px] font-mono text-emerald-600">{o.memberId.memberId}</p>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {isActive ? 'Active' : 'Expired'}
                        </span>
                      </div>

                      {/* Associate */}
                      {assoc && (
                        <p className="text-[10px] text-violet-600 mb-1">
                          👤 {assoc.name}
                          {assoc.employeeId && <span className="font-mono ml-1">({assoc.employeeId})</span>}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="font-mono">#{o._id?.slice(-8).toUpperCase()}</span>
                        <span className="font-medium text-slate-700">{o.serviceId?.name || '—'}</span>
                        <span className={`font-medium px-1.5 rounded border ${tb.cls}`}>{tb.label}</span>
                        <span className="font-semibold text-emerald-700">₹{o.amountPaid?.toLocaleString('en-IN')}</span>
                        <span>{fmt(o.createdAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
                Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                {dateFilter !== 'all' && ` · ${DATE_FILTERS.find(f => f.id === dateFilter)?.label}`}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Order detail slide-over ──────────────────────────────── */}
      {selected && (
        <OrderDetail order={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
