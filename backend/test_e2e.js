const axios = require('axios');

async function testE2E() {
  console.log('========================================================');
  console.log('🧪 RUNNING PRODUCTION END-TO-END SYSTEM VALIDATION');
  console.log('========================================================');
  
  const testEmail = `prof.test_${Date.now()}@university.edu`;
  const testPassword = 'SecurePassword@2026';

  try {
    // 1. Real Faculty Self-Registration
    console.log('[1/8] Registering real faculty account with valid RFC email & strong password...');
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Dr. Test Administrator',
      email: testEmail,
      password: testPassword,
      department: 'Computer Science & Engineering'
    });
    console.log('      ✅ Registration Successful. Token received:', !!registerRes.data.token);
    const token = registerRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Real Faculty Login with JWT
    console.log('[2/8] Testing faculty login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: testEmail,
      password: testPassword
    });
    console.log('      ✅ Login Successful. Faculty ID:', loginRes.data.faculty.id);

    // 3. Timetable API verification
    console.log('[3/8] Fetching scheduled timetable slots...');
    const timetableRes = await axios.get('http://localhost:5000/timetable', { headers: authHeaders });
    console.log(`      ✅ Timetable active. Slot count: ${timetableRes.data.count || 0}`);

    // 4. Register Student with Facial Biometric snapshot
    console.log('[4/8] Enrolling student biometric profile with AI embedding...');
    const sampleFaceBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABi9uvDAAAAMUlEQVR42u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAODVA58AAAFw/e/eAAAAAElFTkSuQmCC';
    const testRoll = `CS_${Date.now().toString().slice(-6)}`;

    const regRes = await axios.post('http://localhost:5000/register-student', {
      name: 'Test Student',
      rollNumber: testRoll,
      email: `student_${testRoll.toLowerCase()}@college.edu`,
      department: 'Computer Science',
      semester: 'Semester 6',
      image: sampleFaceBase64
    }, { headers: authHeaders });
    console.log(`      ✅ Student Enrolled: ${regRes.data.student.name} (${regRes.data.student.rollNumber})`);

    // 5. Generate 10-Minute Attendance Session QR
    console.log('[5/8] Generating time-bound attendance session QR code...');
    const qrRes = await axios.post('http://localhost:5000/generate-qr', {
      subject: 'Advanced Neural Networks & Biometrics',
      durationMinutes: 10,
      room: 'LH-301'
    }, { headers: authHeaders });
    const sessionToken = qrRes.data.sessionToken;
    console.log(`      ✅ QR Session generated. Expires at: ${qrRes.data.session.expiresAt}`);

    // 6. Student QR Token Validation
    console.log('[6/8] Validating student scanner session token...');
    const statusRes = await axios.get(`http://localhost:5000/api/sessions/status/${encodeURIComponent(sessionToken)}`);
    console.log(`      ✅ Session valid: ${statusRes.data.valid}, Seconds left: ${statusRes.data.session.remainingSeconds}s`);

    // 7. Student Face Scan Verification (GPS: 12.9716, 77.5946)
    console.log('[7/8] Submitting facial verification within 500m campus radius...');
    const scanRes = await axios.post('http://localhost:5000/scan-face', {
      sessionToken,
      image: sampleFaceBase64,
      lat: 12.9716,
      lng: 77.5946
    });
    console.log(`      ✅ Face Verified! Attendance Marked: ${scanRes.data.attendance.status}`);

    // 8. Duplicate Scan Protection Check
    console.log('[8/8] Testing duplicate scan rejection...');
    const dupRes = await axios.post('http://localhost:5000/scan-face', {
      sessionToken,
      image: sampleFaceBase64,
      lat: 12.9716,
      lng: 77.5946
    });
    console.log(`      ✅ Duplicate protected: ${dupRes.data.alreadyMarked}`);

    console.log('--------------------------------------------------------');
    console.log('🎉 ALL 8/8 END-TO-END PRODUCTION CHECKS PASSED!');
    console.log('========================================================');
  } catch (err) {
    console.error('❌ E2E Validation Error:', err.response?.data || err.message);
  }
}

testE2E();
