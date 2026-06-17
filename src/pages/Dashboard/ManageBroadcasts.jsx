import React, { useState, useEffect } from 'react';
import { broadcastAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

// ─── Config maps ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'GENERAL_NOTICE',   label: 'General Notice',   emoji: '📢', accent: 'amber' },
  { value: 'EMERGENCY_NOTICE', label: 'Emergency Notice', emoji: '🚨', accent: 'red'   },
  { value: 'SCHEME_UPDATE',    label: 'Scheme Update',    emoji: '🌱', accent: 'emerald' },
];

const TARGET_GROUPS = [
  { value: 'ALL',             label: 'All People',              desc: 'Admins, Associates & Members' },
  { value: 'ADMIN_ONLY',      label: 'Only All Admins',         desc: 'District Admins only'          },
  { value: 'ASSOCIATE_ONLY',  label: 'Only All Associates',     desc: 'Field Associates only'         },
  { value: 'MEMBER_ONLY',     label: 'Only All Members',        desc: 'Registered Members only'       },
  { value: 'ADMIN_ASSOCIATE', label: 'Admin & Associate',       desc: 'Admins + Associates'           },
];

const CATEGORY_STYLES = {
  GENERAL_NOTICE:   { bar: 'border-l-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100',   dot: 'bg-amber-400'   },
  EMERGENCY_NOTICE: { bar: 'border-l-red-500',     badge: 'bg-red-50 text-red-700 border-red-100',         dot: 'bg-red-500'     },
  SCHEME_UPDATE:    { bar: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
};

const TARGET_STYLES = {
  ALL:             'bg-slate-100 text-slate-700 border-slate-200',
  ADMIN_ONLY:      'bg-blue-50 text-blue-700 border-blue-100',
  ASSOCIATE_ONLY:  'bg-violet-50 text-violet-700 border-violet-100',
  MEMBER_ONLY:     'bg-emerald-50 text-emerald-700 border-emerald-100',
  ADMIN_ASSOCIATE: 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

const EMPTY_FORM = {
  title: '',
  message: '',
  category: 'GENERAL_NOTICE',
  targetGroup: 'ALL',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCategoryMeta  = (val) => CATEGORIES.find((c) => c.value === val)   || CATEGORIES[0];
const getTargetMeta    = (val) => TARGET_GROUPS.find((t) => t.value === val) || TARGET_GROUPS[0];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color = 'slate' }) {
  const colors = {
    slate:   'text-slate-800',
    red:     'text-red-600',
    amber:   'text-amber-600',
    emerald: 'text-emerald-600',
    violet:  'text-violet-600',
    blue:    'text-blue-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ManageBroadcasts() {
  const { user } = useAuth();
  const canWrite = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // Associates only see broadcasts targeted at them
  const associateTargets = ['ALL', 'ASSOCIATE_ONLY', 'ADMIN_ASSOCIATE'];

  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter state
  const [filterCategory,    setFilterCategory]    = useState('');
  const [filterTargetGroup, setFilterTargetGroup] = useState('');
  const [filterStatus,      setFilterStatus]      = useState('active');
  const [search,            setSearch]            = useState('');

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const { data } = await broadcastAPI.getAll({
        status:      filterStatus      || undefined,
        category:    filterCategory    || undefined,
        targetGroup: filterTargetGroup || undefined,
      });
      setBroadcasts(data.data || []);
    } catch {
      setError('Failed to load broadcasts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBroadcasts(); }, [filterStatus, filterCategory, filterTargetGroup]);

  // ─── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await broadcastAPI.create(form);
      showSuccess('Broadcast dispatched successfully.');
      setForm(EMPTY_FORM);
      setIsComposing(false);
      await loadBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Revoke ────────────────────────────────────────────────────────────────
  const handleRevoke = async (id, title) => {
    if (!window.confirm(`Revoke broadcast "${title}"?`)) return;
    try {
      await broadcastAPI.revoke(id);
      showSuccess('Broadcast revoked.');
      await loadBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke.');
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      await broadcastAPI.remove(id);
      showSuccess('Broadcast deleted.');
      await loadBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  // ─── Filtered list (client-side title search) ──────────────────────────────
  const filtered = broadcasts
    .filter((b) => !canWrite ? associateTargets.includes(b.targetGroup) : true)
    .filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.message.toLowerCase().includes(search.toLowerCase())
    );

  const activeCount    = broadcasts.filter((b) => b.status === 'active').length;
  const emergencyCount = broadcasts.filter((b) => b.category === 'EMERGENCY_NOTICE' && b.status === 'active').length;

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
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl border border-slate-200 p-4 gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">Broadcast Desk</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {canWrite ? 'Send announcements and circulars to your network' : 'Notices and circulars from your organisation'}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => { setIsComposing(true); setError(''); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Compose Broadcast
          </button>
        )}
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search broadcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition"
          />
        </div>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
          ))}
        </select>

        {/* Target filter */}
        <select
          value={filterTargetGroup}
          onChange={(e) => setFilterTargetGroup(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Targets</option>
          {TARGET_GROUPS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Broadcast list */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Dispatches ({filtered.length})
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-28 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((b) => {
            const cat    = getCategoryMeta(b.category);
            const target = getTargetMeta(b.targetGroup);
            const styles = CATEGORY_STYLES[b.category] || CATEGORY_STYLES.GENERAL_NOTICE;
            const isRevoked = b.status === 'revoked';

            return (
              <div
                key={b._id}
                className={`bg-white rounded-xl border border-slate-200 border-l-4 ${styles.bar} p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${isRevoked ? 'opacity-60' : ''}`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${styles.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                      {cat.emoji} {cat.label}
                    </span>
                    {/* Target badge */}
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${TARGET_STYLES[b.targetGroup]}`}>
                      👥 {target.label}
                    </span>
                    {/* Revoked badge */}
                    {isRevoked && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                        Revoked
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-semibold text-slate-800">{b.title}</h4>

                  {/* Message */}
                  <p className="text-sm text-slate-500 leading-relaxed">{b.message}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>📅 {formatDate(b.createdAt)}</span>
                    {b.createdBy?.name && <span>✍️ {b.createdBy.name}</span>}
                  </div>
                </div>

                {/* Actions — only for Admin/SuperAdmin */}
                {canWrite && (
                <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-start">
                  {!isRevoked && (
                    <button
                      onClick={() => handleRevoke(b._id, b.title)}
                      className="text-xs font-medium text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(b._id, b.title)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl text-center py-14 text-slate-400 text-sm">
            {search || filterCategory || filterTargetGroup
              ? 'No broadcasts match your filters.'
              : canWrite ? 'No broadcasts yet. Compose one to get started.' : 'No active broadcasts for you right now.'}
          </div>
        )}
      </div>

      {/* ── Compose Modal ── */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsComposing(false)} />
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh]">

            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Compose Broadcast</h4>
                <p className="text-xs text-slate-400 mt-0.5">Fill in the details and dispatch to your target group</p>
              </div>
              <button onClick={() => setIsComposing(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-2 rounded-lg">{error}</div>
              )}

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => {
                    const selected = form.category === c.value;
                    const accentMap = {
                      amber:   selected ? 'border-amber-400 bg-amber-50 text-amber-700'   : 'border-slate-200 text-slate-600 hover:border-amber-200',
                      red:     selected ? 'border-red-400 bg-red-50 text-red-700'         : 'border-slate-200 text-slate-600 hover:border-red-200',
                      emerald: selected ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-200',
                    };
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setForm({ ...form, category: c.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${accentMap[c.accent]}`}
                      >
                        <span className="text-lg">{c.emoji}</span>
                        <span className="text-center leading-tight">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Group */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">Target Group *</label>
                <div className="space-y-1.5">
                  {TARGET_GROUPS.map((t) => {
                    const selected = form.targetGroup === t.value;
                    return (
                      <label
                        key={t.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetGroup"
                          value={t.value}
                          checked={selected}
                          onChange={() => setForm({ ...form, targetGroup: t.value })}
                          className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${selected ? 'text-emerald-700' : 'text-slate-700'}`}>{t.label}</p>
                          <p className="text-xs text-slate-400">{t.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Attendance report upload reminder"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your announcement here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 leading-relaxed resize-none"
                />
                <p className="text-xs text-slate-400 text-right">{form.message.length} chars</p>
              </div>

              {/* Preview strip */}
              {(form.title || form.message) && (
                <div className={`rounded-xl border-l-4 border border-slate-200 p-3 space-y-1 ${CATEGORY_STYLES[form.category]?.bar || ''}`}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Preview</p>
                  <p className="text-sm font-semibold text-slate-800">{form.title || '—'}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{form.message || '—'}</p>
                  <div className="flex gap-2 pt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[form.category]?.badge || ''}`}>
                      {getCategoryMeta(form.category).emoji} {getCategoryMeta(form.category).label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TARGET_STYLES[form.targetGroup]}`}>
                      👥 {getTargetMeta(form.targetGroup).label}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
