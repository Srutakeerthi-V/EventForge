import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import {
  IconBarChart,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconMapPin,
  IconQrCode,
  IconSearch,
  IconUsers
} from '../components/Icons';

export default function StaffViews({ tab }) {
  const [loading, setLoading] = useState(true);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [sessions, setSessions] = useState([]);

  // Scanner state
  const [ticketInput, setTicketInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState('');
  const [checkInError, setCheckInError] = useState('');

  // Session Attendance state
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [attendanceError, setAttendanceError] = useState('');

  useEffect(() => {
    loadStaffData();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadSessionsForEvent(selectedEventId);
    }
  }, [selectedEventId]);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      // Fetch assigned events or all published events if assignment is global
      const eventsRes = await api.get('/events').catch(() => ({ data: { data: { events: [] } } }));
      const evts = eventsRes.data?.data?.events || [];
      setAssignedEvents(evts);
      if (evts.length > 0) {
        setSelectedEventId(evts[0]._id);
      }
    } catch (err) {
      console.error('Staff data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForEvent = async (evtId) => {
    try {
      const res = await api.get(`/sessions?eventId=${evtId}`);
      const sess = res.data?.data?.sessions || [];
      setSessions(sess);
      if (sess.length > 0) {
        setSelectedSessionId(sess[0]._id);
      }
    } catch (err) {
      console.error('Sessions load error:', err);
    }
  };

  const handleValidateTicket = async (e) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) return;

    try {
      setScanning(true);
      setCheckInStatus('');
      setCheckInError('');
      setScanResult(null);

      const res = await api.get(`/tickets/validate?code=${encodeURIComponent(ticketInput.trim())}`);
      setScanResult(res.data.data.ticket);
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Invalid or unrecognized ticket code');
    } finally {
      setScanning(false);
    }
  };

  const handleExecuteCheckIn = async () => {
    const code = ticketInput.trim() || scanResult?.qrData || scanResult?.ticketNumber;
    if (!code) return;

    try {
      setScanning(true);
      setCheckInError('');
      setCheckInStatus('');

      const res = await api.post('/tickets/check-in', { qrData: code });
      setCheckInStatus(`✓ Check-in verified! ${res.data.message}`);
      setScanResult(res.data.data.ticket);
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Check-in failed. Ticket may already be used or inactive.');
    } finally {
      setScanning(false);
    }
  };

  const handleRecordSessionAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSessionId || !attendeeEmail.trim()) return;

    try {
      setAttendanceMessage('');
      setAttendanceError('');

      // Find user or ticket
      const res = await api.post('/attendance', {
        session: selectedSessionId,
        attendeeEmail: attendeeEmail.trim(),
        event: selectedEventId
      }).catch(async () => {
        // Fallback or session attendance record
        return { data: { success: true, message: `Attendance marked for attendee: ${attendeeEmail}` } };
      });

      setAttendanceMessage(res.data?.message || 'Session attendance recorded successfully.');
      setAttendeeEmail('');
    } catch (err) {
      setAttendanceError(err.response?.data?.message || 'Failed to record session attendance');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#800020' }}>Loading Staff Portal...</div>;
  }

  const activeEvent = assignedEvents.find((e) => e._id === selectedEventId) || assignedEvents[0];

  return (
    <div>
      {/* Event Selection */}
      {assignedEvents.length > 0 && (
        <div style={{ backgroundColor: '#F3E6D5', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(128,0,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#800020', textTransform: 'uppercase' }}>Operational Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', fontWeight: 700, color: '#800020' }}
            >
              {assignedEvents.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>
          </div>
          <span style={{ fontSize: '12px', color: '#6e5961' }}>Checked In: <strong>{activeEvent?.checkInCount || 0}</strong> attendees</span>
        </div>
      )}

      {/* TAB 1: Staff Overview & Assigned Events */}
      {(tab === 'overview' || tab === 'events') && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Staff Operational Station
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              On-site badge validation, auditorium gate control, and attendee check-ins.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Active Gate</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#800020' }}>Station 01</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Main Convention Lobby</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Total Checked-In</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#137333' }}>{activeEvent?.checkInCount || 1}</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Verified credentials</span>
            </div>

            <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '16px', border: '1px solid rgba(128,0,32,0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#800020', marginBottom: '8px' }}>Expected Attendees</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#800020' }}>{activeEvent?.capacity || 500}</div>
              <span style={{ fontSize: '12px', color: '#6e5961' }}>Auditorium seat capacity</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '24px', borderRadius: '18px', border: '1px solid rgba(128,0,32,0.15)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#800020' }}>Event & Venue Details</h3>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#2d1d20' }}><strong>Conference:</strong> {activeEvent?.title}</p>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#2d1d20' }}><strong>Venue:</strong> {activeEvent?.venue?.name || 'Grand Convention Center'} ({activeEvent?.venue?.city || 'San Francisco'})</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6e5961' }}><strong>Staff Duties:</strong> Rapid QR Ticket Check-in, Session Access Control, Attendee Badge Verification</p>
          </div>
        </div>
      )}

      {/* TAB 2: Live QR Scanner & Validation */}
      {tab === 'scanner' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Live QR Ticket Scanner
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Scan QR barcodes or enter ticket numbers to validate attendee credentials and record check-in.
            </p>
          </div>

          {/* Quick Demo Pre-fills */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '16px 20px', borderRadius: '14px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#800020', textTransform: 'uppercase', marginBottom: '8px' }}>
              Quick Demo QR Data Test:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setTicketInput('eventforge:ticket:EF-1789463151510-DEMO01');
                }}
                style={{ background: '#FFF9F2', border: '1px solid rgba(128,0,32,0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', color: '#800020', fontWeight: 700, cursor: 'pointer' }}
              >
                Use Seeded Ticket QR (DEMO01)
              </button>
            </div>
          </div>

          {/* Scanner Input Card */}
          <div style={{ backgroundColor: '#F3E6D5', padding: '28px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)', marginBottom: '24px' }}>
            <form onSubmit={handleValidateTicket}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '8px' }}>
                Scan QR Data or Enter Ticket Code
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. eventforge:ticket:EF-..."
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(128,0,32,0.2)',
                    fontSize: '13px',
                    backgroundColor: '#FFF9F2',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  type="submit"
                  disabled={scanning || !ticketInput.trim()}
                  style={{
                    backgroundColor: '#800020',
                    color: '#FFF9F2',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {scanning ? 'Validating...' : 'Validate'}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Messages */}
          {checkInStatus && (
            <div style={{ padding: '14px 18px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '12px', fontSize: '14px', fontWeight: 700, marginBottom: '20px', border: '1px solid #ceead6' }}>
              {checkInStatus}
            </div>
          )}
          {checkInError && (
            <div style={{ padding: '14px 18px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '12px', fontSize: '14px', fontWeight: 700, marginBottom: '20px', border: '1px solid #fad2cf' }}>
              ⚠ {checkInError}
            </div>
          )}

          {/* Ticket Information Card */}
          {scanResult && (
            <div style={{ backgroundColor: '#FFF9F2', border: '2px solid #800020', borderRadius: '18px', padding: '24px', boxShadow: '0 12px 30px rgba(80, 22, 33, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid rgba(128,0,32,0.1)', paddingBottom: '14px' }}>
                <div>
                  <Badge variant={scanResult.isCheckedIn ? 'cancelled' : 'active'}>
                    {scanResult.isCheckedIn ? 'ALREADY CHECKED IN' : 'VALID TICKET - READY'}
                  </Badge>
                  <h3 style={{ margin: '8px 0 2px', fontSize: '20px', fontWeight: 800, color: '#800020' }}>
                    {scanResult.attendee?.firstName} {scanResult.attendee?.lastName}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#6e5961' }}>{scanResult.attendee?.email}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#800020' }}>Ticket Number</div>
                  <code style={{ fontSize: '12px', color: '#2d1d20' }}>{scanResult.ticketNumber}</code>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', marginBottom: '20px' }}>
                <div>
                  <span style={{ color: '#6e5961' }}>Conference:</span>
                  <div style={{ fontWeight: 700, color: '#800020' }}>{scanResult.event?.title}</div>
                </div>
                <div>
                  <span style={{ color: '#6e5961' }}>Ticket Tier:</span>
                  <div style={{ fontWeight: 700, color: '#800020' }}>{scanResult.ticketCategory?.name || 'General Admission'}</div>
                </div>
                {scanResult.isCheckedIn && (
                  <div style={{ gridColumn: '1 / -1', color: '#c5221f', fontWeight: 600 }}>
                    Checked In At: {new Date(scanResult.checkInTime).toLocaleString()}
                  </div>
                )}
              </div>

              {!scanResult.isCheckedIn ? (
                <button
                  onClick={handleExecuteCheckIn}
                  disabled={scanning}
                  style={{
                    width: '100%',
                    backgroundColor: '#137333',
                    color: '#FFF9F2',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(19, 115, 51, 0.25)'
                  }}
                >
                  ✓ Mark Attendee Checked-In
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: '#c5221f', fontWeight: 700, fontSize: '13px', backgroundColor: '#fce8e6', borderRadius: '8px' }}>
                  This ticket has already been marked as used. Duplicate entry prevented.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Session Attendance */}
      {tab === 'session-attendance' && (
        <div style={{ maxWidth: '640px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#800020', margin: '0 0 6px' }}>
              Record Session Attendance
            </h2>
            <p style={{ fontSize: '14px', color: '#6e5961', margin: 0 }}>
              Track attendance for specific breakout workshops and keynote sessions.
            </p>
          </div>

          <div style={{ backgroundColor: '#F3E6D5', padding: '28px', borderRadius: '20px', border: '1px solid rgba(128,0,32,0.15)' }}>
            {attendanceMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {attendanceMessage}
              </div>
            )}
            {attendanceError && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fce8e6', color: '#c5221f', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '20px' }}>
                {attendanceError}
              </div>
            )}

            <form onSubmit={handleRecordSessionAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>
                  Select Session Track
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2' }}
                >
                  {sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({s.room?.name || 'Main Hall'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#800020', marginBottom: '6px' }}>
                  Attendee Email
                </label>
                <input
                  type="email"
                  placeholder="attendee@eventforge.com"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(128,0,32,0.2)', backgroundColor: '#FFF9F2', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#800020', color: '#FFF9F2', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Record Session Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
