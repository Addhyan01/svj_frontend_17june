import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { openingsAPI } from '../../api/services';

const EMPTY_FORM = {
  openingId:  '',
  name:       '',
  email:      '',
  phone:      '',
  district:   '',
  block:      '',
  experience: 'Fresher',
  message:    '',
};

export default function Career() {
  const [openings, setOpenings]         = useState([]);
  const [fetchingJobs, setFetchingJobs] = useState(true);

  // Modal state
  const [selectedJob, setSelectedJob]   = useState(null); // null = closed
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [formError, setFormError]       = useState('');

  // ── Fetch live ONGOING openings ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await openingsAPI.getPublic();
        setOpenings(data.data || []);
      } catch {
        setOpenings([]);
      } finally {
        setFetchingJobs(false);
      }
    };
    load();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedJob) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedJob]);

  const openModal = (job) => {
    setSelectedJob(job);
    setFormData({ ...EMPTY_FORM, openingId: job._id });
    setSuccess(false);
    setFormError('');
  };

  const closeModal = () => {
    setSelectedJob(null);
    setFormData(EMPTY_FORM);
    setSuccess(false);
    setFormError('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCareerSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      await openingsAPI.apply(formData);
      setSuccess(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#5A2D82] via-[#3a1f60] to-[#3A7D44] py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '36px 36px' }}
        />
        <div className="absolute -top-20 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
           करियर (Career)
          </h1>
          <p className="text-white/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Bihar के हर गाँव और ब्लॉक तक बदलाव पहुँचाने के लिए हम नए Talents और Volunteers की तलाश में हैं। नीचे दी गई Openings देखें और Apply करें।
          </p>
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition-colors">होम</Link>
            <span>/</span>
            <span className="text-white/90">करियर</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OPENINGS GRID
      ══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h3 className="text-xl font-black text-gray-900 border-l-4 border-[#3A7D44] pl-3 mb-8">
          Current Open Positions
        </h3>

        {fetchingJobs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : openings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold text-gray-500">No Open Positions Right Now</p>
            <p className="text-sm mt-1">Check back soon — new opportunities will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openings.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="text-lg font-black text-gray-950 leading-snug">{job.title}</h4>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-[#3A7D44] rounded-md tracking-wider uppercase shrink-0">
                      {job.type}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-400">📍 {job.location}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{job.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openModal(job)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md"
                    style={{ backgroundColor: '#5A2D82' }}
                  >
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          APPLICATION MODAL
      ══════════════════════════════════════════════ */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal card */}
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#5A2D82] to-purple-800 px-6 py-5 text-white shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-purple-200 uppercase tracking-widest mb-1">Apply for Position</p>
                  <h3 className="text-lg font-black leading-tight">{selectedJob.title}</h3>
                  <p className="text-purple-200 text-xs mt-1">📍 {selectedJob.location} &nbsp;·&nbsp; {selectedJob.type}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-0.5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {success ? (
                /* ── Success State ── */
                <div className="flex flex-col items-center justify-center px-8 py-14 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Application Submitted!</h4>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      Thank you, <span className="font-semibold text-gray-700">{formData.name}</span>! Your application has been received. Our team will reach out to you soon.
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: '#5A2D82' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={handleCareerSubmit} className="p-6 space-y-4">

                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                      {formError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Apna poora naam likhein"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-semibold text-gray-800 placeholder:font-normal"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-semibold text-gray-800 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Mobile *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength="10"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit number"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-semibold text-gray-800 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  {/* District, Block, Experience */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">District *</label>
                      <input
                        type="text"
                        name="district"
                        required
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="e.g. Patna"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-semibold text-gray-800 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Block *</label>
                      <input
                        type="text"
                        name="block"
                        required
                        value={formData.block}
                        onChange={handleInputChange}
                        placeholder="Block naam"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-semibold text-gray-800 placeholder:font-normal"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Experience</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm font-bold text-gray-700"
                      >
                        <option value="Fresher">Fresher</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2+ Years">2+ Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Why do you want to join? (Optional)</label>
                    <textarea
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Aap is NGO ke sath kyun kaam karna chahte hain..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-[#5A2D82] text-sm text-gray-800 placeholder-gray-400 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#5A2D82' }}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
