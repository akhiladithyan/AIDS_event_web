import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Cpu, Sparkles } from 'lucide-react';
import PillNav from './PillNav';

const Navbar = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar if scrolled up or near top, hide if scrolled down past 50px threshold
      if (currentScrollY <= 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 5) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 5) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { label: 'Events', href: '/' },
    { label: 'Student Profile', href: '/student' }
  ];

  const brandLogoComponent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ef4a40 0%, #6654b5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(239, 74, 64, 0.5)',
        flexShrink: 0
      }}>
        <Cpu size={18} color="#fff" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.05rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          lineHeight: 1.1
        }}>
          NEURA <span style={{ color: '#ef4a40' }}>'26</span>
          <Sparkles size={12} color="#ef4a40" />
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, letterSpacing: '0.05em', lineHeight: 1 }}>
          DEPT OF AI & DS
        </div>
      </div>
    </div>
  );

  return (
    <header
      style={{
        position: 'fixed',
        top: 16,
        left: 0,
        right: 0,
        zIndex: 900,
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100px)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease'
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <PillNav
          logoComponent={brandLogoComponent}
          items={navItems}
          activeHref={location.pathname}
          baseColor="rgba(18, 12, 38, 0.85)"
          pillColor="rgba(255, 255, 255, 0.08)"
          pillTextColor="rgba(255, 255, 255, 0.85)"
          hoveredPillTextColor="#ffffff"
          initialLoadAnimation={false}
        />
      </div>
    </header>
  );
};

export default Navbar;

