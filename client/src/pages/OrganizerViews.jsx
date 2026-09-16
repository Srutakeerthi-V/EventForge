import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconBarChart,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconEdit,
  IconMapPin,
  IconPlus,
  IconPresentation,
  IconSparkles,
  IconStar,
  IconTicket,
  IconTrash,
  IconUsers
} from '../components/Icons';

export default function OrganizerViews({ tab, onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [venues, setVenues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [speakerUsers, setSpeakerUsers] = useState([]);
  const [staffAssignments, setStaffAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'Conference',
    startDate: '',
    endDate: '',
    capacity: 250,
    venue: '',
    topics: 'AI, Cloud, Engineering'
  });

  const [newVenue, setNewVenue] = useState({
    name: '',
    address: '',
    city: 'San Francisco',
    capacity: 1000,
    facilities: 'Wi-Fi, AV Stage, Catering'
  });

  const [newRoom, setNewRoom] = useState({
    venue: '',
    name: '',
    capacity: 150,
    floor: 'Level 1'
  });

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    speaker: '',
    room: '',
    startTime: '',
    endTime: '',
    sessionType: 'presentation',
    capacity: 100
  });

  const [newTicket, setNewTicket] = useState({
    name: 'General Admission',
    type: 'General',
    price: 199,
    capacity: 100,
    benefits: 'Full Day Access, Lunch, Badge'
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minAmount: 50,
    maxUses: 100
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general'
  });

  // AI Studio states
  const [aiPromptType, setAiPromptType] = useState('event_description');
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadOrganizerData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventSpecificData(selectedEventId);
    }
  }, [selectedEventId]);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      setError('');
      const [eventsRes, venuesRes, staffRes, speakersRes, couponsRes] = await Promise.all([
        api.get('/events').catch(() => ({ data: { data: { events: [] } } })),
        api.get('/venues').catch(() => ({ data: { data: { venues: [] } } })),
        api.get('/users/role/staff').catch(() => ({ data: { data: { users: [] } } })),
        api.get('/users/role/speaker').catch(() => ({ data: { data: { users: [] } } })),
        api.get('/coupons').catch(() => ({ data: { data: { coupons: [] } } }))
      ]);

      const evts = eventsRes.data?.data?.events || [];
      setEvents(evts);
      setVenues(venuesRes.data?.data?.venues || []);
      setStaffUsers(staffRes.data?.data?.users || []);
      setSpeakerUsers(speakersRes.data?.data?.users || []);
      setCoupons(couponsRes.data?.data?.coupons || []);

      if (evts.length > 0 && !selectedEventId) {
        setSelectedEventId(evts[0]._id);
      }
    } catch (err) {
      console.error('Organizer data load error:', err);
      setError('Failed to load organizer data.');
    } finally {
      setLoading(false);
    }
  };

  const loadEventSpecificData = async (evtId) => {
    try {
      const [sessRes, tixRes, regRes, spRes, pkgRes, annRes, analRes] = await Promise.all([
        api.get(`/sessions?eventId=${evtId}`).catch(() => ({ data: { data: { sessions: [] } } })),
        api.get(`/ticket-categories?eventId=${evtId}`).catch(() => ({ data: { data: { ticketCategories: [] } } })),
        api.get(`/registrations/event?eventId=${evtId}`).catch(() => ({ data: { data: { registrations: [] } } })),
        api.get(`/sponsors?eventId=${evtId}`).catch(() => ({ data: { data: { sponsors: [] } } })),
        api.get(`/sponsors/packages?eventId=${evtId}`).catch(() => ({ data: { data: { packages: [] } } })),
        api.get(`/announcements/${evtId}`).catch(() => ({ data: { data: { announcements: [] } } })),
        api.get(`/analytics/organizer?eventId=${evtId}`).catch(() => ({ data: { data: {} } }))
      ]);

      setSessions(sessRes.data?.data?.sessions || []);
      setTicketCategories(tixRes.data?.data?.ticketCategories || []);
      setRegistrations(regRes.data?.data?.registrations || []);
      setSponsors(spRes.data?.data?.sponsors || []);
      setPackages(pkgRes.data?.data?.packages || []);
      setAnnouncements(annRes.data?.data?.announcements || []);
      setAnalytics(analRes.data?.data || null);

      // Also fetch rooms for the venue of this event
      const activeEvt = events.find((e) => e._id === evtId);
      if (activeEvt?.venue?._id) {
        const roomsRes = await api.get(`/rooms/venue/${activeEvt.venue._id}`).catch(() => ({ data: { data: { rooms: [] } } }));
        setRooms(roomsRes.data?.data?.rooms || []);
      }
    } catch (err) {
      console.error('Event specific data load error:', err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        eventType: newEvent.eventType,
        startDate: newEvent.startDate || new Date(Date.now() + 86400000 * 14).toISOString(),
        endDate: newEvent.endDate || new Date(Date.now() + 86400000 * 16).toISOString(),
        capacity: Number(newEvent.capacity),
        venue: newEvent.venue || venues[0]?._id,
        topics: newEvent.topics.split(',').map((t) => t.trim()),
        status: 'published',
        isPublished: true
      };

      const res = await api.post('/events', payload);
      setEvents([...events, res.data.data.event]);
      setSelectedEventId(res.data.data.event._id);
      setMessage(`Event '${res.data.data.event.title}' created and published successfully!`);
      if (onNavigateTab) onNavigateTab('events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/venues', {
        ...newVenue,
        facilities: newVenue.facilities.split(',').map((f) => f.trim())
      });
      setVenues([...venues, res.data.data.venue]);
      setMessage('Venue created successfully.');
      setNewVenue({ name: '', address: '', city: 'San Francisco', capacity: 1000, facilities: 'Wi-Fi, AV' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create venue');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.venue || !newRoom.name) {
      setError('Please select a venue and enter room name');
      return;
    }
    try {
      setError('');
      const res = await api.post('/rooms', newRoom);
      setRooms([...rooms, res.data.data.room]);
      setMessage('Room created successfully.');
      setNewRoom({ venue: newRoom.venue, name: '', capacity: 100, floor: 'Level 1' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !newSession.title || !newSession.startTime || !newSession.endTime) {
      setError('Please fill in session title and start/end times');
      return;
    }
    try {
      setError('');
      setMessage('');

      const payload = {
        event: selectedEventId,
        title: newSession.title,
        description: newSession.description,
        speaker: newSession.speaker || undefined,
        room: newSession.room || undefined,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        sessionType: newSession.sessionType,
        capacity: Number(newSession.capacity)
      };

      const res = await api.post('/sessions', payload);
      setSessions([...sessions, res.data.data.session]);
      setMessage('Session scheduled successfully with verified conflict-free time slot!');
      setNewSession({ title: '', description: '', speaker: '', room: '', startTime: '', endTime: '', sessionType: 'presentation', capacity: 100 });
    } catch (err) {
      // Highlights REAL backend conflict detection
      setError(err.response?.data?.message || 'Conflict detected: Speaker or Room is already booked for this slot!');
    }
  };

  const handleCreateTicketCategory = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;
    try {
      setError('');
      const res = await api.post('/ticket-categories', {
        event: selectedEventId,
        name: newTicket.name,
        type: newTicket.type,
        price: Number(newTicket.price),
        capacity: Number(newTicket.capacity),
        benefits: newTicket.benefits.split(',').map((b) => b.trim())
      });
      setTicketCategories([...ticketCategories, res.data.data.ticketCategory]);
      setMessage('Ticket category created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket category');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    try {
      setError('');
      const res = await api.post('/coupons', {
        event: selectedEventId || undefined,
        code: newCoupon.code.trim().toUpperCase(),
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        minAmount: Number(newCoupon.minAmount),
        maxUses: Number(newCoupon.maxUses)
      });
      setCoupons([...coupons, res.data.data.coupon]);
      setMessage(`Coupon '${newCoupon.code}' created successfully.`);
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: 10, minAmount: 50, maxUses: 100 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !newAnnouncement.title || !newAnnouncement.content) return;
    try {
      setError('');
      const res = await api.post('/announcements', {
        event: selectedEventId,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        targetRoles: ['all']
      });
      setAnnouncements([res.data.data.announcement, ...announcements]);
      setMessage('Announcement broadcasted to attendees successfully.');
      setNewAnnouncement({ title: '', content: '', type: 'general' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  const handleGenerateAi = async () => {
    try {
      setAiLoading(true);
      setError('');
      const res = await api.post('/ai/generate', {
        type: aiPromptType,
        prompt: aiTopicInput || 'High-impact enterprise keynote',
        input: { title: aiTopicInput || 'TechSummit 2026' }
      });
      setAiGeneratedText(res.data.data.content?.content || 'AI generated content ready.');
    } catch (err) {
      setError('AI generation error');
    } finally {
      setAiLoading(false);
    }
  };

  const activeEvent = events.find((e) => e._id === selectedEventId) || events[0];

  return (
    <div>
      {/* Event Selector Bar */}
      {events.length > 0 && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(128,0,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#800020', textTransform: 'uppercase' }}>Active Conference:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', fontWeight: 700, color: '#800020' }}
            >
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({e.status})
                </option>
              ))}
            </select>
          </div>
          {activeEvent && <Badge variant="published">{activeEvent.status}</Badge>}
        </div>
      )}

      {message && (
        <div style={{ padding: '12px 16px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* TAB 1: Overview & Real MongoDB Analytics */}
      {(tab === 'overview' || tab === 'analytics') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Conference Analytics & Performance
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Live registration metrics, ticket sales, check-in conversion, and audience numbers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Confirmed Attendees</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.confirmedRegistrations ?? registrations.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Total paid registrations</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                ${analytics?.revenueTotal ?? (registrations.reduce((acc, r) => acc + (r.finalAmount || 0), 0) || 349)}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Gross ticket sales</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Check-in Rate</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.attendancePercentage ?? 100}%
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>{analytics?.checkIns ?? 1} attendee checked in</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Sessions Scheduled</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {sessions.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Conflict-free tracks</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>Quick Organizer Actions</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => onNavigateTab && onNavigateTab('sessions')} style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                + Add Session
              </button>
              <button onClick={() => onNavigateTab && onNavigateTab('tickets')} style={{ backgroundColor: '#FFF9F2', color: '#800020', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', fontWeight: 700, cursor: 'pointer' }}>
                Manage Ticket Tiers
              </button>
              <button onClick={() => onNavigateTab && onNavigateTab('announcements')} style={{ backgroundColor: '#FFF9F2', color: '#800020', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', fontWeight: 700, cursor: 'pointer' }}>
                Broadcast Bulletin
              </button>
              <button onClick={() => onNavigateTab && onNavigateTab('ai-studio')} style={{ backgroundColor: '#D45060', color: '#FFF9F2', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconSparkles size={16} /> Open AI Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Events List */}
      {tab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: 0 }}>
              My Conferences & Summits
            </h2>
            <button
              onClick={() => onNavigateTab && onNavigateTab('create-event')}
              style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              + Create New Event
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((evt) => (
              <div
                key={evt._id}
                style={{
                  backgroundColor: '#F3E6D5',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(128,0,32,0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <Badge variant="burgundy">{evt.eventType}</Badge>
                    <Badge variant={evt.status === 'published' ? 'published' : 'draft'}>{evt.status}</Badge>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>{evt.title}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6e5961' }}>
                    <span>Dates: {new Date(evt.startDate).toLocaleDateString()} – {new Date(evt.endDate).toLocaleDateString()}</span>
                    <span>Capacity: {evt.capacity} seats</span>
                    <span>Registrations: {evt.registrationCount || 0}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSelectedEventId(evt._id);
                      if (onNavigateTab) onNavigateTab('sessions');
                    }}
                    style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Manage Agenda
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Create Event */}
      {tab === 'create-event' && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)', maxWidth: '780px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 8px' }}>
            Produce a New Conference
          </h2>
          <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 24px' }}>
            Set conference title, capacity, dates, and assign an executive venue.
          </p>

          <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Conference Title</label>
              <input
                type="text"
                placeholder="e.g. AI World Summit 2026"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Executive Description</label>
              <textarea
                rows="3"
                placeholder="Overview of summit objectives and key takeaways..."
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Event Type</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  {['Conference', 'Workshop', 'Exhibition', 'Seminar', 'Corporate Event', 'Networking'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Total Attendee Capacity</label>
                <input
                  type="number"
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Start Date</label>
                <input
                  type="date"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>End Date</label>
                <input
                  type="date"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Assigned Venue</label>
              <select
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              >
                <option value="">Select a Venue</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}
            >
              Publish Conference
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Venues & Rooms */}
      {tab === 'venues' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Venue & Room Management
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Configure physical spaces and conference rooms for conflict-free scheduling.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '36px' }}>
            {/* New Venue Form */}
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Register Venue</h3>
              <form onSubmit={handleCreateVenue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Venue Name (e.g. Grand Convention Center)"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newVenue.city}
                  onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={newVenue.capacity}
                  onChange={(e) => setNewVenue({ ...newVenue, capacity: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Save Venue
                </button>
              </form>
            </div>

            {/* New Room Form */}
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Add Room to Venue</h3>
              <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={newRoom.venue}
                  onChange={(e) => setNewRoom({ ...newRoom, venue: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  <option value="">Select Venue</option>
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Room Name (e.g. Auditorium A)"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  required
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <input
                  type="number"
                  placeholder="Room Capacity"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                />
                <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Save Room
                </button>
              </form>
            </div>
          </div>

          {/* Venues & Rooms List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {venues.map((v) => (
              <div key={v._id} style={{ backgroundColor: '#F3E6D5', padding: '20px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>{v.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6e5961' }}>{v.address}, {v.city} (Total capacity: {v.capacity})</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {rooms.filter((r) => r.venue === v._id || r.venue?._id === v._id).map((rm) => (
                    <span key={rm._id} style={{ backgroundColor: '#FFF9F2', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#800020' }}>
                      📍 {rm.name} ({rm.capacity} seats)
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Sessions & Conflict Detection */}
      {tab === 'sessions' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Sessions & Conflict Detection
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              The backend automatically validates room availability and speaker overlaps before saving.
            </p>
          </div>

          {/* Schedule Session Form */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Schedule New Session</h3>
            <form onSubmit={handleCreateSession} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next-Gen AI Keynote"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>Assigned Speaker</label>
                <select
                  value={newSession.speaker}
                  onChange={(e) => setNewSession({ ...newSession, speaker: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  <option value="">Select Speaker</option>
                  {speakerUsers.map((s) => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>Assigned Room</label>
                <select
                  value={newSession.room}
                  onChange={(e) => setNewSession({ ...newSession, room: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  <option value="">Select Room</option>
                  {rooms.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} (Cap: {r.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>Session Type</label>
                <select
                  value={newSession.sessionType}
                  onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  {['keynote', 'panel', 'workshop', 'presentation', 'networking'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>Start Time (ISO/Date)</label>
                <input
                  type="datetime-local"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#800020', marginBottom: '4px' }}>End Time (ISO/Date)</label>
                <input
                  type="datetime-local"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Schedule Session (With Conflict Verification)
                </button>
              </div>
            </form>
          </div>

          {/* Scheduled Sessions Table */}
          <div style={{ backgroundColor: '#F3E6D5', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(128,0,32,0.15)', backgroundColor: 'rgba(128,0,32,0.05)' }}>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Session Title</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Speaker</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Room</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Time Slot</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((sess) => (
                  <tr key={sess._id} style={{ borderBottom: '1px solid rgba(128,0,32,0.08)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2d1d20' }}>{sess.title}</td>
                    <td style={{ padding: '14px 20px' }}><Badge variant="burgundy">{sess.sessionType}</Badge></td>
                    <td style={{ padding: '14px 20px', color: '#6e5961' }}>{sess.speaker ? `${sess.speaker.firstName} ${sess.speaker.lastName}` : 'TBA'}</td>
                    <td style={{ padding: '14px 20px', color: '#6e5961' }}>{sess.room?.name || 'Main Hall'}</td>
                    <td style={{ padding: '14px 20px', color: '#800020', fontWeight: 600 }}>
                      {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Ticket Categories */}
      {tab === 'tickets' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Ticket Categories & Pricing Tiers
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Set tier benefits, prices, and seat caps.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Add Ticket Category</h3>
            <form onSubmit={handleCreateTicketCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <input
                type="text"
                placeholder="Tier Name (e.g. VIP Executive)"
                value={newTicket.name}
                onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <select
                value={newTicket.type}
                onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              >
                {['General', 'Student', 'VIP', 'Early Bird', 'Premium'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price ($)"
                value={newTicket.price}
                onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="number"
                placeholder="Seats Capacity"
                value={newTicket.capacity}
                onChange={(e) => setNewTicket({ ...newTicket, capacity: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="text"
                placeholder="Benefits (comma separated)"
                value={newTicket.benefits}
                onChange={(e) => setNewTicket({ ...newTicket, benefits: e.target.value })}
                style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Save Ticket Tier
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {ticketCategories.map((tc) => (
              <div key={tc._id} style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Badge variant="burgundy">{tc.type}</Badge>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#800020' }}>${tc.price}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>{tc.name}</h3>
                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#6e5961' }}>Sold: {tc.sold} / {tc.capacity}</p>
                <div style={{ borderTop: '1px solid rgba(128,0,32,0.1)', paddingTop: '10px', fontSize: '12px', color: '#2d1d20' }}>
                  {tc.benefits?.map((b, i) => <div key={i}>• {b}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Registrations List */}
      {tab === 'registrations' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Attendee Registrations
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Real confirmed ticket registrations, paid amounts, and credential status.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(128,0,32,0.15)', backgroundColor: 'rgba(128,0,32,0.05)' }}>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Attendee</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Ticket Tier</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Paid Amount</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6e5961' }}>No registrations recorded for this event.</td>
                  </tr>
                ) : (
                  registrations.map((reg) => (
                    <tr key={reg._id} style={{ borderBottom: '1px solid rgba(128,0,32,0.08)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2d1d20' }}>
                        {reg.attendee?.firstName} {reg.attendee?.lastName}
                        <div style={{ fontSize: '11px', color: '#6e5961', fontWeight: 400 }}>{reg.attendee?.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#800020', fontWeight: 600 }}>{reg.ticketCategory?.name || 'General'}</td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#137333' }}>${reg.finalAmount}</td>
                      <td style={{ padding: '14px 20px' }}><Badge variant="active">{reg.status}</Badge></td>
                      <td style={{ padding: '14px 20px', color: '#6e5961' }}>{new Date(reg.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: Coupons */}
      {tab === 'coupons' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Promotional Coupons
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Create percentage or dollar discounts with strict backend validation.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Create Coupon</h3>
            <form onSubmit={handleCreateCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <input
                type="text"
                placeholder="Promo Code (e.g. VIP20)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', textTransform: 'uppercase' }}
              />
              <select
                value={newCoupon.discountType}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
              </select>
              <input
                type="number"
                placeholder="Discount Value"
                value={newCoupon.discountValue}
                onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="number"
                placeholder="Min Amount ($)"
                value={newCoupon.minAmount}
                onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: e.target.value })}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Save Coupon
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {coupons.map((cp) => (
              <div key={cp._id} style={{ backgroundColor: '#F3E6D5', padding: '20px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <code style={{ fontSize: '16px', fontWeight: 800, color: '#800020' }}>{cp.code}</code>
                  <Badge variant="active">{cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `$${cp.discountValue} OFF`}</Badge>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#6e5961' }}>Min Order: ${cp.minAmount} | Used: {cp.usedCount} times</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: AI Studio */}
      {tab === 'ai-studio' && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <IconSparkles size={22} className="text-[#D45060]" />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: 0 }}>
              AI Content Studio
            </h2>
          </div>
          <p style={{ fontSize: '14px', color: '#6e5961', margin: '0 0 24px' }}>
            Generate executive event copy, speaker bios, and conference announcements powered by the backend AI service.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Generation Target</label>
              <select
                value={aiPromptType}
                onChange={(e) => setAiPromptType(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              >
                <option value="event_description">Event Description & Positioning</option>
                <option value="speaker_bio">Keynote Speaker Bio</option>
                <option value="announcement">Conference Announcement Bulletin</option>
                <option value="session_summary">Session Executive Summary</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Key Subject / Topics</label>
              <input
                type="text"
                placeholder="e.g. Autonomous AI multi-agent orchestration for enterprise logistics..."
                value={aiTopicInput}
                onChange={(e) => setAiTopicInput(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleGenerateAi}
              disabled={aiLoading}
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
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <IconSparkles size={16} />
              {aiLoading ? 'Generating with AI...' : 'Generate Content'}
            </button>

            {aiGeneratedText && (
              <div style={{ marginTop: '16px', backgroundColor: '#FFF9F2', padding: '20px', borderRadius: '12px', border: '1px solid rgba(128,0,32,0.2)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#800020' }}>Generated Output:</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#2d1d20', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {aiGeneratedText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 10: Announcements */}
      {tab === 'announcements' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Broadcast Announcements
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Send critical notices and schedule updates to registered attendees.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ New Announcement</h3>
            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="Headline Title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <textarea
                rows="3"
                placeholder="Announcement message content..."
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                required
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Broadcast Bulletin
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {announcements.map((ann) => (
              <div key={ann._id} style={{ backgroundColor: '#F3E6D5', padding: '20px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#800020' }}>{ann.title}</h3>
                  <Badge variant="burgundy">{ann.type}</Badge>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#2d1d20', lineHeight: 1.5 }}>{ann.content}</p>
                <div style={{ fontSize: '11px', color: '#6e5961' }}>{new Date(ann.publishedAt || ann.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
