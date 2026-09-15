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

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEventsClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('event-cards-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('contact-info-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Home', href: '/', onClick: handleHomeClick },
    { label: 'Events', href: location.pathname === '/' ? '#event-cards-grid' : '/#event-cards-grid', onClick: handleEventsClick },
    { label: 'Contact', href: location.pathname === '/' ? '#contact-info-section' : '/#contact-info-section', onClick: handleContactClick },
    { label: 'Results', href: '/results' },
    { label: 'Student Profile', href: '/student' }
  ];

  const brandLogoComponent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        background: 'rgba(28, 230, 4, 0.15)',
        border: '1.5px solid rgba(28, 230, 4, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(28, 230, 4, 0.35)',
        flexShrink: 0,
        overflow: 'hidden'
      }}>
        <img
          src="/images/icon.png"
          alt="AIDEX Icon"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.25rem',
        fontWeight: 900,
        letterSpacing: '-0.02em',
        background: 'linear-gradient(135deg, #ffffff 0%, #b8ffbf 45%, #1ce604 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        lineHeight: 1
      }}>
        AIDEX '26
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

