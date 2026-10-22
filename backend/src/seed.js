require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Timetable = require('./models/Timetable');
const AttendanceSession = require('./models/AttendanceSession');
const Attendance = require('./models/Attendance');

// Generate 128-d normalized vector for seed students
function makeEmbedding(seedNumber) {
  const vec = [];
  for (let i = 0; i < 128; i++) {
    vec.push(Math.sin((i + 1) * seedNumber * 0.27));
  }
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map(v => Number((v / norm).toFixed(5)));
}

async function seedData() {
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('⚠️ [CRITICAL GUARD] Seeding demo data is blocked in production mode to protect real users.');
    console.error('   If you explicitly want to run this, pass the --force flag: node src/seed.js --force');
    process.exit(1);
  }

  await connectDB();

  console.log('[Seed] Clearing demo collections...');
  await Faculty.deleteMany({});
  await Student.deleteMany({});
  await Timetable.deleteMany({});
  await AttendanceSession.deleteMany({});
  await Attendance.deleteMany({});

  // 1. Create Demo Faculty
  console.log('[Seed] Creating demo faculty...');
  const faculty = await Faculty.create({
    name: 'Prof. Rajesh Sharma',
    email: 'prof.sharma@college.edu',
    password: 'Password@123',
    department: 'Computer Science & Engineering',
    role: 'faculty'
  });

  // 2. Create Sample Students
  console.log('[Seed] Creating registered students with biometric embeddings...');
  const students = await Student.create([
    {
      name: 'Aarav Patel',
      rollNumber: 'CS2024001',
      email: 'aarav.patel@college.edu',
      department: 'Computer Science',
      semester: 'Semester 6',
      faceEmbedding: makeEmbedding(101),
      registeredBy: faculty._id,
      facePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Priya Sharma',
      rollNumber: 'CS2024002',
      email: 'priya.sharma@college.edu',
      department: 'Computer Science',
      semester: 'Semester 6',
      faceEmbedding: makeEmbedding(202),
      registeredBy: faculty._id,
      facePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Rohan Gupta',
      rollNumber: 'CS2024003',
      email: 'rohan.gupta@college.edu',
      department: 'Computer Science',
      semester: 'Semester 6',
      faceEmbedding: makeEmbedding(303),
      registeredBy: faculty._id,
      facePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Ananya Iyer',
      rollNumber: 'CS2024004',
      email: 'ananya.iyer@college.edu',
      department: 'Computer Science',
      semester: 'Semester 6',
      faceEmbedding: makeEmbedding(404),
      registeredBy: faculty._id,
      facePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
    },
    {
      name: 'Vikram Singh',
      rollNumber: 'CS2024005',
      email: 'vikram.singh@college.edu',
      department: 'Computer Science',
      semester: 'Semester 6',
      faceEmbedding: makeEmbedding(505),
      registeredBy: faculty._id,
      facePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    }
  ]);

  // 3. Create Timetable Slots (including one matching today's day & current hour!)
  console.log('[Seed] Creating scheduled timetable slots...');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const currentHour = now.getHours();
  const nextHour = (currentHour + 1) % 24;

  const currentSlotStartTime = `${String(currentHour).padStart(2, '0')}:00`;
  const currentSlotEndTime = `${String(nextHour).padStart(2, '0')}:00`;

  await Timetable.create([
    {
      subject: 'Computer Vision & Deep Learning',
      courseCode: 'CS602',
      facultyId: faculty._id,
      day: currentDay, // Current day so auto-align catches it!
      startTime: currentSlotStartTime,
      endTime: currentSlotEndTime,
      room: 'AI Vision Lab 3',
      department: 'Computer Science',
      semester: 'Semester 6'
    },
    {
      subject: 'Artificial Intelligence & Neural Networks',
      courseCode: 'CS601',
      facultyId: faculty._id,
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      room: 'LH-201',
      department: 'Computer Science',
      semester: 'Semester 6'
    },
    {
      subject: 'Cloud & Distributed Systems',
      courseCode: 'CS603',
      facultyId: faculty._id,
      day: 'Wednesday',
      startTime: '11:15',
      endTime: '12:15',
      room: 'LH-104',
      department: 'Computer Science',
      semester: 'Semester 6'
    },
    {
      subject: 'Database Management Systems',
      courseCode: 'CS604',
      facultyId: faculty._id,
      day: 'Thursday',
      startTime: '14:00',
      endTime: '15:00',
      room: 'LH-302',
      department: 'Computer Science',
      semester: 'Semester 6'
    }
  ]);

  // 4. Create an Initial Attendance Session & historical logs for analytics
  console.log('[Seed] Creating past attendance sessions and logs...');
  const pastSession = await AttendanceSession.create({
    sessionToken: 'historical_sample_token',
    facultyId: faculty._id,
    subject: 'Computer Vision & Deep Learning',
    room: 'AI Vision Lab 3',
    durationMinutes: 10,
    startedAt: new Date(Date.now() - 24 * 3600 * 1000),
    expiresAt: new Date(Date.now() - 24 * 3600 * 1000 + 10 * 60 * 1000),
    isActive: false,
    autoMarkedAbsent: true,
    campusLat: 12.9716,
    campusLng: 77.5946,
    radiusMeters: 500
  });

  await Attendance.create([
    {
      studentId: students[0]._id,
      sessionId: pastSession._id,
      facultyId: faculty._id,
      subject: pastSession.subject,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 2 * 60 * 1000),
      status: 'Present',
      confidence: 0.96,
      spoofScore: 0.04,
      isSpoof: false,
      location: { lat: 12.9716, lng: 77.5946, distanceMeters: 14, withinRadius: true },
      clientIp: '192.168.1.104',
      verificationMethod: 'AI Face Recognition'
    },
    {
      studentId: students[1]._id,
      sessionId: pastSession._id,
      facultyId: faculty._id,
      subject: pastSession.subject,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 3 * 60 * 1000),
      status: 'Present',
      confidence: 0.94,
      spoofScore: 0.05,
      isSpoof: false,
      location: { lat: 12.9718, lng: 77.5944, distanceMeters: 32, withinRadius: true },
      clientIp: '192.168.1.108',
      verificationMethod: 'AI Face Recognition'
    },
    {
      studentId: students[2]._id,
      sessionId: pastSession._id,
      facultyId: faculty._id,
      subject: pastSession.subject,
      timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 8 * 60 * 1000),
      status: 'Late',
      confidence: 0.91,
      spoofScore: 0.07,
      isSpoof: false,
      location: { lat: 12.9715, lng: 77.5948, distanceMeters: 45, withinRadius: true },
      clientIp: '192.168.1.112',
      verificationMethod: 'AI Face Recognition'
    },
    {
      studentId: students[3]._id,
      sessionId: pastSession._id,
      facultyId: faculty._id,
      subject: pastSession.subject,
      timestamp: pastSession.expiresAt,
      status: 'Absent',
      confidence: 0,
      spoofScore: 0,
      isSpoof: false,
      location: { lat: 12.9716, lng: 77.5946, distanceMeters: 0, withinRadius: false },
      clientIp: 'SYSTEM-CRON',
      verificationMethod: 'Auto Absent Timeout',
      reasons: ['Did not scan within 10 minutes']
    },
    {
      studentId: students[4]._id,
      sessionId: pastSession._id,
      facultyId: faculty._id,
      subject: pastSession.subject,
      timestamp: pastSession.expiresAt,
      status: 'Absent',
      confidence: 0,
      spoofScore: 0,
      isSpoof: false,
      location: { lat: 12.9716, lng: 77.5946, distanceMeters: 0, withinRadius: false },
      clientIp: 'SYSTEM-CRON',
      verificationMethod: 'Auto Absent Timeout',
      reasons: ['Did not scan within 10 minutes']
    }
  ]);

  console.log('[Seed] Database successfully populated!');
  console.log('Demo Faculty Credentials:');
  console.log('  Email: prof.sharma@college.edu');
  console.log('  Password: Password@123');
  process.exit(0);
}

seedData().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
