import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  QrCode, 
  CheckCircle, 
  Radio, 
  BookOpen,
  MapPin
} from 'lucide-react';
import { createTimetableSlot, deleteTimetableSlot } from '../utils/api';

export default function TimetableManager({ slots, activeSlot, onRefresh, onLaunchSession }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('LH-101');
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTimetableSlot({
        subject,
        courseCode,
        day,
        startTime,
        endTime,
        room
      });
      setShowAddModal(false);
      setSubject('');
      setCourseCode('');
      onRefresh();
    } catch (err) {
      alert('Failed to add slot: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this lecture slot from timetable?')) return;
    try {
      await deleteTimetableSlot(id);
      onRefresh();
    } catch (err) {
      alert('Failed to delete slot: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Timetable Header & Active Slot Alignment Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
        color: '#ffffff',
        padding: '24px 28px',
        border: 'none',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#34d399' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Timetable Auto-Alignment Engine
              </span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {activeSlot ? `Current Lecture: ${activeSlot.subject}` : 'No Active Lecture Slot Right Now'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              {activeSlot 
                ? `Scheduled: ${activeSlot.day} ${activeSlot.startTime} - ${activeSlot.endTime} in ${activeSlot.room}`
                : 'Sessions automatically sync with your scheduled college lecture hours.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {activeSlot && (
              <button
                onClick={() => onLaunchSession(activeSlot)}
                className="btn btn-success"
                style={{
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                  padding: '12px 20px',
                  fontWeight: 700
                }}
              >
                <QrCode size={18} />
                <span>Launch QR for Active Slot</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '12px 18px'
              }}
            >
              <Plus size={18} />
              <span>Add Lecture Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Days Schedule Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {daysOfWeek.map((dayName) => {
          const daySlots = slots.filter(s => s.day === dayName);
          return (
            <div key={dayName} className="card" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--neutral-100)',
                marginBottom: '14px'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
                  {dayName}
                </h4>
                <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                  {daySlots.length} Slots
                </span>
              </div>

              {daySlots.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.85rem' }}>
                  No lectures scheduled
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {daySlots.map((slot) => {
                    const isLive = activeSlot && activeSlot._id === slot._id;
                    return (
                      <div
                        key={slot._id}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          background: isLive ? 'var(--primary-50)' : 'var(--neutral-50)',
                          border: `1px solid ${isLive ? 'var(--primary-300)' : 'var(--neutral-200)'}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, color: 'var(--neutral-900)', fontSize: '0.95rem' }}>
                            {slot.subject}
                          </span>
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--neutral-400)',
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                            title="Delete slot"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--neutral-600)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                            <Clock size={13} color="var(--primary-600)" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="var(--neutral-500)" />
                            {slot.room}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {slot.courseCode || 'CS301'}
                          </span>

                          <button
                            onClick={() => onLaunchSession(slot)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                          >
                            <QrCode size={13} />
                            <span>Start QR</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">Add Timetable Lecture Slot</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">Close</button>
            </div>
            <form onSubmit={handleAddSlot} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  Course / Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Distributed Cloud Computing"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS604"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Day of Week *
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)' }}
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  Room / Lecture Hall
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. LH-204"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--neutral-300)' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {loading ? 'Adding...' : 'Save Lecture Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
