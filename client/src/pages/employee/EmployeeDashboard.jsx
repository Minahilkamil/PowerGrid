import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, FiMessageSquare, FiCheckCircle, FiActivity, 
  FiAlertTriangle, FiUserCheck, FiMapPin, FiZap,
  FiTrendingUp, FiClock, FiBell, FiList, FiPlus
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import Badge from '../../components/Badge.jsx';

const taskData = [
  { name: 'Mon', tasks: 12 },
  { name: 'Tue', tasks: 19 },
  { name: 'Wed', tasks: 15 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 30 },
  { name: 'Sat', tasks: 10 },
  { name: 'Sun', tasks: 5 },
];

const complaintData = [
  { name: 'Resolved', value: 45, color: '#10b981' },
  { name: 'Pending', value: 15, color: '#f59e0b' },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState('Absent');

  const stats = [
    { label: 'Assigned Tasks', value: '12', sub: '4 Pending', icon: <FiBriefcase />, color: 'blue' },
    { label: 'Today\'s Readings', value: '24', sub: '8 Remaining', icon: <FiActivity />, color: 'purple' },
    { label: 'Attendance', value: attendance, sub: attendance === 'Present' ? 'Checked-in: 09:00 AM' : 'Not checked-in', icon: <FiUserCheck />, color: 'teal' },
    { label: 'Performance', value: '94', sub: 'Top 5%', icon: <FiTrendingUp />, color: 'pink' },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Employee Dashboard</h1>
          <p>Quick overview of your activities and tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => navigate('/employee/meter-readings')}>
            <FiPlus /> Start Reading
          </button>
          <button className="btn-secondary" onClick={() => navigate('/employee/attendance')}>
             Check In
          </button>
          <button className="btn-secondary" onClick={() => navigate('/employee/complaints')}>
             Complaints
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
            <div style={{ 
              padding: '1rem', 
              background: `var(--bg-${s.color})`, 
              color: `var(--text-${s.color})`, 
              borderRadius: '14px',
              fontSize: '1.5rem'
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{s.label}</div>
              <strong style={{ fontSize: '1.5rem', color: '#1e293b', display: 'block' }}>{s.value}</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{s.sub}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="section-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Weekly Work Progress</h3>
            <FiTrendingUp style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3>Complaint Status</h3>
          <div style={{ height: '260px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
            {complaintData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: d.color }}></div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Recent Complaints */}
        <div className="section-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Recent Assigned Complaints</h3>
            <button className="text-btn">View All</button>
          </div>
          <div className="activity-list">
            {[
              { id: 'CMP-8901', type: 'Voltage Issue', area: 'Gulshan-e-Iqbal', priority: 'high', time: '10 mins ago' },
              { id: 'CMP-8905', type: 'Meter Fault', area: 'North Nazimabad', priority: 'medium', time: '1 hour ago' },
              { id: 'CMP-8912', type: 'Wire Sparking', area: 'DHA Phase 6', priority: 'emergency', time: '2 hours ago' },
            ].map((item, i) => (
              <div key={i} className="activity-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                borderBottom: i === 2 ? 'none' : '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', 
                    background: item.priority === 'emergency' ? '#fef2f2' : '#f8fafc',
                    color: item.priority === 'emergency' ? '#ef4444' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FiMessageSquare />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.type} <small style={{ color: '#94a3b8', fontWeight: 400 }}>({item.id})</small></div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}><FiMapPin style={{fontSize: '0.7rem'}} /> {item.area}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge value={item.priority} color={item.priority === 'emergency' ? 'red' : item.priority === 'high' ? 'orange' : 'blue'} />
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Alerts & Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="section-card" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <FiAlertTriangle fontSize="1.25rem" />
              <h3 style={{ color: 'white', margin: 0 }}>Emergency Alerts</h3>
            </div>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
              Main transformer fault reported in Area-B Sector 4. Immediate attention required.
            </p>
            <button style={{ 
              width: '100%', padding: '0.75rem', borderRadius: '8px', 
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', fontWeight: 600, cursor: 'pointer'
            }}>
              Respond Now
            </button>
          </div>

          <div className="section-card">
            <h3>Load Shedding Notices</h3>
            <div style={{ marginTop: '1rem' }}>
              {[
                { area: 'Gulshan Block 4', time: '02:00 PM - 04:00 PM' },
                { area: 'North Nazimabad', time: '06:00 PM - 07:00 PM' },
              ].map((n, i) => (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.area}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}><FiClock style={{fontSize: '0.7rem'}} /> {n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
