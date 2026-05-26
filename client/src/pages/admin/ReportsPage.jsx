import React from 'react';
import { FiFileText, FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Page.css';

export default function ReportsPage() {
  const reports = [
    { title: 'Monthly Revenue Report', desc: 'Detailed breakdown of collections, taxes, and late fees.', icon: <FiFileText /> },
    { title: 'Consumer Usage Analysis', desc: 'Area-wise consumption patterns and peak load reports.', icon: <FiBarChart2 /> },
    { title: 'Employee Performance', desc: 'Task completion rates and attendance summary.', icon: <FiTrendingUp /> },
    { title: 'System Loss Report', desc: 'Analysis of technical and non-technical losses.', icon: <FiPieChart /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Generate and export system-wide performance reports</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {reports.map((r, i) => (
          <div key={i} className="section-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: '12px', color: '#3b82f6', fontSize: '1.5rem' }}>
              {r.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{r.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{r.desc}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="add-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => toast.success('Report generated! Download starting...')}>
                  <FiDownload /> Export PDF
                </button>
                <button className="add-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#10b981' }} onClick={() => toast.success('Excel file exported!')}>
                  <FiDownload /> Export Excel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
