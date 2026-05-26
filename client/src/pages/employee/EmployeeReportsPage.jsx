import React from 'react';
import { 
  FiFileText, FiDownload, FiPrinter, FiSearch, 
  FiFilter, FiCalendar, FiPieChart, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';

export default function EmployeeReportsPage() {
  const reports = [
    { id: 'REP-2024-001', title: 'Daily Meter Reading Report', type: 'Meter Reading', date: '2024-05-24', status: 'generated' },
    { id: 'REP-2024-002', title: 'Complaint Resolution Summary', type: 'Complaints', date: '2024-05-23', status: 'generated' },
    { id: 'REP-2024-003', title: 'Weekly Performance Analysis', type: 'Performance', date: '2024-05-19', status: 'generated' },
    { id: 'REP-2024-004', title: 'Asset Maintenance Log', type: 'Maintenance', date: '2024-05-15', status: 'generated' },
    { id: 'REP-2024-005', title: 'Attendance & Work Hours', type: 'Attendance', date: '2024-05-01', status: 'archived' },
  ];

  const columns = [
    { key: 'id', label: 'Report ID' },
    { key: 'title', label: 'Report Title', render: (r) => <div style={{fontWeight: 600}}>{r.title}</div> },
    { key: 'type', label: 'Category' },
    { key: 'date', label: 'Generated Date' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} color={r.status === 'generated' ? 'green' : 'blue'} /> },
    { 
      key: 'actions', label: '', 
      render: (r) => (
        <div style={{display: 'flex', gap: '0.5rem'}}>
          <button className="icon-btn" title="Download PDF" onClick={() => toast.success('Downloading PDF...')}><FiDownload /></button>
          <button className="icon-btn" title="Print" onClick={() => toast.success('Preparing print...')}><FiPrinter /></button>
        </div>
      ) 
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Work Reports</h1>
          <p>Generate and download your work activity, performance, and field reports</p>
        </div>
        <button className="btn-primary" onClick={() => toast.success('Report generator opened')}>
          <FiFileText /> Generate New Report
        </button>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="section-card" style={{ textAlign: 'center' }}>
          <FiActivity style={{ color: '#3b82f6', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Readings</div>
          <strong style={{ fontSize: '1.25rem' }}>1,245</strong>
        </div>
        <div className="section-card" style={{ textAlign: 'center' }}>
          <FiPieChart style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Resolution Rate</div>
          <strong style={{ fontSize: '1.25rem' }}>98.2%</strong>
        </div>
        <div className="section-card" style={{ textAlign: 'center' }}>
          <FiCalendar style={{ color: '#8b5cf6', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Active Days</div>
          <strong style={{ fontSize: '1.25rem' }}>22/24</strong>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search reports by ID or Title..." />
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiFilter /> Filter by Type
        </button>
      </div>

      <div className="table-card">
        <Table columns={columns} data={reports} loading={false} />
      </div>
    </div>
  );
}
