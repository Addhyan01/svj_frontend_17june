import React, { useState, useEffect, useCallback } from 'react';
import { deliveryAPI } from '../../api/services';

/* ─── helpers ─────────────────────────────────────────────────── */
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtFull(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

const STATUS_STYLES = {
  pending:    { badge: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400',             label: 'Pending',    icon: '⏳' },
  emergency:  { badge: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500 animate-pulse', label: 'Emergency',  icon: '🚨' },
  on_the_way: { badge: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500',              label: 'On the Way', icon: '🚚' },
  delivered:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',        label: 'Delivered',  icon: '✅' },
  failed:     { badge: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400',             label: 'Failed',     icon: '❌' },
};

/* ─── Timeline row ────────────────────────────────────────────── */
function TimelineRow({ icon, label, value, color = 'slate' }) {
  if (!value) return null;
  const colors = { emerald: 'text-emerald-600', blue: 'text-blue-600', amber: 'text-amber-600', red: 'text-red-500', slate: 'text-slate-700' };
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-sm shrink-0">{icon}</div>
      <div className="flex-1 min-w-0 pb-3 border-b border-slate-50 last:border-0">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${colors[color]}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Delivery Detail Slide-Over ──────────────────────────────── */
function DeliveryDetail({ delivery: d, onClose }) {
  if (!d) return null;
  const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Delivery Details</p>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5">#{d._id?.slice(-10).toUpperCase()}</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Status banner */}
          <div className={`mx-4 mt-4 px-4 py-3 rounded-xl border-2 flex items-center gap-3 ${
            d.status === 'delivered' ? 'bg-emerald-50 border-emerald-200' :
            d.status === 'failed'    ? 'bg-slate-50 border-slate-200' :
            d.status === 'emergency' ? 'bg-red-50 border-red-200' :
            d.status === 'on_the_way'? 'bg-blue-50 border-blue-200' :
                                       'bg-amber-50 border-amber-200'
          }`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency Request' : '📅 Scheduled Delivery'}
              </p>
            </div>
          </div>

          {/* Products section */}
          <div className="mx-4 mt-4">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Product(s)</p>
            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
              {d.services?.map((sv, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{sv.serviceId?.type === 'ON_DEMAND' ? '🌳' : '🩹'}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{sv.serviceId?.name || 'Service'}</p>
                      <p className="text-xs text-slate-400">{sv.serviceId?.type === 'SUBSCRIPTION' ? 'Subscription' : 'On-Demand'}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">× {sv.quantity} <span className="text-slate-400 font-normal text-xs">unit{sv.quantity > 1 ? 's' : ''}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mx-4 mt-4">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-3">Timeline</p>
            <div className="space-y-0">
              <TimelineRow icon="📋" label="Order Created"        value={fmtFull(d.createdAt)}          color="slate" />
              <TimelineRow icon="🗓" label="Estimated Delivery"   value={fmt(d.estimatedDeliveryDate)}   color="amber" />
              <TimelineRow icon="🔧" label="Associate Claimed"    value={fmtFull(d.claimedAt)}           color="blue"  />
              <TimelineRow icon="🚚" label="Out for Delivery"     value={fmtFull(d.dispatchedAt)}        color="blue"  />
              <TimelineRow icon="✅" label="Delivered On"         value={fmtFull(d.deliveredAt)}         color="emerald" />
            </div>
          </div>

          {/* Associate info */}
          {d.associateId?.name && (
            <div className="mx-4 mt-4">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Field Associate</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                  {d.associateId.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.associateId.name}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                    {d.associateId.employeeId && <span className="font-mono">{d.associateId.employeeId}</span>}
                    {d.associateId.phone && <span>📞 {d.associateId.phone}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Block */}
          {d.blockId?.name && (
            <div className="mx-4 mt-4">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Delivery Area</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-2">
                <span className="text-lg">📍</span>
                <p className="text-sm font-semibold text-slate-800">{d.blockId.name} Block</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {d.notes && (
            <div className="mx-4 mt-4">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Notes</p>
              <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-600 leading-relaxed">{d.notes}</p>
              </div>
            </div>
          )}

          {/* Fail reason */}
          {d.failReason && (
            <div className="mx-4 mt-4 mb-2">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">Failure Reason</p>
              <div className="bg-red-50 rounded-xl border border-red-100 px-4 py-3 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">❌</span>
                <p className="text-xs text-red-700 font-medium leading-relaxed">{d.failReason}</p>
              </div>
            </div>
          )}

          <div className="h-8" />
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Delivery Row Card ───────────────────────────────────────── */
function DeliveryRow({ d, onClick }) {
  const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
  const serviceName = d.services?.[0]?.serviceId?.name || 'Service';
  const totalQty    = d.services?.reduce((sum, sv) => sum + (sv.quantity || 0), 0) || 0;

  return (
    <button onClick={() => onClick(d)}
      className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
            d.status === 'delivered' ? 'bg-emerald-50 border-emerald-100' :
            d.status === 'emergency' ? 'bg-red-50 border-red-100' :
            d.status === 'on_the_way'? 'bg-blue-50 border-blue-100' :
            d.status === 'failed'    ? 'bg-slate-50 border-slate-200' :
                                       'bg-amber-50 border-amber-100'
          }`}>
            {s.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{serviceName}</p>
              {d.deliveryType === 'EMERGENCY' && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">EMERGENCY</span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
              <span>{totalQty} unit{totalQty > 1 ? 's' : ''}</span>
              {d.blockId?.name && <span>📍 {d.blockId.name}</span>}
              <span>📅 {fmt(d.createdAt)}</span>
              {d.estimatedDeliveryDate && d.status !== 'delivered' && (
                <span className="text-amber-500 font-medium">Est. {fmt(d.estimatedDeliveryDate)}</span>
              )}
              {d.deliveredAt && <span className="text-emerald-600 font-medium">✅ {fmt(d.deliveredAt)}</span>}
            </div>
          </div>
        </div>

        {/* Right: status badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.badge}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${s.dot}`} />
            {s.label}
          </span>
          <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/* ─── Empty State ─────────────────────────────────────────────── */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="py-16 px-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}

/* ─── Main Page Component ─────────────────────────────────────── */
export default function MemberMyDeliveries({ defaultTab = 'scheduled' }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState(defaultTab); // 'scheduled' | 'delivered'
  const [selected,   setSelected]   = useState(null);       // delivery for detail panel

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deliveryAPI.getMyDeliveries();
      setDeliveries(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Sync prop changes (when nav switches between scheduled/delivered)
  useEffect(() => { setActiveTab(defaultTab); }, [defaultTab]);

  /* split by tab */
  const scheduled = deliveries.filter(d => ['pending', 'on_the_way', 'emergency'].includes(d.status));
  const delivered  = deliveries.filter(d => ['delivered', 'failed'].includes(d.status));
  const current    = activeTab === 'scheduled' ? scheduled : delivered;

  if (loading) return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 h-14 animate-pulse" />
      {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">My Deliveries</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {scheduled.length} scheduled · {delivered.length} completed
            </p>
          </div>
          <button onClick={load}
            className="text-xs text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* Tab bar */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { id: 'scheduled', label: 'Scheduled Orders', count: scheduled.length, icon: '🗓' },
              { id: 'delivered', label: 'Delivered Orders',  count: delivered.length,  icon: '✅' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === t.id
                    ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>{t.count}</span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
            {current.length === 0 ? (
              activeTab === 'scheduled'
                ? <EmptyState icon="🗓" title="No Scheduled Deliveries" sub="Your upcoming deliveries will appear here once your associate processes your order." />
                : <EmptyState icon="📦" title="No Completed Deliveries" sub="Deliveries marked as delivered or failed will show up here." />
            ) : current.map(d => (
              <DeliveryRow key={d._id} d={d} onClick={setSelected} />
            ))}
          </div>
        </div>
      </div>

      {/* Detail slide-over */}
      {selected && <DeliveryDetail delivery={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
