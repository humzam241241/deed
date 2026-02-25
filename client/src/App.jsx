import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// ─── Layout components ────────────────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ─── Eagerly-loaded pages ─────────────────────────────────────────────────────
import Home             from './pages/Home';
import Products         from './pages/Products';
import OurTeam          from './pages/OurTeam';
import OurProcess       from './pages/OurProcess';
import OntarioTechClubs from './pages/OntarioTechClubs';
import StudentClubs     from './pages/StudentClubs';
import CorporateTeams   from './pages/CorporateTeams';
import Contact          from './pages/Contact';
import NotFound         from './pages/NotFound';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const DesignStudio    = lazy(() => import('./pages/DesignStudio'));
const AdminLogin      = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));
const ListingDetail   = lazy(() => import('./pages/ListingDetail'));
const ClubDashboard   = lazy(() => import('./pages/ClubDashboard'));

// ─── Loading fallbacks ────────────────────────────────────────────────────────
const DarkFallback  = <div className="min-h-screen bg-gray-950" />;
const LightFallback = (
  <div className="min-h-screen flex items-center justify-center text-gray-500">
    Loading…
  </div>
);

// ─── Public layout ────────────────────────────────────────────────────────────
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

// ─── Protected route wrapper ──────────────────────────────────────────────────
// Redirects unauthenticated users to /admin/login.
// Optionally checks for a required role.
function ProtectedRoute({ requiredRole, redirectTo = '/admin/login', children }) {
  const { user, userRole, loading } = useAuth();

  if (loading) return DarkFallback;
  if (!user) return <Navigate to={redirectTo} replace />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" replace />;

  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Admin pages — no Navbar/Footer ── */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={DarkFallback}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={DarkFallback}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ── Club exec dashboard ── */}
        <Route
          path="/club"
          element={
            <ProtectedRoute requiredRole="club_exec">
              <Suspense fallback={LightFallback}>
                <ClubDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* ── Public pages — wrapped in Navbar/Footer ── */}
        <Route element={<PublicLayout />}>
          <Route path="/"                    element={<Home />} />
          <Route path="/products"            element={<Products />} />
          <Route path="/our-team"            element={<OurTeam />} />
          <Route path="/our-process"         element={<OurProcess />} />
          <Route
            path="/design-studio"
            element={
              <Suspense fallback={LightFallback}>
                <DesignStudio />
              </Suspense>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <Suspense fallback={LightFallback}>
                <ListingDetail />
              </Suspense>
            }
          />
          <Route path="/student-clubs"       element={<StudentClubs />} />
          <Route path="/corporate-teams"     element={<CorporateTeams />} />
          <Route path="/ontario-tech-clubs"  element={<OntarioTechClubs />} />
          <Route path="/contact"             element={<Contact />} />
          <Route path="*"                    element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
