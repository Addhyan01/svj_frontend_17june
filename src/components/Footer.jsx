import React from 'react';
// import { Link } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom'; // 🚀 useLocation add kiya

export default function Footer() {
  const location = useLocation(); // 🚀 Current path track karne ke liye
  const currentYear = new Date().getFullYear();
  
// 🚀 BLOCKER GUARD: Dashboard par footer ko render nahi karna hai
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }


  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Programs', path: '/programs' },
    { name: 'Careers', path: '/career' },
    { name: 'Our Vision', path: '/about' },
     { name: 'Our Mission', path: '/about' },
     { name: 'Our Certificates', path: '/about' },
    // { name: 'Download Center', path: '/download' },
    { name: 'Contact Us', path: '/contact' },
     
  ];

  return (
    <footer className="bg-gray-900 text-gray-400 pt-12 pb-6 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ─── MAIN 3-COLUMN RESPONSIVE GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-800">
          
          {/* Column 1: NGO Branding Message */}
          <div className="space-y-3">
            <div className="flex flex-col select-none">
              <div className="text-xl font-black tracking-wide leading-tight flex space-x-1">
                <span className="text-purple-400">सबका</span>
                <span className="text-emerald-400">वि<span className="text-purple-400">का</span>स</span>
                <span className="text-purple-400">ज्यति</span>
              </div>
              <span className="text-xs font-bold leading-none mt-1 text-emerald-400 tracking-wider">
                “गाँव गाँव खुशी, देश खुशहाल”
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm pt-1">
सबका विकास ज्योति (SVJ NGO) एक सामाजिक संगठन है, जो समाज के वंचित एवं जरूरतमंद वर्गों के जीवन स्तर को बेहतर बनाने के लिए कार्यरत है। हमारा उद्देश्य शिक्षा, स्वास्थ्य, महिला सशक्तिकरण, कौशल विकास, पर्यावरण संरक्षण और आत्मनिर्भरता के माध्यम से समाज में सकारात्मक एवं स्थायी परिवर्तन लाना है।</p>          </div>

          {/* Column 2: Interactive Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
              Quick Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {footerLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="hover:text-emerald-400 transition duration-150 font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Contact & Support Coordinates */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
              Connect With Us
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              {/* Address */}
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs uppercase tracking-wide mb-0.5">Registered Head Office</p>
                  <span className="text-gray-400 leading-relaxed">Sabka Vikas Jayti, GPS Parishar 1st Floor, New Kaloni, Azadnagar, Ward No - 35, Mohanpur, Samastipur, Bihar - 848101</span>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-purple-500/40 bg-purple-500/10 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs uppercase tracking-wide mb-0.5">Email Support</p>
                  <a href="mailto:info@sabkavikasjyoti.org" className="hover:text-emerald-400 transition text-gray-400">
                    info@sabkavikasjayti.org
                  </a>
                </div>
              </li>

              {/* WhatsApp */}
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-green-500/40 bg-green-500/10 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs uppercase tracking-wide mb-0.5"> WhatsApp</p>
                  <a
                    href="https://wa.me/917209985021"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition text-gray-400"
                  >
                    +91 7209985021
                  </a>
                </div>
              </li>

              {/* Toll Free */}
              <li className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs uppercase tracking-wide mb-0.5">📞 Toll Free</p>
                  <a href="tel:01169290807" className="hover:text-emerald-400 transition text-gray-400">011-69290807</a>
                </div>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-4 pt-2">
              {/* YouTube */}
              <a
                href="https://www.youtube.com/channel/UCjh8BjR-8mlP1dnR51KANyw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/sabkavikasjayti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/sabkavikasjayti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-pink-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* ─── BOTTOM COPYRIGHT COMPONENT ─── */}
        <div className="pt-6 text-center text-xs space-y-1">
          <p className="font-semibold text-gray-500">
            © {currentYear} Sabka Vikas Jayti NGO. All Rights Reserved.
          </p>
          <p className="text-gray-600 font-medium">
            Designed & Developed by{' '}
            <a
              href="https://www.tecsonet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
            >
              Tecsonet Solutions
            </a>.
          </p>
        </div>

      </div>
    </footer>
  );
}