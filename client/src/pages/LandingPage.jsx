import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconCalendar,
  IconMapPin,
  IconQrCode,
  IconShield,
  IconSparkles,
  IconTicket,
  IconUsers,
  IconBarChart,
  IconPresentation
} from '../components/Icons';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loggingInRole, setLoggingInRole] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?limit=4');
        setEvents(res.data.data.events || []);
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const demoRoles = [
    { name: 'Platform Admin', email: 'admin@eventforge.com', role: 'PLATFORM_ADMIN', desc: 'Organizations, users & global policies', color: '#800020' },
    { name: 'Event Organizer', email: 'organizer@eventforge.com', role: 'EVENT_ORGANIZER', desc: 'Create summits, conflict check, AI tools', color: '#800020' },
    { name: 'Event Staff', email: 'staff@eventforge.com', role: 'EVENT_STAFF', desc: 'Live camera QR scanner & fast check-in', color: '#D45060' },
    { name: 'Keynote Speaker', email: 'speaker@eventforge.com', role: 'SPEAKER', desc: 'Speaker profile, schedule & slide decks', color: '#800020' },
    { name: 'Conference Attendee', email: 'attendee@eventforge.com', role: 'ATTENDEE', desc: 'Browse summits, register & QR badge', color: '#D45060' },
    { name: 'Corporate Sponsor', email: 'sponsor@eventforge.com', role: 'SPONSOR', desc: 'Brand assets & deliverables tracker', color: '#800020' },
  ];

  const handleQuickLogin = async (email) => {
    try {
      setLoggingInRole(email);
      await login(email, 'Password123');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFF9F2' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '80px 32px 60px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '60px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '9999px', background: '#F3E6D5', border: '1px solid rgba(128, 0, 32, 0.15)', marginBottom: '24px' }}>
            <IconSparkles size={16} className="text-[#D45060]" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#800020', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Enterprise Summit Platform
            </span>
          </div>

          <h1 style={{ fontSize: '48px', lineHeight: 1.15, fontWeight: 900, color: '#800020', margin: '0 0 20px', letterSpacing: '-0.03em' }}>
            Where Global Summits and Enterprise Leaders Converge.
          </h1>

          <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#6e5961', margin: '0 0 32px' }}>
            EventForge is an end-to-end corporate event management platform powering multi-track conferences, conflict-free scheduling, live QR check-ins, and AI-accelerated event content.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/events')}
              style={{
                backgroundColor: '#800020',
                color: '#FFF9F2',
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(128, 0, 32, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              Explore Conferences
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              style={{
                backgroundColor: '#F3E6D5',
                color: '#800020',
                padding: '14px 28px',
                borderRadius: '12px',
                border: '1px solid rgba(128, 0, 32, 0.2)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              {user ? 'Open Dashboard' : 'Sign In to Portal'}
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128, 0, 32, 0.12)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#800020', color: '#FFF9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconQrCode size={22} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#800020' }}>Live QR Check-In</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
              Staff camera scanner with millisecond ticket validation and duplicate check-in prevention.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128, 0, 32, 0.12)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#D45060', color: '#FFF9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconPresentation size={22} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#800020' }}>Conflict Detection</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
              Zero double-booked rooms or overlapping speaker slots across multi-track summits.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128, 0, 32, 0.12)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#D45060', color: '#FFF9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconSparkles size={22} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#800020' }}>AI Content Studio</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
              Automated generation of compelling descriptions, speaker bios, and personalized session matching.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128, 0, 32, 0.12)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#800020', color: '#FFF9F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconBarChart size={22} />
            </div>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#800020' }}>Real-time Analytics</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
              Aggregated MongoDB metrics for attendance, revenue, ticket distribution, and ratings.
            </p>
          </div>
        </div>
      </section>

      {/* 1-Click Demo Accounts Evaluation Banner */}
      <section style={{ backgroundColor: '#F3E6D5', borderTop: '1px solid rgba(128, 0, 32, 0.15)', borderBottom: '1px solid rgba(128, 0, 32, 0.15)', padding: '50px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#D45060', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <IconShield size={16} /> Instant Role Evaluation
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#800020', margin: '0 0 10px' }}>
              Test All 6 Enterprise Roles in 1 Click
            </h2>
            <p style={{ fontSize: '15px', color: '#6e5961', margin: 0 }}>
              Each role grants specific backend permissions and tailored dashboard experiences. Password for all: <code style={{ background: '#FFF9F2', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#800020' }}>Password123</code>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {demoRoles.map((role) => (
              <div
                key={role.email}
                style={{
                  backgroundColor: '#FFF9F2',
                  border: '1px solid rgba(128, 0, 32, 0.15)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(80, 22, 33, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#800020' }}>{role.name}</h3>
                    <Badge variant="burgundy">{role.role.replace('_', ' ')}</Badge>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6e5961' }}>{role.desc}</p>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', fontFamily: 'monospace', color: '#800020', fontWeight: 600 }}>{role.email}</p>
                </div>

                <button
                  disabled={loggingInRole === role.email}
                  onClick={() => handleQuickLogin(role.email)}
                  style={{
                    width: '100%',
                    backgroundColor: '#800020',
                    color: '#FFF9F2',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {loggingInRole === role.email ? 'Signing In...' : `Launch as ${role.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Conferences Section */}
      <section style={{ padding: '70px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px' }}>
          <div>
            <p style={{ margin: '0 0 6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D45060', fontWeight: 700 }}>
              Live Schedule
            </p>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#800020' }}>
              Featured Enterprise Conferences
            </h2>
          </div>
          <button
            onClick={() => navigate('/events')}
            style={{ background: 'transparent', border: 'none', color: '#800020', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            View All Conferences →
          </button>
        </div>

        {loadingEvents ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6e5961' }}>Loading conferences...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#F3E6D5', borderRadius: '16px' }}>
            No upcoming events found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {events.map((evt) => (
              <div
                key={evt._id}
                style={{
                  backgroundColor: '#F3E6D5',
                  borderRadius: '20px',
                  border: '1px solid rgba(128, 0, 32, 0.15)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 12px 30px rgba(80, 22, 33, 0.08)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => navigate(`/events/${evt._id}`)}
              >
                <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={evt.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
                    alt={evt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
                    <Badge variant="burgundy">{evt.eventType}</Badge>
                  </div>
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>
                      {evt.title}
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6e5961', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {evt.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#800020', fontWeight: 600, borderTop: '1px solid rgba(128, 0, 32, 0.1)', paddingTop: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconCalendar size={14} />
                        {new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconUsers size={14} />
                        {evt.capacity} Capacity
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${evt._id}`);
                      }}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        backgroundColor: '#800020',
                        color: '#FFF9F2',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      View Agenda & Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
