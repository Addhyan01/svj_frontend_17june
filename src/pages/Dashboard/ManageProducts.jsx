import React, { useState, useEffect, useCallback } from 'react';
import { servicesAPI, authAPI, deliveryAPI, geoAPI } from '../../api/services';

const PRICE_CALC = (service, qty = 1) => {
  if (!service) return 0;
  if (service.type === 'SUBSCRIPTION') return service.baseFee;
  return service.baseFee + (qty - 1) * (service.subsequentFee || 0);
};

const INPUT = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 bg-white';
const LABEL = 'block text-xs font-medium text-slate-600 mb-1';

export default function ManageProducts({ section = 'catalog' }) {
  const [services,   setServices]   = useState([]);
  const [members,    setMembers]    = useState([]);
  const [districts,  setDistricts]  = useState([]);
  const [blocks,     setBlocks]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  // ── Activate form ────────────────────────────────────────────────────────
  const [actForm,    setActForm]    = useState({ memberId: '', serviceId: '', txRef: '', treeQty: 1 });
  const [actLoading, setActLoading] = useState(false);
  const [actMsg,     setActMsg]     = useState(null);

  // ── Emergency form ───────────────────────────────────────────────────────
  const [emgForm,    setEmgForm]    = useState({ memberId: '', serviceId: '' });
  const [emgLoading, setEmgLoading] = useState(false);
  const [emgMsg,     setEmgMsg]     = useState(null);

  // ── Create service form ──────────────────────────────────────────────────
  const [showCreateSvc, setShowCreateSvc] = useState(false);
  const [svcForm, setSvcForm] = useState({
    name: '', description: '', type: 'SUBSCRIPTION',
    baseFee: '', subsequentFee: 0, totalMonths: 12,
  });
  const [svcLoading, setSvcLoading] = useState(false);

  // ── Member filters (Activate tab) ────────────────────────────────────────
  const [memberSearch,    setMemberSearch]    = useState('');
  const [filterDistrict,  setFilterDistrict]  = useState('');
  const [filterBlock,     setFilterBlock]     = useState('');

  // ── Monthly cycle ────────────────────────────────────────────────────────
  const [cycleLoading, setCycleLoading] = useState(false);
  const [cycleResult,  setCycleResult]  = useState(null);

  // ── Load data ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, memRes, distRes] = await Promise.all([
        servicesAPI.getAll(),
        authAPI.getUsers('MEMBER'),
        geoAPI.getDistricts(),
      ]);
      setServices(svcRes.data.data  || []);
      setMembers(memRes.data.data   || []);
      setDistricts(distRes.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!filterDistrict) { setBlocks([]); setFilterBlock(''); return; }
    geoAPI.getBlocks(filterDistrict).then(r => setBlocks(r.data.data || []));
  }, [filterDistrict]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const selectedSvc = services.find(s => s._id === actForm.serviceId);
  const isTree      = selectedSvc?.type === 'ON_DEMAND';
  const calcPrice   = PRICE_CALC(selectedSvc, actForm.treeQty);

  const filteredMembers = members.filter(m => {
    const q = memberSearch.toLowerCase();
    const matchSearch   = !q || m.name?.toLowerCase().includes(q) || m.phone?.includes(q) || m.memberId?.toLowerCase().includes(q);
    const matchDistrict = !filterDistrict || m.districtId?._id === filterDistrict || m.districtId === filterDistrict;
    const matchBlock    = !filterBlock    || m.blockId?._id    === filterBlock    || m.blockId    === filterBlock;
    return matchSearch && matchDistrict && matchBlock;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleGenerateCycle = async () => {
    if (!window.confirm("Generate monthly delivery tickets for all active pad subscribers?\n\nThis will create 1 delivery ticket per member who hasn't received one this month.")) return;
    setCycleLoading(true); setCycleResult(null);
    try {
      const res = await deliveryAPI.generateMonthlyCycle();
      setCycleResult({ success: true, summary: res.data.summary });
    } catch (err) {
      setCycleResult({ success: false, error: err.response?.data?.message || 'Cycle generation failed.' });
    } finally { setCycleLoading(false); }
  };

  const handleActivate = async (e) => {
    e.preventDefault(); setActLoading(true); setActMsg(null);
    try {
      const payload = {
        serviceId: actForm.serviceId,
        txRef:     actForm.txRef,
        amount:    calcPrice,
        ...(isTree && { treeQuantity: parseInt(actForm.treeQty) }),
      };
      const res = await authAPI.activateMembership(actForm.memberId, payload);
      setActMsg({ type: 'success', text: res.data.message + (res.data.membershipId ? ` | ID: ${res.data.membershipId}` : '') });
      setActForm({ memberId: '', serviceId: '', txRef: '', treeQty: 1 });
      load();
    } catch (err) {
      setActMsg({ type: 'error', text: err.response?.data?.message || 'Activation failed.' });
    } finally { setActLoading(false); }
  };

  const handleEmergency = async (e) => {
    e.preventDefault(); setEmgLoading(true); setEmgMsg(null);
    try {
      const res = await deliveryAPI.adminRaiseEmergency(emgForm.memberId, emgForm.serviceId);
      setEmgMsg({ type: 'success', text: `${res.data.message} | Remaining units: ${res.data.remainingUnits}` });
      setEmgForm({ memberId: '', serviceId: '' });
    } catch (err) {
      setEmgMsg({ type: 'error', text: err.response?.data?.message || 'Emergency request failed.' });
    } finally { setEmgLoading(false); }
  };

  const handleCreateService = async (e) => {
    e.preventDefault(); setSvcLoading(true);
    try {
      await servicesAPI.create({ ...svcForm, baseFee: Number(svcForm.baseFee), subsequentFee: Number(svcForm.subsequentFee) });
      setShowCreateSvc(false);
      setSvcForm({ name: '', description: '', type: 'SUBSCRIPTION', baseFee: '', subsequentFee: 0, totalMonths: 12 });
      load();
    } catch { /* silent */ }
    finally { setSvcLoading(false); }
  };

  if (loading) return <div className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />;

  /* ══════════════════════════════════════════════════════════════════════════
     SERVICE CATALOG
  ══════════════════════════════════════════════════════════════════════════ */
  if (section === 'catalog') return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 px-5 py-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📦</span>
            <h2 className="text-sm font-semibold text-slate-800">Service Catalog</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{services.length} service{services.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateCycle}
            disabled={cycleLoading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {cycleLoading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Generate Monthly Cycle</>
            )}
          </button>
          <button
            onClick={() => setShowCreateSvc(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Service
          </button>
        </div>
      </div>

      {/* Cycle result banner */}
      {cycleResult && (
        <div className={`rounded-xl border p-4 ${cycleResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          {cycleResult.success ? (
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">✅</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Monthly cycle generated successfully</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-emerald-700">
                  <span>📋 Scanned: <strong>{cycleResult.summary?.totalSubscriptionsScanned ?? '—'}</strong></span>
                  <span>🆕 Created: <strong>{cycleResult.summary?.ticketsGenerated ?? '—'}</strong></span>
                  <span>⏭ Skipped: <strong>{cycleResult.summary?.accountsSkippedOrAlreadyProcessed ?? '—'}</strong></span>
                </div>
              </div>
              <button onClick={() => setCycleResult(null)} className="ml-auto shrink-0 text-emerald-500 hover:text-emerald-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xl">❌</span>
              <p className="text-sm font-semibold text-red-700">{cycleResult.error}</p>
              <button onClick={() => setCycleResult(null)} className="ml-auto text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Service list */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {services.length > 0 ? services.map(s => (
          <div key={s._id} className="p-5 hover:bg-slate-50/60 transition">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">{s.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.description}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${
                s.type === 'SUBSCRIPTION' ? 'bg-violet-50 text-violet-700 border-violet-100' : 'bg-green-50 text-green-700 border-green-100'
              }`}>
                {s.type === 'SUBSCRIPTION' ? '📦 Subscription' : '🌳 On-Demand'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <p className="text-slate-400 font-medium mb-0.5">Base Fee</p>
                <p className="text-slate-800 font-semibold text-sm">₹{s.baseFee?.toLocaleString('en-IN')}</p>
              </div>
              {s.type === 'ON_DEMAND' && s.subsequentFee > 0 && (
                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <p className="text-slate-400 font-medium mb-0.5">Extra Unit</p>
                  <p className="text-slate-800 font-semibold text-sm">₹{s.subsequentFee?.toLocaleString('en-IN')}</p>
                </div>
              )}
              {s.type === 'SUBSCRIPTION' && (
                <>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-medium mb-0.5">Duration</p>
                    <p className="text-slate-800 font-semibold text-sm">{s.totalMonths} months</p>
                  </div>
                  <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    <p className="text-slate-400 font-medium mb-0.5">Units/Year</p>
                    <p className="text-slate-800 font-semibold text-sm">12</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm font-semibold text-slate-600 mb-1">No Services Yet</p>
            <p className="text-xs text-slate-400 mb-5">Create your first service to get started.</p>
            <button onClick={() => setShowCreateSvc(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Create First Service
            </button>
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      {showCreateSvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateSvc(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Create New Service</h4>
              <button onClick={() => setShowCreateSvc(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateService} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className={LABEL}>Service Name *</label>
                <input required className={INPUT} placeholder="e.g. Sanitary Pad Monthly" value={svcForm.name} onChange={e => setSvcForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div>
                <label className={LABEL}>Description *</label>
                <textarea required rows={3} className={INPUT + ' resize-none'} placeholder="Brief description of this service…" value={svcForm.description} onChange={e => setSvcForm(f => ({...f, description: e.target.value}))} />
              </div>
              <div>
                <label className={LABEL}>Type *</label>
                <select className={INPUT} value={svcForm.type} onChange={e => setSvcForm(f => ({...f, type: e.target.value}))}>
                  <option value="SUBSCRIPTION">SUBSCRIPTION — Monthly recurring</option>
                  <option value="ON_DEMAND">ON_DEMAND — One-time order</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Base Fee (₹) *</label>
                  <input required type="number" min="0" className={INPUT} value={svcForm.baseFee} onChange={e => setSvcForm(f => ({...f, baseFee: e.target.value}))} />
                </div>
                {svcForm.type === 'ON_DEMAND' && (
                  <div>
                    <label className={LABEL}>Subsequent Unit (₹)</label>
                    <input type="number" min="0" className={INPUT} value={svcForm.subsequentFee} onChange={e => setSvcForm(f => ({...f, subsequentFee: e.target.value}))} />
                  </div>
                )}
                {svcForm.type === 'SUBSCRIPTION' && (
                  <div>
                    <label className={LABEL}>Duration (months)</label>
                    <input type="number" min="1" className={INPUT} value={svcForm.totalMonths} onChange={e => setSvcForm(f => ({...f, totalMonths: e.target.value}))} />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreateSvc(false)} className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition">Cancel</button>
                <button type="submit" disabled={svcLoading} className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 py-2.5 rounded-lg transition">
                  {svcLoading ? 'Creating…' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     ACTIVATE MEMBER
  ══════════════════════════════════════════════════════════════════════════ */
  if (section === 'activate') return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">✅</div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Activate Member Subscription</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manually activate a product for a member after offline payment</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">

        {/* Member filters */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filter Members</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Search</label>
              <input className={INPUT} placeholder="Name, phone, or ID…" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>District</label>
              <select className={INPUT} value={filterDistrict} onChange={e => { setFilterDistrict(e.target.value); setFilterBlock(''); }}>
                <option value="">All Districts</option>
                {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Block</label>
              <select className={INPUT} value={filterBlock} onChange={e => setFilterBlock(e.target.value)} disabled={!filterDistrict}>
                <option value="">All Blocks</option>
                {blocks.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Activation form */}
        <form onSubmit={handleActivate} className="space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Activation Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Select Member *</label>
              <select required className={INPUT} value={actForm.memberId} onChange={e => setActForm(f => ({...f, memberId: e.target.value}))}>
                <option value="">— Choose member —</option>
                {filteredMembers.map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.memberId || 'N/A'}) — {m.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Select Product *</label>
              <select required className={INPUT} value={actForm.serviceId} onChange={e => setActForm(f => ({...f, serviceId: e.target.value, treeQty: 1}))}>
                <option value="">— Choose product —</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name} ({s.type})</option>)}
              </select>
            </div>
          </div>

          {isTree && (
            <div>
              <label className={LABEL}>Number of Trees *</label>
              <input type="number" min="1" required className={INPUT} value={actForm.treeQty}
                onChange={e => setActForm(f => ({...f, treeQty: Math.max(1, parseInt(e.target.value) || 1)}))} />
            </div>
          )}

          <div>
            <label className={LABEL}>Transaction Reference *</label>
            <input required className={INPUT} placeholder="Payment reference / UPI ID / receipt no." value={actForm.txRef}
              onChange={e => setActForm(f => ({...f, txRef: e.target.value}))} />
          </div>

          {selectedSvc && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <p className="text-xs text-emerald-700">
                {isTree ? `${actForm.treeQty} tree(s) — on-demand pricing` : 'Annual subscription · 12 units'}
              </p>
              <p className="text-base font-bold text-emerald-800">₹{calcPrice.toLocaleString('en-IN')}</p>
            </div>
          )}

          {actMsg && (
            <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${actMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <span>{actMsg.type === 'success' ? '✅' : '❌'}</span>
              <span>{actMsg.text}</span>
            </div>
          )}

          <button type="submit" disabled={actLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
            {actLoading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Activating…</>
              : 'Activate Membership'}
          </button>
        </form>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     EMERGENCY REQUEST
  ══════════════════════════════════════════════════════════════════════════ */
  if (section === 'emergency') return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-5 py-4">
        <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-xl shrink-0">🚨</div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Emergency Request — Helpline</h2>
          <p className="text-xs text-slate-400 mt-0.5">Raise an emergency delivery on behalf of a member via toll-free</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-red-700 mb-0.5">Use with caution</p>
          <p className="text-xs text-red-600 leading-relaxed">Use this only when a member calls on the toll-free number and cannot raise the request themselves. <strong>1 unit will be permanently deducted</strong> from their annual subscription quota.</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <form onSubmit={handleEmergency} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Select Member *</label>
              <select required className={INPUT} value={emgForm.memberId} onChange={e => setEmgForm(f => ({...f, memberId: e.target.value}))}>
                <option value="">— Choose active member —</option>
                {members.filter(m => m.status === 'active').map(m => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.memberId || 'N/A'}) — {m.blockId?.name || '?'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Select Service *</label>
              <select required className={INPUT} value={emgForm.serviceId} onChange={e => setEmgForm(f => ({...f, serviceId: e.target.value}))}>
                <option value="">— Choose service —</option>
                {services.filter(s => s.type === 'SUBSCRIPTION').map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {emgMsg && (
            <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${emgMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <span>{emgMsg.type === 'success' ? '✅' : '❌'}</span>
              <span>{emgMsg.text}</span>
            </div>
          )}

          <button type="submit" disabled={emgLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2">
            {emgLoading
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Raising…</>
              : '🚨 Raise Emergency for Member'}
          </button>
        </form>
      </div>
    </div>
  );

  // Fallback (shouldn't reach here)
  return null;
}
