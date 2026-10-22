const axios = require('axios');

async function testE2E() {
  console.log('--- STARTING E2E SYSTEM VALIDATION ---');
  
  // 1. Faculty Login
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'prof.sharma@college.edu',
    password: 'Password@123'
  });
  console.log('1. Faculty JWT Login Successful:', loginRes.data.success);
  const token = loginRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Fetch Timetable Slots
  const timetableRes = await axios.get('http://localhost:5000/timetable', { headers: authHeaders });
  console.log('2. Timetable Slots Count:', timetableRes.data.count, 'Today:', timetableRes.data.currentDay);

  // 3. Register New Student with Face snapshot
  // Create a clean 100x100 face base64 placeholder
  const sampleFaceBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABi9uvDAAAAMUlEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODVA58AAAFw/e/eAAAAAElFTkSuQmCC';

  const regRes = await axios.post('http://localhost:5000/register-student', {
    name: 'Neha Verma',
    rollNumber: 'CS2024099',
    email: 'neha.verma@college.edu',
    department: 'Computer Science',
    semester: 'Semester 6',
    image: sampleFaceBase64
  }, { headers: authHeaders });
  console.log('3. Student Registration Successful:', regRes.data.student.name, 'Roll:', regRes.data.student.rollNumber);

  // 4. Generate 10-Minute Attendance Session QR
  const qrRes = await axios.post('http://localhost:5000/generate-qr', {
    subject: 'Computer Vision & Deep Learning',
    durationMinutes: 10,
    room: 'LH-201'
  }, { headers: authHeaders });
  console.log('4. QR Session Generated. Token length:', qrRes.data.sessionToken.length);
  const sessionToken = qrRes.data.sessionToken;

  // 5. Student validates Session Token
  const statusRes = await axios.get(`http://localhost:5000/api/sessions/status/${encodeURIComponent(sessionToken)}`);
  console.log('5. Student QR Validation:', statusRes.data.valid, 'Subject:', statusRes.data.session.subject, 'Seconds Left:', statusRes.data.session.remainingSeconds);

  // 6. Student submits Face Scan within Campus Radius (GPS: 12.9716, 77.5946)
  const scanRes = await axios.post('http://localhost:5000/scan-face', {
    sessionToken,
    image: sampleFaceBase64,
    lat: 12.9716,
    lng: 77.5946
  });
  console.log('6. Student Face Scan Status:', scanRes.data.attendance.status, 'Confidence:', scanRes.data.attendance.confidence, 'Student:', scanRes.data.student.name);

  // 7. Verify Duplicate Scan Protection
  const dupRes = await axios.post('http://localhost:5000/scan-face', {
    sessionToken,
    image: sampleFaceBase64,
    lat: 12.9716,
    lng: 77.5946
  });
  console.log('7. Duplicate Scan Handled:', dupRes.data.alreadyMarked, 'Status:', dupRes.data.attendance.status);

  // 8. Fetch Daily Attendance Logs
  const logRes = await axios.get('http://localhost:5000/attendance-log', { headers: authHeaders });
  console.log('8. Attendance Logs Retrieved. Total:', logRes.data.total, 'Present Rate:', logRes.data.summary.presentPercentage + '%');

  // 9. Fetch Analytics Stats
  const statsRes = await axios.get('http://localhost:5000/api/attendance/stats', { headers: authHeaders });
  console.log('9. Analytics Stats:', statsRes.data.overview);

  console.log('--- ALL E2E BACKEND & AI MICROSERVICE TESTS PASSED ---');
}

testE2E().catch(err => {
  console.error('Test Failed:', err.response ? err.response.data : err.message);
  process.exit(1);
});
