import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, deliveryAPI, broadcastAPI } from '../../api/services';

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function monthName(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

const STATUS_STYLES = {
  pending:    { badge: 'bg-amber-50 text-amber-700 border-amber-100',       dot: 'bg-amber-400',             label: 'Pending',    icon: '⏳' },
  emergency:  { badge: 'bg-red-50 text-red-700 border-red-100',             dot: 'bg-red-500 animate-pulse', label: 'Emergency',  icon: '🚨' },
  on_the_way: { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500',              label: 'On the Way', icon: '🚚' },
  delivered:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500',           label: 'Delivered',  icon: '✅' },
  failed:     { badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400',             label: 'Failed',     icon: '❌' },
};

const BROADCAST_STYLES = {
  GENERAL_NOTICE:   { bar: 'border-l-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100',      emoji: '📢' },
  EMERGENCY_NOTICE: { bar: 'border-l-red-500',     badge: 'bg-red-50 text-red-700 border-red-100',            emoji: '🚨' },
  SCHEME_UPDATE:    { bar: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', emoji: '🌱' },
};
const CATEGORY_LABELS = {
  GENERAL_NOTICE: 'General Notice',
  EMERGENCY_NOTICE: 'Emergency Notice',
  SCHEME_UPDATE: 'Scheme Update',
};

// ─── mini stat chip ───────────────────────────────────────────────────────────
function StatChip({ label, value, color = 'slate', small }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber:   'bg-amber-50  border-amber-100  text-amber-700',
    red:     'bg-red-50    border-red-100    text-red-600',
    blue:    'bg-blue-50   border-blue-100   text-blue-700',
    slate:   'bg-slate-50  border-slate-200  text-slate-700',
    violet:  'bg-violet-50 border-violet-100 text-violet-700',
  };
  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${colors[color]}`}>
      <p className={`font-bold leading-none ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className="text-[10px] font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  );
}

// ─── unit dot grid (12 boxes for pads) ───────────────────────────────────────
function UnitGrid({ total, delivered, emergency, pending }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {Array.from({ length: total }).map((_, i) => {
        let bg, title;
        if (i < delivered)             { bg = 'bg-emerald-500'; title = `Unit ${i + 1}: Delivered`; }
        else if (i < delivered + emergency) { bg = 'bg-red-400';     title = `Unit ${i + 1}: Emergency`; }
        else if (i < delivered + emergency + pending) { bg = 'bg-amber-400'; title = `Unit ${i + 1}: Scheduled`; }
        else                           { bg = 'bg-slate-200';   title = `Unit ${i + 1}: Upcoming`; }
        return (
          <div key={i} title={title}
            className={`h-5 w-5 rounded-md ${bg} flex items-center justify-center text-[9px] font-bold text-white`}>
            {i + 1}
          </div>
        );
      })}
      <div className="w-full flex flex-wrap gap-3 mt-1.5 text-[10px] font-medium text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500 inline-block"/>Delivered</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-400 inline-block"/>Emergency</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-400 inline-block"/>Scheduled</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-200 inline-block"/>Upcoming</span>
      </div>
    </div>
  );
}

export default function MemberOverview() {
  const { user } = useAuth();

  const [deliveries,      setDeliveries]      = useState([]);
  const [memberships,     setMemberships]      = useState([]);
  const [broadcasts,      setBroadcasts]       = useState([]);
  const [loading,         setLoading]          = useState(true);
  const [activeTab,       setActiveTab]        = useState('deliveries');
  const [deliveryFilter,  setDeliveryFilter]   = useState('all'); // all | regular | emergency | delivered | pending
  const [resolvedUser,    setResolvedUser]      = useState(user);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyMsg,    setEmergencyMsg]      = useState(null);

  // Resolve full user object (populated fields)
  useEffect(() => {
    const needsRefresh =
      !user?.districtId?.name ||
      !user?.blockId?.name ||
      (user?.associateId && !user?.associateId?.name);
    if (!needsRefresh) { setResolvedUser(user); return; }
    authAPI.getMe()
      .then(({ data }) => setResolvedUser(data.data))
      .catch(() => setResolvedUser(user));
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [delRes, memRes, bcRes] = await Promise.all([
        deliveryAPI.getMyDeliveries(),
        deliveryAPI.getMyMembership(),
        broadcastAPI.getAll({ status: 'active' }),
      ]);
      setDeliveries(delRes.data.data || []);
      setMemberships(memRes.data.data || []);
      const all = bcRes.data.data || [];
      setBroadcasts(all.filter(b => ['ALL', 'MEMBER_ONLY'].includes(b.targetGroup)));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []); // eslint-disable-line

  // ─── derived values ─────────────────────────────────────────────────────────
  const deliveredCount   = deliveries.filter(d => d.status === 'delivered').length;
  const pendingCount     = deliveries.filter(d => ['pending', 'on_the_way'].includes(d.status)).length;
  const emergencyCount   = deliveries.filter(d => d.deliveryType === 'EMERGENCY').length;
  const failedCount      = deliveries.filter(d => d.status === 'failed').length;

  const activeMemship = memberships.find(m => m.expiresAt && new Date(m.expiresAt) > new Date());
  const activePadSub  = memberships.find(m =>
    m.expiresAt && new Date(m.expiresAt) > new Date() &&
    m.serviceType === 'SUBSCRIPTION' &&
    (m.totalUnitsEntitled - m.unitsClaimed) > 0
  );

  // Per-subscription delivery breakdown for quota tracker
  const getSubDeliveries = (sub) => {
    if (!sub?.serviceId?._id) return { delivered: 0, emergency: 0, scheduled: 0 };
    const svcDeliveries = deliveries.filter(d =>
      d.services?.some(sv => sv.serviceId?._id === sub.serviceId._id || sv.serviceId === sub.serviceId._id)
    );
    return {
      delivered:  svcDeliveries.filter(d => d.status === 'delivered').length,
      emergency:  svcDeliveries.filter(d => d.deliveryType === 'EMERGENCY' && d.status !== 'failed').length,
      scheduled:  svcDeliveries.filter(d => ['pending','on_the_way'].includes(d.status) && d.deliveryType !== 'EMERGENCY').length,
    };
  };

  // Filtered deliveries for history tab
  const filteredDeliveries = deliveries.filter(d => {
    if (deliveryFilter === 'regular')   return d.deliveryType === 'REGULAR';
    if (deliveryFilter === 'emergency') return d.deliveryType === 'EMERGENCY';
    if (deliveryFilter === 'delivered') return d.status === 'delivered';
    if (deliveryFilter === 'pending')   return ['pending', 'on_the_way'].includes(d.status);
    return true;
  });

  // Emergency handler
  const handleEmergency = async () => {
    if (!activePadSub?.serviceId?._id) return;
    setEmergencyLoading(true);
    setEmergencyMsg(null);
    try {
      await deliveryAPI.raiseEmergency(activePadSub.serviceId._id);
      setEmergencyMsg({ type: 'success', text: 'Emergency request sent successfully. Your associate will deliver 1 unit shortly. 1 unit has been deducted from your annual quota.' });
      await loadData();
    } catch (err) {
      setEmergencyMsg({ type: 'error', text: err.response?.data?.message || 'Emergency request failed. Please try again or call our helpline.' });
    } finally { setEmergencyLoading(false); }
  };

  // ─── loading skeleton ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 h-36 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />)}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
      <div className="bg-white rounded-xl border border-slate-200 h-80 animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Identity Card ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Member Profile</p>
            <h2 className="text-lg font-bold text-white truncate">{resolvedUser?.name || 'Member'}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {resolvedUser?.memberId && (
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {resolvedUser.memberId}
                </span>
              )}
              {resolvedUser?.membershipId && (
                <span className="text-xs font-mono font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                  {resolvedUser.membershipId}
                </span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                resolvedUser?.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {resolvedUser?.status === 'active' ? '✓ Active' : '⏳ Pending'}
              </span>
            </div>
          </div>
          <div className="h-14 w-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
          {[
            { label: 'Phone',    value: resolvedUser?.phone },
            { label: 'Email',    value: resolvedUser?.email },
            { label: 'District', value: resolvedUser?.districtId?.name },
            { label: 'Block',    value: resolvedUser?.blockId?.name },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{f.label}</p>
              <p className="text-xs text-slate-200 font-semibold mt-0.5 truncate">{f.value || '—'}</p>
            </div>
          ))}
        </div>
        {resolvedUser?.associateId?.name && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Your Field Associate</p>
              <p className="text-sm font-semibold text-white">{resolvedUser.associateId.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                {resolvedUser.associateId.employeeId && <span className="text-[10px] font-mono text-violet-400">{resolvedUser.associateId.employeeId}</span>}
                {resolvedUser.associateId.phone && <span className="text-[10px] text-slate-400">📞 {resolvedUser.associateId.phone}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Per-Subscription Quota Tracker ─────────────────────────────────── */}
      {memberships.filter(m => m.serviceType === 'SUBSCRIPTION').map(sub => {
        const isActive   = sub.expiresAt && new Date(sub.expiresAt) > new Date();
        const total      = sub.totalUnitsEntitled || 12;
        const claimed    = sub.unitsClaimed || 0;
        const remaining  = Math.max(0, total - claimed);
        const { delivered: delv, emergency: emg, scheduled: sched } = getSubDeliveries(sub);
        const pct        = total > 0 ? Math.round((claimed / total) * 100) : 0;
        const daysLeft   = sub.expiresAt ? Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / 86400000)) : 0;

        return (
          <div key={sub._id} className={`rounded-xl border p-5 space-y-4 ${isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🩹</span>
                  <h3 className="text-sm font-semibold text-slate-800">{sub.serviceId?.name || 'Subscription'}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isActive ? `Active · ${daysLeft} days remaining` : 'Expired'} · ₹{sub.amountPaid?.toLocaleString('en-IN')} paid
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {isActive ? '● Active' : '○ Expired'}
              </span>
            </div>

            {/* Quota stats row */}
            <div className="grid grid-cols-4 gap-2">
              <StatChip label="Total Units"  value={total}     color="slate"   small />
              <StatChip label="Delivered"    value={delv}      color="emerald" small />
              <StatChip label="Remaining"    value={remaining} color={remaining <= 2 ? 'red' : 'blue'} small />
              <StatChip label="Emergency"    value={emg}       color={emg > 0 ? 'red' : 'slate'} small />
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">{claimed} of {total} units used</span>
                <span className={`font-semibold ${pct >= 90 ? 'text-red-500' : pct >= 60 ? 'text-amber-500' : 'text-emerald-600'}`}>{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                {/* Segmented: delivered (green) + emergency (red) */}
                <div className="h-3 flex rounded-full overflow-hidden">
                  <div className="bg-emerald-500 transition-all" style={{ width: `${total > 0 ? (delv / total) * 100 : 0}%` }} />
                  <div className="bg-red-400 transition-all"     style={{ width: `${total > 0 ? (emg / total) * 100 : 0}%` }} />
                  <div className="bg-amber-400 transition-all"   style={{ width: `${total > 0 ? (sched / total) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"/>Delivered ({delv})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block"/>Emergency ({emg})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block"/>Scheduled ({sched})</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200 inline-block"/>Upcoming ({remaining - sched})</span>
              </div>
            </div>

            {/* Unit dot grid — visual representation of all 12 units */}
            {total <= 24 && (
              <UnitGrid total={total} delivered={delv} emergency={emg} pending={sched} />
            )}

            {/* Validity dates */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs text-slate-500">
              <div><span className="text-slate-400">Activated: </span><span className="font-semibold text-slate-700">{fmt(sub.createdAt)}</span></div>
              <div><span className="text-slate-400">Expires: </span><span className={`font-semibold ${daysLeft <= 30 && isActive ? 'text-amber-600' : 'text-slate-700'}`}>{fmt(sub.expiresAt)}{daysLeft <= 30 && isActive ? ` (${daysLeft}d)` : ''}</span></div>
            </div>

            {/* Low quota warning */}
            {isActive && remaining <= 2 && remaining > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.052 3.378c.866-1.5 3.032-1.5 3.898 0l5.353 9.748z" />
                </svg>
                <span>Only <strong>{remaining} unit{remaining > 1 ? 's' : ''}</strong> remaining in your annual quota. Renew soon.</span>
              </div>
            )}
            {isActive && remaining === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>Your annual quota is exhausted. Contact your associate to renew.</span>
              </div>
            )}
          </div>
        );
      })}

      {/* No subscription state */}
      {memberships.filter(m => m.serviceType === 'SUBSCRIPTION').length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">No Active Subscription</p>
            <p className="text-xs text-amber-600 mt-0.5">Contact your field associate to activate your membership.</p>
          </div>
        </div>
      )}

      {/* ── Emergency Request Button ────────────────────────────────────────── */}
      {activePadSub && (
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Need Pads Urgently?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Raise an emergency request and your associate will deliver <strong>1 unit (6 pads)</strong> to you immediately.<br />
                  <span className="text-red-500 font-medium">⚠ This will permanently deduct 1 unit from your annual quota.</span>
                </p>
                <div className="flex items-center gap-4 mt-1.5 text-xs">
                  <span className="text-slate-500">Quota remaining: <strong className="text-slate-800">{activePadSub.totalUnitsEntitled - activePadSub.unitsClaimed} units</strong></span>
                  <span className="text-slate-400">After request: <strong className="text-red-600">{activePadSub.totalUnitsEntitled - activePadSub.unitsClaimed - 1} units</strong></span>
                </div>
              </div>
            </div>
            <button onClick={handleEmergency} disabled={emergencyLoading}
              className="shrink-0 flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition whitespace-nowrap">
              {emergencyLoading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Sending…</>
                : '🚨 Request Emergency'}
            </button>
          </div>
          {emergencyMsg && (
            <div className={`mt-3 text-xs p-3 rounded-lg border flex items-start gap-2 ${emergencyMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <span>{emergencyMsg.type === 'success' ? '✅' : '❌'}</span>
              <span>{emergencyMsg.text}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Main Tab Panel ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: 'deliveries', label: 'Delivery History', count: deliveries.length },
            { id: 'membership', label: 'All Subscriptions', count: memberships.length },
            { id: 'notices',    label: 'Notices',           count: broadcasts.length },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors ${
                activeTab === t.id
                  ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── TAB: Delivery History ────────────────────────────────────────── */}
        {activeTab === 'deliveries' && (
          <>
            {/* Filter bar */}
            <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              {[
                { id: 'all',       label: 'All', count: deliveries.length },
                { id: 'delivered', label: 'Delivered', count: deliveredCount },
                { id: 'pending',   label: 'In Progress', count: pendingCount },
                { id: 'regular',   label: 'Regular', count: deliveries.filter(d => d.deliveryType === 'REGULAR').length },
                { id: 'emergency', label: 'Emergency', count: emergencyCount },
              ].map(f => (
                <button key={f.id} onClick={() => setDeliveryFilter(f.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                    deliveryFilter === f.id
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                  }`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {filteredDeliveries.length > 0 ? filteredDeliveries.map((d) => {
                const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
                return (
                  <div key={d._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    {/* Status + Type badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.icon} {s.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        d.deliveryType === 'EMERGENCY'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Scheduled'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{d._id?.slice(-8)}</span>
                    </div>

                    {/* Service details */}
                    <div className="space-y-0.5 mb-2">
                      {d.services?.map((sv, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">
                            {sv.serviceId?.name || 'Service'} <span className="text-slate-400 font-normal text-xs">× {sv.quantity} unit{sv.quantity > 1 ? 's' : ''}</span>
                          </p>
                          {sv.serviceId?.type === 'SUBSCRIPTION' && (
                            <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">
                              Subscription
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Timeline grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">📅 Created:</span>
                        <span className="font-semibold text-slate-700">{fmt(d.createdAt)} {fmtTime(d.createdAt)}</span>
                      </div>
                      {d.estimatedDeliveryDate && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">🗓 Scheduled:</span>
                          <span className="font-semibold text-slate-700">{fmt(d.estimatedDeliveryDate)}</span>
                        </div>
                      )}
                      {d.claimedAt && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">🔧 Claimed:</span>
                          <span className="font-semibold text-slate-700">{fmt(d.claimedAt)} {fmtTime(d.claimedAt)}</span>
                        </div>
                      )}
                      {d.dispatchedAt && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">🚚 Dispatched:</span>
                          <span className="font-semibold text-slate-700">{fmt(d.dispatchedAt)} {fmtTime(d.dispatchedAt)}</span>
                        </div>
                      )}
                      {d.deliveredAt && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">✅ Delivered:</span>
                          <span className="font-semibold text-emerald-700">{fmt(d.deliveredAt)} {fmtTime(d.deliveredAt)}</span>
                        </div>
                      )}
                      {d.blockId?.name && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">📍 Block:</span>
                          <span className="font-semibold text-slate-700">{d.blockId.name}</span>
                        </div>
                      )}
                      {d.associateId?.name && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">👤 Associate:</span>
                          <span className="font-semibold text-slate-700">{d.associateId.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes or fail reason */}
                    {d.notes && (
                      <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded p-2 mt-2">
                        <span className="font-medium text-slate-600">Note:</span> {d.notes}
                      </div>
                    )}
                    {d.failReason && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2 mt-2 flex items-start gap-2">
                        <span className="shrink-0">❌</span>
                        <span><span className="font-medium">Failed:</span> {d.failReason}</span>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div className="px-5 py-16 text-center">
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm text-slate-400">No deliveries found matching this filter.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB: All Subscriptions ───────────────────────────────────────── */}
        {activeTab === 'membership' && (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {memberships.length > 0 ? memberships.map((m) => {
              const isActive = m.expiresAt && new Date(m.expiresAt) > new Date();
              const used     = m.unitsClaimed || 0;
              const total    = m.totalUnitsEntitled || 0;
              const remaining = Math.max(0, total - used);
              const pct      = total > 0 ? Math.round((used / total) * 100) : 0;
              return (
                <div key={m._id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.serviceId?.name || 'Service'}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        <span className={`font-medium px-2 py-0.5 rounded border ${
                          m.serviceType === 'SUBSCRIPTION'
                            ? 'bg-violet-50 text-violet-600 border-violet-100'
                            : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {m.serviceType === 'SUBSCRIPTION' ? '📦 Subscription' : '🌳 On-Demand'}
                        </span>
                        <span className="text-slate-500">
                          ₹{m.amountPaid?.toLocaleString('en-IN')} paid · {m.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {isActive ? '● Active' : '○ Expired'}
                    </span>
                  </div>

                  {/* Quota bar for subscription types */}
                  {total > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Units used: <strong className="text-slate-800">{used}</strong> / {total}</span>
                        <span>Remaining: <strong className={`${remaining <= 2 ? 'text-red-600' : 'text-emerald-600'}`}>{remaining}</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div><span className="text-slate-400">Purchased:</span> <span className="font-semibold text-slate-700">{fmt(m.createdAt)}</span></div>
                    {m.expiresAt && <div><span className="text-slate-400">Expires:</span> <span className="font-semibold text-slate-700">{fmt(m.expiresAt)}</span></div>}
                  </div>
                </div>
              );
            }) : (
              <div className="px-5 py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-slate-600 mb-1">No Subscriptions Yet</p>
                <p className="text-xs text-slate-400">Contact your field associate to activate your first subscription.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Notices ─────────────────────────────────────────────────── */}
        {activeTab === 'notices' && (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {broadcasts.length > 0 ? broadcasts.map((b) => {
              const s = BROADCAST_STYLES[b.category] || BROADCAST_STYLES.GENERAL_NOTICE;
              return (
                <div key={b._id} className={`px-5 py-4 border-l-4 ${s.bar} hover:bg-slate-50/60 transition-colors`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">{fmt(b.createdAt)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{b.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.message}</p>
                </div>
              );
            }) : (
              <div className="px-5 py-16 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p className="text-sm font-medium text-slate-600 mb-1">No Active Notices</p>
                <p className="text-xs text-slate-400">All clear! You'll see important announcements here.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
