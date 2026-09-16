import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconSparkles, IconShield, IconUsers, IconTicket } from './Icons';

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switching, setSwitching] = useState(false);

  const demoAccounts = [
    { label: 'Platform Admin', email: 'admin@eventforge.com', role: 'PLATFORM_ADMIN', desc: 'Manage system, organizations, analytics' },
    { label: 'Event Organizer', email: 'organizer@eventforge.com', role: 'EVENT_ORGANIZER', desc: 'Create summits, venues, sessions, AI studio' },
    { label: 'Event Staff', email: 'staff@eventforge.com', role: 'EVENT_STAFF', desc: 'Live QR scanner, validate & check-in attendees' },
    { label: 'Speaker', email: 'speaker@eventforge.com', role: 'SPEAKER', desc: 'Profile, schedule, presentation materials' },
    { label: 'Attendee', email: 'attendee@eventforge.com', role: 'ATTENDEE', desc: 'Browse events, QR ticket badge, feedback' },
    { label: 'Sponsor', email: 'sponsor@eventforge.com', role: 'SPONSOR', desc: 'Brand assets, package & deliverables tracker' },
  ];

  const handleQuickSwitch = async (email) => {
    try {
      setSwitching(true);
      await login(email, 'Password123');
      setShowRoleSwitcher(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleDisplayName = (role) => {
    const map = {
      PLATFORM_ADMIN: 'Platform Admin',
      admin: 'Platform Admin',
      EVENT_ORGANIZER: 'Event Organizer',
      organizer: 'Event Organizer',
      EVENT_STAFF: 'Event Staff',
      staff: 'Event Staff',
      SPEAKER: 'Speaker',
      speaker: 'Speaker',
      ATTENDEE: 'Attendee',
      attendee: 'Attendee',
      SPONSOR: 'Sponsor',
      sponsor: 'Sponsor'
    };
    return map[role] || role;
  };

  return (
    <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="brand-block" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="brand-mark" style={{ background: '#800020', color: '#FFF9F2', fontWeight: 800 }}>EF</span>
        <div>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#800020', letterSpacing: '-0.02em' }}>EventForge</span>
          <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#D45060', fontWeight: 700, letterSpacing: '0.08em' }}>Enterprise Summit OS</span>
        </div>
      </div>

      <nav className="main-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active-nav' : '')}>Home</NavLink>
        <NavLink to="/events" className={({ isActive }) => (isActive ? 'active-nav' : '')}>Browse Events</NavLink>
        {user && (
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active-nav' : '')}>
            Dashboard
          </NavLink>
        )}
      </nav>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Demo Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="secondary-btn"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #D45060',
              color: '#800020',
              background: '#FFF9F2'
            }}
          >
            <IconSparkles size={14} className="text-[#D45060]" />
            <span>Switch Demo Role</span>
          </button>

          {showRoleSwitcher && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: '#FFF9F2',
                borderRadius: '16px',
                border: '1px solid rgba(128, 0, 32, 0.2)',
                boxShadow: '0 20px 40px rgba(80, 22, 33, 0.18)',
                padding: '12px',
                zIndex: 200
              }}
            >
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid rgba(128, 0, 32, 0.1)' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#800020' }}>Select Demo Account</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6e5961' }}>1-click login into any enterprise role</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    disabled={switching}
                    onClick={() => handleQuickSwitch(acc.email)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: user?.email === acc.email ? '#F3E6D5' : 'transparent',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F3E6D5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = user?.email === acc.email ? '#F3E6D5' : 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#800020' }}>{acc.label}</span>
                      {user?.email === acc.email && (
                        <span style={{ fontSize: '10px', background: '#800020', color: '#FFF9F2', padding: '2px 6px', borderRadius: '4px' }}>Active</span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6e5961' }}>{acc.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#800020',
                  color: '#FFF9F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                {user.firstName?.charAt(0) || 'U'}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#800020' }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: '11px', color: '#D45060', fontWeight: 600 }}>{getRoleDisplayName(user.role)}</div>
              </div>
            </div>
            <button
              className="secondary-btn"
              onClick={logout}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="secondary-btn" style={{ padding: '7px 16px', fontSize: '13px' }}>
              Login
            </NavLink>
            <NavLink to="/register" className="primary-btn" style={{ padding: '7px 16px', fontSize: '13px', background: '#800020', color: '#FFF9F2' }}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
