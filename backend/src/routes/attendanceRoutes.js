const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const aiServiceClient = require('../services/aiServiceClient');
const { validateStudentSession } = require('../middleware/studentValidation');
const { protectFaculty } = require('../middleware/auth');

// In-memory or database alert tracker for suspicious attempts
const suspiciousAlerts = [];

// @route   POST /scan-face (and /api/attendance/scan-face)
// @desc    Student submits face scan + QR validation
router.post('/scan-face', validateStudentSession, async (req, res) => {
  try {
    const { image } = req.body;
    const session = req.attendanceSession;
    const geoResult = req.geoResult;
    const clientIp = req.clientIp;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No facial image provided'
      });
    }

    // Step 1: Geofencing check
    if (!geoResult.withinRadius) {
      const alert = {
        id: Date.now().toString(),
        type: 'GPS_VIOLATION',
        subject: session.subject,
        timestamp: new Date(),
        message: `Attendance rejected: Device is ${geoResult.distanceMeters}m away from campus center (Allowed: ${geoResult.maxRadius}m).`,
        clientIp,
        details: { distance: geoResult.distanceMeters, lat: geoResult.lat, lng: geoResult.lng }
      };
      suspiciousAlerts.unshift(alert);

      return res.status(403).json({
        success: false,
        isOutOfRadius: true,
        distanceMeters: geoResult.distanceMeters,
        maxRadius: geoResult.maxRadius,
        message: `Location outside campus boundaries (${geoResult.distanceMeters}m away). You must be inside the campus premises to mark attendance.`
      });
    }

    // Step 2: Anti-Spoofing & Liveness Analysis via AI Microservice
    const antiSpoofCheck = await aiServiceClient.checkAntiSpoof(image);
    if (antiSpoofCheck.is_spoof) {
      const spoofAlert = {
        id: Date.now().toString(),
        type: 'ANTI_SPOOF_TRIGGERED',
        subject: session.subject,
        timestamp: new Date(),
        message: `Suspicious face scan detected: Spoof probability ${(antiSpoofCheck.spoof_score * 100).toFixed(1)}%. Possible screen replay or photo print attack.`,
        clientIp,
        spoofScore: antiSpoofCheck.spoof_score,
        reasons: antiSpoofCheck.reasons
      };
      suspiciousAlerts.unshift(spoofAlert);

      return res.status(400).json({
        success: false,
        isSpoof: true,
        spoofScore: antiSpoofCheck.spoof_score,
        reasons: antiSpoofCheck.reasons,
        message: 'Anti-spoofing alert: Screen replay or non-live face detected. Please present your live face directly.'
      });
    }

    // Step 3: Biometric Face Verification against registered students
    const activeStudents = await Student.find({ isActive: true });
    if (activeStudents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No registered students found in database. Contact faculty for registration.'
      });
    }

    const verificationResult = await aiServiceClient.verifyFace(image, activeStudents, 0.70);

    if (!verificationResult.match || !verificationResult.matched_student) {
      return res.status(404).json({
        success: false,
        message: 'Facial recognition failed: Face does not match any registered student profile in the system.',
        confidence: verificationResult.confidence || 0
      });
    }

    const matchedStudentInfo = verificationResult.matched_student;
    const student = await Student.findById(matchedStudentInfo.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found in system.'
      });
    }

    // Step 4: Check if attendance already marked for this session
    const existingRecord = await Attendance.findOne({
      studentId: student._id,
      sessionId: session._id
    });

    if (existingRecord) {
      return res.status(200).json({
        success: true,
        alreadyMarked: true,
        message: `Attendance has already been marked as ${existingRecord.status} for ${student.name} (${student.rollNumber}).`,
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          department: student.department
        },
        attendance: {
          status: existingRecord.status,
          timestamp: existingRecord.timestamp,
          confidence: existingRecord.confidence
        }
      });
    }

    // Determine Status: Present vs Late (e.g. if scanned after 7 mins of 10 min window)
    const elapsedMinutes = (Date.now() - new Date(session.startedAt).getTime()) / (1000 * 60);
    const status = elapsedMinutes > 7 ? 'Late' : 'Present';

    const attendanceRecord = await Attendance.create({
      studentId: student._id,
      sessionId: session._id,
      facultyId: session.facultyId,
      subject: session.subject,
      timestamp: new Date(),
      status,
      confidence: verificationResult.confidence || 0.95,
      spoofScore: antiSpoofCheck.spoof_score || 0.05,
      isSpoof: false,
      location: {
        lat: geoResult.campusLat,
        lng: geoResult.campusLng,
        distanceMeters: geoResult.distanceMeters,
        withinRadius: true
      },
      clientIp,
      verificationMethod: 'AI Face Recognition',
      reasons: ['Live face verified via OpenCV / AI Biometrics']
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked successfully as "${status}"`,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        photo: student.facePhoto
      },
      attendance: {
        id: attendanceRecord._id,
        subject: attendanceRecord.subject,
        status: attendanceRecord.status,
        timestamp: attendanceRecord.timestamp,
        confidence: attendanceRecord.confidence,
        spoofScore: attendanceRecord.spoofScore,
        location: attendanceRecord.location,
        landmarks: verificationResult.landmarks
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to process face scan attendance',
      error: err.message
    });
  }
});

// @route   GET /attendance-log (and /api/attendance/attendance-log)
// @desc    Fetch daily/semester records with stats
router.get('/attendance-log', protectFaculty, async (req, res) => {
  try {
    const { date, subject, status, rollNumber } = req.query;

    const filter = {};

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'name rollNumber department email facePhoto')
      .populate('sessionId', 'subject room startedAt expiresAt durationMinutes')
      .sort({ timestamp: -1 })
      .limit(200);

    // Format logs
    const formattedRecords = records.map(r => ({
      id: r._id,
      studentName: r.studentId ? r.studentId.name : 'Unknown Student',
      rollNumber: r.studentId ? r.studentId.rollNumber : 'N/A',
      department: r.studentId ? r.studentId.department : 'General',
      photo: r.studentId ? r.studentId.facePhoto : '',
      subject: r.subject,
      timestamp: r.timestamp,
      status: r.status,
      confidence: r.confidence ? Math.round(r.confidence * 100) : 0,
      spoofScore: r.spoofScore !== undefined ? r.spoofScore : 0.05,
      locationDistance: r.location ? r.location.distanceMeters : 0,
      withinRadius: r.location ? r.location.withinRadius : true,
      verificationMethod: r.verificationMethod,
      clientIp: r.clientIp
    }));

    // Calculate aggregates
    const totalPresent = formattedRecords.filter(r => r.status === 'Present').length;
    const totalAbsent = formattedRecords.filter(r => r.status === 'Absent').length;
    const totalLate = formattedRecords.filter(r => r.status === 'Late').length;
    const total = formattedRecords.length;

    const presentPercentage = total > 0 ? Math.round(((totalPresent + totalLate) / total) * 100) : 0;

    res.json({
      success: true,
      total,
      summary: {
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate,
        presentPercentage
      },
      records: formattedRecords
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/attendance/stats
// @desc    Overall analytics for charts
router.get('/stats', protectFaculty, async (req, res) => {
  try {
    const allRecords = await Attendance.find({});
    const present = allRecords.filter(r => r.status === 'Present').length;
    const absent = allRecords.filter(r => r.status === 'Absent').length;
    const late = allRecords.filter(r => r.status === 'Late').length;
    const total = allRecords.length;

    // Group by Subject
    const subjectMap = {};
    allRecords.forEach(r => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      subjectMap[r.subject].total += 1;
      if (r.status === 'Present') subjectMap[r.subject].present += 1;
      else if (r.status === 'Absent') subjectMap[r.subject].absent += 1;
      else if (r.status === 'Late') subjectMap[r.subject].late += 1;
    });

    const subjectStats = Object.keys(subjectMap).map(subj => ({
      subject: subj,
      ...subjectMap[subj],
      presentRate: Math.round(((subjectMap[subj].present + subjectMap[subj].late) / subjectMap[subj].total) * 100)
    }));

    res.json({
      success: true,
      overview: {
        total,
        present,
        absent,
        late,
        presentPct: total > 0 ? Math.round((present / total) * 100) : 0,
        absentPct: total > 0 ? Math.round((absent / total) * 100) : 0,
        latePct: total > 0 ? Math.round((late / total) * 100) : 0
      },
      subjectStats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/attendance/suspicious-alerts
// @desc    Notifications for anti-spoof and GPS security violations
router.get('/suspicious-alerts', protectFaculty, async (req, res) => {
  res.json({
    success: true,
    alerts: suspiciousAlerts.slice(0, 50)
  });
});

// @route   POST /api/attendance/suspicious-alerts/dismiss
// @desc    Clear or acknowledge alert
router.post('/suspicious-alerts/clear', protectFaculty, async (req, res) => {
  suspiciousAlerts.length = 0;
  res.json({ success: true, message: 'Alerts cleared' });
});

// @route   GET /api/attendance/export-csv
// @desc    Export attendance logs as downloadable CSV text
router.get('/export-csv', protectFaculty, async (req, res) => {
  try {
    const records = await Attendance.find({})
      .populate('studentId', 'name rollNumber department email')
      .sort({ timestamp: -1 });

    let csv = 'Roll Number,Student Name,Department,Subject,Date,Time,Status,Confidence,Spoof Score,Method\n';

    records.forEach(r => {
      const roll = r.studentId ? `"${r.studentId.rollNumber}"` : 'N/A';
      const name = r.studentId ? `"${r.studentId.name}"` : 'Unknown';
      const dept = r.studentId ? `"${r.studentId.department}"` : 'General';
      const subj = `"${r.subject}"`;
      const dateStr = new Date(r.timestamp).toISOString().split('T')[0];
      const timeStr = new Date(r.timestamp).toLocaleTimeString();
      const status = r.status;
      const conf = `${Math.round(r.confidence * 100)}%`;
      const spoof = `${(r.spoofScore * 100).toFixed(1)}%`;
      const method = `"${r.verificationMethod}"`;

      csv += `${roll},${name},${dept},${subj},${dateStr},${timeStr},${status},${conf},${spoof},${method}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Export failed', error: err.message });
  }
});

module.exports = router;
