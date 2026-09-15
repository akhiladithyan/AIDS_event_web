import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import './CardNav.css';

const CardNav = ({
  logoComponent,
  items = [],
  activeHref = '/',
  className = '',
  ease = 'power3.out',
  baseColor = 'rgba(12, 20, 14, 0.95)',
  menuColor = '#1ce604',
  buttonBgColor = '#1ce604',
  buttonTextColor = '#060b07',
  onMobileMenuClick
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 280;

    const contentEl = navEl.querySelector('.card-nav-content');
    if (contentEl) {
      const wasVisible = contentEl.style.visibility;
      const wasPointerEvents = contentEl.style.pointerEvents;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.pointerEvents = 'auto';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';

      contentEl.offsetHeight;

      const topBar = 60;
      const padding = 20;
      const contentHeight = contentEl.scrollHeight;

      contentEl.style.visibility = wasVisible;
      contentEl.style.pointerEvents = wasPointerEvents;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
    return 280;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.35, ease, stagger: 0.08 }, '-=0.2');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const openMenu = () => {
    const tl = tlRef.current;
    setIsHamburgerOpen(true);
    setIsExpanded(true);
    if (tl) {
      tl.play();
    }
    if (onMobileMenuClick) onMobileMenuClick();
  };

  const closeMenu = () => {
    const tl = tlRef.current;
    setIsHamburgerOpen(false);
    if (tl) {
      tl.reverse().then(() => {
        setIsExpanded(false);
      }).catch(() => {
        setIsExpanded(false);
      });
    } else {
      setIsExpanded(false);
    }
  };

  const toggleMenu = () => {
    if (isHamburgerOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  // Group items into category cards for React Bits CardNav display
  const mainLinks = items.filter(it => it.label !== 'Contact');
  const contactItem = items.find(it => it.label === 'Contact');

  const cardSections = [
    {
      title: 'Main Navigation',
      bgColor: 'rgba(255, 255, 255, 0.04)',
      textColor: '#ffffff',
      links: mainLinks
    },
    {
      title: 'Support & Queries',
      bgColor: 'rgba(28, 230, 4, 0.08)',
      textColor: '#1ce604',
      links: contactItem ? [contactItem] : []
    }
  ];

  const isExternalLink = href =>
    !href ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div className="logo-container">
            {logoComponent}
          </div>

          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{ color: menuColor }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {cardSections.map((sec, idx) => (
            <div
              key={`${sec.title}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: sec.bgColor, borderColor: 'rgba(28, 230, 4, 0.2)' }}
            >
              <div className="nav-card-label" style={{ color: sec.textColor }}>{sec.title}</div>
              <div className="nav-card-links">
                {sec.links.map((lnk, i) => (
                  <React.Fragment key={`${lnk.label}-${i}`}>
                    {isRouterLink(lnk.href) ? (
                      <Link
                        className={`nav-card-link ${activeHref === lnk.href ? 'is-active' : ''}`}
                        to={lnk.href}
                        onClick={(e) => {
                          lnk.onClick?.(e);
                          closeMenu();
                        }}
                      >
                        <ArrowUpRight className="nav-card-link-icon" size={14} />
                        {lnk.label}
                      </Link>
                    ) : (
                      <a
                        className={`nav-card-link ${activeHref === lnk.href ? 'is-active' : ''}`}
                        href={lnk.href}
                        onClick={(e) => {
                          lnk.onClick?.(e);
                          closeMenu();
                        }}
                      >
                        <ArrowUpRight className="nav-card-link-icon" size={14} />
                        {lnk.label}
                      </a>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
