import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import { IconCalendar, IconMapPin, IconSearch, IconUsers } from '../components/Icons';

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Conference', 'Workshop', 'Exhibition', 'Seminar', 'Corporate Event', 'Networking'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        let url = '/events';
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedType !== 'All') params.append('eventType', selectedType);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await api.get(url);
        setEvents(res.data.data.events || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [search, selectedType]);

  return (
    <div style={{ backgroundColor: '#FFF9F2', minHeight: '100vh', padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D45060', fontWeight: 700 }}>
            Catalog
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '36px', fontWeight: 900, color: '#800020' }}>
            Explore Corporate Events & Summits
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#6e5961' }}>
            Discover upcoming industry conferences, multi-track workshops, and executive symposiums.
          </p>
        </div>

        {/* Filters Bar */}
        <div
          style={{
            backgroundColor: '#F3E6D5',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(128, 0, 32, 0.15)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '36px'
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF9F2', padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(128, 0, 32, 0.15)', flex: '1', minWidth: '240px' }}>
            <IconSearch size={16} className="text-[#800020]" />
            <input
              type="text"
              placeholder="Search by conference title or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '13px', color: '#2d1d20' }}
            />
          </div>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: selectedType === type ? '#800020' : '#FFF9F2',
                  color: selectedType === type ? '#FFF9F2' : '#800020',
                  boxShadow: selectedType === type ? '0 4px 10px rgba(128, 0, 32, 0.2)' : 'none'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6e5961' }}>Loading events...</div>
        ) : events.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              backgroundColor: '#F3E6D5',
              borderRadius: '20px',
              border: '1px solid rgba(128, 0, 32, 0.15)'
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: '#800020' }}>No Conferences Found</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6e5961' }}>Try adjusting your search criteria or type filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
            {events.map((evt) => (
              <div
                key={evt._id}
                onClick={() => navigate(`/events/${evt._id}`)}
                style={{
                  backgroundColor: '#F3E6D5',
                  borderRadius: '20px',
                  border: '1px solid rgba(128, 0, 32, 0.15)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(80, 22, 33, 0.06)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ height: '190px', position: 'relative' }}>
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
                    <h3 style={{ margin: '0 0 8px', fontSize: '19px', fontWeight: 800, color: '#800020' }}>
                      {evt.title}
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6e5961', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {evt.description}
                    </p>

                    {evt.topics && evt.topics.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {evt.topics.slice(0, 3).map((topic, i) => (
                          <span key={i} style={{ background: '#FFF9F2', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#800020', fontWeight: 600 }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#800020', fontWeight: 600, borderTop: '1px solid rgba(128, 0, 32, 0.1)', paddingTop: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconCalendar size={14} />
                        {new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconUsers size={14} />
                        {evt.availableSeats ?? evt.capacity} Seats Left
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
                        padding: '11px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      View Details & Tickets
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
