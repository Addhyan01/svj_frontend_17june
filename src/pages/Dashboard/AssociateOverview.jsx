import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, broadcastAPI } from '../../api/services';

function StatCard({ label, value, sub, color = 'emerald', icon }) {
  const c = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  icon: 'text-violet-600'  },
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    icon: 'text-blue-600'    },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   icon: 'text-amber-600'   },
  }[color] || {};
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={`p-1.5 rounded-lg ${c.bg} ${c.border} border ${c.icon}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const CATEGORY_STYLES = {
  GENERAL_NOTICE:   { bar: 'border-l-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100',     dot: 'bg-amber-400',   emoji: '📢' },
  EMERGENCY_NOTICE: { bar: 'border-l-red-500',     badge: 'bg-red-50 text-red-700 border-red-100',           dot: 'bg-red-500',     emoji: '🚨' },
  SCHEME_UPDATE:    { bar: 'border-l-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', emoji: '🌱' },
};

const CATEGORY_LABELS = {
  GENERAL_NOTICE: 'General Notice',
  EMERGENCY_NOTICE: 'Emergency Notice',
  SCHEME_UPDATE: 'Scheme Update',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AssociateOverview() {
  const { user } = useAuth();

  // After login, user.id exists but user._id may not (login response shape).
  // After page refresh via getMe, user._id exists. Handle both.
  const associateId = user?._id || user?.id;

  const [members,    setMembers]    = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  // resolvedUser holds the full user object (with assignedBlocks, districtId, blockId populated)
  // Falls back to a fresh /auth/me call if the login token is missing these fields
  const [resolvedUser, setResolvedUser] = useState(user);

  // Resolve full user profile if login token is missing assignedBlocks / districtId
  useEffect(() => {
    const needsRefresh =
      !user?.districtId?.name ||          // districtId not populated
      user?.assignedBlocks === undefined;  // assignedBlocks missing entirely

    if (!needsRefresh) {
      setResolvedUser(user);
      return;
    }
    authAPI.getMe()
      .then(({ data }) => setResolvedUser(data.data))
      .catch(() => setResolvedUser(user));
  }, [user]);

  useEffect(() => {
    if (!associateId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [memRes, bcRes] = await Promise.all([
          authAPI.getUsers('MEMBER', undefined, associateId),
          broadcastAPI.getAll({ status: 'active' }),
        ]);
        setMembers(memRes.data.data || []);
        // Show broadcasts relevant to associate: ALL, ASSOCIATE_ONLY, ADMIN_ASSOCIATE
        const all = bcRes.data.data || [];
        setBroadcasts(
          all.filter(b => ['ALL', 'ASSOCIATE_ONLY', 'ADMIN_ASSOCIATE'].includes(b.targetGroup))
        );
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [associateId]);

  const activeMembers  = members.filter(m => m.status === 'active').length;
  const pendingMembers = members.filter(m => m.status === 'pending').length;
  const assignedBlocks = resolvedUser?.assignedBlocks?.length || 0;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-24 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Identity banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Field Associate</p>
          <h2 className="text-lg font-bold text-white">{resolvedUser?.name || 'Associate'}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {resolvedUser?.employeeId && (
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {resolvedUser.employeeId}
              </span>
            )}
            {resolvedUser?.blockId?.name && (
              <span className="text-xs text-slate-400">📍 {resolvedUser.blockId.name}</span>
            )}
            {resolvedUser?.districtId?.name && (
              <span className="text-xs text-slate-400">🏛 {resolvedUser.districtId.name}</span>
            )}
            {assignedBlocks > 0 && (
              <span className="text-xs text-slate-400">🗺 {assignedBlocks} block{assignedBlocks !== 1 ? 's' : ''} assigned</span>
            )}
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="My Members" value={members.length}
          sub={`${pendingMembers} pending activation`} color="violet"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Active Members" value={activeMembers}
          sub={`${members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0}% activation rate`} color="emerald"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Assigned Blocks" value={assignedBlocks}
          sub="blocks under your coverage" color="blue"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        />
        <StatCard
          label="Broadcasts" value={broadcasts.length}
          sub="active notices for you" color="amber"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
        />
      </div>

      {/* Two column: member list + broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* My members */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">My Members</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {activeMembers} active / {members.length} total
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {members.length > 0 ? members.slice(0, 20).map((m) => (
              <div key={m._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                  {m.memberId && <p className="text-xs text-emerald-600 font-mono mt-0.5">{m.memberId}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{m.phone || '—'}</p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  m.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {m.status}
                </span>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                No members registered under you yet.
              </div>
            )}
            {members.length > 20 && (
              <div className="px-5 py-3 text-center text-xs text-slate-400">
                +{members.length - 20} more — go to My Members to see all
              </div>
            )}
          </div>
        </div>

        {/* Broadcasts for associate */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Notices & Broadcasts</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {broadcasts.length} active
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {broadcasts.length > 0 ? broadcasts.map((b) => {
              const s = CATEGORY_STYLES[b.category] || CATEGORY_STYLES.GENERAL_NOTICE;
              return (
                <div key={b._id} className={`px-5 py-3.5 border-l-4 ${s.bar} hover:bg-slate-50/60 transition-colors`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${s.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.emoji} {CATEGORY_LABELS[b.category]}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(b.createdAt)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{b.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{b.message}</p>
                </div>
              );
            }) : (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                No active broadcasts for you right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member status breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Member Status Breakdown</h3>
        {members.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No members yet. Add your first member to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Active',   count: activeMembers,                                          color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { label: 'Pending',  count: pendingMembers,                                         color: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100'       },
              { label: 'Inactive', count: members.filter(m => m.status === 'inactive').length,    color: 'bg-slate-300',   badge: 'bg-slate-100 text-slate-600 border-slate-200'      },
            ].map((row) => {
              const pct = members.length > 0 ? Math.round((row.count / members.length) * 100) : 0;
              return (
                <div key={row.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${row.badge}`}>{row.label}</span>
                    <span className="text-sm font-bold text-slate-800">{row.count} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${row.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
