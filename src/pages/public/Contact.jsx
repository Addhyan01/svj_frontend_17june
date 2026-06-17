import { useState } from 'react';
import { Link } from 'react-router-dom';
import { enquiryAPI } from '../../api/services';
import logoImg from '../../assets/logo.png';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Enquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await enquiryAPI.submit(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Enquiry', message: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
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
          {/* <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-2">
              <img src={logoImg} alt="SVJ Logo" className="w-full h-full object-contain" />
            </div>
          </div> */}

          {/* <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            संपर्क करें
          </span> */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
            हमसे जुड़ें
          </h1>
          <p className="text-white/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            किसी भी जानकारी, सुझाव या शिकायत के लिए हमसे सीधे संपर्क करें — हम आपकी हर बात
            सुनने के लिए यहाँ हैं।
          </p>

          <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition-colors">होम</Link>
            <span>/</span>
            <span className="text-white/90">संपर्क</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Column: NGO Office Info (40% space on desktop) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Get in Touch</h2>
          <p className="text-gray-500 font-medium text-sm sm:text-base">
            सबका विकास ज्यति एनजीओ से संबंधित किसी भी जानकारी, सुझाव या शिकायत के लिए आप हमसे सीधे संपर्क कर सकते हैं।
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-[#3A7D44] rounded-xl border border-emerald-100 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0x" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">Registered Head Office</h4>
              <p className="text-sm text-gray-600 font-medium mt-0.5">Sabka Vikas jayti, 
 GPS Parishar 1st Floor,<br />  New Kaloni, Azadnagar, Ward No - 35, <br /> Mohanpur, Samastipur, Bihar - 848101</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-[#5A2D82] rounded-xl border border-purple-100 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">Email Support</h4>
              <p className="text-sm text-gray-600 font-medium mt-0.5">info@sabkavikasjayti.org</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">Phone</h4>
              <a href="tel:7209985021" className="text-sm text-gray-600 font-medium mt-0.5 hover:text-blue-600 transition-colors block">
                +91 7209985021
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-xl border border-orange-100 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">Toll Free</h4>
              <a href="tel:01169290807" className="text-sm text-gray-600 font-medium mt-0.5 hover:text-orange-500 transition-colors block">
                011-69290807
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Contact Interactive Form (70% space on desktop) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">

        {/* Success message */}
        {success && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-emerald-800">Message sent successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">Hamari team jald hi aapse sampark karegi.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-auto text-emerald-400 hover:text-emerald-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Your Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Apna naam darj karein"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                required
                maxLength="10"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit mobile no"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Subject (विषय)</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold text-gray-700"
            >
              <option value="General Enquiry">General Enquiry (सामान्य पूछताछ)</option>
              <option value="Scheme Related">Scheme Related (योजना सम्बंधित)</option>
              <option value="Technical Support">Technical Support (तकनीकी सहायता)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Your Message</label>
            <textarea
              name="message"
              required
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Apna sandesh ya pooch-taach yahan detail me likhein..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-800 placeholder-gray-400"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition duration-150 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex justify-center items-center text-sm"
            style={{ backgroundColor: '#3A7D44' }}
          >
            {loading ? 'Sending Message Vector...' : 'Send Message'}
          </button>

        </form>
      </div>

    {/* Google Business Map */}
      <div className="lg:col-span-12 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <div className="px-2 pb-2 pt-6 bg-white">
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="p-3 bg-emerald-50 text-[#3A7D44] rounded-xl border border-emerald-100 shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">Our Location</h4>
              <p className="text-sm text-gray-500 font-medium">Sabka Vikas Jayti — Patna, Bihar, India</p>
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.828006644151!2d85.74109949999999!3d25.8092477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed9bce0d19adcf%3A0x6f594321d1ab6b13!2sSabka%20Vikas%20jayti!5e0!3m2!1sen!2sin!4v1781618166356!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl"
            title="Sabka Vikas Jayti Location"
          ></iframe>
        </div>
      </div>

    </div>
    </div>
  );
}