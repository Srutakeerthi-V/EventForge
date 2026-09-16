import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconLayers
} from '../components/Icons';

export default function SponsorViews({ tab }) {
  const [loading, setLoading] = useState(true);
  const [sponsorData, setSponsorData] = useState(null);
  const [brandProfile, setBrandProfile] = useState({
    brandName: '',
    website: '',
    description: '',
    logo: ''
  });
  const [deliverables, setDeliverables] = useState([]);
  const [assets, setAssets] = useState([
    { title: 'Vector Brand Logo (SVG)', type: 'logo', url: 'https://techcorp.example.com/logo.svg' },
    { title: 'Keynote Backdrop Banner (4K)', type: 'banner', url: 'https://techcorp.example.com/banner.png' }
  ]);
  const [newAsset, setNewAsset] = useState({ title: '', type: 'logo', url: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSponsorData();
  }, []);

  const loadSponsorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sponsors/mine').catch(() => ({ data: { data: { sponsor: null } } }));
      const sp = res.data?.data?.sponsor || res.data?.data?.sponsors?.[0];

      if (sp) {
        setSponsorData(sp);
        setBrandProfile({
          brandName: sp.brandName || '',
          website: sp.website || '',
          description: sp.description || '',
          logo: sp.logo || ''
        });

        // Load deliverables
        if (sp._id) {
          const delRes = await api.get(`/sponsors/${sp._id}/deliverables`).catch(() => ({ data: { data: { deliverables: [] } } }));
          setDeliverables(delRes.data?.data?.deliverables || []);
        }
      } else {
        // Default seeded values
        setBrandProfile({
          brandName: 'TechCorp Solutions Inc.',
          website: 'https://techcorp.example.com',
          description: 'Global enterprise software and cloud optimization partner.',
          logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
        });
        setDeliverables([
          { _id: '1', title: 'High-Resolution Brand Assets for Main Screen', dueDate: new Date(Date.now() + 86400000 * 15), status: 'completed' },
          { _id: '2', title: 'Expo Showcase Booth Equipment Checklist', dueDate: new Date(Date.now() + 86400000 * 20), status: 'pending' },
          { _id: '3', title: 'Keynote Speaker Introduction Slide Deck', dueDate: new Date(Date.now() + 86400000 * 25), status: 'in_progress' }
        ]);
      }
    } catch (err) {
      console.error('Sponsor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      if (sponsorData?._id) {
        await api.put(`/sponsors/${sponsorData._id}`, brandProfile);
      }
      setMessage('Brand information updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update brand profile');
    }
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.title || !newAsset.url) return;
    setAssets([...assets, newAsset]);
    setNewAsset({ title: '', type: 'logo', url: '' });
    setMessage('Brand asset registered successfully.');
  };

  const toggleDeliverableStatus = (delId) => {
    setDeliverables(
      deliverables.map((d) =>
        d._id === delId
          ? { ...d, status: d.status === 'completed' ? 'pending' : 'completed' }
          : d
      )
    );
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#800020' }}>Loading Sponsor Portal...</div>;
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

      {/* TAB 1: Overview & Events */}
      {(tab === 'overview' || tab === 'events') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Corporate Sponsor Hub
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Manage brand exposure, deliverables deadlines, and conference partner benefits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Partner Tier</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#800020' }}>Gold Partner</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>TechSummit 2026</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Deliverables Done</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#137333' }}>
                {deliverables.filter((d) => d.status === 'completed').length} / {deliverables.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Key milestones completed</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Expo Booth Space</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#800020' }}>Booth #G-14</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Level 1 Convention Floor</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: 800, color: '#800020' }}>Partner Package Privileges</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#2d1d20' }}>
              <li>✓ Premium 10x10 Expo Booth</li>
              <li>✓ Logo on main stage screen and live streams</li>
              <li>✓ 4 Complimentary VIP Passes for staff</li>
              <li>✓ Sponsor spotlight in keynote program guide</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Brand Profile */}
      {tab === 'brand-profile' && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
            Brand Information
          </h2>
          <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 24px' }}>
            Brand details displayed on the event detail showcase.
          </p>

          <form onSubmit={handleUpdateBrand} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Brand Name</label>
              <input
                type="text"
                value={brandProfile.brandName}
                onChange={(e) => setBrandProfile({ ...brandProfile, brandName: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Official Website</label>
              <input
                type="url"
                value={brandProfile.website}
                onChange={(e) => setBrandProfile({ ...brandProfile, website: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>Company Description</label>
              <textarea
                rows="3"
                value={brandProfile.description}
                onChange={(e) => setBrandProfile({ ...brandProfile, description: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
              Save Brand Info
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Deliverables Tracker */}
      {tab === 'deliverables' && (
        <div style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Sponsorship Deliverables Tracker
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Track due dates and submit collateral to conference organizers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {deliverables.map((del) => (
              <div
                key={del._id}
                style={{
                  backgroundColor: '#F3E6D5',
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(128,0,32,0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>{del.title}</h4>
                  <div style={{ fontSize: '12px', color: '#6e5961' }}>
                    Due: {new Date(del.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Badge variant={del.status === 'completed' ? 'active' : 'draft'}>{del.status}</Badge>
                  <button
                    onClick={() => toggleDeliverableStatus(del._id)}
                    style={{
                      backgroundColor: del.status === 'completed' ? '#FFF9F2' : '#800020',
                      color: del.status === 'completed' ? '#800020' : '#FFF9F2',
                      border: '1px solid #800020',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {del.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Brand Assets */}
      {tab === 'assets' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Brand Assets & Media Collateral
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Provide vector logos and display assets for main screen projection.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>+ Register Asset</h3>
            <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Asset Title (e.g. 4K Backdrop Banner)"
                value={newAsset.title}
                onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="url"
                placeholder="Asset URL (e.g. https://...)"
                value={newAsset.url}
                onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button type="submit" style={{ backgroundColor: '#800020', color: '#FFF9F2', padding: '10px 18px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Register Asset
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {assets.map((ast, i) => (
              <div key={i} style={{ backgroundColor: '#F3E6D5', padding: '18px 22px', borderRadius: '14px', border: '1px solid rgba(128,0,32,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#800020' }}>{ast.title}</h4>
                  <a href={ast.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#6e5961', textDecoration: 'underline' }}>{ast.url}</a>
                </div>
                <Badge variant="burgundy">{ast.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
