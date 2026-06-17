import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { servicesAPI, authAPI, deliveryAPI } from '../../api/services';

/* ─── helpers ──────────────────────────────────────────────────── */
const calcPrice = (service, qty) => {
  if (!service) return 0;
  if (service.type === 'SUBSCRIPTION') return service.baseFee;
  return service.baseFee + Math.max(0, qty - 1) * (service.subsequentFee || 0);
};
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const INPUT = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white text-slate-800 placeholder-slate-400';
const LABEL = 'block text-xs font-semibold text-slate-600 mb-1.5';
function StepBar({ step }) {
  const steps = ['Choose Product', 'Review & Pay', 'Confirmed'];
  return (
    <div className="flex items-center mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < step  ? 'bg-emerald-500 border-emerald-500 text-white' :
              i === step ? 'bg-white border-emerald-500 text-emerald-600' :
                           'bg-white border-slate-300 text-slate-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] font-medium mt-1 whitespace-nowrap ${i === step ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mt-[-14px] transition-all ${i < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── Product card ─────────────────────────────────────────────── */
function ProductCard({ service, selected, onSelect }) {
  const isTree = service.type === 'ON_DEMAND';
  return (
    <button onClick={() => onSelect(service)}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected ? 'border-emerald-500 bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${isTree ? 'bg-green-50 border-green-100' : 'bg-pink-50 border-pink-100'}`}>
            {isTree ? '🌳' : '🩹'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">{service.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{service.description}</p>
          </div>
        </div>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
          {selected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
          {isTree ? `₹${service.baseFee?.toLocaleString('en-IN')} for 1st tree` : `₹${service.baseFee?.toLocaleString('en-IN')}/year`}
        </span>
        {isTree && service.subsequentFee > 0 && (
          <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
            +₹{service.subsequentFee?.toLocaleString('en-IN')} each additional
          </span>
        )}
        {!isTree && (
          <span className="text-xs font-medium bg-violet-50 border border-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
            12 units/year · Monthly delivery
          </span>
        )}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isTree ? 'bg-green-50 border-green-100 text-green-700' : 'bg-violet-50 border-violet-100 text-violet-700'}`}>
          {isTree ? 'On-Demand' : 'Subscription'}
        </span>
      </div>
    </button>
  );
}

/* ─── Order history row ────────────────────────────────────────── */
function OrderRow({ membership, onViewDetail }) {
  const isActive = membership.expiresAt && new Date(membership.expiresAt) > new Date();
  const remaining = Math.max(0, (membership.totalUnitsEntitled || 0) - (membership.unitsClaimed || 0));
  const isTree = membership.serviceType === 'ON_DEMAND';
  return (
    <button onClick={() => onViewDetail(membership)}
      className="w-full text-left px-4 py-4 hover:bg-slate-50 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${isTree ? 'bg-green-50 border-green-100' : 'bg-pink-50 border-pink-100'}`}>
            {isTree ? '🌳' : '🩹'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{membership.serviceId?.name || 'Service'}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-slate-400">
              <span>₹{membership.amountPaid?.toLocaleString('en-IN')} paid</span>
              <span>📅 {fmt(membership.createdAt)}</span>
              {membership.serviceType === 'SUBSCRIPTION' && (
                <span className={remaining <= 2 ? 'text-red-500 font-semibold' : 'text-slate-500'}>
                  {remaining} unit{remaining !== 1 ? 's' : ''} remaining
                </span>
              )}
              {membership.serviceType === 'ON_DEMAND' && (
                <span className="text-slate-500">{membership.totalUnitsEntitled} unit{membership.totalUnitsEntitled !== 1 ? 's' : ''} ordered</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {isActive ? '● Active' : '○ Expired'}
          </span>
          <svg className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

/* ─── Order detail slide-over ──────────────────────────────────── */
function OrderDetail({ membership: m, onClose }) {
  if (!m) return null;

  const isActive   = m.expiresAt && new Date(m.expiresAt) > new Date();
  const total      = m.totalUnitsEntitled || 0;
  const claimed    = m.unitsClaimed || 0;
  const remaining  = Math.max(0, total - claimed);
  const pct        = total > 0 ? Math.round((claimed / total) * 100) : 0;
  const daysLeft   = m.expiresAt ? Math.max(0, Math.ceil((new Date(m.expiresAt) - new Date()) / 86400000)) : 0;
  const isTree     = m.serviceType === 'ON_DEMAND';
  const svc        = m.serviceId;
  // For trees: unitQty comes from totalUnitsEntitled (set at activation = treeQuantity)
  // Fallback: derive from price if somehow 0 (e.g. legacy records)
  const rawQty     = m.totalUnitsEntitled || 0;
  const unitQty    = isTree && rawQty === 0 && svc?.baseFee
    ? (m.amountPaid === svc.baseFee ? 1 : Math.round(1 + (m.amountPaid - svc.baseFee) / (svc.subsequentFee || svc.baseFee)))
    : rawQty;
  const rateFirst  = svc?.baseFee || 0;
  const rateSubseq = svc?.subsequentFee || 0;
  const priceExtra = unitQty > 1 ? (unitQty - 1) * rateSubseq : 0;

  const deliveredCount = claimed; // for subscription: unitsClaimed = units delivered
  const pendingCount   = Math.max(0, total - claimed);

  const SL = ({ children }) => (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{children}</p>
  );
  const IR = ({ label, value, mono, vc = '', hi }) => (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 text-right max-w-[55%] ${mono ? 'font-mono' : ''} ${hi ? 'text-sm text-emerald-700' : ''} ${vc}`}>
        {value || '—'}
      </span>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Order Details</p>
            <h2 className="text-sm font-bold text-slate-800 mt-0.5 truncate">{m.serviceId?.name || 'Order'}</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition shrink-0 ml-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Status Hero */}
          <div className={`mx-4 mt-4 rounded-xl border-2 p-4 flex items-center gap-3 ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
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

          {/* Order Information */}
          <div className="mx-4 mt-4">
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

          {/* Pricing Breakdown */}
          <div className="mx-4 mt-4">
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
                  <IR label="Annual Fee"       value={`₹${m.amountPaid?.toLocaleString('en-IN')}/year`} />
                  <IR label="Units Included"   value={`${total} units (1 per month)`} />
                  <IR label="Rate per Unit"    value={total > 0 ? `₹${Math.round(m.amountPaid / total)}/unit` : '—'} />
                  <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                    <span className="text-xs font-bold text-emerald-800">Total Paid</span>
                    <span className="text-base font-bold text-emerald-700">₹{m.amountPaid?.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="mx-4 mt-4">
            <SL>Payment Details</SL>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <IR label="Payment Method"  value="Razorpay (Online)" />
              <IR label="Payment Status"  value={m.paymentStatus === 'success' ? '✅ Successful' : '❌ Failed'} vc={m.paymentStatus === 'success' ? 'text-emerald-600' : 'text-red-500'} />
              <IR label="Transaction Ref" value={m.paymentRef} mono />
              <IR label="Amount Paid"     value={`₹${m.amountPaid?.toLocaleString('en-IN')}`} hi />
            </div>
          </div>

          {/* Delivery Quota — Subscription */}
          {!isTree && total > 0 && (
            <div className="mx-4 mt-4">
              <SL>Delivery Quota</SL>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Total',     v: total,    c: 'text-slate-800'   },
                    { label: 'Used',      v: claimed,  c: 'text-emerald-600' },
                    { label: 'Pending',   v: pendingCount, c: 'text-amber-600' },
                    { label: 'Left',      v: remaining, c: remaining <= 2 ? 'text-red-600' : 'text-blue-600' },
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

          <div className="h-6" />
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-100 shrink-0 bg-white">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN EXPORT — Order History + New Order flow
════════════════════════════════════════════════════════════════ */
export default function MemberOrder() {
  const { user, setUser } = useAuth();

  /* data */
  const [services,     setServices]     = useState([]);
  const [memberships,  setMemberships]  = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);

  /* new-order wizard state */
  const [showWizard,   setShowWizard]   = useState(false);
  const [wizardStep,   setWizardStep]   = useState(0); // 0=choose 1=pay 2=done
  const [selected,     setSelected]     = useState(null);
  const [treeQty,      setTreeQty]      = useState(1);
  const [payLoading,   setPayLoading]   = useState(false);
  const [payMsg,       setPayMsg]       = useState(null);
  const [orderResult,  setOrderResult]  = useState(null);

  /* detail slide-over */
  const [detailItem,   setDetailItem]   = useState(null);

  const isTree = selected?.type === 'ON_DEMAND';
  const amount = calcPrice(selected, treeQty);
  const userId = user?._id || user?.id;

  /* ── load data ─────────────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [svcRes, memRes] = await Promise.all([
        servicesAPI.getAll(),
        deliveryAPI.getMyMembership(),
      ]);
      setServices(svcRes.data.data || []);
      setMemberships(memRes.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── reset wizard ──────────────────────────────────────────── */
  const resetWizard = () => {
    setShowWizard(false);
    setWizardStep(0);
    setSelected(null);
    setTreeQty(1);
    setPayMsg(null);
    setOrderResult(null);
  };

  /* ── Razorpay ──────────────────────────────────────────────── */
  const openRazorpay = () => {
    if (!window.Razorpay) {
      setPayMsg({ type: 'error', text: 'Razorpay SDK not loaded. Please refresh.' });
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'Sabka Vikas Jayti',
      description: selected?.name,
      prefill: { name: user?.name || '', contact: user?.phone || '' },
      theme: { color: '#10b981' },
      handler: async (response) => {
        setPayLoading(true); setPayMsg(null);
        try {
          const payload = { serviceId: selected._id, txRef: response.razorpay_payment_id, amount, ...(isTree && { treeQuantity: parseInt(treeQty) }) };
          const res = await authAPI.activateMembership(userId, payload);
          setOrderResult({ membershipId: res.data.membershipId, joiningCase: res.data.joiningCase, paymentId: response.razorpay_payment_id });
          setWizardStep(2);
          const me = await authAPI.getMe();
          setUser(me.data.data);
          await loadAll();
        } catch (err) {
          setPayMsg({ type: 'error', text: err.response?.data?.message || 'Activation failed. Contact support.' });
        } finally { setPayLoading(false); }
      },
      modal: { ondismiss: () => {} },
    };
    new window.Razorpay(options).open();
  };

  /* ════════════════════════════════════════════════════════════
     WIZARD OVERLAY
  ════════════════════════════════════════════════════════════ */
  if (showWizard) {
    /* Step 2 — Confirmation */
    if (wizardStep === 2) return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Order Confirmed!</h2>
            <p className="text-emerald-100 text-sm mt-1">Your membership has been activated successfully.</p>
          </div>
          <div className="p-5 space-y-2">
            {[
              { label: 'Product',       value: selected?.name },
              { label: 'Amount Paid',   value: `₹${amount.toLocaleString('en-IN')}` },
              { label: 'Payment ID',    value: orderResult?.paymentId, mono: true },
              orderResult?.membershipId && { label: 'Membership ID', value: orderResult.membershipId, mono: true },
              isTree && { label: 'Trees Ordered', value: `${treeQty} tree${treeQty > 1 ? 's' : ''}` },
              !isTree && orderResult?.joiningCase && { label: 'Delivery Schedule', value: orderResult.joiningCase === 'B' ? '2 units delivered immediately' : '1 unit now + 1 unit by month-end' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-400">{row.label}</span>
                <span className={`text-sm font-semibold text-slate-800 ${row.mono ? 'font-mono text-xs' : ''}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-700 flex items-start gap-2">
              <span className="shrink-0">💡</span>
              <span>Your associate will schedule delivery shortly. Track it under <strong>My Delivery → Scheduled Orders</strong>.</span>
            </div>
            <button onClick={resetWizard}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition">
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );

    /* Step 1 — Review & Pay */
    if (wizardStep === 1) return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => { setWizardStep(0); setPayMsg(null); }}
            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <StepBar step={1} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Review Order</h3>

          {/* summary card */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 border ${isTree ? 'bg-green-50 border-green-100' : 'bg-pink-50 border-pink-100'}`}>
              {isTree ? '🌳' : '🩹'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{selected?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{isTree ? `${treeQty} tree${treeQty > 1 ? 's' : ''}` : '12 units · Annual subscription'}</p>
            </div>
            <p className="text-base font-bold text-emerald-700 shrink-0">₹{amount.toLocaleString('en-IN')}</p>
          </div>

          {/* Tree price breakdown */}
          {isTree && (
            <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between"><span>1st tree</span><span className="font-semibold">₹{selected?.baseFee?.toLocaleString('en-IN')}</span></div>
              {treeQty > 1 && <div className="flex justify-between"><span>{treeQty - 1} extra × ₹{selected?.subsequentFee?.toLocaleString('en-IN')}</span><span className="font-semibold">₹{((treeQty - 1) * (selected?.subsequentFee || 0)).toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-slate-800"><span>Total</span><span className="text-emerald-700">₹{amount.toLocaleString('en-IN')}</span></div>
            </div>
          )}

          {/* Online payment only notice */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-xs text-blue-700 leading-relaxed">
              <span className="font-semibold">Secure online payment only.</span> Member orders are processed exclusively through Razorpay for a safe and verified transaction record.
            </p>
          </div>

          {/* Error message */}
          {payMsg && payMsg.type === 'error' && (
            <div className="text-xs p-3 rounded-lg border bg-red-50 border-red-200 text-red-600 flex items-start gap-2">
              <span>❌</span><span>{payMsg.text}</span>
            </div>
          )}

          {/* Razorpay button — only payment method */}
          <button onClick={openRazorpay} disabled={payLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {payLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay ₹{amount.toLocaleString('en-IN')} via Razorpay
              </>
            )}
          </button>
        </div>
      </div>
    );

    /* Step 0 — Choose Product */
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={resetWizard}
            className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <StepBar step={0} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Choose a Product</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select the service you want to subscribe to or order.</p>
        </div>

        <div className="space-y-3">
          {services.length === 0
            ? <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm text-slate-400">No products available.</div>
            : services.map(s => <ProductCard key={s._id} service={s} selected={selected?._id === s._id} onSelect={setSelected} />)
          }
        </div>

        {/* Tree qty */}
        {selected?.type === 'ON_DEMAND' && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <label className={LABEL}>How many trees?</label>
            <div className="flex items-center gap-3 mb-3">
              <button onClick={() => setTreeQty(q => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-lg transition">−</button>
              <span className="text-2xl font-bold text-slate-800 w-12 text-center">{treeQty}</span>
              <button onClick={() => setTreeQty(q => q + 1)}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-lg transition">+</button>
              <div className="flex-1 text-right">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-xl font-bold text-emerald-700">₹{calcPrice(selected, treeQty).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1,2,5,10].map(n => (
                <button key={n} onClick={() => setTreeQty(n)}
                  className={`px-2.5 py-1 rounded-full border text-xs font-medium transition ${treeQty === n ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
                  {n} tree{n > 1 ? 's' : ''} = ₹{calcPrice(selected, n).toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sticky bottom bar */}
        {selected && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">You pay</p>
              <p className="text-2xl font-bold text-emerald-700">₹{amount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selected.name} · {isTree ? `${treeQty} tree${treeQty > 1 ? 's' : ''}` : 'Annual · 12 units'}</p>
            </div>
            <button onClick={() => { setPayMsg(null); setWizardStep(1); }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              Proceed to Payment
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     DEFAULT VIEW — Order History
  ════════════════════════════════════════════════════════════ */
  const activeOrders  = memberships.filter(m => m.expiresAt && new Date(m.expiresAt) > new Date());
  const expiredOrders = memberships.filter(m => !m.expiresAt || new Date(m.expiresAt) <= new Date());

  if (loadingData) return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200 h-16 animate-pulse" />
      {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />)}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Page header with New Order button */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">My Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeOrders.length} active · {expiredOrders.length} expired
            </p>
          </div>
          <button onClick={() => { setShowWizard(true); setWizardStep(0); setSelected(null); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </button>
        </div>

        {/* Empty state */}
        {memberships.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 py-16 px-6 text-center">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-sm font-semibold text-slate-700 mb-1">No Orders Yet</p>
            <p className="text-xs text-slate-400 mb-5">Start by placing your first order for Sanitary Pads or Tree Plantation.</p>
            <button onClick={() => { setShowWizard(true); setWizardStep(0); setSelected(null); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Place First Order
            </button>
          </div>
        )}

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Active Orders</h3>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{activeOrders.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {activeOrders.map(m => <OrderRow key={m._id} membership={m} onViewDetail={setDetailItem} />)}
            </div>
          </div>
        )}

        {/* Expired orders */}
        {expiredOrders.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Past Orders</h3>
              <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{expiredOrders.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {expiredOrders.map(m => <OrderRow key={m._id} membership={m} onViewDetail={setDetailItem} />)}
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {detailItem && <OrderDetail membership={detailItem} onClose={() => setDetailItem(null)} />}
    </>
  );
}
