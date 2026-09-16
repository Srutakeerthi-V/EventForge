import React from 'react';
import {
  IconBarChart,
  IconBuilding,
  IconCalendar,
  IconCheckCircle,
  IconEdit,
  IconLayers,
  IconPresentation,
  IconQrCode,
  IconSettings,
  IconSparkles,
  IconStar,
  IconTicket,
  IconUsers
} from './Icons';

export default function Sidebar({ activeTab, onSelectTab, role }) {
  const normalizedRole = (role || 'ATTENDEE').toUpperCase();

  const menuConfig = {
    PLATFORM_ADMIN: [
      { id: 'overview', label: 'Platform Overview', icon: IconBarChart },
      { id: 'organizations', label: 'Organizations', icon: IconBuilding },
      { id: 'users', label: 'Users & Permissions', icon: IconUsers },
      { id: 'subscriptions', label: 'Subscriptions', icon: IconLayers },
      { id: 'analytics', label: 'Platform Analytics', icon: IconBarChart },
      { id: 'settings', label: 'Global Settings', icon: IconSettings },
    ],
    EVENT_ORGANIZER: [
      { id: 'overview', label: 'Organizer Overview', icon: IconBarChart },
      { id: 'events', label: 'Events Management', icon: IconCalendar },
      { id: 'create-event', label: 'Create New Event', icon: IconEdit },
      { id: 'venues', label: 'Venues & Rooms', icon: IconBuilding },
      { id: 'sessions', label: 'Sessions & Conflicts', icon: IconPresentation },
      { id: 'tickets', label: 'Ticket Categories', icon: IconTicket },
      { id: 'registrations', label: 'Registrations', icon: IconUsers },
      { id: 'coupons', label: 'Coupons & Promos', icon: IconTicket },
      { id: 'sponsors', label: 'Sponsors & Packages', icon: IconLayers },
      { id: 'staff', label: 'Staff Assignments', icon: IconUsers },
      { id: 'announcements', label: 'Announcements', icon: IconEdit },
      { id: 'ai-studio', label: 'AI Content Studio', icon: IconSparkles },
      { id: 'analytics', label: 'Analytics & Revenue', icon: IconBarChart },
    ],
    EVENT_STAFF: [
      { id: 'overview', label: 'Staff Overview', icon: IconBarChart },
      { id: 'events', label: 'Assigned Events', icon: IconCalendar },
      { id: 'scanner', label: 'Live QR Ticket Scanner', icon: IconQrCode },
      { id: 'session-attendance', label: 'Session Attendance', icon: IconCheckCircle },
    ],
    SPEAKER: [
      { id: 'overview', label: 'Speaker Overview', icon: IconBarChart },
      { id: 'profile', label: 'Speaker Profile', icon: IconUsers },
      { id: 'sessions', label: 'Assigned Sessions', icon: IconPresentation },
      { id: 'availability', label: 'Availability Slots', icon: IconCalendar },
      { id: 'materials', label: 'Presentation Material', icon: IconLayers },
    ],
    ATTENDEE: [
      { id: 'overview', label: 'My Dashboard', icon: IconBarChart },
      { id: 'my-tickets', label: 'My Tickets & QR Badges', icon: IconQrCode },
      { id: 'browse', label: 'Browse Conferences', icon: IconCalendar },
      { id: 'my-sessions', label: 'My Session Schedule', icon: IconPresentation },
      { id: 'recommendations', label: 'AI Recommendations', icon: IconSparkles },
      { id: 'announcements', label: 'Event Bulletins', icon: IconCalendar },
      { id: 'feedback', label: 'Submit Feedback', icon: IconStar },
    ],
    SPONSOR: [
      { id: 'overview', label: 'Sponsor Overview', icon: IconBarChart },
      { id: 'events', label: 'Sponsored Events', icon: IconCalendar },
      { id: 'brand-profile', label: 'Brand Profile', icon: IconBuilding },
      { id: 'assets', label: 'Brand Assets & Media', icon: IconLayers },
      { id: 'deliverables', label: 'Deliverables Tracker', icon: IconCheckCircle },
    ],
  };

  const isOrganizer = ['EVENT_ORGANIZER', 'ORGANIZER'].includes(normalizedRole);
  const isAdmin = ['PLATFORM_ADMIN', 'ADMIN'].includes(normalizedRole);
  const isStaff = ['EVENT_STAFF', 'STAFF'].includes(normalizedRole);
  const isSpeaker = ['SPEAKER'].includes(normalizedRole);
  const isSponsor = ['SPONSOR'].includes(normalizedRole);

  const items = isOrganizer
    ? menuConfig.EVENT_ORGANIZER
    : isAdmin
    ? menuConfig.PLATFORM_ADMIN
    : isStaff
    ? menuConfig.EVENT_STAFF
    : isSpeaker
    ? menuConfig.SPEAKER
    : isSponsor
    ? menuConfig.SPONSOR
    : menuConfig.ATTENDEE;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFF9F2',
        borderRight: '1px solid rgba(128, 0, 32, 0.12)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexShrink: 0
      }}
    >
      <div style={{ padding: '0 12px 14px', borderBottom: '1px solid rgba(128, 0, 32, 0.1)', marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D45060', fontWeight: 800 }}>
          Navigation
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: 700, color: '#800020' }}>
          {isOrganizer ? 'Organizer Portal' : isAdmin ? 'Admin Console' : isStaff ? 'Staff Portal' : isSpeaker ? 'Speaker Portal' : isSponsor ? 'Sponsor Hub' : 'Attendee Portal'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? '#800020' : 'transparent',
                color: isActive ? '#FFF9F2' : '#2d1d20',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#F3E6D5';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={17} className={isActive ? 'text-[#FFF9F2]' : 'text-[#800020]'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
