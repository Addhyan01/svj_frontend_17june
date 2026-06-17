import React, { useState, useEffect } from 'react';
import { meetingAPI } from '../../api/services';
import CreateMeeting from './CreateMeeting';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLES = {
  GENERAL:   { badge: 'bg-slate-100 text-slate-700 border-slate-200',   emoji: '📋' },
  TRAINING:  { badge: 'bg-blue-50 text-blue-700 border-blue-100',       emoji: '🎓' },
  AWARENESS: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', emoji: '📢' },
  REVIEW:    { badge: 'bg-violet-50 text-violet-700 border-violet-100', emoji: '🔍' },
  EMERGENCY: { badge: 'bg-red-50 text-red-700 border-red-100',          emoji: '🚨' },
  OTHER:     { badge: 'bg-amber-50 text-amber-700 border-amber-100',    emoji: '📌' },
};

const TYPE_LABELS = {
  GENERAL: 'General', TRAINING: 'Training', AWARENESS: 'Awareness',
  REVIEW: 'Review', EMERGENCY: 'Emergency', OTHER: 'Other',
};

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MeetingDetail({ meetingId, onBack }) {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(false);
  const [lightbox, setLightbox] = useState(null); // photo URL
  const [deleting, setDeleting] = useState(false);

  const canEdit =
    user?.role === 'SUPER_ADMIN' ||
    meeting?.conductedBy?._id === (user?._id || user?.id) ||
    meeting?.conductedBy === (user?._id || user?.id);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await meetingAPI.getById(meetingId);
      setMeeting(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meeting.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [meetingId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this meeting? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await meetingAPI.remove(meetingId);
      onBack?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-48" />
        <div className="bg-white rounded-xl border border-slate-200 h-64 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <button onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Details
        </button>
        <CreateMeeting editMeeting={meeting} onSuccess={() => { setEditing(false); load(); }} />
      </div>
    );
  }

  const typeStyle = TYPE_STYLES[meeting.meetingType] || TYPE_STYLES.OTHER;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 disabled:opacity-50">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{meeting.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${typeStyle.badge}`}>
                {typeStyle.emoji} {TYPE_LABELS[meeting.meetingType]}
              </span>
              <span className="text-xs text-slate-400">
                🗓 {formatDateTime(meeting.meetingDate)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-emerald-600">{meeting.totalMembersAttended}</p>
            <p className="text-xs text-slate-400">members attended</p>
          </div>
        </div>

        {meeting.description && (
          <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {meeting.description}
          </p>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Conducted by */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Conducted By</p>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
              {meeting.conductedBy?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{meeting.conductedBy?.name || '—'}</p>
              {meeting.conductedBy?.employeeId && (
                <p className="text-xs text-violet-600 font-mono">{meeting.conductedBy.employeeId}</p>
              )}
              <p className="text-xs text-slate-400 capitalize">{meeting.conductedByRole?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {meeting.address?.fullAddress || [
              meeting.address?.line1,
              meeting.address?.village,
              meeting.address?.block,
              meeting.address?.district,
              meeting.address?.state,
              meeting.address?.pincode,
            ].filter(Boolean).join(', ') || '—'}
          </p>
          {meeting.gpsLocation?.lat && (
            <a
              href={`https://maps.google.com/?q=${meeting.gpsLocation.lat},${meeting.gpsLocation.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1.5">
              📍 View on Map
            </a>
          )}
        </div>

        {/* District / Block */}
        {(meeting.districtId || meeting.blockId) && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Area</p>
            <div className="space-y-1">
              {meeting.districtId?.name && (
                <p className="text-sm text-slate-700">🏛 {meeting.districtId.name}</p>
              )}
              {meeting.blockId?.name && (
                <p className="text-sm text-slate-700">📍 {meeting.blockId.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Date/Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Date & Time</p>
          <p className="text-sm font-semibold text-slate-800">{formatDateTime(meeting.meetingDate)}</p>
          <p className="text-xs text-slate-400 mt-1">
            Created {new Date(meeting.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Notes */}
      {meeting.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Meeting Notes / Minutes</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{meeting.notes}</p>
        </div>
      )}

      {/* Photos */}
      {meeting.photos?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Meeting Photos ({meeting.photos.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {meeting.photos.map((p, i) => (
              <button key={i} type="button" onClick={() => setLightbox(p)}
                className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-400 transition group">
                <img src={p} alt={`Meeting photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Full size"
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-9 w-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-lg transition">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
