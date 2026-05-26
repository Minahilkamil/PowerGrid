import React, { useState } from 'react';
import { 
  FiTool, FiActivity, FiClock, FiCheckCircle, 
  FiAlertCircle, FiPlus, FiFilter, FiCalendar, FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge.jsx';
import Table from '../../components/Table.jsx';

export default function EmployeeMaintenancePage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { 
      id: 'MNT-501', equipment: 'Transformer TR-88', area: 'Area B-4', 
      type: 'Preventive', status: 'pending', lastCheck: '2024-03-15', nextCheck: '2024-05-30' 
    },
    { 
      id: 'MNT-502', equipment: 'Substation Panel 4', area: 'Sector 12', 
      type: 'Corrective', status: 'in-progress', lastCheck: '2024-04-10', nextCheck: '2024-05-25' 
    },
    { 
      id: 'MNT-503', equipment: 'Pole #442 Insulator', area: 'DHA Phase 5', 
      type: 'Routine', status: 'completed', lastCheck: '2024-05-10', nextCheck: '2024-06-10' 
    },
  ]);

  const filteredTasks = maintenanceTasks.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.equipment.toLowerCase().includes(search.toLowerCase()) ||
                         t.id.toLowerCase().includes(search.toLowerCase()) ||
                         t.area.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (id) => {
    const nextStatusMap = {
      'pending': 'in-progress',
      'in-progress': 'completed',
      'completed': 'pending'
    };
    setMaintenanceTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: nextStatusMap[t.status] } : t
    ));
    toast.success('Task status updated!');
  };

  const columns = [
    { key: 'id', label: 'Task ID', render: (r) => <span style={{fontWeight: 700}}>{r.id}</span> },
    { key: 'equipment', label: 'Equipment/Asset' },
    { key: 'type', label: 'Type' },
    { key: 'area', label: 'Area/Location' },
    { key: 'nextCheck', label: 'Next Due', render: (r) => <span style={{color: '#ef4444', fontWeight: 500}}>{r.nextCheck}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { 
      key: 'actions', label: '', 
      render: (r) => (
        <button className="icon-btn" title="Update Status" onClick={() => handleUpdateStatus(r.id)}>
          <FiActivity />
        </button>
      ) 
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Maintenance Management</h1>
          <p>Schedule and track preventive and corrective maintenance of assets</p>
        </div>
        <button className="btn-primary" onClick={() => toast.success('New maintenance task form')}>
          <FiPlus /> New Task
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="section-card">
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Pending Checks</div>
          <strong style={{ fontSize: '1.5rem', color: '#f59e0b' }}>12</strong>
        </div>
        <div className="section-card">
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Overdue</div>
          <strong style={{ fontSize: '1.5rem', color: '#ef4444' }}>03</strong>
        </div>
        <div className="section-card">
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Completed (MTD)</div>
          <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>45</strong>
        </div>
        <div className="section-card">
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Efficiency</div>
          <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>94%</strong>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search equipment or area..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="tabs" style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          {['all', 'pending', 'in-progress', 'completed'].map(tab => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              style={{ 
                padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                background: filter === tab ? 'white' : 'transparent',
                color: filter === tab ? '#1e293b' : '#64748b',
                fontWeight: filter === tab ? 600 : 500,
                boxShadow: filter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={filteredTasks} loading={false} />
      </div>
    </div>
  );
}
