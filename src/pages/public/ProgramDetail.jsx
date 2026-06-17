import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROGRAMS } from './programsData';
import { ProgramCard } from './Programs';
import { enquiryAPI } from '../../api/services';
import logo from '../../assets/logo.png';

// ─── Apply Now Modal ──────────────────────────────────────────────────────────
function ApplyModal({ programName, onClose }) {
  const EMPTY = { fullName: '', mobile: '', address: '', pinCode: '', district: '' };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Close on Escape
  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())               errs.fullName = 'Full name is required.';
    if (!/^[6-9]\d{9}$/.test(form.mobile))  errs.mobile   = 'Enter a valid 10-digit mobile number.';
    if (!form.address.trim())                errs.address  = 'Address is required.';
    if (!/^\d{6}$/.test(form.pinCode))       errs.pinCode  = 'PIN Code must be 6 digits.';
    if (!form.district.trim())               errs.district = 'District is required.';
    return errs;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await enquiryAPI.submit({
        name:        form.fullName,
        phone:       form.mobile,
        email:       '',
        subject:     'Program Application',
        message:     `Application for program: ${programName}`,
        address:     form.address,
        pinCode:     form.pinCode,
        district:    form.district,
        programName: programName,
        enquiryType: 'PROGRAM_APPLICATION',
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleKeyDown}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-pop">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#5A2D82] to-[#3A7D44] px-6 py-5 text-white shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Program Application</p>
                <h2 id="apply-modal-title" className="text-xl font-black leading-tight">{programName}</h2>
                <p className="text-white/70 text-xs mt-1">Fill in your details and we'll reach out to you.</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {submitted ? (
              /* ── Success State ── */
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Application Submitted!</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Thank you, <span className="font-bold text-gray-700">{form.fullName}</span>. Your application for
                    &nbsp;<span className="font-bold text-[#5A2D82]">{programName}</span>&nbsp;
                    has been received. Our team will contact you on&nbsp;
                    <span className="font-bold text-gray-700">{form.mobile}</span>&nbsp;shortly.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#5A2D82] to-[#3A7D44] text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity duration-200"
                >
                  Done
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                      errors.fullName
                        ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
                        : 'border-gray-200 focus:ring-[#5A2D82]/20 focus:border-[#5A2D82]/50'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">+91</span>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                        errors.mobile
                          ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
                          : 'border-gray-200 focus:ring-[#5A2D82]/20 focus:border-[#5A2D82]/50'
                      }`}
                    />
                  </div>
                  {errors.mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House/Village, Block, Tehsil"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 resize-none leading-relaxed ${
                      errors.address
                        ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
                        : 'border-gray-200 focus:ring-[#5A2D82]/20 focus:border-[#5A2D82]/50'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
                </div>

                {/* PIN Code + District — side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={form.pinCode}
                      onChange={handleChange}
                      maxLength={6}
                      placeholder="6-digit PIN"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                        errors.pinCode
                          ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
                          : 'border-gray-200 focus:ring-[#5A2D82]/20 focus:border-[#5A2D82]/50'
                      }`}
                    />
                    {errors.pinCode && <p className="text-red-500 text-xs mt-1 font-medium">{errors.pinCode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      placeholder="e.g. Patna"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${
                        errors.district
                          ? 'border-red-300 focus:ring-red-500/20 bg-red-50'
                          : 'border-gray-200 focus:ring-[#5A2D82]/20 focus:border-[#5A2D82]/50'
                      }`}
                    />
                    {errors.district && <p className="text-red-500 text-xs mt-1 font-medium">{errors.district}</p>}
                  </div>
                </div>

                {/* Submit error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-4 py-3">
                    {errors.submit}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#5A2D82] to-[#3A7D44] text-white font-black py-3.5 rounded-xl text-sm hover:opacity-90 transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application →'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { transform: scale(0.93) translateY(12px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
        .animate-modal-pop { animation: modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
}

// ─── Program Detail Page ──────────────────────────────────────────────────────
export default function ProgramDetail() {
  const { id } = useParams();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const program = PROGRAMS.find((p) => p.id === id);

  // ── 404 fallback ──
  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <span className="text-6xl mb-4">🔍</span>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Program Not Found</h2>
        <p className="text-gray-500 mb-6">The program you're looking for doesn't exist or may have been moved.</p>
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 bg-[#3A7D44] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#2f6337] transition-colors duration-200"
        >
          ← View All Programs
        </Link>
      </div>
    );
  }

  // Other programs (exclude current)
  const otherPrograms = PROGRAMS.filter((p) => p.id !== id).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ── */}
      <div className="relative h-64 sm:h-80 md:h-[420px] overflow-hidden bg-gray-900">
        <img
          src={program.bannerImage || program.image}
          alt={program.name}
          className="w-full h-full "
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* ── Watermark Logo ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={logo}
            alt="SVJ Logo"
            className="w-24 sm:w-32 md:w-40 opacity-30 select-none"
          />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 sm:px-8 max-w-7xl mx-auto w-full left-0 right-0 ml-auto mr-auto">
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-3">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/programs" className="hover:text-white transition-colors">Programs</Link>
            <span>/</span>
            <span className="text-white/90">{program.name}</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{program.icon}</span>
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: program.badgeColor, color: program.badgeFg }}
            >
              {program.category}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            {program.name}
          </h1>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Main Detail Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Full Description */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[#3A7D44] inline-block" />
                About This Program
              </h2>
              <div className="prose prose-gray max-w-none">
                {program.fullDesc.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base">{para}</p>
                ))}
              </div>
            </section>

            {/* Objectives */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[#5A2D82] inline-block" />
                Objectives
              </h2>
              <ul className="space-y-3">
                {program.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5A2D82]/10 text-[#5A2D82] flex items-center justify-center text-xs font-black mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 text-sm sm:text-base leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Key Activities */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-yellow-400 inline-block" />
                Key Activities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {program.keyActivities.map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <span className="text-xl flex-shrink-0">✅</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{activity}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact & Benefits */}
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded bg-[#3A7D44] inline-block" />
                Impact & Benefits
              </h2>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 space-y-3">
                {program.impact.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[#3A7D44] text-lg flex-shrink-0">🌟</span>
                    <p className="text-gray-700 text-sm sm:text-base font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            {/* {program.gallery && program.gallery.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 rounded bg-pink-400 inline-block" />
                  Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {program.gallery.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden h-44 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <img
                        src={img}
                        alt={`${program.name} photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )} */}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            {/* Quick Actions Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-24">
              <h3 className="font-black text-gray-900 text-base mb-4">हमारे साथ जुड़ें</h3>
              <div className="space-y-3">

                {/* ── Apply Now ── */}
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#5A2D82] to-[#3A7D44] text-white font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity duration-200 shadow-md"
                >
                   Apply Now
                </button>

                <Link
                  to="/donation"
                  className="flex items-center justify-center gap-2 w-full bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black py-3 rounded-xl text-sm transition-colors duration-200 shadow-sm"
                >
                  Donate Now
                </Link>
                {/* <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 w-full border-2 border-[#5A2D82]/20 text-[#5A2D82] font-bold py-3 rounded-xl text-sm hover:bg-[#5A2D82]/5 transition-colors duration-200"
                >
                  🤝 Volunteer / Partner
                </Link> */}
                {/* <Link
                  to="/programs"
                  className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:border-gray-300 transition-colors duration-200"
                >
                  ← All Programs
                </Link> */}
              </div>

              {/* Contact Note */}
              {program.contactNote && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">{program.contactNote}</p>
                </div>
              )}
            </div>

            {/* Category Tag */}
            {/* <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Category</p>
              <span
                className="inline-block text-sm font-black px-4 py-2 rounded-full"
                style={{ backgroundColor: program.badgeColor, color: program.badgeFg }}
              >
                {program.icon} {program.category}
              </span>
            </div> */}
          </div>
        </div>

        {/* ── More Programs Section ──
        {otherPrograms.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">More Programs</h2>
              <Link
                to="/programs"
                className="text-sm font-bold text-[#3A7D44] hover:underline underline-offset-4"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPrograms.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </section>
        )} */}
      </div>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <ApplyModal
          programName={program.name}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
}
