import React from 'react';
import { 
  FiBell, FiInfo, FiAlertCircle, FiCheckCircle, 
  FiMessageSquare, FiSettings, FiClock, FiTrash2 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge.jsx';

export default function EmployeeNotificationsPage() {
  const notifications = [
    { id: 1, type: 'task', title: 'New Task Assigned', message: 'You have been assigned a new meter reading task for Gulshan Block 4.', time: '5 mins ago', read: false },
    { id: 2, type: 'alert', title: 'Emergency Alert', message: 'Main transformer fault reported in your area. Immediate attention required.', time: '1 hour ago', read: false },
    { id: 3, type: 'complaint', title: 'Complaint Assigned', message: 'Complaint CMP-8901 has been assigned to you for resolution.', time: '2 hours ago', read: true },
    { id: 4, type: 'attendance', title: 'Attendance Reminder', message: 'You haven\'t checked in yet. Please log your attendance.', time: '4 hours ago', read: true },
    { id: 5, type: 'system', title: 'System Update', message: 'The employee portal has been updated with new field reporting tools.', time: '1 day ago', read: true },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your latest task assignments and alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => toast.success('All marked as read')}>Mark all as read</button>
          <button className="icon-btn" style={{ background: '#f8fafc' }}><FiSettings /></button>
        </div>
      </div>

      <div className="section-card" style={{ padding: 0 }}>
        <div className="notification-list">
          {notifications.map((n, i) => (
            <div 
              key={n.id} 
              style={{ 
                padding: '1.5rem', 
                borderBottom: i === notifications.length - 1 ? 'none' : '1px solid #f1f5f9',
                background: n.read ? 'white' : '#eff6ff',
                display: 'flex', gap: '1.25rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: n.type === 'alert' ? '#fef2f2' : n.type === 'task' ? '#eff6ff' : '#f8fafc',
                color: n.type === 'alert' ? '#ef4444' : n.type === 'task' ? '#3b82f6' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                flexShrink: 0
              }}>
                {n.type === 'alert' ? <FiAlertCircle /> : n.type === 'task' ? <FiCheckCircle /> : <FiInfo />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontWeight: n.read ? 600 : 700 }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.time}</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{n.message}</p>
              </div>
              {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '4px' }}></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
