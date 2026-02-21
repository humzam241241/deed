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

// Lazy-loaded - contains Three.js (heavy). Isolates 3D errors from rest of site.
const DesignStudio = lazy(() => import('./pages/DesignStudio'));

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/our-process" element={<OurProcess />} />
          <Route path="/design-studio" element={
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading Design Studio...</div>}>
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
  );
}