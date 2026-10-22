// API Utility layer connecting React frontend to Express backend

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeader() {
  const token = localStorage.getItem('faculty_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication
export async function loginFaculty(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerFaculty(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function resetFacultyPassword(email, newPassword) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword })
  });
}

export async function getFacultyMe() {
  return request('/api/auth/me');
}

// Students
export async function getStudents() {
  return request('/api/students');
}

export async function registerStudent(payload) {
  // Uses /register-student (prompt specified)
  return request('/register-student', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteStudent(id) {
  return request(`/api/students/${id}`, {
    method: 'DELETE'
  });
}

// Attendance Sessions & QR Code
export async function generateQRSession(payload) {
  // Uses /generate-qr (prompt specified)
  return request('/generate-qr', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getSessionStatus(token) {
  return request(`/api/sessions/status/${encodeURIComponent(token)}`);
}

export async function getActiveSession() {
  return request('/api/sessions/active');
}

export async function closeSession(id) {
  return request(`/api/sessions/close/${id}`, {
    method: 'POST'
  });
}

// Student Face Attendance Scanning
export async function scanFaceAttendance(payload) {
  // Uses /scan-face (prompt specified)
  return request('/scan-face', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Attendance Logs & Analytics
export async function getAttendanceLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  // Uses /attendance-log (prompt specified)
  return request(`/attendance-log${query ? `?${query}` : ''}`);
}

export async function getAttendanceStats() {
  return request('/api/attendance/stats');
}

export async function getSuspiciousAlerts() {
  return request('/api/attendance/suspicious-alerts');
}

export async function clearSuspiciousAlerts() {
  return request('/api/attendance/suspicious-alerts/clear', {
    method: 'POST'
  });
}

// Timetable
export async function getTimetableSlots() {
  // Uses /timetable (prompt specified)
  return request('/timetable');
}

export async function getActiveTimetableSlot() {
  return request('/api/timetable/active-slot');
}

export async function createTimetableSlot(payload) {
  return request('/timetable', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteTimetableSlot(id) {
  return request(`/api/timetable/${id}`, {
    method: 'DELETE'
  });
}
