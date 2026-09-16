import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AdminViews from './AdminViews';
import OrganizerViews from './OrganizerViews';
import StaffViews from './StaffViews';
import SpeakerViews from './SpeakerViews';
import AttendeeViews from './AttendeeViews';
import SponsorViews from './SponsorViews';
import Badge from '../components/Badge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const normalizedRole = (user?.role || 'ATTENDEE').toUpperCase();
  const isOrganizer = ['EVENT_ORGANIZER', 'ORGANIZER'].includes(normalizedRole);
  const isAdmin = ['PLATFORM_ADMIN', 'ADMIN'].includes(normalizedRole);
  const isStaff = ['EVENT_STAFF', 'STAFF'].includes(normalizedRole);
  const isSpeaker = ['SPEAKER'].includes(normalizedRole);
  const isSponsor = ['SPONSOR'].includes(normalizedRole);

  const getRoleTitle = () => {
    if (isAdmin) return 'Platform Administration Console';
    if (isOrganizer) return 'Event Organizer Studio';
    if (isStaff) return 'Event Staff Operations';
    if (isSpeaker) return 'Speaker Portal';
    if (isSponsor) return 'Sponsor Relations Hub';
    return 'Attendee Portal';
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', backgroundColor: '#FFF9F2' }}>
      {/* Role Navigation Sidebar */}
      <Sidebar
        role={normalizedRole}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Role Content View */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(128, 0, 32, 0.12)', paddingBottom: '20px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D45060', fontWeight: 800 }}>
                {getRoleTitle()}
              </span>
              <Badge variant="burgundy">{normalizedRole.replace('_', ' ')}</Badge>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#800020', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome, {user?.firstName || 'User'} {user?.lastName || ''}
            </h1>
          </div>

          <div style={{ textAlign: 'right', fontSize: '12px', color: '#6e5961' }}>
            <div>Signed in as: <strong style={{ color: '#800020' }}>{user?.email}</strong></div>
            <div>Organization: <strong>{user?.organization?.name || 'EventForge Network'}</strong></div>
          </div>
        </div>

        {/* Dynamic View Injection by Role */}
        {isAdmin && <AdminViews tab={activeTab} onNavigateTab={setActiveTab} />}
        {isOrganizer && <OrganizerViews tab={activeTab} onNavigateTab={setActiveTab} />}
        {isStaff && <StaffViews tab={activeTab} onNavigateTab={setActiveTab} />}
        {isSpeaker && <SpeakerViews tab={activeTab} onNavigateTab={setActiveTab} />}
        {isSponsor && <SponsorViews tab={activeTab} onNavigateTab={setActiveTab} />}
        {!isAdmin && !isOrganizer && !isStaff && !isSpeaker && !isSponsor && (
          <AttendeeViews tab={activeTab} onNavigateTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}
