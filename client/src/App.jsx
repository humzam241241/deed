import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages - eagerly loaded (small, no heavy deps)
import Home from './pages/Home';
import Products from './pages/Products';
import OurTeam from './pages/OurTeam';
import OurProcess from './pages/OurProcess';
import OntarioTechClubs from './pages/OntarioTechClubs';
import StudentClubs from './pages/StudentClubs';
import CorporateTeams from './pages/CorporateTeams';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Lazy-loaded pages (heavy deps or standalone — no Navbar/Footer needed)
const DesignStudio   = lazy(() => import('./pages/DesignStudio'));
const AdminLogin     = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Admin routes render WITHOUT the site Navbar/Footer
function AdminRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/"      element={<AdminDashboard />} />
        <Route path="*"      element={<AdminLogin />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Admin sub-tree (no Navbar/Footer) ── */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* ── Public site ── */}
      <Route path="*" element={
        <>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/our-team" element={<OurTeam />} />
              <Route path="/our-process" element={<OurProcess />} />
              <Route path="/design-studio" element={
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Design Studio…</div>}>
                  <DesignStudio />
                </Suspense>
              } />
              <Route path="/student-clubs" element={<StudentClubs />} />
              <Route path="/corporate-teams" element={<CorporateTeams />} />
              <Route path="/ontario-tech-clubs" element={<OntarioTechClubs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
  );
}