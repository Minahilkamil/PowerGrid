import React from 'react';
import { FiLock, FiShield, FiEye, FiGlobe, FiSmartphone, FiActivity } from 'react-icons/fi';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import './Page.css';

export default function SecurityPage() {
  const logs = [
    { user: 'admin@electricity.com', action: 'Login Success', ip: '119.155.21.228', device: 'Chrome / Windows', time: '2 mins ago' },
    { user: 'employee@electricity.com', action: 'Bill Generated', ip: '39.37.165.168', device: 'Firefox / Mac', time: '1 hour ago' },
    { user: 'admin@electricity.com', action: 'Tariff Updated', ip: '119.155.21.228', device: 'Chrome / Windows', time: '3 hours ago' },
    { user: 'unknown', action: 'Failed Login Attempt', ip: '182.161.44.12', device: 'Unknown / Linux', time: '5 hours ago' },
  ];

  const columns = [
    { key: 'user', label: 'User', render: (l) => <strong>{l.user}</strong> },
    { key: 'action', label: 'Action', render: (l) => <span style={{ color: l.action.includes('Failed') ? '#ef4444' : 'inherit' }}>{l.action}</span> },
    { key: 'ip', label: 'IP Address' },
    { key: 'device', label: 'Device' },
    { key: 'time', label: 'Time' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Security & Access Logs</h1>
          <p>Monitor system activity and secure your administrative account</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="section-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FiSmartphone style={{ fontSize: '1.5rem', color: '#10b981' }} />
            <div>
              <h4 style={{ color: '#64748b' }}>Two-Factor Auth</h4>
              <strong>Enabled (SMS + Authenticator)</strong>
            </div>
          </div>
        </div>
        <div className="section-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FiGlobe style={{ fontSize: '1.5rem', color: '#3b82f6' }} />
            <div>
              <h4 style={{ color: '#64748b' }}>Active Sessions</h4>
              <strong>2 Authorized Devices</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Activity Audit Logs</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Badge value="Real-time" color="green" />
          </div>
        </div>
        <div className="table-card">
          <Table
            columns={columns}
            data={logs}
            emptyMsg="No activity logs found."
          />
        </div>
      </div>
    </div>
  );
}
