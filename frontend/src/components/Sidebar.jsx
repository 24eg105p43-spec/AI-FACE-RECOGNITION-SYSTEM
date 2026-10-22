import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  ClipboardList, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight,
  Radio,
  MapPin
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable Slots', icon: CalendarClock },
    { id: 'students', label: 'Student Biometrics', icon: Users },
    { id: 'attendance', label: 'Attendance Records', icon: ClipboardList },
    { id: 'security', label: 'Anti-Spoof Security', icon: ShieldAlert }
  ];

  return (
    <aside style={{
      width: collapsed ? '80px' : '260px',
      background: '#ffffff',
      borderRight: '1px solid var(--neutral-200)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      flexShrink: 0
    }}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: '-14px',
          top: '24px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: '#ffffff',
          border: '1px solid var(--neutral-300)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 30,
          boxShadow: 'var(--shadow-sm)',
          color: 'var(--neutral-600)'
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav List */}
      <nav style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--neutral-600)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.925rem',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              title={item.label}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '15%',
                  bottom: '15%',
                  width: '4px',
                  background: 'var(--primary-600)',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              <Icon size={20} color={isActive ? 'var(--primary-600)' : 'var(--neutral-500)'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Campus System Geofence Badge */}
      {!collapsed && (
        <div style={{
          margin: '16px',
          padding: '16px',
          background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--neutral-200)',
          fontSize: '0.775rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--neutral-800)', marginBottom: '6px' }}>
            <MapPin size={14} color="var(--primary-600)" />
            <span>Campus Geofence</span>
          </div>
          <div style={{ color: 'var(--neutral-600)', lineHeight: '1.4' }}>
            Radius: <strong>500m active</strong>
          </div>
          <div style={{ color: 'var(--neutral-500)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            <span>OpenCV 5 & YuNet active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
