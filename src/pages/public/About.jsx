import { Link } from 'react-router-dom';
import { useState } from 'react';
import logoImg from '../../assets/logo.png';
import cert1 from '../../assets/certificates/cert1.jpg';
import cert2 from '../../assets/certificates/cert2.jpg';
import cert3 from '../../assets/certificates/cert3.jpg';
import cert4 from '../../assets/certificates/cert4.jpg';
import aboutimg from '../../assets/imageabout.png';

const CERTIFICATES = [cert1, cert2, cert3];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '1250+', label: 'सक्रिय सदस्य',        icon: '👥' },
  { value: '29000+', label: 'पेड़ लगाए गए',        icon: '🌳' },
  { value: '50000+', label: 'पैड वितरित किए',      icon: '💜' },
  { value: '38+',    label: 'जिले охвачены',        icon: '📍' },
];

// ── Core Values ───────────────────────────────────────────────────────────────
const VALUES = [
  { icon: '🎯', title: 'पारदर्शिता',        desc: 'हर खर्च किया गया रुपया, हर लगाया गया पेड़, हर वितरित पैड — सदस्यों और दानकर्ताओं को खुले तौर पर रिपोर्ट किया जाता है।' },
  { icon: '🤝', title: 'समुदाय पहले',       desc: 'हम समुदायों के साथ काम करते हैं, न कि सिर्फ उनके लिए। हर कार्यक्रम जमीनी एसोसिएट्स और लाभार्थियों के साथ मिलकर बनाया जाता है।' },
  { icon: '⚡', title: 'प्रभाव आधारित',     desc: 'हम सफलता को इरादे से नहीं, बल्कि परिणामों से मापते हैं — सुधरी हुई जिंदगियाँ, स्कूल जाते बच्चे, उगते पेड़, सशक्त महिलाएँ।' },
  { icon: '🌱', title: 'स्थायित्व',         desc: 'हमारे मॉडल खुद को बनाए रखने के लिए बने हैं — सदस्य नेटवर्क, स्लैब प्राइसिंग और सामुदायिक स्वामित्व के माध्यम से।' },
  { icon: '💡', title: 'नवाचार',            desc: 'डिजिटल सदस्य प्रबंधन से लेकर स्वचालित डिलीवरी चक्र तक — हम ग्रामीण कल्याण में आधुनिक तकनीक लाते हैं।' },
  { icon: '❤️', title: 'करुणा',             desc: 'हम जो भी करते हैं उसके केंद्र में बिहार के लोगों के प्रति गहरी देखभाल है — उनकी गरिमा, स्वास्थ्य और भविष्य।' },
];

// ── Milestones ────────────────────────────────────────────────────────────────
const MILESTONES = [
  { year: '2019', title: 'स्थापना',               desc: 'SVJ NGO की नींव रखी गई — पटना, बिहार में एक छोटी लेकिन जोशीली टीम के साथ।' },
  { year: '2020', title: 'पहले 500 सदस्य',        desc: 'पहले 500 सदस्य जोड़े गए और पहली ब्लॉक-स्तरीय बैठक आयोजित की गई।' },
  { year: '2021', title: 'वृक्षारोपण अभियान',     desc: 'ट्री प्लांटेशन ड्राइव शुरू की — पहले वर्ष में 5,000 पेड़ लगाए गए।' },
  { year: '2022', title: 'राज्यव्यापी विस्तार',   desc: 'सैनिटरी पैड वितरण योजना बिहार के सभी 38 जिलों में फैलाई गई।' },
  { year: '2023', title: '29K पेड़ और 15K पैड',   desc: '29,000+ पेड़ लगाए गए और 15,000+ सैनिटरी पैड पूरे राज्य में वितरित किए गए।' },
  { year: '2024', title: 'डिजिटल प्लेटफॉर्म',    desc: 'पूरी तरह स्वचालित डिजिटल सदस्य प्रबंधन और डिलीवरी ट्रैकिंग सिस्टम लॉन्च किया गया।' },
];

export default function About() {
  const [selectedCert, setSelectedCert] = useState(null);
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
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-2">
              <img src={logoImg} alt="SVJ Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            हमारे बारे में
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
            सबका विकास ज्यति
          </h1>
          <p className="text-white/75 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            बिहार का एक जमीनी NGO, जो स्वास्थ्य, हरियाली, शिक्षा और आर्थिक गरिमा हर गाँव तक
            पहुँचाने के लिए अथक प्रयास कर रहा है — एक परिवार, एक कदम।
          </p>

          <div className="flex items-center justify-center gap-2 text-white/50 text-sm font-semibold">
            <Link to="/" className="hover:text-white transition-colors">होम</Link>
            <span>/</span>
            <span className="text-white/90">हमारे बारे में</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OUR STORY — TWO COLUMN
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT — Text Content */}
            <div className="space-y-6">
              <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                हमारी कहानी
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                एक सपने से<br />
                <span className="text-[#3A7D44]">शुरू हुई यात्रा</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                सबका विकास ज्यति (SVJ) की स्थापना 2019 में पटना, बिहार में एक दृढ़ विश्वास के
                साथ हुई — कि असली राष्ट्रीय विकास गाँवों से शुरू होता है, बोर्डरूम से नहीं।
              </p>
              <p className="text-gray-600 leading-relaxed">
                जो एक छोटे स्वयंसेवकों के समूह से शुरू हुआ, वह आज एक राज्यव्यापी आंदोलन बन
                चुका है जो बिहार के सभी 38 जिलों में जीवन को छू रहा है। सैनिटरी पैड वितरण से
                लेकर हजारों पेड़ लगाने तक, हमारी हर कार्रवाई गरिमा, स्थायित्व और सामुदायिक
                स्वामित्व में निहित है।
              </p>
              <p className="text-gray-600 leading-relaxed">
                आज SVJ सिर्फ एक NGO नहीं — यह बदलाव लाने वालों का एक नेटवर्क है: फील्ड
                एसोसिएट्स, जिला प्रशासक, महिला नेता, किसान और छात्र — सब एक मिशन के तहत —
                <span className="font-bold text-gray-900"> "गाँव गाँव खुशी, देश खुशहाल"</span>।
              </p>

              {/* Highlight Pills */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: '🌳', text: '29,000+ पेड़' },
                  { icon: '💜', text: '50,000+ पैड' },
                  { icon: '👥', text: '1250+ सदस्य' },
                  { icon: '📍', text: '38 जिले' },
                ].map((pill) => (
                  <span key={pill.text} className="inline-flex items-center gap-1.5 bg-slate-50 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full">
                    {pill.icon} {pill.text}
                  </span>
                ))}
              </div>

              <Link
                to="/programs"
                className="inline-flex items-center gap-2 bg-[#5A2D82] hover:bg-[#4a2370] text-white font-black px-7 py-3.5 rounded-xl text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 mt-2"
              >
                हमारे कार्यक्रम देखें →
              </Link>
            </div>

            {/* RIGHT — Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                <img
                  src={aboutimg}
                  alt="SVJ वृक्षारोपण अभियान"
                  className="w-full h-full object-cover"
                />
                {/* Overlay badge */}
                {/* <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg border border-white/60">
                    <p className="text-xs font-black uppercase tracking-widest text-[#5A2D82] mb-0.5">स्थापना</p>
                    <p className="text-gray-900 font-black text-lg leading-snug">2019 से बिहार के लिए</p>
                    <p className="text-gray-500 text-xs mt-0.5">पटना, बिहार — सर्वांगीण ग्रामीण विकास</p>
                  </div>
                </div> */}
              </div>

              {/* Floating accent card */}
              {/* <div className="absolute -top-5 -right-5 w-24 h-24 bg-gradient-to-br from-[#5A2D82] to-[#3A7D44] rounded-2xl shadow-xl flex items-center justify-center hidden sm:flex">
                <div className="text-center text-white">
                  <p className="text-2xl font-black leading-none">5+</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide opacity-80 leading-tight">वर्षों का<br/>प्रभाव</p>
                </div>
              </div> */}

              {/* Decorative dots */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 opacity-20 hidden sm:block"
                style={{ backgroundImage: 'radial-gradient(circle, #5A2D82 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          IMPACT STATS
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <span className="text-3xl block mb-2">{s.icon}</span>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          MISSION & VISION
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-5 py-2 rounded-full mb-4">
              लक्ष्य एवं दृष्टिकोण
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              हम क्यों और कहाँ जा रहे हैं
            </h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-xl mx-auto">
              SVJ के दो स्तंभ — जो हर कार्यक्रम और हर निर्णय को दिशा देते हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT — Mission */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-shadow duration-300">
              {/* Top color bar */}
              <div className="h-2 bg-gradient-to-r from-[#5A2D82] to-[#8b5cf6]" />

              {/* Large faded background letter */}
              <div className="absolute top-6 right-6 text-[120px] font-black text-[#5A2D82]/5 leading-none select-none pointer-events-none">
                M
              </div>

              <div className="p-10 relative z-10 space-y-5">
                <p className="text-[#5A2D82] text-xs font-black uppercase tracking-[0.2em]">
                  हमारा मिशन
                </p>

                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  हर घर तक पहुँचना,<br />
                  हर जरूरत पूरी करना
                </h3>

                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#5A2D82] to-[#8b5cf6]" />

                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  बिहार के हर ब्लॉक और परिवार तक स्वास्थ्य सुरक्षा और पर्यावरण पुनर्स्थापना
                  एक पारदर्शी, स्वचालित, समुदाय-संचालित मॉडल के माध्यम से पहुँचाना — ताकि
                  सेवाएँ सीधे लाभार्थियों तक पहुँचें, बिना किसी बिचौलिए के।
                </p>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  हम सैनिटरी पैड सब्सक्रिप्शन, वृक्षारोपण अभियान, डिजिटल साक्षरता और कौशल
                  विकास जैसे कार्यक्रमों के ज़रिये ज़मीनी स्तर पर बदलाव ला रहे हैं — एक
                  परिवार, एक कदम।
                </p>

                <ul className="space-y-2.5 pt-2">
                  {['पारदर्शी वितरण प्रणाली', 'सामुदायिक नेतृत्व मॉडल', 'तकनीक-आधारित ट्रैकिंग'].map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-[#5A2D82] flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RIGHT — Vision */}
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-xl transition-shadow duration-300">
              {/* Top color bar */}
              <div className="h-2 bg-gradient-to-r from-[#3A7D44] to-[#34d058]" />

              {/* Large faded background letter */}
              <div className="absolute top-6 right-6 text-[120px] font-black text-[#3A7D44]/5 leading-none select-none pointer-events-none">
                V
              </div>

              <div className="p-10 relative z-10 space-y-5">
                <p className="text-[#3A7D44] text-xs font-black uppercase tracking-[0.2em]">
                  हमारा विजन
                </p>

                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  एक सशक्त बिहार,<br />
                  एक हरा-भरा कल
                </h3>

                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#3A7D44] to-[#34d058]" />

                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  एक ऐसा सशक्त ग्रामीण बिहार जहाँ महिलाओं को स्वास्थ्य को लेकर कोई झिझक
                  न हो, किसान हरी संपत्ति से सम्मानजनक आय अर्जित करें, और हर समुदाय एक
                  ऐसे डिजिटल ढाँचे से लाभान्वित हो जो कल्याण को पारदर्शी और समावेशी बनाए।
                </p>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  हम एक ऐसे भविष्य की कल्पना करते हैं जहाँ गाँव का हर बच्चा शिक्षित हो, हर
                  महिला आत्मनिर्भर हो, और हर खेत के आसपास पेड़ों की छाँव हो — यही हमारा
                  सपना है, यही हमारी प्रेरणा।
                </p>

                <ul className="space-y-2.5 pt-2">
                  {['महिला स्वास्थ्य एवं सशक्तिकरण', 'हरित एवं स्थायी भविष्य', 'डिजिटल ग्रामीण विकास'].map((point) => (
                    <li key={point} className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-[#3A7D44] flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CORE VALUES
      ══════════════════════════════════════════════ */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100 text-[#3A7D44] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              हमारे मार्गदर्शक सिद्धांत
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">हमारे मूल मूल्य</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              ये छह सिद्धांत हमारे हर निर्णय और हर कार्यक्रम को आकार देते हैं।
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="group p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5A2D82]/10 to-[#3A7D44]/10 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ══════════════════════════════════════════════
          JOURNEY MILESTONES
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              हमारा सफर
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">सपने से जमीनी हकीकत तक</h2>
          </div>

          <div className="relative">
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#5A2D82] to-[#3A7D44]" />
            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div key={m.year} className={`relative flex items-start gap-6 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}>
                  <div className="absolute left-6 sm:left-1/2 w-4 h-4 rounded-full bg-white border-4 border-[#3A7D44] transform -translate-x-1/2 mt-1 z-10" />
                  <div className={`ml-16 sm:ml-0 sm:w-[calc(50%-2rem)] bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${i % 2 === 0 ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                    <span className="inline-block text-xs font-black text-white px-3 py-1 rounded-lg mb-2"
                      style={{ backgroundColor: i % 2 === 0 ? '#5A2D82' : '#3A7D44' }}>
                      {m.year}
                    </span>
                    <p className="font-black text-gray-900 text-sm mb-1">{m.title}</p>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CERTIFICATES
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              प्रमाण पत्र
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">हमारे प्रमाण पत्र</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              SVJ NGO की विश्वसनीयता और पारदर्शिता को प्रमाणित करने वाले आधिकारिक दस्तावेज़।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CERTIFICATES.map((cert, index) => (
              <div
                key={index}
                className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="relative overflow-hidden bg-slate-50">
                  <img
                    src={cert}
                    alt={`प्रमाण पत्र ${index + 1}`}
                    className="w-full object-contain max-h-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      🔍 बड़ा देखें
                    </span>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3A7D44] flex-shrink-0" />
                  <p className="text-sm font-bold text-gray-700">Certificate {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors duration-150 text-lg leading-none"
              aria-label="बंद करें"
            >
              ✕
            </button>
            <img
              src={selectedCert}
              alt="प्रमाण पत्र प्रीव्यू"
              className="w-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          JOIN US CTA
      ══════════════════════════════════════════════ */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute -top-16 left-1/4 w-64 h-64 bg-[#5A2D82]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 right-1/4 w-64 h-64 bg-[#3A7D44]/20 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5A2D82] to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            बदलाव का हिस्सा बनें
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            SVJ के साथ जुड़ें — एक सदस्य, स्वयंसेवक, दानकर्ता या फील्ड एसोसिएट के रूप में।
            हर भूमिका में आप किसी के जीवन को बेहतर बना सकते हैं।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/programs"
              className="inline-flex items-center justify-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black px-8 py-3.5 rounded-xl text-sm shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              हमारे कार्यक्रम →
            </Link>
            <Link
              to="/donation"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-white/20 transition-all duration-200"
            >
              💚 अभी दान करें
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
