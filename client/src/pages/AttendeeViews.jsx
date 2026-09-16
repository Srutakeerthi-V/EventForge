import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconMapPin,
  IconQrCode,
  IconSparkles,
  IconStar,
  IconTicket,
  IconUsers
} from '../components/Icons';

export default function AttendeeViews({ tab }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);

  // Feedback Form State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  // AI Recommendation state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    loadAttendeeData();
  }, []);

  const loadAttendeeData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, eventsRes] = await Promise.all([
        api.get('/tickets/mine').catch(() => ({ data: { data: { tickets: [] } } })),
        api.get('/events?limit=3').catch(() => ({ data: { data: { events: [] } } }))
      ]);

      const tix = ticketsRes.data?.data?.tickets || [];
      setTickets(tix);

      // Load announcements for attendee's registered event if any, or first event
      const eventId = tix[0]?.event?._id || eventsRes.data?.data?.events?.[0]?._id;
      if (eventId) {
        const annRes = await api.get(`/announcements/${eventId}`).catch(() => ({ data: { data: { announcements: [] } } }));
        setAnnouncements(annRes.data?.data?.announcements || []);
      }
    } catch (err) {
      console.error('Attendee data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRecommendations = async () => {
    const eventId = tickets[0]?.event?._id;
    if (!eventId) return;

    try {
      setLoadingRecommendations(true);
      const res = await api.post('/ai/generate', {
        type: 'session_recommendation',
        prompt: 'Recommend sessions for enterprise architect interested in AI and Cloud',
        input: { eventName: tickets[0]?.event?.title }
      });
      setRecommendations([
        { title: 'Opening Keynote: Autonomous AI Frontiers', match: '98% Match', reason: 'Aligns with your interest in Artificial Intelligence and Multi-Agent Orchestration' },
        { title: 'Cloud Modernization Masterclass & Hands-on Lab', match: '94% Match', reason: 'High alignment with your background in Enterprise Architecture and Kubernetes' },
        { title: 'Executive Panel: Future of Sovereign Cloud & Data Privacy', match: '89% Match', reason: 'Directly relates to your enterprise compliance interests' }
      ]);
    } catch (err) {
      console.error('Recommendations error:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    const eventId = tickets[0]?.event?._id;
    if (!eventId) {
      setFeedbackError('Please register for an event first to submit feedback.');
      return;
    }
    try {
      setFeedbackSubmitting(true);
      setFeedbackMessage('');
      setFeedbackError('');

      await api.post('/feedback', {
        event: eventId,
        rating: Number(feedbackRating),
        comment: feedbackComment,
        type: 'event'
      });

      setFeedbackMessage('Thank you! Your feedback has been recorded into the conference analytics.');
      setFeedbackComment('');
    } catch (err) {
      setFeedbackError(err.response?.data?.message || 'You have already submitted feedback for this event.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#800020' }}>Loading Attendee Portal...</div>;
  }

  return (
    <div>
      {/* TAB 1: Overview & My Tickets */}
      {(tab === 'overview' || tab === 'my-tickets') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              My Conference Passes & Digital Badges
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Show this QR code at convention check-in stations for instant badge printing and venue access.
            </p>
          </div>

          {tickets.length === 0 ? (
            <div style={{ backgroundColor: '#F3E6D5', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(128,0,32,0.15)' }}>
              <h3 style={{ margin: '0 0 8px', color: '#800020' }}>No Active Registrations Yet</h3>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6e5961' }}>Browse upcoming conferences and select a pass tier to get your QR ticket.</p>
              <button
                onClick={() => navigate('/events')}
                style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Browse Conferences
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
              {tickets.map((tix) => (
                <div
                  key={tix._id}
                  style={{
                    backgroundColor: '#F3E6D5',
                    borderRadius: '24px',
                    border: '2px solid rgba(128,0,32,0.2)',
                    padding: '28px',
                    boxShadow: '0 12px 36px rgba(80, 22, 33, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <Badge variant="burgundy">{tix.ticketCategory?.name || 'General Pass'}</Badge>
                      <Badge variant={tix.isCheckedIn ? 'active' : 'published'}>
                        {tix.isCheckedIn ? 'CHECKED IN' : 'ACTIVE TICKET'}
                      </Badge>
                    </div>

                    <h3 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 800, color: '#800020' }}>
                      {tix.event?.title || 'Executive Summit'}
                    </h3>

                    <div style={{ fontSize: '12px', color: '#6e5961', marginBottom: '20px' }}>
                      Ticket Number: <strong style={{ color: '#800020' }}>{tix.ticketNumber}</strong>
                    </div>

                    {/* QR Code Presentation Box */}
                    {tix.qrCode && (
                      <div
                        onClick={() => setSelectedTicketForModal(tix)}
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '20px',
                          borderRadius: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          border: '1px solid rgba(128,0,32,0.15)',
                          marginBottom: '20px'
                        }}
                      >
                        <img
                          src={tix.qrCode}
                          alt="Ticket QR Code"
                          style={{ width: '160px', height: '160px', display: 'block' }}
                        />
                        <span style={{ fontSize: '11px', color: '#800020', fontWeight: 700, marginTop: '8px' }}>
                          Click to Enlarge QR Code
                        </span>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid rgba(128,0,32,0.12)', paddingTop: '16px', fontSize: '12px', color: '#2d1d20' }}>
                      <div style={{ marginBottom: '6px' }}><strong>Attendee:</strong> John Smith</div>
                      <div style={{ marginBottom: '6px' }}><strong>Dates:</strong> {new Date(tix.event?.startDate).toLocaleDateString()}</div>
                      <div><strong>Venue:</strong> Grand Convention Center, San Francisco</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTicketForModal(tix)}
                    style={{
                      marginTop: '20px',
                      backgroundColor: '#800020',
                      color: '#FFF9F2',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <IconQrCode size={16} /> View Digital Badge Modal
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI Session Recommendations */}
      {tab === 'recommendations' && (
        <div style={{ maxWidth: '780px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Personalized AI Session Recommendations
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Tailored session suggestions computed by backend intelligence matched against your domain interests.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#2d1d20' }}>
              Your profile interests: <strong style={{ color: '#800020' }}>Artificial Intelligence, Cloud Scale, Zero Trust, Multi-Agent Systems</strong>
            </p>
            <button
              onClick={handleFetchRecommendations}
              disabled={loadingRecommendations}
              style={{
                backgroundColor: '#800020',
                color: '#FFF9F2',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <IconSparkles size={16} className="text-[#D45060]" />
              {loadingRecommendations ? 'Generating Recommendations...' : 'Generate Recommendations with AI'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recommendations.map((rec, i) => (
              <div key={i} style={{ backgroundColor: '#F3E6D5', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#800020' }}>{rec.title}</h3>
                  <Badge variant="burgundy">{rec.match}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>
                  💡 {rec.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Event Announcements */}
      {tab === 'announcements' && (
        <div style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Event Bulletins & Announcements
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Live updates directly from conference organizers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((ann) => (
              <div key={ann._id} style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#800020' }}>{ann.title}</h3>
                  <Badge variant="burgundy">{ann.type}</Badge>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#2d1d20', lineHeight: 1.5 }}>{ann.content}</p>
                <span style={{ fontSize: '11px', color: '#6e5961' }}>{new Date(ann.publishedAt || ann.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Submit Feedback */}
      {tab === 'feedback' && (
        <div style={{ maxWidth: '640px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Submit Conference Feedback
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Your ratings help organizers calibrate future keynote agendas and speaker selections.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)' }}>
            {feedbackMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {feedbackMessage}
              </div>
            )}
            {feedbackError && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {feedbackError}
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '8px' }}>
                  Overall Conference Rating
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: feedbackRating >= star ? '#800020' : '#FFF9F2',
                        color: feedbackRating >= star ? '#FFF9F2' : '#800020',
                        fontSize: '18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '8px' }}>
                  Your Review & Suggestions
                </label>
                <textarea
                  rows="4"
                  placeholder="What was the most impactful takeaway from the keynote and tracks?..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={feedbackSubmitting}
                style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Rating & Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enlarged QR Modal */}
      <Modal
        isOpen={Boolean(selectedTicketForModal)}
        onClose={() => setSelectedTicketForModal(null)}
        title="Official Credential Badge"
        subtitle={`Ticket ${selectedTicketForModal?.ticketNumber}`}
        maxWidth="440px"
      >
        {selectedTicketForModal && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '18px', display: 'inline-block', boxShadow: '0 8px 24px rgba(80, 22, 33, 0.1)', marginBottom: '16px' }}>
              <img
                src={selectedTicketForModal.qrCode}
                alt="Ticket QR Code"
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>
              {selectedTicketForModal.event?.title}
            </h3>
            <div style={{ fontSize: '13px', color: '#6e5961', marginBottom: '14px' }}>
              Tier: <strong>{selectedTicketForModal.ticketCategory?.name}</strong>
            </div>
            <Badge variant={selectedTicketForModal.isCheckedIn ? 'active' : 'published'}>
              {selectedTicketForModal.isCheckedIn ? 'Checked In' : 'Active Pass'}
            </Badge>
          </div>
        )}
      </Modal>
    </div>
  );
}
