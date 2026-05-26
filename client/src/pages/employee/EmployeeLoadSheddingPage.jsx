import React, { useState } from 'react';
import { 
  FiClock, FiSearch, FiAlertTriangle, FiMapPin, 
  FiZap, FiInfo, FiChevronRight, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';

export default function EmployeeLoadSheddingPage() {
  const schedules = [
    { id: 'LS-01', area: 'Gulshan Block 4, 13, 15', time: '02:00 PM - 04:00 PM', duration: '2 Hours', type: 'scheduled', status: 'upcoming' },
    { id: 'LS-02', area: 'North Nazimabad Sector 5', time: '06:00 PM - 07:00 PM', duration: '1 Hour', type: 'emergency', status: 'active' },
    { id: 'LS-03', area: 'DHA Phase 5, 6', time: '09:00 AM - 10:00 AM', duration: '1 Hour', type: 'maintenance', status: 'completed' },
    { id: 'LS-04', area: 'Korangi Industrial Area', time: '11:00 PM - 12:00 AM', duration: '1 Hour', type: 'scheduled', status: 'upcoming' },
  ];

  const columns = [
    { key: 'area', label: 'Affected Areas', render: (r) => <div style={{fontWeight: 600}}>{r.area}</div> },
    { key: 'time', label: 'Timing', render: (r) => <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><FiClock size={14} /> {r.time}</div> },
    { key: 'duration', label: 'Duration' },
    { key: 'type', label: 'Outage Type', render: (r) => <Badge value={r.type} color={r.type === 'emergency' ? 'red' : r.type === 'maintenance' ? 'orange' : 'blue'} /> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} color={r.status === 'active' ? 'red' : r.status === 'upcoming' ? 'orange' : 'green'} /> },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Outage & Load Shedding</h1>
          <p>Monitor real-time outage status and scheduled load shedding in your zones</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCalendar /> View Calendar
          </button>
        </div>
      </div>

      <div className="section-card" style={{ background: '#fef2f2', border: '1px solid #fee2e2', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          <FiAlertTriangle />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#991b1b', display: 'block' }}>Active Emergency Outage</strong>
          <p style={{ color: '#b91c1c', fontSize: '0.9rem', margin: '2px 0' }}>Technical fault at Substation-A is causing unplanned outages in North Nazimabad Sector 5.</p>
        </div>
        <button className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={() => toast.success('Updates sent to consumers!')}>
          Notify Consumers
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search by area or schedule ID..." />
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={schedules} loading={false} />
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
        <div className="section-card">
          <h3>Recent Outage Reports</h3>
          <div style={{ marginTop: '1rem' }}>
            {[
              { area: 'Block 2, Gulshan', report: 'Cable fault reported by consumer', time: '15 mins ago' },
              { area: 'Phase 1, DHA', report: 'Transformer sparking reported', time: '1 hour ago' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '1rem 0', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: '1rem' }}>
                <div style={{ color: '#f59e0b' }}><FiInfo /></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.area}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{r.report}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{r.time}</div>
                </div>
                <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><FiChevronRight /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h3>Zone Distribution</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { name: 'Zone A (North)', status: 'Stable', load: '45MW' },
              { name: 'Zone B (East)', status: 'Load Shedding', load: '12MW' },
              { name: 'Zone C (South)', status: 'Stable', load: '68MW' },
            ].map((z, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{z.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Current Load: {z.load}</div>
                </div>
                <Badge value={z.status} color={z.status === 'Stable' ? 'green' : 'orange'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
