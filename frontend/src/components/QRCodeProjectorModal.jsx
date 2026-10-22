import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  MapPin, 
  ShieldCheck, 
  AlertCircle,
  StopCircle,
  Maximize2
} from 'lucide-react';
import { generateQRSession, closeSession } from '../utils/api';

export default function QRCodeProjectorModal({ isOpen, onClose, activeSlot, onSessionStarted }) {
  const [subject, setSubject] = useState(activeSlot?.subject || 'Artificial Intelligence & Neural Networks');
  const [duration, setDuration] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (activeSlot) {
      setSubject(activeSlot.subject);
    }
  }, [activeSlot]);

  // Countdown timer when session is active
  useEffect(() => {
    if (!sessionData) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTerminate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData]);

  if (!isOpen) return null;

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const data = await generateQRSession({
        timetableSlotId: activeSlot?._id,
        subject,
        durationMinutes: duration,
        room: activeSlot?.room || 'LH-101',
        clientOrigin: window.location.origin
      });

      setSessionData(data);
      setSecondsRemaining(duration * 60);
      if (onSessionStarted) onSessionStarted(data.session);
    } catch (err) {
      alert(`Failed to launch session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!sessionData?.session?.id) {
      setSessionData(null);
      return;
    }
    try {
      await closeSession(sessionData.session.id);
      alert('Attendance session ended. Absentees have been recorded automatically.');
      setSessionData(null);
      onClose();
    } catch (err) {
      alert('Error ending session: ' + err.message);
    }
  };

  const scannerDirectUrl = sessionData?.sessionToken
    ? `${window.location.origin}/scan?token=${encodeURIComponent(sessionData.sessionToken)}`
    : '';

  const copyScannerLink = () => {
    const targetUrl = scannerDirectUrl || sessionData?.scannerUrl;
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-dialog" 
        style={{ 
          maxWidth: fullscreen ? '100vw' : '680px',
          height: fullscreen ? '100vh' : 'auto',
          borderRadius: fullscreen ? '0' : 'var(--radius-xl)',
          padding: '0'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
          color: '#ffffff',
          borderTopLeftRadius: fullscreen ? 0 : 'var(--radius-xl)',
          borderTopRightRadius: fullscreen ? 0 : 'var(--radius-xl)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={22} />
              <span>Classroom Attendance QR Session</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Project this high-res QR code for enrolled students to scan
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '6px',
                cursor: 'pointer'
              }}
              title="Toggle Fullscreen Projector Mode"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px' }}>
          {!sessionData ? (
            /* Setup Phase */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeSlot && (
                <div style={{
                  padding: '14px 18px',
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span className="pulse-dot" />
                  <div style={{ fontSize: '0.875rem', color: 'var(--primary-900)' }}>
                    <strong>Active Timetable Slot Detected:</strong> {activeSlot.subject} ({activeSlot.startTime} - {activeSlot.endTime})
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '8px' }}>
                  Course / Lecture Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="e.g. Computer Vision CS602"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-700)' }}>
                    Session Duration Control (Default 10 min)
                  </label>
                  <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{duration} Minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-600)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '4px' }}>
                  <span>5 mins</span>
                  <span>10 mins (Standard)</span>
                  <span>15 mins</span>
                  <span>20 mins</span>
                  <span>30 mins</span>
                </div>
              </div>

              <div style={{
                background: 'var(--neutral-50)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-200)',
                fontSize: '0.825rem',
                color: 'var(--neutral-600)',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--neutral-800)', marginBottom: '4px' }}>
                  <MapPin size={15} color="var(--primary-600)" />
                  <span>Security & Campus Radius Geofence</span>
                </div>
                Only students physically within the 500m campus boundary will be permitted to scan. Unscanned students will be auto-marked absent after {duration} minutes.
              </div>

              <button
                onClick={handleCreateSession}
                disabled={loading || !subject}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Initializing Secure JWT Token...' : `Generate Attendance QR (${duration} mins)`}
              </button>
            </div>
          ) : (
            /* Live Projection Phase */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
              {/* Lecture and Countdown Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  {sessionData.session.subject}
                </span>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: secondsRemaining < 120 ? 'var(--accent-red-bg)' : 'var(--primary-50)',
                  border: `1px solid ${secondsRemaining < 120 ? 'var(--accent-red-border)' : 'var(--primary-200)'}`,
                  color: secondsRemaining < 120 ? 'var(--accent-red)' : 'var(--primary-700)',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <Clock size={16} />
                  <span>Expires In: {formatTime(secondsRemaining)}</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div style={{
                padding: '24px',
                background: '#ffffff',
                borderRadius: '24px',
                border: '4px solid var(--primary-100)',
                boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)',
                display: 'inline-block'
              }}>
                <QRCodeSVG
                  value={scannerDirectUrl}
                  size={fullscreen ? 380 : 260}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%232563eb%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22 fill=%22white%22/><path d=%22M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z%22 fill=%22%232563eb%22/></svg>',
                    x: undefined,
                    y: undefined,
                    height: 36,
                    width: 36,
                    excavate: true,
                  }}
                />
              </div>

              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--neutral-600)', maxWidth: '440px' }}>
                Students must open camera or QR scanner to access the verified face recognition portal.
              </p>

              {/* Direct Link Controls */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                <button
                  onClick={copyScannerLink}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
                  <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>

                <a
                  href={scannerDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={16} />
                  <span>Open Scanner View</span>
                </a>

                <button
                  onClick={handleTerminate}
                  className="btn btn-danger btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <StopCircle size={16} />
                  <span>End Session Now</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
