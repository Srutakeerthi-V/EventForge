import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconBarChart,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconEdit,
  IconLayers,
  IconPlus,
  IconSearch,
  IconSettings,
  IconShield,
  IconTicket,
  IconTrash,
  IconUsers
} from '../components/Icons';

export default function AdminViews({ tab }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // User filter state
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New org modal / form state
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const [usersRes, orgsRes, eventsRes, analyticsRes] = await Promise.all([
        api.get('/users?limit=100').catch(() => ({ data: { data: { users: [] } } })),
        api.get('/organizations').catch(() => ({ data: { data: { organizations: [] } } })),
        api.get('/events').catch(() => ({ data: { data: { events: [] } } })),
        api.get('/analytics/admin').catch(() => ({ data: { data: {} } }))
      ]);

      setUsers(usersRes.data?.data?.users || []);
      setOrganizations(orgsRes.data?.data?.organizations || []);
      setEvents(eventsRes.data?.data?.events || []);
      setAnalytics(analyticsRes.data?.data || null);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      await api.put(`/users/${user._id}`, { isActive: newStatus });
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u)));
      setMessage(`User ${user.firstName} ${newStatus ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrgName) return;
    try {
      setCreatingOrg(true);
      const res = await api.post('/organizations', { name: newOrgName, industry: newOrgIndustry });
      setOrganizations([...organizations, res.data.data.organization]);
      setNewOrgName('');
      setNewOrgIndustry('');
      setMessage('Organization created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#800020' }}>Loading Admin Console...</div>;
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ padding: '10px 0' }}>
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

      {/* TAB 1: Platform Overview */}
      {(tab === 'overview' || tab === 'analytics') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Platform Overview & Infrastructure Metrics
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Live aggregate statistics across organizations, users, conferences, and registrations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020' }}>Total Users</span>
                <IconUsers size={20} className="text-[#800020]" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.totalUsers ?? users.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Active across 6 enterprise roles</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020' }}>Organizations</span>
                <IconBuilding size={20} className="text-[#800020]" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.totalOrganizations ?? organizations.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Enterprise event producers</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020' }}>Total Events</span>
                <IconCalendar size={20} className="text-[#800020]" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.totalEvents ?? events.length}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Published & in-progress summits</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020' }}>Registrations</span>
                <IconTicket size={20} className="text-[#800020]" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#800020' }}>
                {analytics?.totalRegistrations ?? 1}
              </div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Issued digital QR credentials</span>
            </div>
          </div>

          {/* User Distribution by Role */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '28px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 800, color: '#800020' }}>
              System User Breakdown by Role
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
              {['PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'].map((r) => {
                const count = users.filter((u) => u.role?.toUpperCase() === r).length;
                return (
                  <div key={r} style={{ background: '#FFF9F2', padding: '14px', borderRadius: '12px', border: '1px solid rgba(128,0,32,0.1)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#D45060', textTransform: 'uppercase' }}>{r.replace('_', ' ')}</div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#800020', marginTop: '4px' }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Organizations Management */}
      {tab === 'organizations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
                Organizations Management
              </h2>
              <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
                Enterprise accounts producing events on the EventForge network.
              </p>
            </div>
          </div>

          {/* Create Organization Form */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '28px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#800020', textTransform: 'uppercase' }}>
              Add New Organization
            </h4>
            <form onSubmit={handleCreateOrg} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Organization Name (e.g. Acme Summits)"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ flex: '1', minWidth: '220px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <input
                type="text"
                placeholder="Industry (e.g. Technology)"
                value={newOrgIndustry}
                onChange={(e) => setNewOrgIndustry(e.target.value)}
                style={{ flex: '1', minWidth: '180px', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
              />
              <button
                type="submit"
                disabled={creatingOrg || !newOrgName}
                style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {creatingOrg ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>

          {/* Organizations Table */}
          <div style={{ backgroundColor: '#F3E6D5', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(128,0,32,0.15)', backgroundColor: 'rgba(128,0,32,0.05)' }}>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Industry</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org._id} style={{ borderBottom: '1px solid rgba(128,0,32,0.08)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2d1d20' }}>{org.name}</td>
                    <td style={{ padding: '14px 20px', color: '#6e5961' }}>{org.industry || 'General Events'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={org.isActive ? 'active' : 'draft'}>{org.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#6e5961' }}>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Users Management */}
      {tab === 'users' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              User Directory & Role Authorization
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Manage access privileges, toggle active status, and audit platform accounts.
            </p>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3E6D5', padding: '8px 16px', borderRadius: '10px', flex: 1, minWidth: '220px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <IconSearch size={16} className="text-[#800020]" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['ALL', 'PLATFORM_ADMIN', 'EVENT_ORGANIZER', 'EVENT_STAFF', 'SPEAKER', 'ATTENDEE', 'SPONSOR'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: roleFilter === r ? '#800020' : '#F3E6D5',
                    color: roleFilter === r ? '#FFF9F2' : '#800020'
                  }}
                >
                  {r.replace('EVENT_', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div style={{ backgroundColor: '#F3E6D5', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(128,0,32,0.15)', backgroundColor: 'rgba(128,0,32,0.05)' }}>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>User Name</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', color: '#800020', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(128,0,32,0.08)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#2d1d20' }}>
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#6e5961', fontFamily: 'monospace' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant="burgundy">{u.role?.replace('_', ' ')}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant={u.isActive ? 'active' : 'draft'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => toggleUserStatus(u)}
                        style={{
                          backgroundColor: u.isActive ? '#fce8e6' : '#e6f4ea',
                          color: u.isActive ? '#c5221f' : '#137333',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Subscriptions */}
      {tab === 'subscriptions' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Subscription Tier Management
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Enterprise licensing, quota allocations, and feature entitlements.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '28px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <Badge variant="burgundy">Enterprise Tier</Badge>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#800020', margin: '14px 0 6px' }}>
                $2,499 / year
              </h3>
              <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 16px' }}>
                Full suite access for global organizations producing multi-track conferences.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#2d1d20' }}>
                <li>✓ Up to 50 Concurrent Summits</li>
                <li>✓ 5,000 Attendees per event</li>
                <li>✓ Live QR Scanner & Validation</li>
                <li>✓ AI Content Studio Integration</li>
                <li>✓ Dedicated SLA & White-labeling</li>
              </ul>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '28px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <Badge variant="neutral">Professional Tier</Badge>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#800020', margin: '14px 0 6px' }}>
                $999 / year
              </h3>
              <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 16px' }}>
                Ideal for growing event producers hosting workshops and symposiums.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#2d1d20' }}>
                <li>✓ Up to 10 Annual Events</li>
                <li>✓ 1,000 Attendees per event</li>
                <li>✓ QR Check-in System</li>
                <li>✓ Speaker & Venue Management</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Settings */}
      {tab === 'settings' && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '32px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#800020', margin: '0 0 8px' }}>
            Global System Configuration
          </h2>
          <p style={{ fontSize: '13px', color: '#6e5961', margin: '0 0 24px' }}>
            Review server endpoints, environment modes, and security configurations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#FFF9F2', borderRadius: '10px' }}>
              <span style={{ fontWeight: 600, color: '#800020' }}>Backend API Gateway:</span>
              <span style={{ fontFamily: 'monospace' }}>http://localhost:5000/api</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#FFF9F2', borderRadius: '10px' }}>
              <span style={{ fontWeight: 600, color: '#800020' }}>Database Engine:</span>
              <span style={{ fontFamily: 'monospace' }}>MongoDB (Local Replica / Standalone)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#FFF9F2', borderRadius: '10px' }}>
              <span style={{ fontWeight: 600, color: '#800020' }}>AI Assistant Model:</span>
              <span style={{ fontFamily: 'monospace' }}>Google Gemini 1.5 Flash (Backend Orchestrated)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#FFF9F2', borderRadius: '10px' }}>
              <span style={{ fontWeight: 600, color: '#800020' }}>Token Lifetime:</span>
              <span style={{ fontFamily: 'monospace' }}>JWT 30 Days (Stateless with bcrypt encryption)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
