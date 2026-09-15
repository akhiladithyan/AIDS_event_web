import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import Admin from './pages/Admin';
import Manager from './pages/Manager';
import Judge from './pages/Judge';
import Grainient from './components/Grainient';

import Results from './pages/Results';
import Scan from './pages/Scan';
import Pass from './pages/Pass';
import LoadingScreen from './components/LoadingScreen';
import LogoLoop from './components/LogoLoop';

function AppContent() {
  const isHomePage = window.location.pathname === '/';
  const [isLoading, setIsLoading] = React.useState(isHomePage);

  return (
    <>
      {/* CYBERPUNK LOADING SCREEN FOR AIDEX '26 (ONLY ON HOME PAGE REFRESH) */}
      {isLoading && isHomePage && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* GLOBAL DYNAMIC GRADIENT BACKGROUND FOR THE WHOLE WEBSITE */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)'
      }}>
        <Grainient
          timeSpeed={0.15}
          grainAmount={0.08}
          /* --- CUSTOMIZE WEBSITE GRADIENT COLORS HERE --- */
          color1="#54b567" /* Color 1: Green Accent */
          color2="#150d2e" /* Color 2: Deep Dark Background Base */
          color3="#349448ff" /* Color 3: Lime Glow */
        />
      </div>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        <Navbar />
        <main style={{ flex: 1, paddingTop: '100px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<StudentProfile />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/judge" element={<Judge />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/pass" element={<Pass />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '28px 20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(10, 6, 20, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          {/* React Bits Infinite Logo Loop Marquee */}
          <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
            <LogoLoop speed={30} pauseOnHover={true} />
          </div>

          <div>AIDEX 2026 &copy; Department of Artificial Intelligence & Data Science</div>
          <div style={{ fontSize: '0.8rem', marginTop: -4, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>
            Vel Tech Multi Tech Dr. Rangarajan Dr. Sakunthala Engineering College
          </div>
        </footer>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
