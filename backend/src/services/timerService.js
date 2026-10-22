const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

/**
 * Marks absent for any student who did not scan within the session duration (default 10 mins)
 */
async function markAbsenteesForSession(session) {
  try {
    // Find all active students in the college/department
    const allStudents = await Student.find({ isActive: true });
    
    // Find students who already marked attendance for this session
    const markedRecords = await Attendance.find({ sessionId: session._id });
    const markedStudentIds = new Set(markedRecords.map(r => r.studentId.toString()));

    const absentStudents = allStudents.filter(s => !markedStudentIds.has(s._id.toString()));

    console.log(`[TimerService] Session "${session.subject}" expired. Auto-marking ${absentStudents.length} students as Absent.`);

    const absentEntries = absentStudents.map(student => ({
      studentId: student._id,
      sessionId: session._id,
      facultyId: session.facultyId,
      subject: session.subject,
      timestamp: session.expiresAt || new Date(),
      status: 'Absent',
      confidence: 0,
      spoofScore: 0,
      isSpoof: false,
      location: {
        lat: session.campusLat,
        lng: session.campusLng,
        distanceMeters: 0,
        withinRadius: false
      },
      clientIp: 'SYSTEM-CRON',
      verificationMethod: 'Auto Absent Timeout',
      reasons: ['Session expired: Did not scan face within 10-minute attendance window']
    }));

    if (absentEntries.length > 0) {
      await Attendance.insertMany(absentEntries, { ordered: false }).catch(err => {
        // Ignore duplicate key errors if already marked
        if (err.code !== 11000) console.warn('[TimerService] InsertMany warning:', err.message);
      });
    }

    session.isActive = false;
    session.autoMarkedAbsent = true;
    await session.save();

    return { processed: absentEntries.length };
  } catch (err) {
    console.error(`[TimerService] Error processing session ${session._id}:`, err.message);
  }
}

/**
 * Periodic scanner that checks for expired sessions
 */
async function processExpiredSessions() {
  try {
    const now = new Date();
    const expiredSessions = await AttendanceSession.find({
      expiresAt: { $lte: now },
      autoMarkedAbsent: false
    });

    for (const session of expiredSessions) {
      await markAbsenteesForSession(session);
    }
  } catch (err) {
    console.error('[TimerService] Cron scan error:', err.message);
  }
}

function startTimerJob() {
  console.log('[TimerService] Auto-mark absent timer background job initiated (checks every 15s)');
  // Check immediately, then every 15 seconds
  processExpiredSessions();
  setInterval(processExpiredSessions, 15000);
}

module.exports = {
  startTimerJob,
  processExpiredSessions,
  markAbsenteesForSession
};
