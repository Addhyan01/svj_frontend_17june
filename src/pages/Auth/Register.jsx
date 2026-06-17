import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/services';
import { geoAPI } from '../../api/services';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '',
    districtId: '', blockId: '', state: 'Bihar',
    pincode: '', password: '', role: 'MEMBER',
  });
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load districts on mount
  useEffect(() => {
    geoAPI.getDistricts()
      .then(({ data }) => setDistricts(data.data || []))
      .catch(() => {});
  }, []);

  // Load blocks when district changes
  useEffect(() => {
    if (!form.districtId) { setBlocks([]); return; }
    geoAPI.getBlocks(form.districtId)
      .then(({ data }) => setBlocks(data.data || []))
      .catch(() => setBlocks([]));
  }, [form.districtId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authAPI.register(form);
      setSuccess('Registration submitted! Your account is pending activation.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text', placeholder = '', required = false) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-800"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Join Sabka Vikas Jayti NGO Platform
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Full Name', 'name', 'text', 'Your full name', true)}
            {field('Mobile No', 'phone', 'tel', '10-digit number', true)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Email ID', 'email', 'email', 'example@gmail.com', true)}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-gray-700"
              >
                <option value="MEMBER">MEMBER (सदस्य)</option>
                <option value="DONOR">DONOR (दाता)</option>
              </select>
            </div>
          </div>

          {field('Complete Address', 'address', 'text', 'Village, Ward No.', true)}

          <div className="grid grid-cols-2 gap-4">
            {/* District dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">District *</label>
              <select
                required
                value={form.districtId}
                onChange={(e) => setForm({ ...form, districtId: e.target.value, blockId: '' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-gray-700"
              >
                <option value="">Select district...</option>
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Block dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Block *</label>
              <select
                required
                value={form.blockId}
                onChange={(e) => setForm({ ...form, blockId: e.target.value })}
                disabled={!form.districtId}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-gray-700 disabled:opacity-50"
              >
                <option value="">Select block...</option>
                {blocks.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">State</label>
              <input
                type="text"
                value={form.state}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-bold text-gray-600"
              />
            </div>
            {field('Pincode', 'pincode', 'text', '800001', true)}
          </div>

          {field('Password', 'password', 'password', '••••••••', true)}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3 px-4 rounded-xl shadow-md transition duration-150 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
            style={{ backgroundColor: '#3A7D44' }}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 font-medium pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
}
