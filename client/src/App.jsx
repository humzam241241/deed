import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// ─── Layout components ────────────────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ─── Eagerly-loaded pages (small, no heavy deps) ──────────────────────────────
import Home            from './pages/Home';
import Products        from './pages/Products';
import OurTeam         from './pages/OurTeam';
import OurProcess      from './pages/OurProcess';
import OntarioTechClubs from './pages/OntarioTechClubs';
import StudentClubs    from './pages/StudentClubs';
import CorporateTeams  from './pages/CorporateTeams';
import Contact         from './pages/Contact';
import NotFound        from './pages/NotFound';

// ─── Lazy-loaded pages (Three.js / admin are heavy — load on demand) ──────────
const DesignStudio   = lazy(() => import('./pages/DesignStudio'));
const AdminLogin     = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// ─── Public layout: Navbar + page content (via <Outlet>) + Footer ─────────────
// Using a layout route (no `path` prop) is the canonical RR v6 pattern.
// It renders for every matched child and avoids nested <Routes>.
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* ── Admin pages — no Navbar/Footer ── */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
            <AdminDashboard />
          </Suspense>
        }
      />

      {/* ── Public pages — wrapped in Navbar/Footer via PublicLayout ── */}
      <Route element={<PublicLayout />}>
        <Route path="/"                  element={<Home />} />
        <Route path="/products"          element={<Products />} />
        <Route path="/our-team"          element={<OurTeam />} />
        <Route path="/our-process"       element={<OurProcess />} />
        <Route
          path="/design-studio"
          element={
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading Design Studio…
              </div>
            }>
              <DesignStudio />
            </Suspense>
          }
        />
        <Route path="/student-clubs"     element={<StudentClubs />} />
        <Route path="/corporate-teams"   element={<CorporateTeams />} />
        <Route path="/ontario-tech-clubs" element={<OntarioTechClubs />} />
        <Route path="/contact"           element={<Contact />} />
        <Route path="*"                  element={<NotFound />} />
      </Route>
    </Routes>
  );
}
