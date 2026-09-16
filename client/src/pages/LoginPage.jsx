import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconShield, IconSparkles } from '../components/Icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    { label: 'Platform Admin', email: 'admin@eventforge.com', role: 'PLATFORM_ADMIN' },
    { label: 'Event Organizer', email: 'organizer@eventforge.com', role: 'EVENT_ORGANIZER' },
    { label: 'Event Staff', email: 'staff@eventforge.com', role: 'EVENT_STAFF' },
    { label: 'Speaker', email: 'speaker@eventforge.com', role: 'SPEAKER' },
    { label: 'Attendee', email: 'attendee@eventforge.com', role: 'ATTENDEE' },
    { label: 'Sponsor', email: 'sponsor@eventforge.com', role: 'SPONSOR' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (accEmail) => {
    try {
      setLoading(true);
      setError('');
      await login(accEmail, 'Password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFF9F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#F3E6D5', borderRadius: '9999px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#800020', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EventForge Portal</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#800020', margin: '0 0 8px' }}>
            Sign In to Your Account
          </h1>
          <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
            Enter credentials or select a 1-click evaluation role below.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#F3E6D5',
            borderRadius: '20px',
            border: '1px solid rgba(128, 0, 32, 0.15)',
            padding: '32px',
            boxShadow: '0 12px 36px rgba(80, 22, 33, 0.08)'
          }}
        >
          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(128, 0, 32, 0.2)',
                  fontSize: '14px',
                  backgroundColor: '#FFF9F2',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(128, 0, 32, 0.2)',
                  fontSize: '14px',
                  backgroundColor: '#FFF9F2',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#800020',
                color: '#FFF9F2',
                border: 'none',
                padding: '13px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick 1-Click Role Switcher inside Login */}
          <div style={{ marginTop: '28px', borderTop: '1px solid rgba(128, 0, 32, 0.15)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#800020', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
              <IconSparkles size={14} className="text-[#D45060]" />
              <span>Or 1-Click Demo Login:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(acc.email)}
                  style={{
                    backgroundColor: '#FFF9F2',
                    border: '1px solid rgba(128, 0, 32, 0.15)',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#800020',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6e5961', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#800020', fontWeight: 700, textDecoration: 'underline' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
