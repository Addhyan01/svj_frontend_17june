import { Link } from 'react-router-dom';
import { PROGRAMS } from './programsData';
import logo from '../../assets/logo.png';

export default function Programs() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header Banner ── */}
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
              <img src={logo} alt="SVJ Logo" className="w-full h-full object-contain" />
            </div>
          </div> */}

          {/* <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            हमारे कार्यक्रम
          </span> */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
            हमारे कार्यक्रम
          </h1>
          <p className="text-white/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            अपने विविध कार्यक्रमों के माध्यम से, हम बिहार भर के समुदायों की सबसे महत्वपूर्ण
            आवश्यकताओं को पूरा करते हैं, जिससे स्थायी प्रभाव और सकारात्मक परिवर्तन उत्पन्न होता है।
          </p>

          <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition-colors">होम</Link>
            <span>/</span>
            <span className="text-white/90">हमारे कार्यक्रम</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── All Program Cards Grid ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Back to Home CTA ── */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-4">Want to support our programs?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/donation"
              className="inline-flex items-center justify-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black px-7 py-3 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              💚 Donate Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-[#3A7D44] text-gray-700 hover:text-[#3A7D44] font-bold px-7 py-3 rounded-xl transition-all duration-200"
            >
              Get Involved →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Reusable Program Card ─────────────────────────────────────────────────
export function ProgramCard({ program }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={program.image}
          alt={program.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={logo}
            alt=""
            className="w-16 h-16 object-contain opacity-30 select-none"
          />
        </div>

        {/* Category badge */}
        {/* <span
          className="absolute top-4 left-4 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ backgroundColor: program.badgeColor, color: program.badgeFg }}
        >
          {program.category}
        </span> */}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">{program.icon}</span>
          <h3 className="text-lg font-black text-gray-900 leading-tight">{program.name}</h3>
        </div>

        {/* Short Description */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {program.shortDesc}
        </p>

        {/* Learn More */}
        <div className="pt-2">
          <Link
            to={`/programs/${program.id}`}
            className="inline-flex items-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );
}
