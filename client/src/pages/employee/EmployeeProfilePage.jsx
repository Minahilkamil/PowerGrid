import React, { useState } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, 
  FiCamera, FiShield, FiClock, FiBriefcase 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const employeeInfo = {
    id: 'EMP-2024-045',
    fullName: user?.name || 'Ali Hassan',
    department: 'Field Operations',
    designation: 'Senior Meter Reader',
    assignedArea: 'Gulshan-e-Iqbal, Karachi',
    phone: '+92 300 1234567',
    email: user?.email || 'ali@example.com',
    joiningDate: '15 Jan 2022',
    zones: ['Zone A-1', 'Zone B-4', 'Zone C-2'],
    workHistory: [
      { date: '2024-05-20', task: 'Transformer Maintenance', status: 'Completed' },
      { date: '2024-05-18', task: 'Meter Reading Cycle', status: 'Completed' },
      { date: '2024-05-15', task: 'Emergency Repair', status: 'Completed' },
    ]
  };

  return (
    <div className="page-container">
      <div className="profile-header-card section-card" style={{ marginBottom: '2rem' }}>
        <div className="profile-cover" style={{ 
          height: '150px', 
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)', 
          borderRadius: '12px 12px 0 0',
          margin: '-1.5rem -1.5rem 0 -1.5rem',
          position: 'relative'
        }}>
          <div className="profile-avatar-container" style={{
            position: 'absolute',
            bottom: '-50px',
            left: '2rem',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem'
          }}>
            <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
              <div className="profile-avatar" style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                background: 'white', border: '4px solid white', 
                fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                color: '#1e40af'
              }}>
                {employeeInfo.fullName[0]}
              </div>
              <button className="avatar-edit-btn" style={{
                position: 'absolute', bottom: '5px', right: '5px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'white', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <FiCamera size={16} />
              </button>
            </div>
            <div className="profile-name-section" style={{ paddingBottom: '10px' }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>{employeeInfo.fullName}</h2>
              <p style={{ margin: 0, color: '#64748b' }}>{employeeInfo.designation} • {employeeInfo.id}</p>
            </div>
          </div>
        </div>
        <div style={{ height: '60px' }}></div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Basic Info */}
        <div className="section-card">
          <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <h3>Employee Information</h3>
            <button className="text-btn">Edit Profile</button>
          </div>
          <div className="info-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="info-item">
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Department</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FiBriefcase className="text-blue" /> {employeeInfo.department}
              </div>
            </div>
            <div className="info-item">
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Assigned Area</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FiMapPin className="text-blue" /> {employeeInfo.assignedArea}
              </div>
            </div>
            <div className="info-item">
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FiPhone className="text-blue" /> {employeeInfo.phone}
              </div>
            </div>
            <div className="info-item">
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FiMail className="text-blue" /> {employeeInfo.email}
              </div>
            </div>
            <div className="info-item">
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Joining Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
                <FiCalendar className="text-blue" /> {employeeInfo.joiningDate}
              </div>
            </div>
          </div>
        </div>

        {/* Work & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="section-card">
            <h3>Assigned Zones</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              {employeeInfo.zones.map(zone => (
                <span key={zone} style={{ 
                  padding: '0.5rem 1rem', background: '#eff6ff', 
                  color: '#1e40af', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 
                }}>
                  {zone}
                </span>
              ))}
            </div>
          </div>

          <div className="section-card">
            <h3>Security & Account</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <FiShield /> Change Password
              </button>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <FiClock /> Security Activity Log
              </button>
            </div>
          </div>

          <div className="section-card">
            <h3>Recent Work History</h3>
            <div className="history-list" style={{ marginTop: '1rem' }}>
              {employeeInfo.workHistory.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0',
                  borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.task}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.date}</div>
                  </div>
                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
