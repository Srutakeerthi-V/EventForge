import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconLayers,
  IconMapPin,
  IconPresentation,
  IconUsers
} from '../components/Icons';

export default function SpeakerViews({ tab }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    designation: '',
    company: '',
    bio: '',
    expertise: '',
    linkedin: '',
    website: ''
  });
  const [sessions, setSessions] = useState([]);
  const [materials, setMaterials] = useState([
    { title: 'Keynote Slides: Autonomous AI Frontiers', type: 'slides', url: 'https://example.com/slides-keynote.pdf' }
  ]);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'slides' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpeakerData();
  }, []);

  const loadSpeakerData = async () => {
    try {
      setLoading(true);
      const [profileRes, sessionsRes] = await Promise.all([
        api.get('/speakers/me').catch(() => ({ data: { data: { profile: null } } })),
        api.get('/sessions/mine').catch(() => ({ data: { data: { sessions: [] } } }))
      ]);

      const prof = profileRes.data?.data?.profile;
      if (prof) {
        setProfile({
          designation: prof.designation || '',
          company: prof.company || '',
          bio: prof.bio || '',
          expertise: Array.isArray(prof.expertise) ? prof.expertise.join(', ') : '',
          linkedin: prof.linkedin || '',
          website: prof.website || ''
        });
      }
      setSessions(sessionsRes.data?.data?.sessions || []);
    } catch (err) {
      console.error('Speaker load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      await api.put('/speakers/me', {
        ...profile,
        expertise: profile.expertise.split(',').map((e) => e.trim())
      });
      setMessage('Speaker profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update speaker profile');
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.url) return;
    setMaterials([...materials, newMaterial]);
    setNewMaterial({ title: '', url: '', type: 'slides' });
    setMessage('Presentation asset linked successfully.');
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#800020' }}>Loading Speaker Portal...</div>;
  }

  return (
    <div>
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

      {/* TAB 1: Overview & Sessions */}
      {(tab === 'overview' || tab === 'sessions') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Speaker Dashboard & Assigned Sessions
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Review your keynote stages, time slots, and room locations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Keynotes & Tracks</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>{sessions.length || 1}</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Scheduled presentations</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Presentation Slides</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>{materials.length}</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Uploaded slide decks</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sessions.map((sess) => (
              <div key={sess._id} style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Badge variant="burgundy">{sess.sessionType}</Badge>
                  <span style={{ fontSize: '12px', color: '#800020', fontWeight: 700 }}>
                    {new Date(sess.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(sess.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>{sess.title}</h3>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6e5961', lineHeight: 1.5 }}>{sess.description}</p>
                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#800020', fontWeight: 600 }}>
                  <span>📍 Room: {sess.room?.name || 'Grand Auditorium'}</span>
                  <span>🗓 Date: {new Date(sess.startTime).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Profile */}
      {tab === 'profile' && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)', maxWidth: '680px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
            Speaker Profile & Credentials
          </h2>
          <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 24px' }}>
            This information will appear in the official conference agenda and program brochure.
          </p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Professional Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Principal AI Researcher"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Organization / Company</label>
                <input
                  type="text"
                  placeholder="e.g. TechInnovate Systems"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Executive Bio</label>
              <textarea
                rows="4"
                placeholder="Brief third-person biography highlighting key credentials and achievements..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Domain Expertise (comma separated)</label>
              <input
                type="text"
                placeholder="Artificial Intelligence, Autonomous Agents, Cloud Scale"
                value={profile.expertise}
                onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
              Save Speaker Profile
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Presentation Materials */}
      {tab === 'materials' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Presentation Materials & Slide Decks
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Attach slides, handouts, and video assets for attendees and AV staff.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Link New Deck or File</h3>
            <form onSubmit={handleAddMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Title (e.g. Keynote Slides PDF)"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="url"
                placeholder="URL (e.g. https://...)"
                value={newMaterial.url}
                onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Attach Material
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {materials.map((m, i) => (
              <div key={i} style={{ backgroundColor: '#F3E6D5', padding: '18px 22px', borderRadius: '14px', border: '1px solid rgba(128,0,32,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#800020' }}>{m.title}</h4>
                  <a href={m.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6e5961', textDecoration: 'underline' }}>{m.url}</a>
                </div>
                <Badge variant="burgundy">{m.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
