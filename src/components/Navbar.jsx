import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 🚀 useLocation add kiya
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // 🚀 Current path track karne ke liye
  const [isOpen, setIsOpen] = useState(false);
  
  // Real-time local authentication check token
  const isLoggedIn = !!localStorage.getItem('token');
  // 🚀 BLOCKER GUARD: Agar user dashboard par hai, toh public navbar gayab ho jaye!
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Career', path: '/career' },
    // { name: 'Download', path: '/download' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleLogoutAction = () => {
    localStorage.removeItem('token');
    alert('Logged out! Token cleared.');
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Branding */}
          <Link to="/" className="flex items-center space-x-3 group py-2">
            <img src={logoImg} alt="Logo" className="h-14 w-14 object-contain" />
            <div className="flex flex-col justify-center select-none">
              <div className="text-xl sm:text-2xl font-black tracking-wide leading-tight flex space-x-1">
                <span style={{ color: '#5A2D82' }}>सबका</span>
                <span style={{ color: '#3A7D44' }}>वि<span style={{ color: '#5A2D82' }}>का</span>स</span>
                <span style={{ color: '#5A2D82' }}>ज्यति</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold leading-none mt-0.5 tracking-wider" style={{ color: '#3A7D44' }}>
                “गाँव गाँव खुशी, देश खुशहाल”
              </span>
            </div>
          </Link>

          {/* Desktop Panel Links */}
          <div className="hidden md:flex space-x-5 items-center">
            {links.map((link) => (
              <Link key={link.name} to={link.path} className="text-gray-600 hover:text-[#3A7D44] font-semibold text-sm transition duration-150">
                {link.name}
              </Link>
            ))}

            {/* Conditional Authentication View Matrix */}
           

            <Link to="/donation" className="text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition duration-150 transform hover:-translate-y-0.5" style={{ backgroundColor: '#3A7D44' }}>
              Donate Now
            </Link>
             {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-[#3A7D44] font-bold text-sm bg-gray-100 px-3.5 py-2 rounded-xl transition duration-150">
                  Dashboard
                </Link>
                <button onClick={handleLogoutAction} className="text-red-600 hover:text-red-700 font-bold text-sm cursor-pointer px-1 py-2">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-[#3A7D44] font-bold text-sm border-2 border-gray-100 hover:border-gray-200 px-4 py-2 rounded-xl transition duration-150">
                Login
              </Link>
            )}
          </div>

          {/* Hamburger Menu Toggle icon button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none p-2 rounded-lg hover:bg-gray-100" style={{ color: '#3A7D44' }}>
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-inner">
          {links.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block text-gray-700 hover:bg-gray-50 hover:text-[#3A7D44] font-semibold py-2.5 px-3 rounded-xl transition duration-150 text-sm">
              {link.name}
            </Link>
          ))}
          
          <div className="pt-2 border-t border-gray-100/60 space-y-2">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-center bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-sm">
                  Dashboard
                </Link>
                <button onClick={handleLogoutAction} className="w-full text-center bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-sm cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center bg-gray-50 text-gray-700 border border-gray-200 font-bold py-2.5 rounded-xl text-sm">
                Login
              </Link>
            )}
            <Link to="/donation" onClick={() => setIsOpen(false)} className="block text-center text-white font-bold py-3 rounded-xl text-sm shadow-md" style={{ backgroundColor: '#3A7D44' }}>
              Donate Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}