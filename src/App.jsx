import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import StudentProfile from './pages/StudentProfile';
import Admin from './pages/Admin';
import Manager from './pages/Manager';
import Judge from './pages/Judge';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
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
          color: 'rgba(255, 255, 255, 0.45)',
          fontSize: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 6, 20, 0.6)'
        }}>
          <div>NEURA 2026 &copy; Department of Artificial Intelligence & Data Science</div>
          <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
            Powered by React, Supabase & Glassmorphism UI Architecture
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
