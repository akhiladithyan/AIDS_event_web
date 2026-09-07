import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, User, ShieldCheck, QrCode, Award, Sparkles } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 16,
      zIndex: 900,
      padding: '0 20px',
      margin: '0 auto 20px auto',
      maxWidth: 1280
    }}>
      <nav className="glass-panel" style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 100,
        background: 'rgba(18, 12, 38, 0.75)',
        backdropFilter: 'blur(24px)'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4a40 0%, #6654b5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 74, 64, 0.5)'
          }}>
            <Cpu size={22} color="#fff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              NEURA <span style={{ color: '#ef4a40' }}>'26</span>
              <Sparkles size={14} color="#ef4a40" />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.05em' }}>
              DEPARTMENT OF AI & DS
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/"
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              color: isActive('/') ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              background: isActive('/') ? 'rgba(239, 74, 64, 0.25)' : 'transparent',
              border: isActive('/') ? '1px solid rgba(239, 74, 64, 0.4)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            Events
          </Link>

          <Link
            to="/student"
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              color: isActive('/student') ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              background: isActive('/student') ? 'rgba(102, 84, 181, 0.35)' : 'transparent',
              border: isActive('/student') ? '1px solid rgba(131, 114, 216, 0.5)' : '1px solid transparent',
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <User size={15} /> Student Profile
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
