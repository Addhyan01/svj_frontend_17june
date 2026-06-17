import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deliveryAPI } from '../../api/services';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES = {
  pending:    { badge: 'bg-amber-50 text-amber-700 border-amber-100',       dot: 'bg-amber-400',             label: 'Pending'    },
  emergency:  { badge: 'bg-red-50 text-red-700 border-red-100',             dot: 'bg-red-500 animate-pulse', label: 'Emergency'  },
  on_the_way: { badge: 'bg-blue-50 text-blue-700 border-blue-100',          dot: 'bg-blue-500',              label: 'On the Way' },
  delivered:  { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500',           label: 'Delivered'  },
  failed:     { badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400',             label: 'Failed'     },
};

const FAIL_REASONS = [
  'Member not found at location',
  'Member not reachable on phone',
  'Member refused delivery',
  'Incorrect address on file',
  'Item out of stock',
  'Access issue at location',
  'Other reason',
];

export default function ManageDeliveries() {
  const { user } = useAuth();
  const isAssociate = user?.role === 'ASSOCIATE';

  const [deliveries,   setDeliveries]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('pending');
  const [filterType,   setFilterType]   = useState('');

  // Status update modal
  const [updating,     setUpdating]     = useState(null);
  const [newStatus,    setNewStatus]    = useState('');
  const [failReason,   setFailReason]   = useState('');
  const [notes,        setNotes]        = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg,    setStatusMsg]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (isAssociate) {
        // Use the scoped endpoint that returns ALL statuses for this associate's members
        const res = await deliveryAPI.getAssociateDeliveries();
        data = res.data.data || [];
      } else {
        // Admin / SuperAdmin
        const res = await deliveryAPI.getAllDeliveries({ deliveryType: filterType || undefined });
        data = res.data.data || [];
      }
      setDeliveries(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [isAssociate, filterType]);

  useEffect(() => { load(); }, [load]);

  // ── tab split ────────────────────────────────────────────────────
  // In Progress: REGULAR pending/on_the_way (own members) + EMERGENCY pending in block
  // Emergency:   unclaimed emergency in block (status=emergency, no associateId)
  // Completed:   delivered + failed (own members only)
  const inProgress = deliveries.filter(d =>
    (d.deliveryType === 'REGULAR' && ['pending', 'on_the_way'].includes(d.status)) ||
    (d.deliveryType === 'EMERGENCY' && d.status === 'on_the_way')
  );
  const emergencyList = deliveries.filter(d =>
    d.deliveryType === 'EMERGENCY' && d.status === 'emergency'
  );
  const completed = deliveries.filter(d =>
    ['delivered', 'failed'].includes(d.status)
  );

  // Admin tabs use a flat filter
  const adminFiltered = deliveries.filter(d => {
    if (activeTab === 'pending')   return ['pending', 'on_the_way'].includes(d.status);
    if (activeTab === 'emergency') return d.status === 'emergency';
    if (activeTab === 'completed') return ['delivered', 'failed'].includes(d.status);
    return true;
  });

  const tabDeliveries = isAssociate
    ? (activeTab === 'pending'   ? inProgress
     : activeTab === 'emergency' ? emergencyList
     :                             completed)
    : adminFiltered;

  const counts = isAssociate
    ? { pending: inProgress.length, emergency: emergencyList.length, completed: completed.length }
    : {
        pending:   deliveries.filter(d => ['pending', 'on_the_way'].includes(d.status)).length,
        emergency: deliveries.filter(d => d.status === 'emergency').length,
        completed: deliveries.filter(d => ['delivered', 'failed'].includes(d.status)).length,
      };

  const handleAcceptEmergency = async (id) => {
    try {
      await deliveryAPI.acceptEmergency(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not claim ticket.');
    }
  };

  const openStatusModal = (delivery) => {
    setUpdating(delivery);
    setNewStatus('');
    setFailReason('');
    setNotes('');
    setStatusMsg(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSavingStatus(true); setStatusMsg(null);
    try {
      await deliveryAPI.updateStatus(updating._id, newStatus, failReason || undefined, notes || undefined);
      setStatusMsg({ type: 'success', text: `Status updated to ${newStatus}.` });
      setTimeout(() => { setUpdating(null); load(); }, 1200);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally { setSavingStatus(false); }
  };

  if (loading) return <div className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4 gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {isAssociate ? 'My Deliveries' : 'Delivery Management'}
          </h2>
            <p className="text-xs text-slate-400 mt-0.5">
            {counts.emergency > 0 && (
              <span className="text-red-500 font-semibold">{counts.emergency} emergency · </span>
            )}
            {counts.pending} in progress · {counts.completed} completed
          </p>
          {isAssociate && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              Showing only deliveries for your assigned members
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {!isAssociate && (
            <select
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white"
              value={filterType} onChange={e => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="REGULAR">Regular</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          )}
          <button onClick={load}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'In Progress', value: counts.pending,   color: 'text-amber-600'   },
          { label: 'Emergency',   value: counts.emergency, color: 'text-red-600'     },
          { label: 'Completed',   value: counts.completed, color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs + List ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {[
            { id: 'pending',   label: isAssociate ? 'In Progress' : 'In Progress', count: counts.pending   },
            { id: 'emergency', label: 'Emergency',                                  count: counts.emergency },
            { id: 'completed', label: 'Completed',                                  count: counts.completed },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition ${
                activeTab === t.id
                  ? 'text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === t.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : t.id === 'emergency'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-slate-100 text-slate-500'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Scope info bar (associate only) ──────────────────── */}
        {isAssociate && activeTab === 'pending' && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Regular deliveries shown only for your registered members. Emergency deliveries are block-wide.
          </div>
        )}
        {isAssociate && activeTab === 'emergency' && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-700 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Unclaimed emergencies from your assigned blocks. First to claim gets the ticket.
          </div>
        )}
        {isAssociate && activeTab === 'completed' && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-700 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Delivered and failed orders for your assigned members.
          </div>
        )}

        {/* ── Delivery rows ─────────────────────────────────────── */}
        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {tabDeliveries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-3xl mb-2">
                {activeTab === 'emergency' ? '🚨' : activeTab === 'completed' ? '✅' : '📋'}
              </div>
              <p className="text-sm text-slate-400">
                {activeTab === 'emergency'
                  ? 'No unclaimed emergencies right now.'
                  : activeTab === 'completed'
                  ? 'No completed deliveries yet.'
                  : 'No pending deliveries for your members.'}
              </p>
            </div>
          ) : tabDeliveries.map(d => {
            const s = STATUS_STYLES[d.status] || STATUS_STYLES.pending;
            const canClaim  = isAssociate && d.status === 'emergency' && !d.associateId;
            const canUpdate = isAssociate && ['pending', 'emergency', 'on_the_way'].includes(d.status);

            return (
              <div key={d._id} className="px-5 py-4 hover:bg-slate-50/60 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{s.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                        d.deliveryType === 'EMERGENCY'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {d.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{d._id?.slice(-8)}</span>
                    </div>

                    {/* Member info */}
                    {d.memberId && (
                      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-1">
                        <span className="font-semibold">👤 {d.memberId.name}</span>
                        {d.memberId.memberId && (
                          <span className="font-mono text-emerald-600">{d.memberId.memberId}</span>
                        )}
                        {d.memberId.phone && <span>📞 {d.memberId.phone}</span>}
                      </div>
                    )}

                    {/* Services */}
                    <div className="space-y-0.5 mb-1.5">
                      {d.services?.map((sv, i) => (
                        <p key={i} className="text-sm text-slate-700">
                          <span className="font-semibold">{sv.serviceId?.name || 'Service'}</span>
                          <span className="text-slate-400"> × {sv.quantity}</span>
                        </p>
                      ))}
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span>📅 {fmt(d.createdAt)}</span>
                      {d.estimatedDeliveryDate && (
                        <span className="text-amber-500">🗓 Est. {fmt(d.estimatedDeliveryDate)}</span>
                      )}
                      {d.blockId?.name && <span>📍 {d.blockId.name}</span>}
                      {d.deliveredAt && (
                        <span className="text-emerald-600">✅ {fmt(d.deliveredAt)}</span>
                      )}
                      {/* Show claimedBy associate when it's someone else's emergency */}
                      {d.associateId?.name && d.deliveryType === 'EMERGENCY' && (
                        <span className="text-violet-500">🔧 {d.associateId.name}</span>
                      )}
                    </div>

                    {d.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 italic bg-slate-50 rounded px-2 py-1">
                        "{d.notes}"
                      </p>
                    )}
                    {d.failReason && (
                      <p className="text-xs text-red-500 mt-1">❌ {d.failReason}</p>
                    )}
                  </div>

                  {/* Action buttons (associate only) */}
                  {isAssociate && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {canClaim && (
                        <button onClick={() => handleAcceptEmergency(d._id)}
                          className="text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition whitespace-nowrap">
                          Claim 🚨
                        </button>
                      )}
                      {canUpdate && (
                        <button onClick={() => openStatusModal(d)}
                          className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition whitespace-nowrap">
                          Update
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status Update Modal ─────────────────────────────────── */}
      {updating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setUpdating(null)} />
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl z-10 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Update Delivery Status</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {updating.deliveryType === 'EMERGENCY' ? '🚨 Emergency' : '📅 Regular'} · #{updating._id?.slice(-8)}
                </p>
              </div>
              <button onClick={() => setUpdating(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="p-5 space-y-4">
              {/* Member summary */}
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Member</p>
                <p className="text-sm font-semibold text-slate-800">{updating.memberId?.name || '—'}</p>
                {updating.memberId?.memberId && (
                  <p className="text-xs font-mono text-emerald-600">{updating.memberId.memberId}</p>
                )}
                {updating.memberId?.phone && (
                  <p className="text-xs text-slate-400">📞 {updating.memberId.phone}</p>
                )}
              </div>

              {/* Product */}
              <div className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Product</p>
                {updating.services?.map((sv, i) => (
                  <p key={i} className="text-sm font-semibold text-slate-800">
                    {sv.serviceId?.name || 'Service'} × {sv.quantity}
                  </p>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">New Status *</label>
                <select required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="">— Select status —</option>
                  {updating.status !== 'on_the_way' && (
                    <option value="on_the_way">🚚 On the Way</option>
                  )}
                  <option value="delivered">✅ Delivered</option>
                  <option value="failed">❌ Failed</option>
                </select>
              </div>

              {newStatus === 'failed' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Failure Reason *</label>
                  <select required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                    value={failReason} onChange={e => setFailReason(e.target.value)}>
                    <option value="">— Select reason —</option>
                    {FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
                <textarea rows={2} placeholder="Add any remarks…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              {statusMsg && (
                <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  <span>{statusMsg.type === 'success' ? '✅' : '❌'}</span>
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setUpdating(null)}
                  className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition">
                  Cancel
                </button>
                <button type="submit" disabled={savingStatus}
                  className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-2.5 rounded-lg transition">
                  {savingStatus ? 'Saving…' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
