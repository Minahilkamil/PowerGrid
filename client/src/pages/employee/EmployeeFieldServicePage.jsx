import React, { useState } from 'react';
import { 
  FiMapPin, FiNavigation, FiPhone, FiCheckCircle, 
  FiAlertTriangle, FiCamera, FiFileText, FiCalendar,
  FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge.jsx';

export default function EmployeeFieldServicePage() {
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([
    { 
      id: 'VST-201', consumer: 'Aslam Pervez', area: 'Gulshan Block 4', 
      address: 'House B-12, Lane 3', purpose: 'Transformer Inspection', 
      priority: 'high', time: '10:00 AM', status: 'pending'
    },
    { 
      id: 'VST-202', consumer: 'Commercial Plaza 4', area: 'North Nazimabad', 
      address: 'Plot 45, Sector 5', purpose: 'Main Line Repair', 
      priority: 'emergency', time: '12:30 PM', status: 'pending'
    },
    { 
      id: 'VST-203', consumer: 'Public Park', area: 'DHA Phase 2', 
      address: 'Main Entrance Pole', purpose: 'Street Light Maintenance', 
      priority: 'low', time: '03:00 PM', status: 'completed'
    },
  ]);

  const handleCompleteVisit = (id) => {
    setVisits(prev => prev.map(v => v.id === id ? { ...v, status: 'completed' } : v));
    setSelectedVisit(prev => ({ ...prev, status: 'completed' }));
    toast.success('Field report submitted and visit completed!');
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Field Service Operations</h1>
        <p>Manage your daily field visits, route planning, and on-site reporting</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }}>
        {/* Visit Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="section-card">
            <div className="card-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Today's Schedule</h3>
              <FiCalendar />
            </div>
            <div className="visit-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visits.map(v => (
                <div 
                  key={v.id} 
                  onClick={() => setSelectedVisit(v)}
                  style={{ 
                    padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer',
                    background: selectedVisit?.id === v.id ? '#eff6ff' : 'white',
                    borderColor: selectedVisit?.id === v.id ? '#3b82f6' : '#f1f5f9',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#1e40af' }}>{v.id}</span>
                    <Badge value={v.status} />
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{v.purpose}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiMapPin size={12} /> {v.area}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 600 }}>
                    <FiNavigation size={12} /> Scheduled: {v.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visit Details & Reporting */}
        <div className="section-card">
          {selectedVisit ? (
            <div className="visit-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selectedVisit.purpose}</h2>
                  <p style={{ color: '#64748b', margin: '4px 0' }}>{selectedVisit.id} • {selectedVisit.consumer}</p>
                </div>
                <Badge value={selectedVisit.priority} />
              </div>

              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="info-item">
                  <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Site Address</label>
                  <div style={{ fontWeight: 500 }}><FiMapPin className="text-blue" /> {selectedVisit.address}</div>
                </div>
                <div className="info-item">
                  <label style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Contact</label>
                  <div style={{ fontWeight: 500 }}><FiPhone className="text-blue" /> +92 300 1234567</div>
                </div>
              </div>

              <div className="reporting-tools" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                <h4 style={{ marginBottom: '1.5rem' }}>Field Reporting Tools</h4>
                <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                    <FiCamera size={24} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Upload Site Photo</div>
                  </div>
                  <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer' }}>
                    <FiFileText size={24} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>Site Observation</div>
                  </div>
                </div>
                
                <div className="lf-group">
                  <label>Maintenance Notes</label>
                  <textarea className="modal-input" placeholder="Enter details about work performed..." style={{ minHeight: '100px' }}></textarea>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  {selectedVisit.status !== 'completed' ? (
                    <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleCompleteVisit(selectedVisit.id)}>
                      <FiCheckCircle /> Complete Visit
                    </button>
                  ) : (
                    <button className="btn-secondary" style={{ flex: 1, color: '#10b981' }} disabled>
                      <FiCheckCircle /> Visit Completed
                    </button>
                  )}
                  <button className="btn-secondary" style={{ flex: 1 }}>
                    <FiNavigation /> Get Directions
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <FiNavigation size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3>Select a visit from the schedule to view details and report.</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
