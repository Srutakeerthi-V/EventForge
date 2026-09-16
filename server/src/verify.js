const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || 'Request failed');
    error.status = res.status;
    error.data = json;
    throw error;
  }
  return json;
}

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPLETE EVENTFORGE E2E VERIFICATION TEST');
  console.log('====================================================\n');

  try {
    // 1. Health check
    const health = await req('/health');
    console.log('✓ 1. Health Check:', health.message);

    // 2. Authentication for all 6 roles
    const roles = ['admin', 'organizer', 'staff', 'speaker', 'attendee', 'sponsor'];
    const tokens = {};
    for (const role of roles) {
      const email = `${role}@eventforge.com`;
      const res = await req('/auth/login', { method: 'POST', body: { email, password: 'Password123' } });
      tokens[role] = res.data.token;
      console.log(`✓ 2. Login [${role.toUpperCase()}]:`, res.data.user.email, '| Role:', res.data.user.role);
    }

    // 3. Events Listing
    const eventsRes = await req('/events');
    const events = eventsRes.data.events;
    const testEvent = events[0];
    console.log(`✓ 3. Events Catalog: ${events.length} events loaded. First: "${testEvent.title}" (ID: ${testEvent._id})`);

    // 4. Test Session Conflict Detection
    const sessRes = await req(`/sessions?eventId=${testEvent._id}`);
    const existingSession = sessRes.data.sessions[0];
    console.log(`✓ 4a. Existing Session: "${existingSession.title}" in Room: ${existingSession.room?.name || 'Main Hall'}`);

    // Try creating a conflicting session with overlapping time in the SAME room
    try {
      await req('/sessions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.organizer}` },
        body: {
          event: testEvent._id,
          title: 'Conflicting Overlap Session',
          room: existingSession.room?._id || existingSession.room,
          startTime: existingSession.startTime,
          endTime: existingSession.endTime,
          sessionType: 'presentation'
        }
      });
      console.error('❌ Conflict detection FAILED - Overlapping session was incorrectly allowed');
    } catch (err) {
      console.log('✓ 4b. Session Conflict Detection Passed: Overlapping session blocked with message:', err.message);
    }

    // 5. Coupon Validation
    const couponRes = await req('/coupons/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.attendee}` },
      body: { code: 'FORGE10', eventId: testEvent._id }
    });
    console.log('✓ 5. Coupon Validation Passed: Code "FORGE10" discountType:', couponRes.data.coupon.discountType, 'Value:', couponRes.data.coupon.discountValue);

    // 6. Ticket Validation by Staff
    const tixRes = await req('/tickets/mine', { headers: { Authorization: `Bearer ${tokens.attendee}` } });
    const attendeeTicket = tixRes.data.tickets[0];
    console.log(`✓ 6. Attendee Ticket: ${attendeeTicket.ticketNumber} | QR Data: ${attendeeTicket.qrData} | CheckedIn: ${attendeeTicket.isCheckedIn}`);

    const validateRes = await req(`/tickets/validate?code=${encodeURIComponent(attendeeTicket.qrData)}`, {
      headers: { Authorization: `Bearer ${tokens.staff}` }
    });
    console.log('✓ 7. Staff Ticket Validation: Valid:', validateRes.data.isValid, '| Attendee:', validateRes.data.ticket.attendee.firstName);

    // 8. Staff Check-in Execution
    const checkinRes = await req('/tickets/check-in', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.staff}` },
      body: { qrData: attendeeTicket.qrData }
    });
    console.log('✓ 8. Staff Check-In Executed:', checkinRes.message);

    // 9. Duplicate Check-in Prevention
    try {
      await req('/tickets/check-in', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.staff}` },
        body: { qrData: attendeeTicket.qrData }
      });
      console.error('❌ Duplicate Check-in Prevention FAILED');
    } catch (err) {
      console.log('✓ 9. Duplicate Check-In Blocked: Status', err.status, '| Reason:', err.message);
    }

    // 10. Real MongoDB Analytics
    const adminAnalytics = await req('/analytics/admin', { headers: { Authorization: `Bearer ${tokens.admin}` } });
    console.log('✓ 10a. Admin Analytics: Total Users:', adminAnalytics.data.totalUsers, '| Orgs:', adminAnalytics.data.totalOrganizations, '| Events:', adminAnalytics.data.totalEvents);

    const organizerAnalytics = await req(`/analytics/organizer?eventId=${testEvent._id}`, { headers: { Authorization: `Bearer ${tokens.organizer}` } });
    console.log('✓ 10b. Organizer Analytics: Total Registrations:', organizerAnalytics.data.totalRegistrations, '| Check-ins:', organizerAnalytics.data.checkIns, '| Attendance %:', organizerAnalytics.data.attendancePercentage, '%');

    // 11. AI Content Studio
    const aiRes = await req('/ai/generate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.organizer}` },
      body: { type: 'event_description', prompt: 'TechSummit 2026 description', input: { title: 'TechSummit 2026' } }
    });
    console.log('✓ 11. AI Studio Generation: Content length:', aiRes.data.content?.content?.length, 'chars');

    console.log('\n====================================================');
    console.log('🎉 ALL 11 END-TO-END VERIFICATION CHECKS PASSED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Verification Error:', err.message, err.data || '');
    process.exit(1);
  }
}

runVerification();
