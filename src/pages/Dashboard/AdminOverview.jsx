import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, geoAPI } from '../../api/services';

function StatCard({ label, value, sub, color = 'emerald', icon }) {
  const colors = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-600' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  text: 'text-violet-600',  icon: 'text-violet-600'  },
    blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-600',    icon: 'text-blue-600'    },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600',   icon: 'text-amber-600'   },
  };
  const c = colors[color] || colors.emerald;
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

export default function AdminOverview() {
  const { user } = useAuth();

  // districtId may be a populated object { _id, name } or a raw ObjectId string
  const districtId = user?.districtId?._id || user?.districtId || null;
  const districtName = user?.districtId?.name || 'Your District';

  const [members,             setMembers]             = useState([]);
  const [associates,          setAssociates]          = useState([]);
  const [blocks,              setBlocks]              = useState([]);
  const [loading,             setLoading]             = useState(true);
  // resolvedDistrictId handles the case where districtId is missing from the
  // login token (old sessions) — we fall back to a fresh /auth/me call.
  const [resolvedDistrictId,  setResolvedDistrictId]  = useState(districtId);

  useEffect(() => {
    if (districtId) {
      // districtId already available in context — use it directly
      setResolvedDistrictId(districtId);
    } else {
      // districtId missing (login response didn't include it) — fetch from /me
      authAPI.getMe()
        .then(({ data }) => {
          const d = data.data?.districtId?._id || data.data?.districtId || null;
          setResolvedDistrictId(d);
        })
        .catch(() => setResolvedDistrictId(null));
    }
  }, [districtId]);

  useEffect(() => {
    // Wait until resolution is complete (null means still resolving when districtId was also null)
    if (resolvedDistrictId === null && districtId === null) return;

    const load = async () => {
      setLoading(true);
      try {
        const [memRes, assocRes, blockRes] = await Promise.all([
          authAPI.getUsers('MEMBER'),        // backend scopes to admin's district
          geoAPI.getAssignedAssociates(),    // backend scopes to admin's district
          resolvedDistrictId
            ? geoAPI.getBlocks(resolvedDistrictId)
            : Promise.resolve({ data: { data: [] } }),
        ]);

        setMembers(memRes.data.data || []);
        setAssociates(assocRes.data.data || []);
        setBlocks(blockRes.data.data || []);
      } catch {
        // silent — show zeros on error
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [resolvedDistrictId]);

  const activeMembers  = members.filter(m => m.status === 'active').length;
  const pendingMembers = members.filter(m => m.status === 'pending').length;
  const assignedAssoc  = associates.filter(a => a.assignedBlocks?.length > 0).length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 h-20 animate-pulse" />
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

      {/* District banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">District Admin Panel</p>
          <h2 className="text-lg font-bold text-white">{districtName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {user?.name} · {user?.employeeId || user?.email || ''}
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members" value={members.length}
          sub={`${pendingMembers} pending activation`} color="violet"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Active Members" value={activeMembers}
          sub={`${members.length > 0 ? Math.round((activeMembers / members.length) * 100) : 0}% activation rate`} color="emerald"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Field Associates" value={associates.length}
          sub={`${assignedAssoc} with block assignments`} color="blue"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <StatCard
          label="Total Blocks" value={blocks.length}
          sub="in your district" color="amber"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        />
      </div>

      {/* Two column: member status + associate list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Member status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Member Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Active',   count: activeMembers,  color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { label: 'Pending',  count: pendingMembers, color: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-100'       },
              { label: 'Inactive', count: members.filter(m => m.status === 'inactive').length, color: 'bg-slate-300', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
            ].map((row) => {
              const pct = members.length > 0 ? Math.round((row.count / members.length) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
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
          {members.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No members in your district yet.</p>
          )}
        </div>

        {/* Associates in district */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Field Associates</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {associates.length} total
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {associates.length > 0 ? associates.map((a) => (
              <div key={a._id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                  {a.employeeId && <p className="text-xs text-violet-600 font-mono mt-0.5">{a.employeeId}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{a.phone || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    a.assignedBlocks?.length > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {a.assignedBlocks?.length || 0} block{a.assignedBlocks?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                No associates assigned to your district yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blocks table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Blocks in {districtName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{blocks.length} blocks mapped</p>
        </div>
        {blocks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Block Name</th>
                  <th className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned Associate</th>
                  <th className="py-3 px-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blocks.map((b) => {
                  const assignedAssociate = associates.find(a =>
                    a.assignedBlocks?.some(ab => (ab._id || ab)?.toString() === b._id?.toString())
                  );
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{b.name}</td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {assignedAssociate ? (
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {assignedAssociate.name}
                          </span>
                        ) : (
                          <span className="text-amber-500 text-xs font-medium">⚠ Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          assignedAssociate
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {assignedAssociate ? 'Covered' : 'Needs Associate'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No blocks found for your district.
          </div>
        )}
      </div>

    </div>
  );
}
