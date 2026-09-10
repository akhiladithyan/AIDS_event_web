import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import Admin from './pages/Admin';
import Manager from './pages/Manager';
import Judge from './pages/Judge';
import Grainient from './components/Grainient';

function App() {
  return (
    <BrowserRouter>
      {/* GLOBAL DYNAMIC GRADIENT BACKGROUND FOR THE WHOLE WEBSITE */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        <Grainient
          timeSpeed={0.15}
          grainAmount={0.08}
          /* --- CUSTOMIZE WEBSITE GRADIENT COLORS HERE --- */
          color1="#54b567" /* Color 1: Green Accent */
          color2="#150d2e" /* Color 2: Deep Dark Background Base */
          color3="#72ef40" /* Color 3: Lime Glow */
        />
      </div>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        <Navbar />
        <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingTop: '100px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<StudentProfile />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/judge" element={<Judge />} />
          </Routes>
        </main>

        <footer style={{
          textAlign: 'center',
          padding: '24px 20px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(10, 6, 20, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 1
        }}>
          <div>NEURA 2026 &copy; Department of Artificial Intelligence & Data Science</div>
          <div style={{ fontSize: '0.78rem', marginTop: 4, color: 'rgba(255, 255, 255, 0.4)' }}>
            Powered by React, Supabase & Glassmorphism UI Architecture
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
