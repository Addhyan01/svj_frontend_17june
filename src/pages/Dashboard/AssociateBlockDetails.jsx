import React, { useState, useEffect } from 'react';
import { geoAPI, authAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function BlockDetailView({ block, onBack }) {
  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Blocks
      </button>

      {/* Header card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Block Details</p>
        <h2 className="text-xl font-bold text-white">{block.name}</h2>
        {block.districtId?.name && (
          <p className="text-sm text-slate-400 mt-1">
            🏛 District: <span className="text-slate-200 font-medium">{block.districtId.name}</span>
          </p>
        )}
      </div>

      {/* Info grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Block Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="Block Name" value={block.name} />
          <InfoRow label="District" value={block.districtId?.name || '—'} />
          <InfoRow label="Block ID" value={block._id} mono />
          <InfoRow label="Created On" value={formatDate(block.createdAt)} />
        </div>
      </div>
    </div>
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

function MemberDetailView({ member, onBack }) {
  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Members List
      </button>

      {/* Header */}
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

      {/* Status badge */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
          member.status === 'active'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : member.status === 'pending'
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {member.status?.toUpperCase()}
        </span>
        {member.membershipId && (
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {member.membershipId}
          </span>
        )}
      </div>

      {/* Details */}
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
          <InfoRow label="Registered On" value={formatDate(member.createdAt)} />
          <InfoRow label="User ID" value={member._id} mono />
        </div>
      </div>
    </div>
  );
}

function BlockMembersList({ block, associateId, onBack, onViewMember }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch members under this associate in this specific block
        const res = await authAPI.getUsers('MEMBER', undefined, associateId);
        const all = res.data.data || [];
        // Filter to only members whose blockId matches this block
        const blockMembers = all.filter(
          (m) => m.blockId?._id === block._id || m.blockId === block._id
        );
        setMembers(blockMembers);
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [block._id, associateId]);

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.memberId?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Blocks
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-1">Members in Block</p>
        <h2 className="text-xl font-bold text-white">{block.name}</h2>
        {block.districtId?.name && (
          <p className="text-sm text-emerald-300 mt-1">🏛 {block.districtId.name}</p>
        )}
      </div>

      {/* Search + count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-sm text-slate-500">
          {loading ? 'Loading…' : `${filtered.length} member${filtered.length !== 1 ? 's' : ''} found`}
        </span>
        <input
          type="text"
          placeholder="Search by name, ID or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
        />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(4)].map((_, i) => (
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
            {members.length === 0
              ? 'No members registered under you in this block yet.'
              : 'No members match your search.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((m) => (
              <button
                key={m._id}
                onClick={() => onViewMember(m)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-600 shrink-0">
                    {m.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                      {m.name}
                    </p>
                    {m.memberId && (
                      <p className="text-xs font-mono text-emerald-600 mt-0.5">{m.memberId}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{m.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                    m.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : m.status === 'pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {m.status}
                  </span>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AssociateBlockDetails() {
  const { user } = useAuth();
  const associateId = user?._id || user?.id;

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // view: 'list' | 'block-detail' | 'members-list' | 'member-detail'
  const [view, setView] = useState('list');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await geoAPI.getMyBlocks();
        setBlocks(res.data.data || []);
      } catch {
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Navigation helpers ──────────────────────────────────────────────────────
  const openBlockDetail = (block) => {
    setSelectedBlock(block);
    setView('block-detail');
  };

  const openMembersList = (block) => {
    setSelectedBlock(block);
    setView('members-list');
  };

  const openMemberDetail = (member) => {
    setSelectedMember(member);
    setView('member-detail');
  };

  const backToList = () => {
    setView('list');
    setSelectedBlock(null);
    setSelectedMember(null);
  };

  const backToMembersList = () => {
    setView('members-list');
    setSelectedMember(null);
  };

  // ── Render sub-views ────────────────────────────────────────────────────────
  if (view === 'block-detail' && selectedBlock) {
    return <BlockDetailView block={selectedBlock} onBack={backToList} />;
  }

  if (view === 'member-detail' && selectedMember) {
    return (
      <MemberDetailView
        member={selectedMember}
        onBack={backToMembersList}
      />
    );
  }

  if (view === 'members-list' && selectedBlock) {
    return (
      <BlockMembersList
        block={selectedBlock}
        associateId={associateId}
        onBack={backToList}
        onViewMember={openMemberDetail}
      />
    );
  }

  // ── Default: blocks list ────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Field Associate</p>
          <h2 className="text-lg font-bold text-white">My Assigned Blocks</h2>
          <p className="text-xs text-slate-400 mt-1">
            {loading ? 'Loading…' : `${blocks.length} block${blocks.length !== 1 ? 's' : ''} assigned to you`}
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
      </div>

      {/* Blocks grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-16 text-center">
          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">No blocks assigned yet</p>
          <p className="text-xs text-slate-400 mt-1">Contact your admin to get blocks assigned to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blocks.map((block) => (
            <div
              key={block._id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:shadow-sm transition-shadow"
            >
              {/* Block name + district */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">{block.name}</h3>
                  {block.districtId?.name && (
                    <p className="text-xs text-slate-400 mt-0.5">🏛 {block.districtId.name}</p>
                  )}
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  onClick={() => openMembersList(block)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View Members
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
