import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import PillButton from './PillButton';
import BorderGlow from './BorderGlow';
import ShinyText from './ShinyText';
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

        <div className="contact-job-grid">
          {contacts.map(c => (
            <BorderGlow
              key={c.id}
              glowColor={c.isPrimary ? "#1ce604" : "rgba(28, 230, 4, 0.7)"}
              glowRadius={300}
              borderRadius={28}
            >
              <div
                className={`contact-job-card ${c.isPrimary ? 'contact-job-card--highlight' : ''}`}
              >
                <div className="contact-job-top">
                  <div className="contact-job-company">
                    AIDEX '26 <span className="contact-job-time">{c.availability || 'Available 9 AM - 6 PM'}</span>
                  </div>
                  <span className={`contact-job-badge ${c.isPrimary ? 'contact-job-badge--primary' : ''}`}>
                    {c.badgeText || (c.isPrimary ? 'Primary Contact' : 'Co-ordinator')}
                  </span>
                </div>

                <div className="contact-job-title-row">
                  <h3 className="contact-job-name">
                    <ShinyText text={c.name} color="#ffffff" shineColor="#1ce604" speed={3.5} />
                  </h3>
                  <div className="contact-job-designation">{c.role}</div>
                </div>

                {c.tags && c.tags.length > 0 && (
                  <div className="contact-job-tags">
                    {c.tags.map((tag, idx) => (
                      <span key={idx} className="contact-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="contact-job-divider" />

                <div className="contact-job-bottom">
                  <div className="contact-job-phone">
                    <span className="contact-phone-val">{c.phone}</span>
                    <span className="contact-phone-sub">{c.email || 'Direct Contact'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* WhatsApp Chat Button */}
                    <PillButton
                      as="a"
                      href={c.whatsappUrl || "https://wa.me/qr/4HRMHEE5TIE6F1"}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="primary"
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 100,
                        backgroundColor: '#25D366',
                        borderColor: '#25D366',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)'
                      }}
                      title="Chat on WhatsApp"
                    >
                      <img
                        src="/images/whatsapp-icon.png"
                        alt="WhatsApp"
                        style={{ width: 22, height: 22, objectFit: 'contain' }}
                      />
                    </PillButton>

                    <PillButton
                      as="a"
                      href={`tel:${c.phone}`}
                      variant="primary"
                      style={{ padding: '12px 22px', fontSize: '0.9rem' }}
                    >
                      Call Now
                    </PillButton>
                  </div>
                </div>
              </div>
            </BorderGlow>
          ))}
        </div>
      </div>
    </section>
  );
}
