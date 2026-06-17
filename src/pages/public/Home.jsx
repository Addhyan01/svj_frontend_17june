import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import logoImg from '../../assets/logo.png';
import { PROGRAMS } from './programsData';

// ── Mission Pillar images (thumbnails)
import pillarEducation from '../../assets/programs/a1.png';
import pillarHealth from '../../assets/programs/a2.png';
import pillarWomen from '../../assets/programs/a3.png';
import pillarEnvironment from '../../assets/programs/a4.png';

// ── Hero slideshow images — add/replace files in src/assets/
// Name them hero-1.jpg, hero-2.jpg ... hero-5.jpg
import hero1 from '../../assets/hero-1.jpeg';
import hero2 from '../../assets/hero-2.jpeg';
import hero3 from '../../assets/hero-3.jpeg';
import hero4 from '../../assets/hero-4.jpeg';
import hero5 from '../../assets/hero-5.jpeg';

const HERO_IMAGES = [hero1, hero2, hero3, hero4, hero5];

// ── Testimonial person images — place files in src/assets/testimonials/
// Name them t1.jpg, t2.jpg ... t8.jpg
import t1 from '../../assets/testimonials/t1.png';
import t2 from '../../assets/testimonials/t2.png';
import t3 from '../../assets/testimonials/t3.png';
import t4 from '../../assets/testimonials/t4.png';
import t5 from '../../assets/testimonials/t5.png';
import t6 from '../../assets/testimonials/t6.png';
import t7 from '../../assets/testimonials/t7.png';
import t8 from '../../assets/testimonials/t8.png';

// ── Animated Counter Hook ──────────────────────────────────────────────────
function useCountUp(target, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const numeric = parseInt(target.replace(/[^0-9]/g, ''), 10);
    const step = Math.ceil(numeric / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);
  const raw = parseInt(target.replace(/[^0-9]/g, ''), 10);
  const suffix = target.replace(/[0-9,]/g, '');
  return count >= raw ? target : count.toLocaleString('en-IN') + suffix;
}

// ── Individual Stat Card ───────────────────────────────────────────────────
function StatCard({ value, label, icon, started }) {
  const displayed = useCountUp(value, 2200, started);
  return (
    <div className="relative bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <span className="text-3xl mb-2 block">{icon}</span>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{displayed}</p>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Star Rating Component ──────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ── Testimonial Carousel Component ────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Pappu Ray',
    role: 'District Admin',
    quote: 'यह संस्था जरूरतमंद लोगों तक सहायता पहुंचाने का शानदार कार्य कर रही है। टीम की मेहनत और समर्पण वास्तव में प्रेरणादायक है',
    rating: 5,
    avatar: t1,
    initials: 'SD',
    bg: 'bg-purple-100',
  },
  {
    id: 2,
    name: 'Chhotu Kumar',
    role: 'Associate — Samastipur District',
    quote: 'संस्था के साथ काम करने का अनुभव बहुत अच्छा रहा। यहां हर सदस्य को अपनी बात रखने और योगदान देने का अवसर मिलता है।',
    rating: 4,
    avatar: t2,
    initials: 'RK',
    bg: 'bg-emerald-100',
  },
  {
    id: 3,
    name: 'Anjani Bharti',
    role: 'Block Leader — Samastipur',
    quote: 'SVJ ne humari community mein jo badlav laya hai woh shabd mein nahi keh sakti. Proud member hoon. Har mahine nayi ummeed milti hai.',
    rating: 5,
    avatar: t3,
    initials: 'PS',
    bg: 'bg-pink-100',
  },
  {
    id: 4,
    name: 'Usha Devi',
    role: 'Member — Begusarai District',
    quote: 'Mujhe pehle lagta tha ki NGO sab dhoka hota hai. Lekin SVJ ne mera bharosa jeet liya. Unka kaam sacche mein ground level par hota hai.',
    rating: 5,
    avatar: t4,
    initials: 'ML',
    bg: 'bg-blue-100',
  },
  {
    id: 5,
    name: 'Kavita Kumari',
    role: 'Women Member — Begusarai',
    quote: 'Mahilaon ke liye jo kaam SVJ kar rahi hai woh koi aur nahi karta. Hamare gaon mein ab khulke baat ho sakti hai swasthya ke baare mein.',
    rating: 5,
    avatar: t5,
    initials: 'KK',
    bg: 'bg-orange-100',
  },
  {
    id: 6,
    name: 'Ajay Paswan',
    role: 'Associate Member — Begusarai',
    quote: 'Digital platform aane ke baad sab kuch easy ho gaya. Membership, orders, delivery — sab ek jagah track ho jaata hai. Bahut accha system hai.',
    rating: 4,
    avatar: t6,
    initials: 'AP',
    bg: 'bg-teal-100',
  },
  {
    id: 7,
    name: 'Ravi Singh',
    role: 'Premium Member — Samastipur',
    quote: 'Mere bachche ab padh rahe hain aur main apne parivar ki sehat ka dhyan rakh sakti hoon. SVJ ki wajah se yeh sab possible hua hai.',
    rating: 5,
    avatar: t8,
    initials: 'RD',
    bg: 'bg-violet-100',
  },
  {
    id: 8,
    name: 'Ritik',
    role: 'District Associate Samastipur',
    quote: 'Main SVJ ke saath 3 saal se hoon. Inhone sikhaya ki kaise apne block mein kaam karna hai. Mera confidence aur income dono badhey hain.',
    rating: 5,
    avatar: t7,
    initials: 'SM',
    bg: 'bg-yellow-100',
  },
];

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const trackRef = useRef(null);

  // Responsive: how many cards visible
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = TESTIMONIALS.length - visibleCount;

  // Clamp current when visibleCount changes
  useEffect(() => {
    setCurrent(prev => Math.min(prev, Math.max(0, TESTIMONIALS.length - visibleCount)));
  }, [visibleCount]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev >= TESTIMONIALS.length - visibleCount ? 0 : prev + 1));
    }, 3500);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [visibleCount]);

  const goTo = (idx) => { setCurrent(idx); startTimer(); };
  const handleArrow = (dir) => {
    setCurrent(prev => {
      const next = prev + dir;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
    startTimer();
  };

  // Card width percentage inside the track
  const cardWidthPct = 100 / visibleCount;
  // Gap in px — keep in sync with the gap below (gap-6 = 24px)
  const gap = 24;
  // translateX: move by (cardWidth% + gap) * current index
  // Using calc to account for gap
  const translateX = `calc(-${current * cardWidthPct}% - ${current * gap / visibleCount}px)`;

  return (
    <section className="py-20 bg-gradient-to-br from-[#5A2D82]/5 to-[#3A7D44]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          {/* <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            Voices
          </span> */}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">हमारे सदस्य क्या कहते हैं </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">हमारे साथ जुड़े लोगों के अनुभव, विश्वास और प्रेरणादायक सफर की कहानी।</p>
        </div>

        {/* Carousel wrapper — overflow hidden clips the track */}
        <div className="relative">

          {/* Left arrow */}
          <button
            onClick={() => handleArrow(-1)}
            className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 shadow-md hover:shadow-lg text-gray-700 hover:text-[#3A7D44] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Clipping container */}
          <div className="overflow-hidden">
            {/* Sliding track — all 8 cards in one row */}
            <div
              ref={trackRef}
              className="flex gap-6"
              style={{
                transform: `translateX(${translateX})`,
                transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-xl transition-shadow duration-300"
                  style={{ minWidth: `calc(${cardWidthPct}% - ${gap * (visibleCount - 1) / visibleCount}px)` }}
                >
                  {/* Star rating */}
                  <StarRating rating={t.rating} />

                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">
                    "{t.quote}"
                  </p>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${t.bg} flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-sm`}>
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.querySelector('.initials-fallback').style.display = 'flex';
                        }}
                      />
                      <span className="initials-fallback text-sm font-black text-gray-600 w-full h-full items-center justify-center hidden">
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm leading-tight">{t.name}</p>
                      <p className="text-xs text-gray-400 font-semibold leading-tight mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => handleArrow(1)}
            className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 shadow-md hover:shadow-lg text-gray-700 hover:text-[#3A7D44] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-7 h-2.5 bg-[#3A7D44]' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
// ── FAQ Data & Section ────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'SVJ NGO क्या है और इसका उद्देश्य क्या है?',
    a: 'सबका विकास ज्यति (SVJ) एक बिहार-आधारित NGO है जो 2019 में स्थापित हुई। इसका उद्देश्य शिक्षा, महिला स्वास्थ्य, पर्यावरण संरक्षण और ग्रामीण समाज के समग्र विकास के लिए काम करना है।',
  },
  {
    q: 'SVJ के कार्यक्रमों में कैसे जुड़ें?',
    a: 'आप हमारे किसी भी कार्यक्रम के पेज पर जाकर "Apply Now" बटन पर क्लिक करके आवेदन कर सकते हैं। हमारी टीम आपसे जल्द संपर्क करेगी।',
  },
  {
    q: 'Sanitary Pad Distribution योजना की सदस्यता कैसे लें?',
    a: 'आज ही इस योजना से जुड़ें और इसके लाभ प्राप्त करें। अधिक जानकारी के लिए अपने नजदीकी ब्लॉक एसोसिएट से संपर्क करें या हमारे Programs पेज पर Apply Now करें।',
  },
  {
    q: 'Tree Plantation Drive में कैसे भाग लें?',
    a: 'इस योजना का लाभ उठाने के लिए अपने नजदीकी ब्लॉक एसोसिएट से संपर्क करें या हमारे Programs पेज पर Apply Now करें।',
  },
  {
    q: 'SVJ को दान (Donation) कैसे करें?',
    a: 'आप हमारी वेबसाइट पर "Donate Now" बटन के माध्यम से ऑनलाइन दान कर सकते हैं। हम Razorpay के जरिए सुरक्षित भुगतान स्वीकार करते हैं।',
  },
  {
    q: 'क्या SVJ एक सरकारी मान्यता प्राप्त संस्था है?',
    a: 'हाँ, SVJ NGO विधिवत पंजीकृत है और बिहार सरकार के दिशा-निर्देशों के अनुसार कार्य करती है। हम पारदर्शिता और जवाबदेही के प्रति पूर्णतः प्रतिबद्ध हैं।',
  },
  {
    q: 'Field Associate कैसे बनें?',
    a: 'हमारे Career पेज पर जाएं और उपलब्ध पदों के लिए आवेदन करें। फील्ड एसोसिएट के रूप में आप अपने ब्लॉक में योजनाओं को जमीनी स्तर पर लागू करने में मदद करते हैं।',
  },
  {
    q: 'SVJ से संपर्क कैसे करें?',
    a: 'आप हमारे Contact Us पेज के जरिए, या enquiry form भरकर हमसे संपर्क कर सकते हैं। हमारी टीम 24–48 घंटों के भीतर जवाब देती है।',
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-[#3A7D44]/40 shadow-sm' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors duration-150"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#3A7D44]/10 text-[#3A7D44] flex items-center justify-center text-xs font-black">
            {index + 1}
          </span>
          <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{faq.q}</span>
        </span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-[#3A7D44] text-white rotate-45' : 'bg-gray-100 text-gray-500'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-white">
          <div className="ml-10 pt-1 border-t border-gray-100">
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed pt-3">{faq.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  const half = Math.ceil(FAQS.length / 2);
  const left  = FAQS.slice(0, half);
  const right = FAQS.slice(half);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-emerald-100 text-[#3A7D44] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Frequently Asked Questions</h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">
            आपके मन में कोई सवाल है? यहाँ सबसे ज़्यादा पूछे जाने वाले सवालों के जवाब मिलेंगे।
          </p>
        </div>

        {/* Two-column accordion grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            {left.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
          <div className="space-y-4">
            {right.map((faq, i) => (
              <FAQItem key={i + half} faq={faq} index={i + half} />
            ))}
          </div>
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <p className="text-lg font-black text-gray-900 mb-2">अभी भी कोई सवाल है?</p>
          <p className="text-gray-500 text-sm mb-5">हमारी टीम आपकी मदद के लिए हमेशा तैयार है।</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black px-7 py-3 rounded-xl text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            Contact Us →
          </Link>
        </div>

      </div>
    </section>
  );
}

export default function Home() {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);

  // ── Hero slideshow state ──
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance every 5 seconds — instant switch, no crossfade
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Manual dot / arrow click
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Intersection observer for counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '1250+', label: 'Active Premium Members', icon: '👥' },
    { value: '29000+', label: 'Trees Planted in Bihar', icon: '🌳' },
    { value: '15000+', label: 'Sanitary Pads Distributed', icon: '💜' },
    { value: '38+', label: 'Districts Covered', icon: '📍' },
  ];

  const pillars = [
    { img: pillarEducation, title: 'शिक्षा', color: 'bg-purple-100', text: 'हम गुणवत्तापूर्ण शिक्षा को हर बच्चे और युवा तक पहुँचाने के लिए कार्य करते हैं। शिक्षा जागरूकता अभियान, अध्ययन सामग्री वितरण और कौशल विकास कार्यक्रमों के माध्यम से हम बेहतर भविष्य की नींव रखते हैं।' },
    { img: pillarHealth, title: 'स्वास्थ्य', color: 'bg-emerald-100', text: 'स्वस्थ समाज के निर्माण हेतु हम स्वास्थ्य जागरूकता, निःशुल्क स्वास्थ्य शिविरों और जरूरतमंद लोगों को चिकित्सा सहायता प्रदान करने के लिए निरंतर प्रयासरत हैं।' },
    { img: pillarWomen, title: 'महिला एवं बाल सशक्तिकरण', color: 'bg-yellow-100', text: 'हम महिलाओं और बच्चों को सुरक्षित, शिक्षित और आत्मनिर्भर बनाने के लिए विभिन्न कार्यक्रम संचालित करते हैं, जिससे वे अपने अधिकारों और अवसरों का पूर्ण लाभ उठा सकें।' },
    { img: pillarEnvironment, title: 'सामुदायिक एवं पर्यावरण विकास', color: 'bg-blue-100', text: 'हम स्वच्छता, वृक्षारोपण, पर्यावरण संरक्षण और सामुदायिक विकास गतिविधियों के माध्यम से एक टिकाऊ और समृद्ध समाज के निर्माण की दिशा में कार्य करते हैं।' },
  ];

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════
          HERO — Auto-changing background slideshow
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">

        {/* ── Background image — instant switch ── */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGES[currentSlide]})` }}
        />

        {/* ── Dark brand gradient overlay — keeps text readable ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5A2D82]/80 via-[#1a3d22]/75 to-[#3A7D44]/80" />

        {/* ── Subtle dot pattern ── */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* ── Floating decorative blobs ── */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

        {/* ── Hero content ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-24">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2">
            <img src={logoImg} alt="SVJ Logo" className="h-6 w-6 object-contain rounded-full" />
            <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Sabka Vikas Jyoti — NGO</span>
          </div> */}

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            गाँव गाँव खुशी,<br />
            <span className="bg-gradient-to-r from-yellow-300 to-emerald-300 bg-clip-text text-transparent">
              देश खुशहाल
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="max-w-2xl mx-auto text-white/80 text-base sm:text-xl leading-relaxed font-medium">
            हम शिक्षा, स्वास्थ्य, महिला सशक्तिकरण और जरूरतमंद लोगों की सहायता के लिए निरंतर कार्य कर रहे हैं।
            आपका छोटा सा सहयोग किसी के जीवन में बड़ा बदलाव ला सकता है।
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/donation"
              className="group inline-flex items-center justify-center gap-2 bg-white text-[#3A7D44] font-black px-8 py-4 rounded-2xl shadow-2xl hover:bg-yellow-300 hover:text-gray-900 transition-all duration-200 text-base sm:text-lg transform hover:-translate-y-1">
              💚 Donate Now
            </Link>
            <Link to="/programs"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200 text-base sm:text-lg transform hover:-translate-y-1">
              Our Services →
            </Link>
          </div>
        </div>

        {/* ── Slide indicator dots ── */}
        <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* ── Slide counter (top-right) ── */}
        <div className="absolute top-6 right-6 z-10 bg-black/25 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {currentSlide + 1} / {HERO_IMAGES.length}
        </div>

        {/* ── Prev / Next arrow buttons ── */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + HERO_IMAGES.length) % HERO_IMAGES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/25 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % HERO_IMAGES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/25 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          IMPACT STATS — Animated counters
      ══════════════════════════════════════════════ */}
      {/* <section ref={statsRef} className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-emerald-100 text-[#3A7D44] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Our Impact</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Numbers that speak the truth</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} icon={s.icon} started={statsStarted} />
            ))}
          </div>
        </div>
      </section> */}

      {/* ══════════════════════════════════════════════
          MISSION PILLARS
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">हमारे कार्य के चार स्तंभ</h2>
            <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">हर एक काम के पीछे एक बड़ा लक्ष्य है — बिहार के ग्रामीण समाज का सम्पूर्ण विकास।</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p) => (
              <div key={p.title}
                className="group rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden cursor-default">
                {/* Thumbnail image */}
                <div className="w-full h-44 overflow-hidden">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full  group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Text content */}
                <div className="p-5 space-y-2 text-center">
                  <h3 className="font-black text-gray-900 text-base">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ABOUT US
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text content */}
            <div className="space-y-6">
              <span className="inline-block bg-emerald-100 text-[#3A7D44] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                About Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                हम कौन हैं और<br />
                <span className="text-[#3A7D44]">क्या करते हैं?</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                <strong>सबका विकास ज्यति (SVJ)</strong> बिहार का एक पंजीकृत गैर-सरकारी संगठन है, जिसकी स्थापना 2019 में हुई। हम ग्रामीण बिहार के जरूरतमंद लोगों तक शिक्षा, स्वास्थ्य, स्वच्छता और आजीविका के अवसर पहुँचाने के लिए प्रतिबद्ध हैं।
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                हमारी टीम राज्य के 38+ जिलों में ब्लॉक-स्तरीय एसोसिएट्स के नेटवर्क के माध्यम से कार्य करती है। हर कार्यक्रम जमीनी हकीकत को समझकर बनाया जाता है — ताकि सहायता सही व्यक्ति तक सही समय पर पहुँचे।
              </p>

              {/* Key highlights */}
              <ul className="space-y-3">
                {[
                  { icon: '📅', text: '2019 में स्थापित, बिहार सरकार द्वारा पंजीकृत' },
                  { icon: '🗺️', text: '38+ जिलों में सक्रिय नेटवर्क' },
                  { icon: '👩‍👧', text: 'महिला स्वास्थ्य, शिक्षा और पर्यावरण पर विशेष ध्यान' },
                  { icon: '🤝', text: 'पारदर्शिता और जवाबदेही के प्रति पूर्ण प्रतिबद्धता' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                    <span className="text-gray-700 text-sm sm:text-base">{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black px-7 py-3 rounded-xl text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  और जानें →
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 hover:border-[#3A7D44] hover:text-[#3A7D44] font-bold px-7 py-3 rounded-xl text-sm transition-all duration-200"
                >
                  संपर्क करें
                </Link>
              </div>
            </div>

            {/* Right — image */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src={hero1}
                alt="SVJ Team at work"
                className="w-full h-full object-cover"
                style={{ minHeight: '420px' }}
              />
              {/* subtle overlay so it blends with the section bg */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          OUR PROGRAMS
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            {/* <span className="inline-block bg-purple-100 text-[#5A2D82] text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              What We Do
            </span> */}
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">हमारे कार्यक्रम</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            हमारे विविध कार्यक्रम शिक्षा, स्वास्थ्य, स्वच्छता, पर्यावरण संरक्षण और सामुदायिक विकास जैसे क्षेत्रों में कार्य करते हैं, जिससे समाज में सकारात्मक बदलाव और स्थायी विकास को बढ़ावा मिलता है।
            </p>
          </div>

          {/* 6 Program Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.slice(0, 6).map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={program.image}
                    alt={program.name}
                    className="w-full h-full  group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Centered logo watermark */}
                  <img
                    src={logoImg}
                    alt="SVJ Logo"
                    className="absolute inset-0 m-auto w-16 h-16 object-contain pointer-events-none"
                    style={{ opacity: 0.30 }}
                  />
                  {/* <span
                    className="absolute top-4 left-4 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ backgroundColor: program.badgeColor, color: program.badgeFg }}
                  >
                    {program.category}
                  </span> */}
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <div className="flex items-center gap-3">
                    {/* <span className="text-2xl">{program.icon}</span> */}
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{program.name}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                    {program.shortDesc}
                  </p>
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
            ))}
          </div>

          {/* More Programs Button */}
          <div className="text-center mt-12">
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 bg-[#3A7D44] hover:bg-[#2f6337] text-white font-black px-9 py-4 rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-base"
            >
              More Programs →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS — Auto carousel
      ══════════════════════════════════════════════ */}
      <TestimonialCarousel />

      {/* ══════════════════════════════════════════════
          FAQ — Frequently Asked Questions
      ══════════════════════════════════════════════ */}
      <FAQSection />

      {/* ══════════════════════════════════════════════
          CTA BANNER — Compact, dark, Hindi
      ══════════════════════════════════════════════ */}
      <section className="relative py-14 overflow-hidden">
        {/* Dark background */}
        <div className="absolute inset-0 bg-gray-950" />
        {/* Subtle purple-green glow */}
        <div className="absolute -top-16 left-1/4 w-64 h-64 bg-[#5A2D82]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 right-1/4 w-64 h-64 bg-[#3A7D44]/20 rounded-full blur-3xl" />
        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#5A2D82] to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            बदलाव की शुरुआत आपसे होती है ।
            {/* <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
             
            </span> */}
          </h2>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            बिहार के गाँव-गाँव तक खुशहाली पहुँचाने में हमारा साथ दें।
            आपका एक छोटा कदम — किसी की पूरी ज़िंदगी बदल सकता है।
          </p>

          <Link
            to="/donation"
            className="inline-flex items-center justify-center gap-2 text-white font-black px-10 py-3.5 rounded-xl text-base shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:opacity-90"
            style={{ backgroundColor: '#3A7D44', boxShadow: '0 4px 24px 0 rgba(58,125,68,0.25)' }}
          >
            अभी दान करें
          </Link>
        </div>
      </section>

    </div>
  );
}
