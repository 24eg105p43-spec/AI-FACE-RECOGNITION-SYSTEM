const jwt = require('jsonwebtoken');
const AttendanceSession = require('../models/AttendanceSession');
const { verifyCampusLocation } = require('../services/geofenceService');

const validateStudentSession = async (req, res, next) => {
  try {
    const { sessionToken, lat, lng } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing session QR token'
      });
    }

    // Verify session token
    let decoded;
    try {
      decoded = jwt.verify(sessionToken, process.env.QR_SECRET || 'super_secret_qr_session_jwt_key_2026_secure_key');
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired QR code session token. Please scan the latest QR code displayed by faculty.'
      });
    }

    // Find the session in database
    const session = await AttendanceSession.findById(decoded.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Attendance session not found or has been revoked.'
      });
    }

    // Check if session has expired
    const now = new Date();
    if (now > session.expiresAt || !session.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Attendance window closed: The 10-minute session has expired.'
      });
    }

    // Geofencing verification
    const studentLat = lat !== undefined ? parseFloat(lat) : undefined;
    const studentLng = lng !== undefined ? parseFloat(lng) : undefined;
    const geoResult = verifyCampusLocation(
      studentLat,
      studentLng,
      session.campusLat,
      session.campusLng,
      session.radiusMeters
    );

    // Capture client IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Attach verified session and location data to request
    req.attendanceSession = session;
    req.geoResult = geoResult;
    req.clientIp = clientIp;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Student validation failed',
      error: error.message
    });
  }
};

module.exports = { validateStudentSession };
