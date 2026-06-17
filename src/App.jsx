import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Core Public Views — lazy loaded for code splitting
const Home        = lazy(() => import('./pages/public/Home'));
const Donation    = lazy(() => import('./pages/public/Donation'));
const Services    = lazy(() => import('./pages/public/Services'));
const Career      = lazy(() => import('./pages/public/Career'));
const Download    = lazy(() => import('./pages/public/Download'));
const Contact     = lazy(() => import('./pages/public/Contact'));
const About       = lazy(() => import('./pages/public/About'));
const Programs    = lazy(() => import('./pages/public/Programs'));
const ProgramDetail = lazy(() => import('./pages/public/ProgramDetail'));

// Auth Views — lazy loaded
const Login    = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

// Dashboard — lazy loaded
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));

// Full-page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#5A2D82] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-semibold">लोड हो रहा है…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Persistent Floating Header Layout */}
      <Navbar />
      <ScrollToTop />

      {/* Dynamic Route Rendering Grid */}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"             element={<Home />} />
            <Route path="/donation"     element={<Donation />} />
            <Route path="/services"     element={<Services />} />
            <Route path="/career"       element={<Career />} />
            <Route path="/download"     element={<Download />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/about"        element={<About />} />
            <Route path="/programs"     element={<Programs />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />

            {/* Dashboard route with role-based access control */}
            <Route path="/dashboard"    element={<DashboardLayout />} />

            {/* Auth routes */}
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}