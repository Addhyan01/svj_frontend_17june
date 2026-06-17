import React, { useState, useEffect, useCallback } from 'react';
import { meetingAPI, geoAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import CreateMeeting from './CreateMeeting';
import MeetingDetail from './MeetingDetail';

const MEETING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'GENERAL',   label: 'General' },
  { value: 'TRAINING',  label: 'Training' },
  { value: 'AWARENESS', label: 'Awareness' },
  { value: 'REVIEW',    label: 'Review' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'OTHER',     label: 'Other' },
];

const TYPE_STYLES = {
  GENERAL:   { badge: 'bg-slate-100 text-slate-700 border-slate-200',      emoji: '📋' },
  TRAINING:  { badge: 'bg-blue-50 text-blue-700 border-blue-100',          emoji: '🎓' },
  AWARENESS: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', emoji: '📢' },
  REVIEW:    { badge: 'bg-violet-50 text-violet-700 border-violet-100',    emoji: '🔍' },
  EMERGENCY: { badge: 'bg-red-50 text-red-700 border-red-100',             emoji: '🚨' },
  OTHER:     { badge: 'bg-amber-50 text-amber-700 border-amber-100',       emoji: '📌' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Admin Associate Drill-Down Component ────────────────────────────────────

function AdminAssociateDrillDown({ associateStats, onMeetingClick, onAddMeeting }) {
  // view: 'associates' | 'meetings'
  const [view, setView] = useState('associates');
  const [selectedAssociate, setSelectedAssociate] = useState(null); // { id, name }
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const handleAssociateClick = async (associateId, associateName, pg = 1) => {
    setLoading(true);
    setError('');
    setSelectedAssociate({ id: associateId, name: associateName });
    setView('meetings');
    setPage(pg);
    try {
      const { data } = await meetingAPI.getAll({ conductedBy: associateId, page: pg, limit: 10 });
      setMeetings(data.data || []);
      setPagination({ total: data.total, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  // ── Associates list ──
  if (view === 'associates') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">All Meetings in District</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click an associate to view their meetings</p>
          </div>
          <button
            onClick={onAddMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Meeting
          </button>
        </div>
        {associateStats.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm font-semibold text-slate-600">No associate activity yet</p>
            <p className="text-xs text-slate-400 mt-1">No meetings have been recorded in this district.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {associateStats.map((a) => (
              <button
                key={a._id}
                onClick={() => handleAssociateClick(a._id, a.user?.name || 'Unknown')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-violet-50/40 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                    {(a.user?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                      {a.user?.name || 'Unknown'}
                    </p>
                    {a.user?.employeeId && (
                      <span className="text-xs text-violet-600 font-mono">{a.user.employeeId}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-violet-600">{a.count}</p>
                    <p className="text-xs text-slate-400">meetings</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{a.attended}</p>
                    <p className="text-xs text-slate-400">reached</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Associate's meetings list ──
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setView('associates'); setMeetings([]); }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Associates
        </button>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-xs font-semibold text-slate-800">👤 {selectedAssociate?.name}</span>
        <span className="ml-auto text-xs text-slate-400">Click a meeting to view details</span>
      </div>

      {loading ? (
        <div className="divide-y divide-slate-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-48 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-sm text-red-600 bg-red-50">{error}</div>
      ) : meetings.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm font-semibold text-slate-600">No meetings found</p>
          <p className="text-xs text-slate-400 mt-1">This associate has no recorded meetings.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {meetings.map((m) => {
              const s = TYPE_STYLES[m.meetingType] || TYPE_STYLES.OTHER;
              return (
                <button
                  key={m._id}
                  onClick={() => onMeetingClick(m._id)}
                  className="w-full px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-lg border ${s.badge} shrink-0`}>
                      <span className="text-base leading-none">{s.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate">{m.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(m.meetingDate)} · {formatTime(m.meetingDate)}</p>
                      {m.address?.fullAddress && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">📍 {m.address.fullAddress}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-600">{m.totalMembersAttended}</p>
                      <p className="text-xs text-slate-400">attended</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
          {pagination.pages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">Page {page} of {pagination.pages} · {pagination.total} total</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => handleAssociateClick(selectedAssociate.id, selectedAssociate.name, page - 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                >Previous</button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => handleAssociateClick(selectedAssociate.id, selectedAssociate.name, page + 1)}
                  className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
                >Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── District Drill-Down Component ───────────────────────────────────────────

function DistrictDrillDown({ districtStats, onMeetingClick, onAddMeeting }) {
  const [drillState, setDrillState] = useState(null);
  const [associates, setAssociates] = useState([]);
  const [associateMeetings, setAssociateMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meetingPage, setMeetingPage] = useState(1);
  const [meetingPagination, setMeetingPagination] = useState({ total: 0, pages: 1 });
  const [districtName, setDistrictName] = useState('');

  const handleDistrictClick = async (districtId, name) => {
    setLoading(true);
    setError('');
    setDistrictName(name);
    setDrillState({ type: 'associates', districtId, districtName: name });
    try {
      const { data } = await meetingAPI.getDistrictAssociates(districtId);
      setAssociates(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load associates.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateClick = async (associateId, associateName, distId, page = 1) => {
    setLoading(true);
    setError('');
    setDrillState({ type: 'meetings', associateId, associateName, districtId: distId });
    setMeetingPage(page);
    try {
      const { data } = await meetingAPI.getAll({ conductedBy: associateId, page, limit: 10 });
      setAssociateMeetings(data.data || []);
      setMeetingPagination({ total: data.total, pages: data.pages });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  const goToDistricts = () => {
    setDrillState(null);
    setAssociates([]);
    setAssociateMeetings([]);
  };

  const goToAssociates = () => {
    if (drillState?.districtId) {
      handleDistrictClick(drillState.districtId, districtName);
    }
  };

  // ── District list view ──
  if (!drillState) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">District-wise Meeting Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click a district to view associate activity</p>
          </div>
          <button
            onClick={onAddMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Meeting
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">District</th>
                <th className="py-3 px-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Meetings</th>
                <th className="py-3 px-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Members Reached</th>
                <th className="py-3 px-5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtStats.map((d) => (
                <tr
                  key={d._id}
                  className="hover:bg-violet-50/40 transition-colors cursor-pointer group"
                  onClick={() => handleDistrictClick(d._id, d.district?.name || 'Unknown')}
                >
                  <td className="py-3 px-5 font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                    🏛 {d.district?.name || 'Unknown'}
                  </td>
                  <td className="py-3 px-5 text-center font-bold text-violet-600">{d.count}</td>
                  <td className="py-3 px-5 text-center font-bold text-emerald-600">{d.attended}</td>
                  <td className="py-3 px-5 text-center">
                    <span className="text-xs text-violet-500 group-hover:text-violet-700 font-medium inline-flex items-center gap-1">
                      View Associates
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Associates list view ──
  if (drillState.type === 'associates') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <button onClick={goToDistricts} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Districts
          </button>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-xs font-semibold text-slate-800">🏛 {drillState.districtName}</span>
          <span className="ml-auto text-xs text-slate-400">Click an associate to view their meetings</span>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center justify-between">
                <div className="space-y-1.5"><div className="h-4 bg-slate-200 rounded w-36" /><div className="h-3 bg-slate-100 rounded w-24" /></div>
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-4 text-sm text-red-600 bg-red-50">{error}</div>
        ) : associates.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm font-semibold text-slate-600">No associates found</p>
            <p className="text-xs text-slate-400 mt-1">No meetings have been recorded in this district yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {associates.map((a) => (
              <button
                key={a._id}
                onClick={() => handleAssociateClick(a._id, a.user?.name || 'Unknown', drillState.districtId)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-violet-50/40 transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
                    {(a.user?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{a.user?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {a.user?.employeeId && <span className="text-xs text-violet-600 font-mono">{a.user.employeeId}</span>}
                      {a.lastMeeting && <span className="text-xs text-slate-400">Last: {formatDate(a.lastMeeting)}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right"><p className="text-sm font-bold text-violet-600">{a.count}</p><p className="text-xs text-slate-400">meetings</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-emerald-600">{a.attended}</p><p className="text-xs text-slate-400">reached</p></div>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Associate's meetings list view ──
  if (drillState.type === 'meetings') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <button onClick={goToDistricts} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Districts
          </button>
          <span className="text-slate-300 text-xs">/</span>
          <button onClick={goToAssociates} className="text-xs text-slate-500 hover:text-slate-800 transition font-medium">
            🏛 {districtName}
          </button>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-xs font-semibold text-slate-800">👤 {drillState.associateName}</span>
          <span className="ml-auto text-xs text-slate-400">Click a meeting to view details</span>
        </div>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-48 mb-2" /><div className="h-3 bg-slate-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-5 py-4 text-sm text-red-600 bg-red-50">{error}</div>
        ) : associateMeetings.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm font-semibold text-slate-600">No meetings found</p>
            <p className="text-xs text-slate-400 mt-1">This associate has no recorded meetings.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {associateMeetings.map((m) => {
                const s = TYPE_STYLES[m.meetingType] || TYPE_STYLES.OTHER;
                return (
                  <button key={m._id} onClick={() => onMeetingClick(m._id)}
                    className="w-full px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors text-left group">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 p-1.5 rounded-lg border ${s.badge} shrink-0`}>
                        <span className="text-base leading-none">{s.emoji}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors truncate">{m.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(m.meetingDate)} · {formatTime(m.meetingDate)}</p>
                        {m.address?.fullAddress && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">📍 {m.address.fullAddress}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div><p className="text-sm font-bold text-emerald-600">{m.totalMembersAttended}</p><p className="text-xs text-slate-400">attended</p></div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
            {meetingPagination.pages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">Page {meetingPage} of {meetingPagination.pages} · {meetingPagination.total} total</p>
                <div className="flex gap-2">
                  <button disabled={meetingPage <= 1}
                    onClick={() => handleAssociateClick(drillState.associateId, drillState.associateName, drillState.districtId, meetingPage - 1)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Previous</button>
                  <button disabled={meetingPage >= meetingPagination.pages}
                    onClick={() => handleAssociateClick(drillState.associateId, drillState.associateName, drillState.districtId, meetingPage + 1)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
}

// ─── Main ManageMeetings Component ───────────────────────────────────────────

export default function ManageMeetings() {
  const { user } = useAuth();
  const [view, setView]             = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedId, setSelectedId] = useState(null);
  const [meetings, setMeetings]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filter, setFilter]         = useState({ meetingType: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const isAssociate  = user?.role === 'ASSOCIATE';
  const isAdmin      = user?.role === 'ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const loadMeetings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        meetingAPI.getAll({ ...filter, limit: 15 }),
        meetingAPI.getStats(),
      ]);
      setMeetings(listRes.data.data || []);
      setPagination({ total: listRes.data.total, pages: listRes.data.pages });
      setStats(statsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Navigate to meeting detail — used by both the main list and the drill-down
  const handleMeetingClick = (meetingId) => {
    setSelectedId(meetingId);
    setView('detail');
  };

  if (view === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Meetings
          </button>
          <h2 className="text-sm font-semibold text-slate-800">Create New Meeting</h2>
        </div>
        <CreateMeeting onSuccess={() => { setView('list'); loadMeetings(); }} />
      </div>
    );
  }

  if (view === 'detail' && selectedId) {
    return (
      <MeetingDetail
        meetingId={selectedId}
        onBack={() => { setView('list'); loadMeetings(); }}
      />
    );
  }

  return (
    <div className="space-y-5">

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Meetings', value: stats.total, sub: 'all time', color: 'violet',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            },
            {
              label: 'Members Reached', value: stats.totalAttended, sub: 'total attendance', color: 'emerald',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
            },
            {
              label: 'This Month',
              value: (() => { const now = new Date(); return stats.monthly?.find((m) => m._id.year === now.getFullYear() && m._id.month === now.getMonth() + 1)?.count || 0; })(),
              sub: 'meetings conducted', color: 'blue',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            },
            {
              label: 'Meeting Types', value: stats.byType?.length || 0, sub: 'categories used', color: 'amber',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
            },
          ].map((card) => {
            const colors = {
              violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  icon: 'text-violet-600'  },
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600' },
              blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    icon: 'text-blue-600'    },
              amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   icon: 'text-amber-600'   },
            }[card.color];
            return (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border ${colors.icon}`}>{card.icon}</div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 leading-none">{card.value ?? '—'}</p>
                  {card.sub && <p className="text-xs text-slate-400 mt-1">{card.sub}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Type breakdown — shown to Associates only */}
      {isAssociate && stats?.byType?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Meetings by Type</h3>
          <div className="flex flex-wrap gap-2">
            {stats.byType.map((t) => {
              const s = TYPE_STYLES[t._id] || TYPE_STYLES.OTHER;
              return (
                <span key={t._id} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${s.badge}`}>
                  {s.emoji} {t._id} <span className="font-bold">({t.count})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin: associate drill-down */}
      {isAdmin && stats?.associateStats?.length > 0 && (
        <AdminAssociateDrillDown
          associateStats={stats.associateStats}
          onMeetingClick={handleMeetingClick}
          onAddMeeting={() => setView('create')}
        />
      )}

      {/* Super Admin: district drill-down */}
      {isSuperAdmin && stats?.districtStats?.length > 0 && (
        <DistrictDrillDown
          districtStats={stats.districtStats}
          onMeetingClick={handleMeetingClick}
          onAddMeeting={() => setView('create')}
        />
      )}

      {/* All Meetings list — hidden for Super Admin and Admin (both use drill-down instead) */}
      {!isSuperAdmin && !isAdmin && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {isAssociate ? 'My Meetings' : isAdmin ? 'All Meetings in District' : 'All Meetings'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{pagination.total} total</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter.meetingType}
              onChange={(e) => handleFilterChange('meetingType', e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Meeting
            </button>
          </div>
        </div>

        {error && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-48 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm font-semibold text-slate-600">No meetings found</p>
            <p className="text-xs text-slate-400 mt-1">Create your first meeting to get started.</p>
            <button onClick={() => setView('create')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition">
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {meetings.map((m) => {
              const s = TYPE_STYLES[m.meetingType] || TYPE_STYLES.OTHER;
              return (
                <button
                  key={m._id}
                  onClick={() => handleMeetingClick(m._id)}
                  className="w-full px-5 py-4 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition-colors text-left"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 p-1.5 rounded-lg border ${s.badge} shrink-0`}>
                      <span className="text-base leading-none">{s.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{m.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(m.meetingDate)} · {formatTime(m.meetingDate)}</p>
                      {!isAssociate && m.conductedBy?.name && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          By {m.conductedBy.name}{m.conductedBy.employeeId && ` (${m.conductedBy.employeeId})`}
                        </p>
                      )}
                      {m.address?.fullAddress && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">📍 {m.address.fullAddress}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600">{m.totalMembersAttended}</p>
                    <p className="text-xs text-slate-400">attended</p>
                    {m.photos?.length > 0 && <p className="text-xs text-slate-400 mt-1">📷 {m.photos.length}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">Page {filter.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={filter.page <= 1} onClick={() => handleFilterChange('page', filter.page - 1)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Previous</button>
              <button disabled={filter.page >= pagination.pages} onClick={() => handleFilterChange('page', filter.page + 1)}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition">Next</button>
            </div>
          </div>
        )}
      </div>}

    </div>
  );
}
