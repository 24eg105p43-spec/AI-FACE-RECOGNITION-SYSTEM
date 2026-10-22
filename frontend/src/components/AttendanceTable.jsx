import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function AttendanceTable({ logs, summary, onFilterChange, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Client-side quick filter
  const filteredRecords = (logs || []).filter((r) => {
    const matchesSearch = 
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSubject = subjectFilter === 'All' || r.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleDownloadCsv = () => {
    window.open('/api/attendance/export-csv', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      {/* Top Action Bar */}
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
            Daily Attendance Records
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--neutral-500)' }}>
            Biometric logs verified with OpenCV YuNet & Campus GPS Radius
          </p>
        </div>

        {/* Export & Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh logs"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '14px 16px',
        background: 'var(--neutral-50)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--neutral-200)',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} color="var(--neutral-400)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or roll number..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--neutral-300)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--neutral-600)', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--neutral-300)',
              fontSize: '0.85rem'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Summary Badges */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <span className="badge badge-present">Present: {summary?.present || 0}</span>
          <span className="badge badge-late">Late: {summary?.late || 0}</span>
          <span className="badge badge-absent">Absent: {summary?.absent || 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll Number</th>
              <th>Subject</th>
              <th>Time</th>
              <th>Status</th>
              <th>AI Confidence</th>
              <th>Anti-Spoof</th>
              <th>Geofence</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neutral-400)' }}>
                  No attendance records match the selected filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const isPresent = r.status === 'Present';
                const isLate = r.status === 'Late';
                const isAbsent = r.status === 'Absent';

                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {r.photo ? (
                          <img
                            src={r.photo}
                            alt=""
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--neutral-200)'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'var(--primary-100)',
                            color: 'var(--primary-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            {r.studentName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--neutral-900)' }}>{r.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>{r.department}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--neutral-700)' }}>
                        {r.rollNumber}
                      </span>
                    </td>

                    <td style={{ fontWeight: 500, color: 'var(--neutral-800)' }}>
                      {r.subject}
                    </td>

                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--neutral-600)' }}>
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td>
                      {isPresent && (
                        <span className="badge badge-present">
                          <CheckCircle size={12} />
                          Present
                        </span>
                      )}
                      {isLate && (
                        <span className="badge badge-late">
                          <Clock size={12} />
                          Late
                        </span>
                      )}
                      {isAbsent && (
                        <span className="badge badge-absent">
                          <XCircle size={12} />
                          Absent
                        </span>
                      )}
                    </td>

                    <td>
                      {isAbsent ? (
                        <span style={{ color: 'var(--neutral-400)', fontSize: '0.8rem' }}>N/A (Timeout)</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem' }}>
                            {r.confidence}%
                          </span>
                          <span style={{ width: '40px', height: '5px', background: 'var(--neutral-200)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${r.confidence}%`, height: '100%', background: 'var(--accent-green)' }} />
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      {isAbsent ? (
                        <span style={{ color: 'var(--neutral-400)', fontSize: '0.8rem' }}>—</span>
                      ) : (
                        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                          {(r.spoofScore * 100).toFixed(1)}% Spoof Risk
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="badge" style={{
                        background: r.withinRadius ? 'var(--accent-green-bg)' : 'var(--accent-red-bg)',
                        color: r.withinRadius ? '#065f46' : '#991b1b',
                        border: `1px solid ${r.withinRadius ? 'var(--accent-green-border)' : 'var(--accent-red-border)'}`,
                        fontSize: '0.75rem'
                      }}>
                        <MapPin size={11} />
                        {r.withinRadius ? `${r.locationDistance}m Campus` : 'Outside Radius'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
