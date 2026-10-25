import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { registerStudent } from '../utils/api';

export default function RegisterStudentModal({ isOpen, onClose, onStudentAdded }) {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [semester, setSemester] = useState('Semester 6');
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetForm();
    }
    return () => stopCamera();
  }, [isOpen]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Webcam user constraint failed, trying generic video stream...', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setIsCameraActive(true);
      } catch (fallbackErr) {
        setCameraError('Camera access not available or blocked. You can upload a photo instead.');
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
      setErrorMsg('Camera stream is still starting. Please wait 1-2 seconds and try again.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    // Mirror snapshot horizontally to match user selfie preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const resetForm = () => {
    setName('');
    setRollNumber('');
    setEmail('');
    setCapturedImage(null);
    setErrorMsg(null);
    setSuccessResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !rollNumber.trim()) {
      setErrorMsg('Student name and roll number are required');
      return;
    }

    if (!capturedImage) {
      setErrorMsg('Please capture or upload a face photograph for biometric embedding generation');
      return;
    }

    setLoading(true);
    try {
      const result = await registerStudent({
        name: name.trim(),
        rollNumber: rollNumber.trim().toUpperCase(),
        email: email.trim(),
        department,
        semester,
        image: capturedImage
      });

      setSuccessResult(result.student);
      if (onStudentAdded) onStudentAdded(result.student);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          color: '#ffffff'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={22} />
              <span>Enroll Student Face Profile</span>
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)' }}>
              Capture biometric face snapshot and generate 128-d AI embeddings
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
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

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {successResult ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-green-bg)',
                color: 'var(--accent-green)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--neutral-900)', marginBottom: '8px' }}>
                Student Successfully Enrolled!
              </h4>
              <p style={{ color: 'var(--neutral-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
                <strong>{successResult.name}</strong> ({successResult.rollNumber}) has been registered with AI biometric embeddings.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  startCamera();
                }}
                className="btn btn-primary"
              >
                Enroll Another Student
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {errorMsg && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--accent-red-bg)',
                  border: '1px solid var(--accent-red-border)',
                  color: 'var(--accent-red)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Camera / Photo Capture Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '280px',
                  height: '220px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed var(--primary-300)'
                }}>
                  {capturedImage ? (
                    <img 
                      src={capturedImage} 
                      alt="Captured Face" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : isCameraActive ? (
                    <video
                      ref={(node) => {
                        videoRef.current = node;
                        if (node && streamRef.current && node.srcObject !== streamRef.current) {
                          node.srcObject = streamRef.current;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--neutral-400)' }}>
                      <Camera size={36} style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '0.8rem' }}>{cameraError || 'Camera inactive'}</div>
                    </div>
                  )}

                  {/* Reticle Guides overlay */}
                  {!capturedImage && isCameraActive && (
                    <div style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '1px dashed rgba(59, 130, 246, 0.6)',
                      borderRadius: '50%',
                      pointerEvents: 'none'
                    }} />
                  )}
                </div>

                {/* Photo Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {capturedImage ? (
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={14} />
                      <span>Retake Snapshot</span>
                    </button>
                  ) : (
                    isCameraActive && (
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Camera size={14} />
                        <span>Take Photo</span>
                      </button>
                    )
                  )}

                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Upload size={14} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {/* Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Patel"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-300)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. CS2024010"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-300)',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-300)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neutral-300)',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--neutral-700)', marginBottom: '4px' }}>
                  Student College Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@college.edu"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Extracting AI Facial Embeddings...' : 'Save & Register Biometric Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
