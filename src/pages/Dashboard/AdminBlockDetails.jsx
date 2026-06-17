import React, { useState, useEffect } from 'react';
import { geoAPI, authAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function BackButton({ onClick, label = 'Back' }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? 'font-mono text-xs text-slate-500' : ''}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active:   'bg-emerald-50 text-emerald-700 border-emerald-100',
    pending:  'bg-amber-50 text-amber-600 border-amber-100',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  );
}

// ─── Member Detail View ───────────────────────────────────────────────────────

function MemberDetailView({ member, onBack, backLabel }) {
  return (
    <div className="space-y-5">
      <BackButton onClick={onBack} label={backLabel || 'Back to Members'} />

      <div className="bg-gradient-to-r from-violet-900 to-violet-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-violet-300 uppercase tracking-widest mb-1">Member Profile</p>
          <h2 className="text-xl font-bold text-white">{member.name}</h2>
          {member.memberId && (
            <span className="inline-block mt-1 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {member.memberId}
            </span>
          )}
        </div>
        <div className="h-12 w-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={member.status} />
        {member.membershipId && (
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {member.membershipId}
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Full Name" value={member.name} />
          <InfoRow label="Phone" value={member.phone} />
          <InfoRow label="Email" value={member.email} />
          <InfoRow label="Member ID" value={member.memberId} mono />
          <InfoRow label="Membership ID" value={member.membershipId} mono />
          <InfoRow label="Status" value={member.status} />
          <InfoRow label="Block" value={member.blockId?.name} />
          <InfoRow label="District" value={member.districtId?.name} />
          <InfoRow label="Field Associate" value={member.associateId?.name} />
          <InfoRow label="Registered On" value={formatDate(member.createdAt)} />
          <InfoRow label="User ID" value={member._id} mono />
        </div>
      </div>
    </div>
  );
}

// ─── Associate Detail View ────────────────────────────────────────────────────

function AssociateDetailView({ associate, onBack, backLabel }) {
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getUsers('MEMBER', undefined, associate._id);
        setMembers(res.data.data || []);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [associate._id]);

  if (selectedMember) {
    return (
      <MemberDetailView
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
        backLabel={`Back to ${associate.name}'s Members`}
      />
    );
  }

  const activeCount  = members.filter(m => m.status === 'active').length;
  const pendingCount = members.filter(m => m.status === 'pending').length;

  return (
    <div className="space-y-5">
      <BackButton onClick={onBack} label={backLabel || 'Back to Associates'} />

      {/* Associate header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Field Associate</p>
          <h2 className="text-xl font-bold text-white">{associate.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {associate.employeeId && (
              <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {associate.employeeId}
              </span>
            )}
            {associate.districtId?.name && (
              <span className="text-xs text-slate-400">🏛 {associate.districtId.name}</span>
            )}
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Associate info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Associate Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Full Name" value={associate.name} />
          <InfoRow label="Phone" value={associate.phone} />
          <InfoRow label="Email" value={associate.email} />
          <InfoRow label="Employee ID" value={associate.employeeId} mono />
          <InfoRow label="Status" value={associate.status} />
          <InfoRow label="District" value={associate.districtId?.name} />
          <InfoRow label="Assigned Blocks" value={associate.assignedBlocks?.map(b => b.name || b).join(', ')} />
          <InfoRow label="Joined On" value={formatDate(associate.createdAt)} />
          <InfoRow label="User ID" value={associate._id} mono />
        </div>
      </div>

      {/* Members under this associate */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Members Under This Associate</h3>
          {!loading && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {activeCount} active / {members.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No members registered under this associate yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {members.map((m) => (
              <button
                key={m._id}
                onClick={() => setSelectedMember(m)}
                className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{m.name}</p>
                    {m.memberId && <p className="text-xs font-mono text-emerald-600 mt-0.5">{m.memberId}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{m.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={m.status} />
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Associates List View (for a block) ──────────────────────────────────────

function BlockAssociatesList({ block, onBack }) {
  const [associates, setAssociates]               = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [search, setSearch]                       = useState('');
  const [selectedAssociate, setSelectedAssociate] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await geoAPI.getAssociatesByBlock(block._id);
        setAssociates(res.data.data || []);
      } catch {
        setAssociates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [block._id]);

  // Drill into associate detail — fully self-contained
  if (selectedAssociate) {
    return (
      <AssociateDetailView
        associate={selectedAssociate}
        onBack={() => setSelectedAssociate(null)}
        backLabel={`Back to ${block.name} Associates`}
      />
    );
  }

  const filtered = associates.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
    a.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
      <BackButton onClick={onBack} label="Back to Block List" />

      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Associates in Block</p>
        <h2 className="text-xl font-bold text-white">{block.name}</h2>
        {block.districtId?.name && (
          <p className="text-sm text-blue-300 mt-1">🏛 {block.districtId.name}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-sm text-slate-500">
          {loading ? 'Loading…' : `${filtered.length} associate${filtered.length !== 1 ? 's' : ''} found`}
        </span>
        <input
          type="text"
          placeholder="Search by name, ID or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">
            {associates.length === 0 ? 'No associates assigned to this block yet.' : 'No associates match your search.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(a => (
              <button
                key={a._id}
                onClick={() => setSelectedAssociate(a)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                    {a.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{a.name}</p>
                    {a.employeeId && <p className="text-xs font-mono text-emerald-600 mt-0.5">{a.employeeId}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{a.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={a.status} />
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Block Detail View (associates + member details button) ──────────────────

function BlockDetailView({ block, onBack }) {
  const [associates, setAssociates]         = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedAssociate, setSelectedAssociate] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await geoAPI.getAssociatesByBlock(block._id);
        setAssociates(res.data.data || []);
      } catch {
        setAssociates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [block._id]);

  // Drill into associate detail from this view
  if (selectedAssociate) {
    return (
      <AssociateDetailView
        associate={selectedAssociate}
        onBack={() => setSelectedAssociate(null)}
        backLabel={`Back to ${block.name} Details`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <BackButton onClick={onBack} label="Back to Block List" />

      {/* Block header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Block Details</p>
        <h2 className="text-xl font-bold text-white">{block.name}</h2>
        {block.districtId?.name && (
          <p className="text-sm text-slate-400 mt-1">🏛 District: <span className="text-slate-200 font-medium">{block.districtId.name}</span></p>
        )}
      </div>

      {/* Block info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Block Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Block Name" value={block.name} />
          <InfoRow label="District" value={block.districtId?.name} />
          <InfoRow label="Total Associates" value={loading ? '…' : String(associates.length)} />
          <InfoRow label="Block ID" value={block._id} mono />
          <InfoRow label="Created On" value={formatDate(block.createdAt)} />
        </div>
      </div>

      {/* Associates list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Associates in This Block</h3>
          {!loading && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {associates.length} total
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : associates.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">
            No associates assigned to this block yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {associates.map(a => (
              <button
                key={a._id}
                onClick={() => setSelectedAssociate(a)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                    {a.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{a.name}</p>
                    {a.employeeId && <p className="text-xs font-mono text-emerald-600 mt-0.5">{a.employeeId}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{a.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={a.status} />
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminBlockDetails() {
  const { user } = useAuth();

  const [blocks, setBlocks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // view: 'list' | 'block-detail' | 'associates-list'
  const [view, setView]                   = useState('list');
  const [selectedBlock, setSelectedBlock] = useState(null);

  const districtName = user?.districtId?.name || '—';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await geoAPI.getAdminDistrictBlocks();
        setBlocks(res.data.data || []);
      } catch {
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const openBlockDetail    = (block) => { setSelectedBlock(block); setView('block-detail'); };
  const openAssociatesList = (block) => { setSelectedBlock(block); setView('associates-list'); };
  const backToList         = () => { setView('list'); setSelectedBlock(null); };

  // ── Sub-view routing ────────────────────────────────────────────────────────
  if (view === 'block-detail' && selectedBlock) {
    return <BlockDetailView block={selectedBlock} onBack={backToList} />;
  }

  if (view === 'associates-list' && selectedBlock) {
    return (
      <BlockAssociatesList
        block={selectedBlock}
        onBack={backToList}
      />
    );
  }

  // ── Default: blocks list ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">District Admin</p>
          <h2 className="text-lg font-bold text-white">Block Details</h2>
          <p className="text-xs text-slate-400 mt-1">
            🏛 {districtName} &nbsp;·&nbsp;
            {loading ? 'Loading…' : `${blocks.length} block${blocks.length !== 1 ? 's' : ''} in your district`}
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      {/* Blocks grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-44 animate-pulse" />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-16 text-center">
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">No blocks found in your district</p>
          <p className="text-xs text-slate-400 mt-1">Contact the Super Admin to add blocks to your district.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map(block => (
            <div key={block._id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:shadow-sm transition-shadow">
              {/* Block name + district + associate count */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">{block.name}</h3>
                  {block.districtId?.name && (
                    <p className="text-xs text-slate-400 mt-0.5">🏛 {block.districtId.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium">
                      {block.associateCount ?? 0} associate{block.associateCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openBlockDetail(block)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Block Details
                </button>
                <button
                  onClick={() => openAssociatesList(block)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View Associates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
