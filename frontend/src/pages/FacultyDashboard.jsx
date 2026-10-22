import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import AttendanceChart from '../components/AttendanceChart';
import TimetableManager from '../components/TimetableManager';
import AttendanceTable from '../components/AttendanceTable';
import RegisterStudentModal from '../components/RegisterStudentModal';
import QRCodeProjectorModal from '../components/QRCodeProjectorModal';
import AntiSpoofAlerts from '../components/AntiSpoofAlerts';

import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  QrCode, 
  UserPlus, 
  CalendarClock, 
  ShieldCheck, 
  Trash2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

import { 
  getStudents, 
  deleteStudent,
  getAttendanceLogs, 
  getAttendanceStats, 
  getSuspiciousAlerts, 
  getTimetableSlots, 
  getActiveTimetableSlot 
} from '../utils/api';

export default function FacultyDashboard({ onSwitchToStudentDemo }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);

  // Data states
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, presentPercentage: 0 });
  const [stats, setStats] = useState({ overview: {}, subjectStats: [] });
  const [alerts, setAlerts] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [selectedSlotForQR, setSelectedSlotForQR] = useState(null);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000); // refresh periodically
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [studentsRes, logsRes, statsRes, alertsRes, timetableRes, activeSlotRes] = await Promise.allSettled([
        getStudents(),
        getAttendanceLogs(),
        getAttendanceStats(),
        getSuspiciousAlerts(),
        getTimetableSlots(),
        getActiveTimetableSlot()
      ]);

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.students) {
        setStudents(studentsRes.value.students);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value?.records) {
        setLogs(logsRes.value.records);
        setSummary(logsRes.value.summary || {});
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.alerts) {
        setAlerts(alertsRes.value.alerts);
      }

      if (timetableRes.status === 'fulfilled' && timetableRes.value?.slots) {
        setTimetableSlots(timetableRes.value.slots);
      }

      if (activeSlotRes.status === 'fulfilled' && activeSlotRes.value?.activeSlot) {
        setActiveSlot(activeSlotRes.value.activeSlot);
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    }
  };

  const handleLaunchQR = (slot) => {
    setSelectedSlotForQR(slot || activeSlot);
    setIsQRModalOpen(true);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await deleteStudent(id);
      fetchAllData();
    } catch (err) {
      alert('Failed to remove student: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          onOpenQRModal={() => handleLaunchQR(activeSlot)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          alertCount={alerts.length}
          onSwitchToStudentDemo={onSwitchToStudentDemo}
        />

        <div className="dashboard-page-container">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Active Slot Auto-Alignment Notification */}
              {activeSlot && (
                <div style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--primary-300)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="pulse-dot" />
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                        Current Timetable Slot Live: {activeSlot.subject} ({activeSlot.startTime} - {activeSlot.endTime})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)' }}>
                        Room: {activeSlot.room} • Faculty: Auto-aligned with College Schedule
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchQR(activeSlot)}
                    className="btn btn-primary btn-sm"
                    style={{ fontWeight: 700, boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                  >
                    <QrCode size={16} />
                    <span>Launch 10-Min QR Session</span>
                  </button>
                </div>
              )}

              {/* Top Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <StatCard
                  title="Enrolled Students"
                  value={students.length}
                  subtitle="Biometrically Verified"
                  icon={Users}
                  color="blue"
                  trend="100% Face Embeddings Ready"
                />
                <StatCard
                  title="Present Today"
                  value={summary.present || 0}
                  subtitle={`Total Logs: ${logs.length}`}
                  icon={UserCheck}
                  color="green"
                  trend={`${summary.presentPercentage || 0}% Attendance Rate`}
                />
                <StatCard
                  title="Absent"
                  value={summary.absent || 0}
                  subtitle="10-Min Auto-Marked"
                  icon={UserX}
                  color="red"
                  trend="Auto-timeout applied"
                />
                <StatCard
                  title="Late Arrivals"
                  value={summary.late || 0}
                  subtitle="Scanned after 7 mins"
                  icon={Clock}
                  color="yellow"
                  trend="Grace period tracked"
                />
              </div>

              {/* Analytics Charts */}
              <AttendanceChart stats={stats} />

              {/* Action Buttons Bar */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={18} />
                  <span>Register New Student (Face Biometrics)</span>
                </button>

                <button
                  onClick={() => handleLaunchQR(activeSlot)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <QrCode size={18} />
                  <span>Generate QR Code Session</span>
                </button>

                <button
                  onClick={() => setActiveTab('timetable')}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CalendarClock size={18} />
                  <span>Manage Timetable</span>
                </button>
              </div>

              {/* Recent Daily Attendance Logs Table */}
              <AttendanceTable
                logs={logs}
                summary={summary}
                onRefresh={fetchAllData}
              />
            </div>
          )}

          {/* TAB 2: TIMETABLE */}
          {activeTab === 'timetable' && (
            <TimetableManager
              slots={timetableSlots}
              activeSlot={activeSlot}
              onRefresh={fetchAllData}
              onLaunchSession={handleLaunchQR}
            />
          )}

          {/* TAB 3: REGISTERED STUDENTS */}
          {activeTab === 'students' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                    Registered Students ({students.length})
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--neutral-500)' }}>
                    Facial biometrics stored as normalized 128-dimensional vectors in MongoDB
                  </p>
                </div>

                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserPlus size={16} />
                  <span>Enroll New Student</span>
                </button>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Profile Photo</th>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Biometrics</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px 0', color: 'var(--neutral-400)' }}>
                          No students enrolled yet. Click "Enroll New Student" to capture face biometrics.
                        </td>
                      </tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s._id}>
                          <td>
                            {s.facePhoto ? (
                              <img
                                src={s.facePhoto}
                                alt={s.name}
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid var(--primary-200)'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: 'var(--primary-100)',
                                color: 'var(--primary-700)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700
                              }}>
                                {s.name.charAt(0)}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--neutral-900)' }}>{s.name}</strong>
                            {s.email && <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{s.email}</div>}
                          </td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.rollNumber}</span>
                          </td>
                          <td>{s.department}</td>
                          <td>{s.semester}</td>
                          <td>
                            <span className="badge badge-present">
                              <ShieldCheck size={12} />
                              128-d Vector Enrolled
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteStudent(s._id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--neutral-400)',
                                cursor: 'pointer',
                                padding: '6px'
                              }}
                              title="Delete student"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE RECORDS */}
          {activeTab === 'attendance' && (
            <AttendanceTable
              logs={logs}
              summary={summary}
              onRefresh={fetchAllData}
            />
          )}

          {/* TAB 5: ANTI-SPOOF SECURITY */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={22} color="var(--accent-red)" />
                  <span>Anti-Spoofing & Liveness Detection Engine</span>
                </h3>
                <p style={{ margin: '6px 0 20px', fontSize: '0.875rem', color: 'var(--neutral-600)', lineHeight: 1.5 }}>
                  The college attendance portal utilizes OpenCV image frequency decomposition and Laplacian sharpness variance to identify photo replays, smartphone screen glare, and 3D silicone mask attacks in real time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--neutral-900)' }}>1. Moiré Frequency Filtering</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                      High-frequency 2D Discrete Fourier Transforms spot micro-grid rasterization lines generated by LCD and OLED smartphone screens.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--neutral-900)' }}>2. Specular Glare & Backlight</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                      HSV value-channel reflection spikes identify device backlight luminance, preventing photo replay attempts.
                    </p>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
                    <h5 style={{ margin: '0 0 6px', color: 'var(--neutral-900)' }}>3. 500m Campus Geofencing</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                      Haversine spherical distance validator blocks remote proxy scanning and ensures presence within college lecture buildings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerts List */}
              <div className="card" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 700 }}>
                  Recent Flagged Security Incidents ({alerts.length})
                </h4>
                {alerts.length === 0 ? (
                  <p style={{ color: 'var(--neutral-500)', fontSize: '0.875rem' }}>
                    No security violations recorded. All student scans verified clean.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {alerts.map((a, i) => (
                      <div key={i} style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--accent-red-bg)', border: '1px solid var(--accent-red-border)', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '4px' }}>{a.type}</div>
                        <div style={{ color: '#7f1d1d' }}>{a.message}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '4px' }}>{new Date(a.timestamp).toLocaleString()} • IP: {a.clientIp}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RegisterStudentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onStudentAdded={() => {
          setIsRegisterModalOpen(false);
          fetchAllData();
        }}
      />

      <QRCodeProjectorModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        activeSlot={selectedSlotForQR || activeSlot}
        onSessionStarted={() => fetchAllData()}
      />

      {isAlertsOpen && (
        <AntiSpoofAlerts
          alerts={alerts}
          onClose={() => setIsAlertsOpen(false)}
          onRefresh={fetchAllData}
        />
      )}
    </div>
  );
}
