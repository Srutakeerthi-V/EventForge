import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconPresentation,
  IconQrCode,
  IconSparkles,
  IconTicket,
  IconUsers,
  IconCheckCircle
} from '../components/Icons';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  // Registration Checkout Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const [eventRes, sessionsRes, ticketsRes, sponsorsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/sessions?eventId=${id}`),
          api.get(`/ticket-categories?eventId=${id}`),
          api.get(`/sponsors?eventId=${id}`).catch(() => ({ data: { data: { sponsors: [] } } }))
        ]);

        setEvent(eventRes.data.data.event);
        setSessions(sessionsRes.data.data.sessions || []);
        setTicketCategories(ticketsRes.data.data.ticketCategories || []);
        setSponsors(sponsorsRes.data.data.sponsors || []);
      } catch (err) {
        console.error('Failed to load event details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponMessage('');
      const res = await api.post('/coupons/validate', { code: couponCode.trim(), eventId: id });
      const coupon = res.data.data.coupon;
      const basePrice = selectedCategory?.price || 0;
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (basePrice * coupon.discountValue) / 100;
      } else {
        discount = Math.min(basePrice, coupon.discountValue);
      }
      setCouponDiscount(discount);
      setCouponMessage(`✓ Coupon applied: $${discount.toFixed(2)} off`);
    } catch (err) {
      setCouponDiscount(0);
      setCouponMessage(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleOpenRegistration = (category) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedCategory(category);
    setSelectedSessions([]);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
    setRegError('');
    setRegistrationSuccess(null);
    setShowRegisterModal(true);
  };

  const toggleSessionSelection = (sessionId) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter((s) => s !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!selectedCategory) return;
    try {
      setRegistering(true);
      setRegError('');

      const payload = {
        event: id,
        ticketCategory: selectedCategory._id,
        selectedSessions,
        couponCode: couponCode.trim() || undefined
      };

      const res = await api.post('/registrations', payload);
      setRegistrationSuccess(res.data.data);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#800020' }}>Loading conference details...</div>;
  }

  if (!event) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#800020' }}>Event not found.</div>;
  }

  const finalAmount = selectedCategory ? Math.max(0, selectedCategory.price - couponDiscount) : 0;

  return (
    <div style={{ backgroundColor: '#FFF9F2', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Header Banner */}
      <div style={{ position: 'relative', height: '340px', backgroundColor: '#800020', overflow: 'hidden' }}>
        <img
          src={event.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=80'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 32px',
            background: 'linear-gradient(to top, rgba(45, 29, 32, 0.95), transparent)',
            color: '#FFF9F2'
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="burgundy">{event.eventType}</Badge>
              <Badge variant="published">{event.status}</Badge>
            </div>
            <h1 style={{ fontSize: '38px', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', color: '#FFF9F2' }}>
              {event.title}
            </h1>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px', color: '#F3E6D5' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCalendar size={16} />
                {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {event.venue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconMapPin size={16} />
                  {event.venue.name || 'Venue TBA'}, {event.venue.city || 'Convention Hall'}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconUsers size={16} />
                {event.availableSeats ?? event.capacity} Seats Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ maxWidth: '1280px', margin: '36px auto 0', padding: '0 32px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(128, 0, 32, 0.15)', paddingBottom: '12px', marginBottom: '32px' }}>
          {[
            { id: 'tickets', label: 'Tickets & Passes' },
            { id: 'agenda', label: 'Agenda & Sessions' },
            { id: 'sponsors', label: 'Sponsors' },
            { id: 'venue', label: 'Venue Information' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#800020' : '#F3E6D5',
                color: activeTab === tab.id ? '#FFF9F2' : '#800020',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Tickets & Passes */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
                Select Your Registration Tier
              </h2>
              <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
                All passes include credential badges, multi-track keynote access, and networking amenities.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {ticketCategories.map((cat) => (
                <div
                  key={cat._id}
                  style={{
                    backgroundColor: '#F3E6D5',
                    borderRadius: '20px',
                    border: '1px solid rgba(128, 0, 32, 0.2)',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(80, 22, 33, 0.06)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#D45060', letterSpacing: '0.06em' }}>
                        {cat.type}
                      </span>
                      <span style={{ fontSize: '12px', color: '#800020', fontWeight: 600 }}>
                        {cat.capacity - cat.sold} remaining
                      </span>
                    </div>

                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#800020', margin: '0 0 10px' }}>
                      {cat.name}
                    </h3>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#800020', marginBottom: '18px' }}>
                      ${cat.price}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#6e5961' }}> / attendee</span>
                    </div>

                    {cat.description && (
                      <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 20px', lineHeight: 1.5 }}>
                        {cat.description}
                      </p>
                    )}

                    <div style={{ borderTop: '1px solid rgba(128, 0, 32, 0.12)', paddingTop: '18px', marginBottom: '24px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '12px' }}>
                        Included Benefits:
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {cat.benefits?.map((benefit, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2d1d20' }}>
                            <IconCheckCircle size={15} className="text-[#800020]" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenRegistration(cat)}
                    style={{
                      width: '100%',
                      backgroundColor: '#800020',
                      color: '#FFF9F2',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Register for {cat.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Agenda & Sessions */}
        {activeTab === 'agenda' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
                Conference Sessions & Schedule
              </h2>
              <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
                Carefully orchestrated multi-track sessions with verified conflict-free room assignments.
              </p>
            </div>

            {sessions.length === 0 ? (
              <div style={{ backgroundColor: '#F3E6D5', padding: '36px', borderRadius: '16px', textAlign: 'center' }}>
                No sessions published yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sessions.map((sess) => (
                  <div
                    key={sess._id}
                    style={{
                      backgroundColor: '#F3E6D5',
                      borderRadius: '16px',
                      border: '1px solid rgba(128, 0, 32, 0.15)',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr',
                      gap: '24px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#800020' }}>
                        <IconClock size={16} />
                        {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6e5961', marginTop: '4px' }}>
                        Duration: {Math.round((new Date(sess.endTime) - new Date(sess.startTime)) / 60000)} mins
                      </div>
                      <div style={{ marginTop: '10px' }}>
                        <Badge variant="burgundy">{sess.sessionType}</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>
                        {sess.title}
                      </h3>
                      <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
                        {sess.description}
                      </p>

                      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#800020', fontWeight: 600 }}>
                        {sess.speaker && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IconUsers size={14} />
                            Speaker: {sess.speaker.firstName} {sess.speaker.lastName}
                          </span>
                        )}
                        {sess.room && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <IconMapPin size={14} />
                            Room: {sess.room.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sponsors */}
        {activeTab === 'sponsors' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
                Corporate Sponsors & Partners
              </h2>
              <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
                Industry partners supporting innovation at {event.title}.
              </p>
            </div>

            {sponsors.length === 0 ? (
              <div style={{ backgroundColor: '#F3E6D5', padding: '36px', borderRadius: '16px', textAlign: 'center' }}>
                Sponsor partnerships are currently being finalized.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                {sponsors.map((sp) => (
                  <div
                    key={sp._id}
                    style={{
                      backgroundColor: '#F3E6D5',
                      borderRadius: '16px',
                      border: '1px solid rgba(128, 0, 32, 0.15)',
                      padding: '24px',
                      textAlign: 'center'
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>
                      {sp.brandName}
                    </h3>
                    {sp.package && (
                      <div style={{ marginBottom: '12px' }}>
                        <Badge variant="burgundy">{sp.package.name || 'Corporate Partner'}</Badge>
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 16px', lineHeight: 1.5 }}>
                      {sp.description}
                    </p>
                    {sp.website && (
                      <a
                        href={sp.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '12px', fontWeight: 700, color: '#800020', textDecoration: 'underline' }}
                      >
                        Visit Partner Site →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Venue */}
        {activeTab === 'venue' && (
          <div style={{ backgroundColor: '#F3E6D5', borderRadius: '20px', padding: '32px', border: '1px solid rgba(128, 0, 32, 0.15)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 16px' }}>
              {event.venue?.name || 'Grand Convention Center'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6e5961', margin: '0 0 12px' }}>
                  <strong>Address:</strong> {event.venue?.address || '750 Howard Street'}, {event.venue?.city || 'San Francisco'}, {event.venue?.country || 'USA'}
                </p>
                <p style={{ fontSize: '14px', color: '#6e5961', margin: '0 0 20px' }}>
                  <strong>Total Facility Capacity:</strong> {event.venue?.capacity || 2500} attendees
                </p>
                <h4 style={{ fontSize: '14px', color: '#800020', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Venue Facilities
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#2d1d20' }}>
                  {(event.venue?.facilities || ['High-Speed Wi-Fi', 'Dolby Projection', 'Executive Green Room', 'Catering Deck']).map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconCheckCircle size={15} className="text-[#800020]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', height: '220px' }}>
                <img
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                  alt="Venue Hall"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title={registrationSuccess ? 'Registration Confirmed!' : `Register for ${event.title}`}
        subtitle={registrationSuccess ? 'Your digital badge and QR ticket are ready' : `Selected Tier: ${selectedCategory?.name} ($${selectedCategory?.price})`}
        maxWidth="680px"
      >
        {registrationSuccess ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e6f4ea', color: '#137333', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <IconCheckCircle size={32} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#800020', margin: '0 0 8px' }}>
              You're Officially Registered!
            </h3>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: '0 0 24px' }}>
              Your ticket number is <strong style={{ color: '#800020' }}>{registrationSuccess.ticket?.ticketNumber}</strong>. Present this QR code at the event check-in desk.
            </p>

            {/* Generated QR Code Badge */}
            {registrationSuccess.ticket?.qrCode && (
              <div style={{ display: 'inline-block', backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(128, 0, 32, 0.2)', marginBottom: '24px', boxShadow: '0 8px 24px rgba(80, 22, 33, 0.08)' }}>
                <img
                  src={registrationSuccess.ticket.qrCode}
                  alt="Ticket QR Code"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
                <div style={{ fontSize: '11px', color: '#800020', fontWeight: 700, marginTop: '10px' }}>
                  {registrationSuccess.ticket.ticketNumber}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  navigate('/dashboard');
                }}
                style={{
                  backgroundColor: '#800020',
                  color: '#FFF9F2',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Go to My Tickets
              </button>
            </div>
          </div>
        ) : (
          <div>
            {regError && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {regError}
              </div>
            )}

            {/* Session Multi-select */}
            {sessions.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '8px' }}>
                  Select Sessions to Attend (Optional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {sessions.map((s) => (
                    <label
                      key={s._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        backgroundColor: selectedSessions.includes(s._id) ? '#F3E6D5' : '#FFF9F2',
                        borderRadius: '10px',
                        border: '1px solid rgba(128, 0, 32, 0.15)',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(s._id)}
                        onChange={() => toggleSessionSelection(s._id)}
                        style={{ accentColor: '#800020' }}
                      />
                      <div style={{ fontSize: '13px', color: '#2d1d20' }}>
                        <span style={{ fontWeight: 700 }}>{s.title}</span> ({new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Coupon Code Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '8px' }}>
                Promo / Coupon Code (e.g. FORGE10 or VIP50)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter coupon code..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(128, 0, 32, 0.2)',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    background: '#FFF9F2'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  style={{
                    backgroundColor: '#F3E6D5',
                    color: '#800020',
                    border: '1px solid rgba(128, 0, 32, 0.2)',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {couponMessage && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: couponDiscount > 0 ? '#137333' : '#c5221f', fontWeight: 600 }}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={{ backgroundColor: '#F3E6D5', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6e5961', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>${selectedCategory?.price || 0}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#137333', fontWeight: 600, marginBottom: '6px' }}>
                  <span>Discount</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#800020', borderTop: '1px solid rgba(128, 0, 32, 0.15)', paddingTop: '10px' }}>
                <span>Total Due</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmRegistration}
              disabled={registering}
              style={{
                width: '100%',
                backgroundColor: '#800020',
                color: '#FFF9F2',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(128, 0, 32, 0.2)'
              }}
            >
              {registering ? 'Processing Registration...' : `Confirm Registration ($${finalAmount.toFixed(2)})`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
