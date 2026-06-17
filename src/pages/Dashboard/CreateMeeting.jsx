import React, { useState, useRef } from 'react';
import { meetingAPI } from '../../api/services';

const MEETING_TYPES = [
  { value: 'GENERAL',   label: 'General Meeting' },
  { value: 'TRAINING',  label: 'Training Session' },
  { value: 'AWARENESS', label: 'Awareness Camp' },
  { value: 'REVIEW',    label: 'Review Meeting' },
  { value: 'EMERGENCY', label: 'Emergency Meeting' },
  { value: 'OTHER',     label: 'Other' },
];

export default function CreateMeeting({ onSuccess, editMeeting = null }) {
  const isEdit = !!editMeeting;

  const [form, setForm] = useState({
    title:                editMeeting?.title || '',
    description:          editMeeting?.description || '',
    meetingType:          editMeeting?.meetingType || 'GENERAL',
    meetingDate:          editMeeting?.meetingDate
      ? new Date(editMeeting.meetingDate).toISOString().slice(0, 16)
      : '',
    addressLine1:         editMeeting?.address?.line1 || '',
    addressVillage:       editMeeting?.address?.village || '',
    addressBlock:         editMeeting?.address?.block || '',
    addressDistrict:      editMeeting?.address?.district || '',
    addressState:         editMeeting?.address?.state || '',
    addressPincode:       editMeeting?.address?.pincode || '',
    fullAddress:          editMeeting?.address?.fullAddress || '',
    gpsLat:               editMeeting?.gpsLocation?.lat || '',
    gpsLng:               editMeeting?.gpsLocation?.lng || '',
    totalMembersAttended: editMeeting?.totalMembersAttended || '',
    notes:                editMeeting?.notes || '',
  });

  const [photos, setPhotos]           = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(editMeeting?.photos || []);
  const [removedPhotos, setRemovedPhotos]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [gpsLoading, setGpsLoading]   = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewPhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingPhoto = (photoPath) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== photoPath));
    setRemovedPhotos((prev) => [...prev, photoPath]);
  };

  const getGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          gpsLat: pos.coords.latitude.toFixed(6),
          gpsLng: pos.coords.longitude.toFixed(6),
        }));
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      photos.forEach((f) => fd.append('photos', f));
      if (isEdit && removedPhotos.length > 0) {
        fd.append('removePhotos', JSON.stringify(removedPhotos));
      }

      if (isEdit) {
        await meetingAPI.update(editMeeting._id, fd);
      } else {
        await meetingAPI.create(fd);
      }

      onSuccess?.();
    } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      const status = err.response?.status;
      console.error('CREATE MEETING ERROR', status, err.response?.data);
      setError(serverMsg ? `[${status}] ${serverMsg}` : `Failed to save meeting. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
          Meeting Information
        </h3>

        <div>
          <label className={labelCls}>Meeting Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            placeholder="e.g. Monthly Block Review Meeting"
            className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Meeting Type *</label>
            <select name="meetingType" value={form.meetingType} onChange={handleChange} required className={inputCls}>
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date & Time *</label>
            <input type="datetime-local" name="meetingDate" value={form.meetingDate} onChange={handleChange} required className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Brief description of the meeting agenda..."
            className={`${inputCls} resize-none`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Total Members Attended</label>
            <input type="number" name="totalMembersAttended" value={form.totalMembersAttended} onChange={handleChange}
              min="0" placeholder="0" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
          Meeting Location
        </h3>

        <div>
          <label className={labelCls}>Address Line 1 *</label>
          <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required
            placeholder="House/Building No., Street Name"
            className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Village / Area</label>
            <input name="addressVillage" value={form.addressVillage} onChange={handleChange}
              placeholder="Village or locality name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Block</label>
            <input name="addressBlock" value={form.addressBlock} onChange={handleChange}
              placeholder="Block name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>District</label>
            <input name="addressDistrict" value={form.addressDistrict} onChange={handleChange}
              placeholder="District name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input name="addressState" value={form.addressState} onChange={handleChange}
              placeholder="State name" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Pincode</label>
            <input name="addressPincode" value={form.addressPincode} onChange={handleChange}
              placeholder="6-digit pincode" maxLength={6} className={inputCls} />
          </div>
        </div>

        {/* GPS */}
        <div>
          <label className={labelCls}>GPS Location (Optional)</label>
          <div className="flex gap-2">
            <input name="gpsLat" value={form.gpsLat} onChange={handleChange}
              placeholder="Latitude" className={`${inputCls} flex-1`} />
            <input name="gpsLng" value={form.gpsLng} onChange={handleChange}
              placeholder="Longitude" className={`${inputCls} flex-1`} />
            <button type="button" onClick={getGPS} disabled={gpsLoading}
              className="px-3 py-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition whitespace-nowrap disabled:opacity-50">
              {gpsLoading ? '...' : '📍 Auto'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">3</span>
          Notes & Minutes
        </h3>
        <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
          placeholder="Meeting minutes, key decisions, action items..."
          className={`${inputCls} resize-none`} />
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">4</span>
          Meeting Photos
          <span className="text-xs font-normal text-slate-400">(up to 10 images, 5MB each)</span>
        </h3>

        {/* Existing photos (edit mode) */}
        {existingPhotos.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Existing photos</p>
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map((p) => (
                <div key={p} className="relative group">
                  <img src={p} alt="meeting"
                    className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                  <button type="button" onClick={() => removeExistingPhoto(p)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New photo previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt="preview"
                  className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
                <button type="button" onClick={() => removeNewPhoto(i)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition w-full justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Click to upload photos
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleFiles} className="hidden" />
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 flex items-center gap-2">
          {loading && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Saving...' : isEdit ? 'Update Meeting' : 'Create Meeting'}
        </button>
      </div>
    </form>
  );
}
