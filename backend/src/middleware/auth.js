const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const protectFaculty = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized: No JWT token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_faculty_jwt_key_2026_secure_key');
    const faculty = await Faculty.findById(decoded.id).select('-password');
    if (!faculty) {
      return res.status(401).json({ success: false, message: 'Faculty user not found' });
    }
    req.faculty = faculty;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired', error: error.message });
  }
};

module.exports = { protectFaculty };
