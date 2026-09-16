import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#F3E6D5',
        borderTop: '1px solid rgba(128, 0, 32, 0.15)',
        padding: '60px 32px 30px',
        color: '#2d1d20',
        marginTop: 'auto'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#800020', color: '#FFF9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>EF</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#800020' }}>EventForge</span>
          </div>
          <p style={{ fontSize: '14px', color: '#6e5961', lineHeight: 1.6, margin: 0 }}>
            Enterprise corporate event and premier conference management platform. Delivering frictionless attendee check-ins, session scheduling, and real-time analytics.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#800020', marginBottom: '16px', fontWeight: 700 }}>
            Platform Roles
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#6e5961' }}>
            <li>Platform Admin Console</li>
            <li>Event Organizer Studio</li>
            <li>Event Staff QR Scanner</li>
            <li>Speaker Portal & Materials</li>
            <li>Attendee Badge & Agenda</li>
            <li>Sponsor Deliverables Hub</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#800020', marginBottom: '16px', fontWeight: 700 }}>
            Core Capabilities
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#6e5961' }}>
            <li>Room & Speaker Conflict Detection</li>
            <li>Dynamic QR Ticket Generation & Validation</li>
            <li>AI Event Studio (Descriptions, Bios, Summaries)</li>
            <li>Real-time MongoDB Aggregations & Analytics</li>
            <li>Tiered Ticketing & Backend Coupon Validation</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#800020', marginBottom: '16px', fontWeight: 700 }}>
            Color Theme
          </h4>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#800020', border: '1px solid rgba(0,0,0,0.1)' }} title="#800020 Burgundy"></span>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F3E6D5', border: '1px solid rgba(0,0,0,0.1)' }} title="#F3E6D5 Cream"></span>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#FFF9F2', border: '1px solid rgba(0,0,0,0.1)' }} title="#FFF9F2 Background"></span>
            <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#D45060', border: '1px solid rgba(0,0,0,0.1)' }} title="#D45060 Accent Coral"></span>
          </div>
          <p style={{ fontSize: '12px', color: '#6e5961', margin: 0 }}>
            Premium corporate conference aesthetic built to executive enterprise specifications.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '40px auto 0',
          paddingTop: '20px',
          borderTop: '1px solid rgba(128, 0, 32, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: '#6e5961'
        }}
      >
        <span>© {new Date().getFullYear()} EventForge Inc. All rights reserved.</span>
        <span>Built with React 19, Express, MongoDB & Node.js</span>
      </div>
    </footer>
  );
}
