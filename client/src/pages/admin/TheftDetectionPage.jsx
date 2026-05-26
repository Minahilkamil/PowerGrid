import React, { useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import toast from 'react-hot-toast';
import { FiShield, FiAlertTriangle, FiActivity, FiSearch } from 'react-icons/fi';
import './Page.css';

export default function TheftDetectionPage() {
  const [alerts, setAlerts] = useState([
    { _id: '1', consumer: 'Ali Hassan', type: 'Meter Tampering', severity: 'High', details: 'Sudden drop in voltage detected', status: 'Unresolved' },
    { _id: '2', consumer: 'Sara Khan', type: 'Consumption Spike', severity: 'Medium', details: '300% increase compared to last month', status: 'Investigating' },
    { _id: '3', consumer: 'Usman Malik', type: 'Bypass Detected', severity: 'Urgent', details: 'Load detected without meter movement', status: 'Unresolved' },
  ]);

  const columns = [
    { key: 'consumer', label: 'Consumer', render: (a) => <strong>{a.consumer}</strong> },
    { key: 'type', label: 'Detection Type' },
    { key: 'severity', label: 'Severity', render: (a) => <Badge value={a.severity} color={a.severity === 'Urgent' ? 'red' : a.severity === 'High' ? 'orange' : 'yellow'} /> },
    { key: 'details', label: 'Details', render: (a) => <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.details}</span> },
    { key: 'status', label: 'Status', render: (a) => <Badge value={a.status} color="blue" /> },
    {
      key: 'actions', label: 'Actions',
      render: (a) => (
        <div className="actions-cell">
          <button className="action-btn text-blue" onClick={() => toast.success('Investigation started')}><FiActivity /></button>
          <button className="action-btn text-red" onClick={() => toast.error('Police report generated')}><FiShield /></button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Theft & Fraud Detection</h1>
          <p>AI-based anomaly detection for electricity theft</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="section-card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <h4 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Active Alerts</h4>
          <h2 style={{ color: '#7f1d1d' }}>{alerts.filter(a => a.status !== 'Resolved').length}</h2>
        </div>
        <div className="section-card">
          <h4 style={{ color: '#64748b', marginBottom: '0.5rem' }}>Total Losses Prevented</h4>
          <h2>PKR 124,500</h2>
        </div>
      </div>

      <div className="table-card">
        <Table
          columns={columns}
          data={alerts}
          emptyMsg="No theft alerts detected."
        />
      </div>
    </div>
  );
}
