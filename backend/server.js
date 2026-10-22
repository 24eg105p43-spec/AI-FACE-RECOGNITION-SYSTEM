require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { startTimerJob } = require('./src/services/timerService');

// Route Handlers
const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const timetableRoutes = require('./src/routes/timetableRoutes');

const app = express();

// Connect to Database
connectDB();

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware (support high-resolution base64 face snapshots)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Start 10-Minute Auto-Mark Absent Timer Background Job
startTimerJob();

// Standard API Routes
app.use('/api/auth', authRoutes);

// Direct and prefixed routes for full prompt compatibility
app.use('/api/students', studentRoutes);
app.use('/', studentRoutes);

app.use('/api/sessions', sessionRoutes);
app.use('/', sessionRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/', attendanceRoutes);

app.use('/api/timetable', timetableRoutes);
app.use('/timetable', timetableRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'MERN AI Face Attendance System Backend',
    database: 'MongoDB',
    aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001',
    campusCoords: {
      lat: process.env.CAMPUS_LAT || 12.9716,
      lng: process.env.CAMPUS_LNG || 77.5946,
      radiusMeters: process.env.CAMPUS_RADIUS_METERS || 500
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Backend Server] AI Face Attendance Backend running on http://localhost:${PORT}`);
});
