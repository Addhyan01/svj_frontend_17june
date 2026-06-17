import React, { useState, useEffect } from 'react';
import { authAPI, geoAPI, deliveryAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

/* ─── helpers ────────────────────────────────────────────────────────────── */
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BackButton({ onClick, label = 'Back to List' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

function InfoCell({ label, value, mono, color }) {
  const colorMap = { violet: 'text-violet-700', emerald: 'text-emerald-700', sky: 'text-sky-700', slate: 'text-slate-800' };
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-semibold break-all ${mono ? 'font-mono' : ''} ${colorMap[color] || colorMap.slate}`}>
        {value || '—'}
      </p>
    </div>
  );
}

/* ─── Inline row/detail helpers for IR ──────────────────────────────────── */
function SL({ children }) {
  return <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>;
}
function IR({ label, value, mono, vc = '', hi }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 text-right max-w-[60%] ${mono ? 'font-mono' : ''} ${hi ? 'text-sm text-emerald-700' : ''} ${vc}`}>
        {value || '—'}
      </span>
    </div>
  );
}

/* ─── Delivery status map ────────────────────────────────────────────────── */
const DL_STATUS = {
  pending:    { badge: 'bg-amber-50 text-amber-700 border-amber-100',       dot: 'bg-amber-400',             label: 'Pending'    },
  emergency:  { badge: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500 animate-pulse', label: 'Emergency'  },
  on_the_way: { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500',              label: 'On the Way' },
  delivered:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500',           label: 'Delivered'  },
  failed:     { badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400',             label: 'Failed'     },
};

/* ─── Inline Order Detail content (used inside OrdersView) ──────────────── */
function MemberOrderDetailContent({ membership: m, onBack }) {
  const isActive     = m.expiresAt && new Date(m.expiresAt) > new Date();
  const total        = m.totalUnitsEntitled || 0;
  const claimed      = m.unitsClaimed || 0;
  const remaining    = Math.max(0, total - claimed);
  const pct          = total > 0 ? Math.round((claimed / total) * 100) : 0;
  const daysLeft     = m.expiresAt ? Math.max(0, Math.ceil((new Date(m.expiresAt) - new Date()) / 86400000)) : 0;
  const isTree       = m.serviceType === 'ON_DEMAND';
  const svc          = m.serviceId;
  const unitQty      = m.totalUnitsEntitled || 0;
  const rateFirst    = svc?.baseFee || 0;
  const rateSubseq   = svc?.subsequentFee || 0;
  const priceExtra   = unitQty > 1 ? (unitQty - 1) * rateSubseq : 0;
  const pendingCount = Math.max(0, total - claimed);

  return (
    <div className="space-y-4">
      {/* Back */}
      <BackButton onClick={onBack} label="Back to Orders" />

      {/* Status Hero */}
      <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${isTree ? 'bg-green-50 border-green-200' : 'bg-pink-50 border-pink-200'}`}>
          {isTree ? '🌳' : '🩹'}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{m.serviceId?.name}</p>
          <p className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isActive ? `● Active · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : '○ Expired'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{isTree ? 'On-Demand · Tree Plantation' : 'Annual Subscription · Monthly delivery'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Information */}
        <div>
          <SL>Order Information</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <IR label="Order ID"     value={m._id?.slice(-12).toUpperCase()} mono />
            <IR label="Order Date"   value={fmt(m.createdAt)} />
            <IR label="Order Status" value={isActive ? '✅ Active' : '○ Expired'} vc={isActive ? 'text-emerald-600' : 'text-slate-500'} />
            <IR label="Service Name" value={m.serviceId?.name} />
            <IR label="Service Type" value={isTree ? '🌳 On-Demand' : '📦 Subscription'} />
            {!isTree && <IR label="Validity" value={`${fmt(m.createdAt)} → ${fmt(m.expiresAt)}`} />}
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <SL>Payment Details</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <IR label="Payment Method"  value="Razorpay (Online)" />
            <IR label="Payment Status"  value={m.paymentStatus === 'success' ? '✅ Successful' : '❌ Failed'} vc={m.paymentStatus === 'success' ? 'text-emerald-600' : 'text-red-500'} />
            <IR label="Transaction Ref" value={m.paymentRef} mono />
            <IR label="Amount Paid"     value={`₹${m.amountPaid?.toLocaleString('en-IN')}`} hi />
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div>
        <SL>Pricing Breakdown</SL>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {isTree ? (
            <>
              <IR label="Quantity Ordered"   value={`${unitQty} tree${unitQty !== 1 ? 's' : ''}`} />
              <IR label="Rate — 1st Tree"    value={`₹${rateFirst.toLocaleString('en-IN')}`} />
              {unitQty > 1 && <IR label={`Rate — Extra (×${unitQty - 1})`} value={`₹${rateSubseq.toLocaleString('en-IN')} × ${unitQty - 1} = ₹${priceExtra.toLocaleString('en-IN')}`} />}
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                <span className="text-xs font-bold text-emerald-800">Total Amount</span>
                <span className="text-base font-bold text-emerald-700">₹{m.amountPaid?.toLocaleString('en-IN')}</span>
              </div>
            </>
          ) : (
            <>
              <IR label="Annual Fee"     value={`₹${m.amountPaid?.toLocaleString('en-IN')}/year`} />
              <IR label="Units Included" value={`${total} units (1 per month)`} />
              <IR label="Rate per Unit"  value={total > 0 ? `₹${Math.round(m.amountPaid / total)}/unit` : '—'} />
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                <span className="text-xs font-bold text-emerald-800">Total Paid</span>
                <span className="text-base font-bold text-emerald-700">₹{m.amountPaid?.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delivery Quota — Subscription */}
      {!isTree && total > 0 && (
        <div>
          <SL>Delivery Quota</SL>
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Total',   v: total,        c: 'text-slate-800'   },
                { label: 'Used',    v: claimed,      c: 'text-emerald-600' },
                { label: 'Pending', v: pendingCount, c: 'text-amber-600'   },
                { label: 'Left',    v: remaining,    c: remaining <= 2 ? 'text-red-600' : 'text-blue-600' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-lg border border-slate-100 py-2">
                  <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                  <p className="text-[9px] text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{claimed} of {total} used</span>
                <span className={`font-semibold ${pct >= 90 ? 'text-red-500' : pct >= 60 ? 'text-amber-500' : 'text-emerald-600'}`}>{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} title={`Unit ${i + 1}`}
                  className={`h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold ${i < claimed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
            {remaining <= 2 && remaining > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-1.5">
                ⚠ Only <strong>{remaining}</strong> unit{remaining > 1 ? 's' : ''} remaining. Renew soon.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery log section */}
      <div>
        <SL>Order Status</SL>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <IR label="Delivery Date" value={fmt(m._deliveryLog?.deliveredAt)} />
          <IR label="Delivery Status" value={
            m._deliveryLog
              ? m._deliveryLog.status === 'delivered'  ? '✅ Delivered'
              : m._deliveryLog.status === 'on_the_way' ? '🚚 On the Way'
              : m._deliveryLog.status === 'failed'     ? '❌ Failed'
              : m._deliveryLog.status === 'emergency'  ? '🚨 Emergency'
              : '⏳ Pending'
              : '⏳ Pending'
          } />
          {m._deliveryLog?.associateId?.name && (
            <IR label="Assigned Associate" value={`${m._deliveryLog.associateId.name}${m._deliveryLog.associateId.employeeId ? ` (${m._deliveryLog.associateId.employeeId})` : ''}`} />
          )}
          {m._deliveryLog?.estimatedDeliveryDate && (
            <IR label="Est. Delivery Date" value={fmt(m._deliveryLog.estimatedDeliveryDate)} />
          )}
          {m._deliveryLog?.notes && (
            <IR label="Notes" value={m._deliveryLog.notes} />
          )}
          {m._deliveryLog?.failReason && (
            <IR label="Fail Reason" value={m._deliveryLog.failReason} vc="text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Delivery Detail content ────────────────────────────────────── */
function DeliveryDetailContent({ delivery: d, onBack }) {
  const s = DL_STATUS[d.status] || DL_STATUS.pending;
  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} label="Back to Orders" />

      {/* Status Hero */}
      <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${
        d.status === 'delivered'  ? 'bg-emerald-50 border-emerald-200' :
        d.status === 'failed'     ? 'bg-red-50 border-red-200' :
        d.status === 'emergency'  ? 'bg-red-50 border-red-200' :
        d.status === 'on_the_way' ? 'bg-blue-50 border-blue-200' :
        'bg-amber-50 border-amber-200'
      }`}>
        <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-pink-50 border border-pink-200">🩹</div>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {d.services?.map(sv => `${sv.serviceId?.name || 'Service'} × ${sv.quantity}`).join(', ')}
          </p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full border ${s.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Information */}
        <div>
          <SL>Order Information</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <IR label="Delivery ID" value={d._id?.slice(-12).toUpperCase()} mono />
            <IR label="Type"        value={d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'} />
            <IR label="Created"     value={fmt(d.createdAt)} />
            <IR label="Block"       value={d.blockId?.name} />
          </div>
        </div>

        {/* Items */}
        <div>
          <SL>Items / Services Ordered</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {d.services?.map((sv, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-600 font-medium">{sv.serviceId?.name || 'Service'}</span>
                <span className="text-xs font-bold text-slate-800">Qty: {sv.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Delivery Status */}
        <div>
          <SL>Delivery Status</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <IR label="Current Status"     value={s.label} vc={
              d.status === 'delivered'  ? 'text-emerald-600' :
              d.status === 'failed'     ? 'text-red-500' :
              d.status === 'on_the_way' ? 'text-blue-600' :
              d.status === 'emergency'  ? 'text-red-600' :
              'text-amber-600'
            } />
            <IR label="Est. Delivery Date" value={fmt(d.estimatedDeliveryDate)} />
            <IR label="Dispatched At"      value={fmt(d.dispatchedAt)} />
            <IR label="Delivered At"       value={fmt(d.deliveredAt)} />
            {d.failReason && <IR label="Fail Reason" value={d.failReason} vc="text-red-500" />}
          </div>
        </div>

        {/* Associate */}
        <div>
          <SL>Assigned Associate</SL>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <IR label="Name"        value={d.associateId?.name || 'Not yet assigned'} />
            <IR label="Employee ID" value={d.associateId?.employeeId} mono />
            <IR label="Phone"       value={d.associateId?.phone} />
            {d.claimedAt && <IR label="Claimed At" value={fmt(d.claimedAt)} />}
          </div>
        </div>
      </div>

      {d.notes && (
        <div>
          <SL>Notes</SL>
          <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-600 leading-relaxed italic">
            "{d.notes}"
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Delivery row card ──────────────────────────────────────────────────── */
function DeliveryRow({ delivery: d, onView }) {
  const s = DL_STATUS[d.status] || DL_STATUS.pending;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-pink-50 border border-pink-100">🩹</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${d.deliveryType === 'EMERGENCY' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'}
              </span>
            </div>
            <div className="space-y-0.5">
              {d.services?.map((sv, i) => (
                <p key={i} className="text-sm font-semibold text-slate-800">
                  {sv.serviceId?.name || 'Service'}
                  <span className="text-slate-400 font-normal"> × {sv.quantity}</span>
                </p>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-slate-400">
              <span>📅 Created {fmt(d.createdAt)}</span>
              {d.estimatedDeliveryDate && <span className="text-amber-600 font-medium">🗓 Est. {fmt(d.estimatedDeliveryDate)}</span>}
              {d.deliveredAt && <span className="text-emerald-600 font-medium">✅ {fmt(d.deliveredAt)}</span>}
              {d.associateId?.name && <span className="text-violet-500">👤 {d.associateId.name}</span>}
            </div>
            {d.notes && <p className="text-xs text-slate-400 mt-1.5 italic bg-slate-50 rounded px-2 py-1 truncate">"{d.notes}"</p>}
            {d.failReason && <p className="text-xs text-red-500 mt-1">❌ {d.failReason}</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2.5 flex justify-end">
        <button onClick={() => onView(d)}
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition">
          View
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Full-width Orders View ─────────────────────────────────────────────── */
function OrdersView({ member, onBack }) {
  const [loading,    setLoading]   = useState(true);
  const [orders,     setOrders]    = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [error,      setError]     = useState('');
  const [activeTab,  setActiveTab] = useState('all');
  // sub-views: null = list, { type:'order', data } = order detail, { type:'delivery', data } = delivery detail
  const [subView, setSubView] = useState(null);

  useEffect(() => {
    if (!member?._id) return;
    setLoading(true);
    setError('');
    deliveryAPI.getMemberOrders(member._id)
      .then(({ data }) => {
        setOrders(data.data?.memberships || []);
        setDeliveries(data.data?.deliveries || []);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [member?._id]);

  const enrichedOrders = orders.map(m => {
    const match = deliveries.find(d =>
      d.services?.some(s => (s.serviceId?._id || s.serviceId) === (m.serviceId?._id || m.serviceId))
    );
    return { ...m, _deliveryLog: match || null };
  });

  const scheduledDeliveries = deliveries
    .filter(d => ['pending', 'on_the_way', 'emergency'].includes(d.status))
    .sort((a, b) => {
      const da = a.estimatedDeliveryDate ? new Date(a.estimatedDeliveryDate) : new Date(a.createdAt);
      const db = b.estimatedDeliveryDate ? new Date(b.estimatedDeliveryDate) : new Date(b.createdAt);
      return da - db;
    });

  const sanitaryOrders = orders.filter(m => m.serviceType === 'SUBSCRIPTION');
  const sanitaryServiceIds = sanitaryOrders.map(m => m.serviceId?._id || m.serviceId);

  // All delivered: every delivery with status 'delivered', sorted newest first
  const deliveredDeliveries = deliveries
    .filter(d => d.status === 'delivered')
    .sort((a, b) => new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt));

  const activeCount     = enrichedOrders.filter(m => m.expiresAt && new Date(m.expiresAt) > new Date()).length;
  const expiredCount    = enrichedOrders.length - activeCount;
  const scheduledCount  = scheduledDeliveries.length;
  const deliveredCount  = deliveredDeliveries.length;

  const tabs = [
    { id: 'all',       label: 'All Orders',    count: enrichedOrders.length },
    { id: 'scheduled', label: 'Scheduled',     count: scheduledCount        },
    { id: 'delivered', label: 'All Delivered', count: deliveredCount        },
  ];

  const EmptyState = ({ emoji, title, sub }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm font-semibold text-slate-700 mb-1">{title}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );

  // ── If a sub-detail is open, show it full-width ──
  if (subView?.type === 'order') {
    return <MemberOrderDetailContent membership={subView.data} onBack={() => setSubView(null)} />;
  }
  if (subView?.type === 'delivery') {
    return <DeliveryDetailContent delivery={subView.data} onBack={() => setSubView(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} label="Back to Members" />
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Member Orders</p>
            <h2 className="text-sm font-bold text-slate-800">{member?.name}</h2>
            {member?.memberId && <p className="text-xs font-mono text-emerald-600">{member.memberId}</p>}
          </div>
        </div>
        {!loading && !error && (
          <div className="flex gap-3">
            {[
              { label: 'Total',     v: enrichedOrders.length, c: 'text-slate-800'   },
              { label: 'Active',    v: activeCount,           c: 'text-emerald-600' },
              { label: 'Scheduled', v: scheduledCount,        c: 'text-amber-600'   },
              { label: 'Delivered', v: deliveredCount,        c: 'text-blue-600'    },
            ].map(s => (
              <div key={s.label} className="text-center px-3 border-r border-slate-200 last:border-0">
                <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
                <p className="text-[9px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      {!loading && !error && (
        <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition border-b-2 ${
                activeTab === t.id
                  ? 'text-emerald-700 border-emerald-500 bg-emerald-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id ? 'bg-emerald-100 text-emerald-700' :
                  t.id === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                  t.id === 'delivered' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-500'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* ── ALL ORDERS ── */}
      {!loading && !error && activeTab === 'all' && (
        enrichedOrders.length === 0
          ? <EmptyState emoji="🛒" title="No Orders Yet" sub="This member hasn't placed any orders." />
          : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {enrichedOrders.map(m => {
                const isActive  = m.expiresAt && new Date(m.expiresAt) > new Date();
                const isTree    = m.serviceType === 'ON_DEMAND';
                const remaining = Math.max(0, (m.totalUnitsEntitled || 0) - (m.unitsClaimed || 0));
                const dl        = m._deliveryLog;
                const dlStatus  = dl?.status;
                return (
                  <div key={m._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${isTree ? 'bg-green-50 border-green-100' : 'bg-pink-50 border-pink-100'}`}>
                          {isTree ? '🌳' : '🩹'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{m.serviceId?.name || 'Service'}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-400">
                            <span>₹{m.amountPaid?.toLocaleString('en-IN')} paid</span>
                            <span>📅 {fmt(m.createdAt)}</span>
                            {!isTree && <span className={remaining <= 2 ? 'text-red-500 font-semibold' : ''}>{remaining} unit{remaining !== 1 ? 's' : ''} left</span>}
                            {isTree  && <span>{m.totalUnitsEntitled || 0} tree{(m.totalUnitsEntitled || 0) !== 1 ? 's' : ''}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {isActive ? '● Active' : '○ Expired'}
                            </span>
                            {dlStatus && (
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                                dlStatus === 'delivered'  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                dlStatus === 'on_the_way' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                dlStatus === 'failed'     ? 'bg-red-50 text-red-600 border-red-100' :
                                dlStatus === 'emergency'  ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {dlStatus === 'delivered'  ? '✅ Delivered' :
                                 dlStatus === 'on_the_way' ? '🚚 On the Way' :
                                 dlStatus === 'failed'     ? '❌ Failed' :
                                 dlStatus === 'emergency'  ? '🚨 Emergency' : '⏳ Pending'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 px-4 py-2.5 flex justify-end">
                      <button onClick={() => setSubView({ type: 'order', data: m })}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition">
                        View Details
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      )}

      {/* ── SCHEDULED ── */}
      {!loading && !error && activeTab === 'scheduled' && (
        scheduledDeliveries.length === 0
          ? <EmptyState emoji="🗓" title="No Scheduled Deliveries" sub="All deliveries have been completed or there are none pending." />
          : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">{scheduledCount} delivery{scheduledCount !== 1 ? 's' : ''}</span> pending or in-transit. Sorted by expected delivery date.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {scheduledDeliveries.map(d => (
                  <DeliveryRow key={d._id} delivery={d} onView={dl => setSubView({ type: 'delivery', data: dl })} />
                ))}
              </div>
            </div>
          )
      )}

      {/* ── ALL DELIVERED ── */}
      {!loading && !error && activeTab === 'delivered' && (
        deliveredDeliveries.length === 0
          ? <EmptyState emoji="✅" title="No Delivered Orders" sub="No deliveries have been completed for this member yet." />
          : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-emerald-700">
                  <span className="font-semibold">{deliveredCount} delivery{deliveredCount !== 1 ? 's' : ''}</span> successfully completed for this member. Sorted by most recent.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {deliveredDeliveries.map(d => (
                  <DeliveryRow key={d._id} delivery={d} onView={dl => setSubView({ type: 'delivery', data: dl })} />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

/* ─── Full-width Member Detail View ─────────────────────────────────────── */
function MemberDetailView({ user: u, meta, onBack, onViewOrders, onToggleStatus, onPasswordReset }) {
  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} />
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{meta.label} Profile</p>
            <h2 className="text-base font-bold text-slate-800">{u.name}</h2>
            {u.memberId   && <p className="text-xs font-mono text-emerald-600">{u.memberId}</p>}
            {u.donorId    && <p className="text-xs font-mono text-sky-600">{u.donorId}</p>}
            {u.employeeId && <p className="text-xs font-mono text-violet-600">{u.employeeId}</p>}
          </div>
        </div>
        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
          u.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-600'
        }`}>
          <span className={`h-2 w-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {u.status || 'pending'}
        </span>
      </div>

      {/* Profile info grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Personal Information</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <InfoCell label="Phone"    value={u.phone} />
          <InfoCell label="Email"    value={u.email} />
          <InfoCell label="District" value={u.district} />
          <InfoCell label="Block"    value={u.block} />
          <InfoCell label="Status"   value={u.status} />
          <InfoCell label="Membership ID" value={u.membershipId || 'Not assigned'} />
          {u.memberId   && <InfoCell label="Member ID"   value={u.memberId}   mono color="emerald" />}
          {u.donorId    && <InfoCell label="Donor ID"    value={u.donorId}    mono color="sky"     />}
          {u.employeeId && <InfoCell label="Employee ID" value={u.employeeId} mono color="violet"  />}
          {u.associateName && u.associateName !== '—' && (
            <InfoCell label="Under Associate" value={u.associateName} />
          )}
          <InfoCell label="Account ID" value={u._id?.slice(-10).toUpperCase()} mono />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Actions</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onToggleStatus(u._id)}
            className={`flex-1 sm:flex-none text-sm font-medium py-2.5 px-5 rounded-lg border transition-colors ${
              u.status === 'active'
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100'
                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
            }`}>
            {u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
          </button>
          <button onClick={() => onPasswordReset(u._id, u.name)}
            className="flex-1 sm:flex-none text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 py-2.5 px-5 rounded-lg transition-colors">
            Reset Password
          </button>
          {meta.roleValue === 'MEMBER' && (
            <button onClick={() => onViewOrders(u)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 px-5 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Orders
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */
const ROLE_META = {
  MEMBER:          { label: 'Member',          roleValue: 'MEMBER'    },
  DONOR:           { label: 'Donor',           roleValue: 'DONOR'     },
  FIELD_ASSOCIATE: { label: 'Field Associate', roleValue: 'ASSOCIATE' },
  DISTRICT_ADMIN:  { label: 'District Admin',  roleValue: 'ADMIN'     },
};

const EMPTY_FORM = {
  name: '', phone: '', email: '', password: '',
  districtId: '', blockId: '', associateId: '',
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ManageMembers({ currentViewRole }) {
  const { user: authUser } = useAuth();
  const actorRole = authUser?.role || 'SUPER_ADMIN';

  const meta = ROLE_META[currentViewRole] || { label: 'User', roleValue: currentViewRole };

  const showAssociateCascade =
    (meta.roleValue === 'MEMBER' || meta.roleValue === 'DONOR') &&
    (actorRole === 'ADMIN' || actorRole === 'SUPER_ADMIN');

  const isAssociate = actorRole === 'ASSOCIATE';

  // ── view state: 'list' | 'detail' | 'orders' ──────────────────────────
  const [view,         setView]         = useState('list'); // current screen
  const [activeUser,   setActiveUser]   = useState(null);  // user being viewed/ordered

  const [users,        setUsers]        = useState([]);
  const [search,       setSearch]       = useState('');
  const [isAddingNew,  setIsAddingNew]  = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [districts,    setDistricts]    = useState([]);
  const [blocks,       setBlocks]       = useState([]);
  const [associates,   setAssociates]   = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  // ── helpers ──────────────────────────────────────────────────────────────
  const openDetail = (u) => { setActiveUser(u); setView('detail'); };
  const openOrders = (u) => { setActiveUser(u); setView('orders'); };
  const goToList   = ()  => { setView('list'); setActiveUser(null); };

  // ── data loading ─────────────────────────────────────────────────────────
  const loadUsers = () => {
    setUsers([]);
    const associateIdParam = isAssociate ? (authUser?._id || authUser?.id) : undefined;
    authAPI.getUsers(meta.roleValue, undefined, associateIdParam)
      .then(({ data }) => {
        const list = (data.data || []).map((u) => ({
          ...u,
          district:      u.districtId?.name  || '—',
          block:         u.blockId?.name     || '—',
          associateName: u.associateId?.name || '—',
        }));
        setUsers(list);
      })
      .catch((err) => setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load users.'));
  };

  useEffect(() => { loadUsers(); }, [currentViewRole, meta.roleValue]);

  useEffect(() => {
    const needsDistrict = showAssociateCascade || isAssociate || meta.roleValue === 'ASSOCIATE' || meta.roleValue === 'ADMIN';
    if (!needsDistrict) return;
    geoAPI.getDistricts().then(({ data }) => setDistricts(data.data || [])).catch(() => {});
  }, [showAssociateCascade, isAssociate, meta.roleValue]);

  useEffect(() => {
    const shouldLoadBlocks = showAssociateCascade || isAssociate;
    if (!shouldLoadBlocks || !form.districtId) { setBlocks([]); return; }
    geoAPI.getBlocks(form.districtId).then(({ data }) => setBlocks(data.data || [])).catch(() => setBlocks([]));
  }, [form.districtId, showAssociateCascade, isAssociate]);

  useEffect(() => {
    if (!showAssociateCascade || !form.blockId) { setAssociates([]); return; }
    geoAPI.getAssociatesByBlock(form.blockId).then(({ data }) => setAssociates(data.data || [])).catch(() => setAssociates([]));
  }, [form.blockId, showAssociateCascade]);

  const filtered    = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.district?.toLowerCase().includes(search.toLowerCase()) ||
    u.memberId?.toLowerCase().includes(search.toLowerCase()) ||
    u.donorId?.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = filtered.filter((u) => u.status === 'active').length;

  // ── create ───────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password) { setError('Name, phone and password are required.'); return; }
    if (showAssociateCascade && (!form.districtId || !form.blockId || !form.associateId)) { setError('Please select district, block and associate.'); return; }
    if (isAssociate && (!form.districtId || !form.blockId)) { setError('District and block are required.'); return; }
    if ((meta.roleValue === 'ADMIN' || meta.roleValue === 'ASSOCIATE') && !form.districtId) { setError('District is required.'); return; }
    setSubmitting(true); setError('');
    try {
      await authAPI.adminRegister({
        name: form.name, phone: form.phone, email: form.email || undefined,
        password: form.password, role: meta.roleValue,
        districtId: form.districtId || undefined,
        blockId: (meta.roleValue !== 'ADMIN' && meta.roleValue !== 'ASSOCIATE') ? (form.blockId || undefined) : undefined,
        associateId: showAssociateCascade ? form.associateId : undefined,
      });
      showSuccess(`${meta.label} registered successfully.`);
      setForm(EMPTY_FORM); setIsAddingNew(false); loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
    } finally { setSubmitting(false); }
  };

  // ── toggle status ─────────────────────────────────────────────────────────
  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await authAPI.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status: data.data.status } : u));
      if (activeUser?._id === userId) setActiveUser((p) => ({ ...p, status: data.data.status }));
      showSuccess(`Status updated to ${data.data.status}.`);
    } catch (err) { setError(err.response?.data?.message || 'Status update failed.'); }
  };

  // ── password reset ────────────────────────────────────────────────────────
  const handlePasswordReset = async (userId, userName) => {
    const newPass = prompt(`Enter new password for ${userName}:`);
    if (!newPass) return;
    try { await authAPI.adminResetPassword(userId, newPass); showSuccess(`Password reset for ${userName}.`); }
    catch (err) { setError(err.response?.data?.message || 'Password reset failed.'); }
  };

  const onDistrictChange = (districtId) => setForm((f) => ({ ...f, districtId, blockId: '', associateId: '' }));
  const onBlockChange    = (blockId)    => setForm((f) => ({ ...f, blockId, associateId: '' }));

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */

  // ── ORDERS VIEW ──────────────────────────────────────────────────────────
  if (view === 'orders' && activeUser) {
    return (
      <div className="space-y-5">
        {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">{successMsg}</div>}
        <OrdersView member={activeUser} onBack={() => setView('detail')} />
      </div>
    );
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────────────────
  if (view === 'detail' && activeUser) {
    return (
      <div className="space-y-5">
        {error    && <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-between">{error}<button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">✕</button></div>}
        {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">{successMsg}</div>}
        <MemberDetailView
          user={activeUser}
          meta={meta}
          onBack={goToList}
          onViewOrders={openOrders}
          onToggleStatus={handleToggleStatus}
          onPasswordReset={handlePasswordReset}
        />
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">{successMsg}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder={`Search ${meta.label}s...`} value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition" />
        </div>
        <button onClick={() => { setIsAddingNew(true); setError(''); setForm(EMPTY_FORM); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add {meta.label}
        </button>
      </div>

      {/* Table — full width */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{meta.label} Directory</p>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {activeCount} active / {filtered.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">District / Block</th>
                {(meta.roleValue === 'MEMBER' || meta.roleValue === 'DONOR') && !isAssociate && (
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Associate</th>
                )}
                <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => openDetail(u)}>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{u.name}</p>
                    {u.employeeId && <p className="text-xs text-violet-600 font-mono mt-0.5">{u.employeeId}</p>}
                    {u.memberId   && <p className="text-xs text-emerald-600 font-mono mt-0.5">{u.memberId}</p>}
                    {u.donorId    && <p className="text-xs text-sky-600 font-mono mt-0.5">{u.donorId}</p>}
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{u._id?.slice(-8)}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="text-slate-700 text-sm">{u.district}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.block}</p>
                  </td>
                  {(meta.roleValue === 'MEMBER' || meta.roleValue === 'DONOR') && !isAssociate && (
                    <td className="py-3.5 px-4 text-slate-600 text-sm">{u.associateName}</td>
                  )}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                      u.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {u.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openDetail(u)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                    {users.length === 0
                      ? `No ${meta.label.toLowerCase()}s registered yet. Add one to get started.`
                      : `No results for "${search}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddingNew(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Add New {meta.label}</h4>
                {isAssociate && <p className="text-xs text-violet-600 mt-0.5">Will be assigned under your account automatically</p>}
              </div>
              <button onClick={() => setIsAddingNew(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded-lg">{error}</div>}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Full Name *</label>
                <input required type="text" placeholder="e.g. Satish Kumar" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Phone *</label>
                  <input required type="text" placeholder="10-digit number" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <input type="email" placeholder="name@domain.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>

              {(isAssociate || showAssociateCascade || meta.roleValue === 'ASSOCIATE' || meta.roleValue === 'ADMIN') && (
                <div className="space-y-3">
                  {showAssociateCascade && (
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                      <svg className="w-4 h-4 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs text-violet-700">Select District → Block → Associate to assign this {meta.label}.</p>
                    </div>
                  )}
                  <div className={`grid gap-3 ${(isAssociate || showAssociateCascade) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">District *</label>
                      <select required value={form.districtId} onChange={(e) => onDistrictChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                        <option value="">Select district...</option>
                        {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    </div>
                    {(isAssociate || showAssociateCascade) && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Block *</label>
                        <select required value={form.blockId} onChange={(e) => onBlockChange(e.target.value)} disabled={!form.districtId}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50">
                          <option value="">Select block...</option>
                          {blocks.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  {showAssociateCascade && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Assign to Associate *</label>
                      <select required value={form.associateId} onChange={(e) => setForm({ ...form, associateId: e.target.value })} disabled={!form.blockId}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50">
                        <option value="">{!form.blockId ? 'Select a block first...' : associates.length === 0 ? 'No associates assigned to this block' : 'Select associate...'}</option>
                        {associates.map((a) => <option key={a._id} value={a._id}>{a.name}{a.employeeId ? ` (${a.employeeId})` : ''}</option>)}
                      </select>
                      {form.blockId && associates.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">⚠ No associates assigned to this block yet.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Password *</label>
                <input required type="password" placeholder="Initial password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddingNew(false)}
                  className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  {submitting ? 'Registering...' : `Register ${meta.label}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
