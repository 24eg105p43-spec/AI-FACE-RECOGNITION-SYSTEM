const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const AttendanceSession = require('../models/AttendanceSession');
const Timetable = require('../models/Timetable');
const { protectFaculty } = require('../middleware/auth');
const { CAMPUS_LAT, CAMPUS_LNG, CAMPUS_RADIUS_METERS } = require('../services/geofenceService');
const { markAbsenteesForSession } = require('../services/timerService');

// @route   POST /generate-qr (and /api/sessions/generate-qr)
// @desc    Faculty generates secure JWT QR link for attendance session
router.post('/generate-qr', protectFaculty, async (req, res) => {
  try {
    const {
      timetableSlotId,
      subject: customSubject,
      durationMinutes = 10,
      room = 'LH-101',
      campusLat = CAMPUS_LAT,
      campusLng = CAMPUS_LNG,
      radiusMeters = CAMPUS_RADIUS_METERS
    } = req.body;

    let subjectName = customSubject || 'General Attendance';
    let linkedTimetableId = null;

    if (timetableSlotId) {
      const slot = await Timetable.findById(timetableSlotId);
      if (slot) {
        subjectName = slot.subject;
        linkedTimetableId = slot._id;
      }
    }

    const duration = parseInt(durationMinutes, 10) || 10;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + duration * 60 * 1000);

    // Create session document first to get _id
    const session = new AttendanceSession({
      sessionToken: 'temp',
      timetableSlotId: linkedTimetableId,
      facultyId: req.faculty._id,
      subject: subjectName,
      room,
      durationMinutes: duration,
      startedAt,
      expiresAt,
      isActive: true,
      campusLat,
      campusLng,
      radiusMeters
    });

    // Create signed JWT containing sessionId and timestamp
    const sessionJwt = jwt.sign(
      {
        sessionId: session._id,
        subject: subjectName,
        facultyId: req.faculty._id,
        createdAt: startedAt.getTime(),
        expiresAt: expiresAt.getTime()
      },
      process.env.QR_SECRET || 'super_secret_qr_session_jwt_key_2026_secure_key',
      { expiresIn: `${duration}m` }
    );

    session.sessionToken = sessionJwt;
    await session.save();

    // Link session to timetable if available
    if (linkedTimetableId) {
      await Timetable.findByIdAndUpdate(linkedTimetableId, {
        $push: { linkedSessions: session._id }
      });
    }

    // Generate high-resolution QR Code data URL containing the direct student scanner URL
    const origin = req.body.clientOrigin || req.headers.origin || `http://${(req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5174').split(':')[0]}:5174`;
    const scannerUrl = `${origin}/scan?token=${encodeURIComponent(sessionJwt)}`;

    const qrCodeDataUrl = await QRCode.toDataURL(scannerUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e3a8a', // Deep navy blue
        light: '#ffffff'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Attendance QR session generated successfully',
      session: {
        id: session._id,
        subject: session.subject,
        durationMinutes: session.durationMinutes,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        campusLat: session.campusLat,
        campusLng: session.campusLng,
        radiusMeters: session.radiusMeters
      },
      sessionToken: sessionJwt,
      scannerUrl,
      qrCodeDataUrl
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate attendance QR',
      error: err.message
    });
  }
});

// @route   GET /api/sessions/status/:token
// @desc    Verify QR token validity and get session details (for student scanner)
router.get('/status/:token', async (req, res) => {
  try {
    const { token } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.QR_SECRET || 'super_secret_qr_session_jwt_key_2026_secure_key');
    } catch (err) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid or expired QR token. Please scan the current code from the faculty screen.'
      });
    }

    const session = await AttendanceSession.findById(decoded.sessionId);
    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'This attendance session has ended or is no longer active.'
      });
    }

    const now = new Date();
    if (now > session.expiresAt) {
      return res.status(403).json({
        success: false,
        valid: false,
        message: 'The 10-minute attendance window has expired.'
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000));

    res.json({
      success: true,
      valid: true,
      session: {
        id: session._id,
        subject: session.subject,
        room: session.room,
        campusLat: session.campusLat,
        campusLng: session.campusLng,
        radiusMeters: session.radiusMeters,
        remainingSeconds,
        expiresAt: session.expiresAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, valid: false, message: 'Server error', error: err.message });
  }
});

// @route   GET /api/sessions/active
// @desc    Get current faculty's active session if any
router.get('/active', protectFaculty, async (req, res) => {
  try {
    const session = await AttendanceSession.findOne({
      facultyId: req.faculty._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ startedAt: -1 });

    if (!session) {
      return res.json({ success: true, activeSession: null });
    }

    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((session.expiresAt.getTime() - now.getTime()) / 1000));

    res.json({
      success: true,
      activeSession: {
        id: session._id,
        subject: session.subject,
        room: session.room,
        sessionToken: session.sessionToken,
        remainingSeconds,
        expiresAt: session.expiresAt,
        durationMinutes: session.durationMinutes,
        startedAt: session.startedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @route   POST /api/sessions/close/:id
// @desc    Manually terminate attendance session and mark absentees
router.post('/close/:id', protectFaculty, async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await markAbsenteesForSession(session);

    res.json({
      success: true,
      message: 'Session closed and absentees automatically recorded.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
