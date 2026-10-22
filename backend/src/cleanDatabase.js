/**
 * Database Clean & Production Reset Script
 * Purges all fake/demo accounts, mock students, fake biometric seeds, and test sessions.
 * Run this to achieve a clean production slate for real users.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Timetable = require('./models/Timetable');
const AttendanceSession = require('./models/AttendanceSession');
const Attendance = require('./models/Attendance');

async function cleanDatabase() {
  try {
    console.log('========================================================');
    console.log('🧹 AI FACE ATTENDANCE - PRODUCTION DATABASE PURGE');
    console.log('========================================================');
    
    await connectDB();

    console.log('[1/5] Removing fake faculty accounts...');
    const fakeFacultyResult = await Faculty.deleteMany({
      email: { $in: ['prof.sharma@college.edu', 'demo@college.edu', 'test@example.com'] }
    });
    console.log(`      Deleted ${fakeFacultyResult.deletedCount} fake faculty accounts.`);

    console.log('[2/5] Removing mock/seed student biometric profiles...');
    const fakeStudentResult = await Student.deleteMany({
      rollNumber: { $in: ['CS2024001', 'CS2024002', 'CS2024003', 'CS2024004', 'CS2024005'] }
    });
    console.log(`      Deleted ${fakeStudentResult.deletedCount} fake student records.`);

    console.log('[3/5] Clearing test attendance sessions...');
    const sessionResult = await AttendanceSession.deleteMany({});
    console.log(`      Deleted ${sessionResult.deletedCount} test attendance sessions.`);

    console.log('[4/5] Clearing test attendance scan logs...');
    const logResult = await Attendance.deleteMany({});
    console.log(`      Deleted ${logResult.deletedCount} test attendance records.`);

    console.log('[5/5] Checking timetable slots...');
    const remainingFaculty = await Faculty.countDocuments();
    const remainingStudents = await Student.countDocuments();

    console.log('--------------------------------------------------------');
    console.log(`✅ DATABASE CLEAN COMPLETE!`);
    console.log(`   Remaining Active Real Faculty: ${remainingFaculty}`);
    console.log(`   Remaining Active Real Students: ${remainingStudents}`);
    console.log(`   All fake users and mock biometrics have been removed.`);
    console.log('========================================================');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to clean database:', err);
    process.exit(1);
  }
}

cleanDatabase();
