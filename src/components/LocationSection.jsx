import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, PhoneCall } from 'lucide-react';
import PillButton from './PillButton';
import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';
import Carousel from './Carousel';
import { storeService } from '../services/store';
import './LocationSection.css';

export default function LocationSection() {
  const [contacts, setContacts] = useState([]);

  // Fetch contacts dynamically from store
  useEffect(() => {
    const loadContacts = async () => {
      const data = await storeService.getContacts();
      setContacts(data);
    };
    loadContacts();
  }, []);

  // Vel Tech Multi Tech exact campus coordinates map view embed URL
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15541.45892548858!2d80.090000!3d13.136000!2m3!1f0!0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52636a0d2495b5%3A0x8e27c1349f25712f!2sVel%20Tech%20Multi%20Tech%20Dr.Rangarajan%20Dr.Sakunthala%20Engineering%20College!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin";
  const directMapsUrl = "https://maps.google.com/?q=Vel+Tech+Multi+Tech+Dr.Rangarajan+Dr.Sakunthala+Engineering+College+Avadi+Chennai";

  return (
    <section className="location-section" id="location-section">
      <div className="location-container">
        {/* Full Interactive Google Map Background */}
        <div className="location-map-wrapper">
          <iframe
            title="Vel Tech Multi Tech Location Map"
            src={mapEmbedUrl}
            className="location-iframe"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="location-map-scrim" />
        </div>

        {/* Floating Futuristic Dark Glass Card */}
        <div className="location-card">
          <div className="location-card-header">
            <div className="location-badge">
              <MapPin size={14} /> VENUE DIRECTION
            </div>
            <h2 className="location-title">
              <ShinyText text="College Location" color="#ffffff" shineColor="#1ce604" speed={3} />
            </h2>
            <div className="location-accent-bar" />
          </div>

          <p className="location-subtitle">
            <strong>Vel Tech Multi Tech Dr. Rangarajan Dr. Sakunthala Engineering College</strong>
          </p>

          <div className="location-details-grid">
            <div className="location-detail-group">
              <span className="location-label">Address</span>
              <p className="location-value">
                #60, Avadi - Vel Tech Road, <br />
                Vel Nagar, Avadi, <br />
                Chennai, Tamil Nadu 600062
              </p>
            </div>
          </div>

          <div className="location-actions">
            <a href={directMapsUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <PillButton variant="primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px' }}>
                <Navigation size={16} /> Get Directions <ExternalLink size={14} />
              </PillButton>
            </a>
          </div>
        </div>
      </div>

      {/* CONTACT INFO SECTION (DYNAMICALLY LOADED FROM STORE / ADMIN PAGE) */}
      <div className="contact-info-section" id="contact-info-section">
        <div className="contact-info-header">
          <div className="contact-badge">
            EVENT HELPDESK & SUPPORT
          </div>
          <h2 className="contact-info-title">Contact For Queries</h2>
          <p className="contact-info-desc">
            Have doubts regarding event registration, problem statements, or schedule? Get in touch with our team.
          </p>
        </div>

        {/* Laptop View: 3 Cards strictly side-by-side in a single row */}
        <div className="desktop-only" style={{ width: '100%' }}>
          <div className="contact-cards-row">
            {contacts.map(c => (
              <div key={c.id} className="contact-card-col">
                <BorderGlow
                  glowColor={c.isPrimary ? "#1ce604" : "rgba(28, 230, 4, 0.7)"}
                  glowRadius={300}
                  borderRadius={24}
                  style={{ width: '100%', height: '100%' }}
                >
                  <div className={`contact-profile-card ${c.isPrimary ? 'contact-profile-card--primary' : ''}`}>
                    {/* Top Badge Header */}
                    <div className="contact-card-top-header">
                      <span className="contact-badge-pill">
                        {c.badgeText || (c.isPrimary ? 'Primary Contact' : 'Co-ordinator')}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div className="contact-profile-info">
                      <h3 className="contact-profile-name">
                        <ShinyText text={c.name} color="#ffffff" shineColor="#1ce604" speed={3.5} />
                      </h3>
                      <div className="contact-profile-role">{c.role}</div>
                    </div>

                    {/* Query Types Tags */}
                    {c.tags && c.tags.length > 0 && (
                      <div className="contact-queries-box">
                        <div className="contact-queries-label">QUERIES HANDLED</div>
                        <div className="contact-queries-tags">
                          {c.tags.map((tag, idx) => (
                            <span key={idx} className="contact-query-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equal-sized Action Buttons: WhatsApp & Call Now with Pill-Nav style */}
                    <div className="contact-action-row">
                      <PillButton
                        as="a"
                        href={c.whatsappUrl || `https://wa.me/${(c.phone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="primary"
                        className="contact-equal-btn contact-whatsapp-pill"
                      >
                        <img
                          src="/images/whatsapp-icon.png"
                          alt="WhatsApp"
                          style={{ width: 16, height: 16, objectFit: 'contain' }}
                        />
                        WhatsApp
                      </PillButton>

                      <PillButton
                        as="a"
                        href={`tel:${c.phone}`}
                        variant="primary"
                        className="contact-equal-btn contact-call-pill"
                      >
                        <PhoneCall size={15} /> Call Now
                      </PillButton>
                    </div>
                  </div>
                </BorderGlow>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View: Carousel Slider */}
        <div className="mobile-only contact-carousel-wrapper" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <Carousel>
            {contacts.map(c => (
              <BorderGlow
                key={c.id}
                glowColor={c.isPrimary ? "#1ce604" : "rgba(28, 230, 4, 0.7)"}
                glowRadius={300}
                borderRadius={24}
                style={{ width: '100%' }}
              >
                <div className={`contact-profile-card ${c.isPrimary ? 'contact-profile-card--primary' : ''}`}>
                  {/* Top Badge Header */}
                  <div className="contact-card-top-header">
                    <span className="contact-badge-pill">
                      {c.badgeText || (c.isPrimary ? 'Primary Contact' : 'Co-ordinator')}
                    </span>
                  </div>

                  <div className="contact-profile-info">
                    <h3 className="contact-profile-name">
                      <ShinyText text={c.name} color="#ffffff" shineColor="#1ce604" speed={3.5} />
                    </h3>
                    <div className="contact-profile-role">{c.role}</div>
                  </div>

                  {c.tags && c.tags.length > 0 && (
                    <div className="contact-queries-box">
                      <div className="contact-queries-label">QUERIES HANDLED</div>
                      <div className="contact-queries-tags">
                        {c.tags.map((tag, idx) => (
                          <span key={idx} className="contact-query-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="contact-action-row">
                    <PillButton
                      as="a"
                      href={c.whatsappUrl || `https://wa.me/${(c.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                      className="contact-equal-btn contact-whatsapp-pill"
                    >
                      <img
                        src="/images/whatsapp-icon.png"
                        alt="WhatsApp"
                        style={{ width: 18, height: 18, objectFit: 'contain' }}
                      />
                      WhatsApp
                    </PillButton>

                    <PillButton
                      as="a"
                      href={`tel:${c.phone}`}
                      variant="primary"
                      className="contact-equal-btn contact-call-pill"
                    >
                      <PhoneCall size={16} /> Call Now
                    </PillButton>
                  </div>
                </div>
              </BorderGlow>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
