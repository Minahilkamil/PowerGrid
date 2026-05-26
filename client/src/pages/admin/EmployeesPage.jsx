import React, { useEffect, useState, useCallback } from 'react';
import { adminAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiBriefcase, FiMail,
  FiCalendar, FiCheckCircle, FiXCircle, FiUserCheck,
  FiUserX, FiClock, FiFilter
} from 'react-icons/fi';
import './Page.css';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, pending
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: 'employee' });
      setEmployees(res.data.data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(id, { isActive: !currentStatus });
      toast.success('Employee status updated');
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleApprove = async (id, action) => {
    try {
      await adminAPI.approveEmployee(id, action);
      toast.success(`Employee ${action === 'approve' ? 'approved' : 'rejected'}`);
      load();
    } catch {
      toast.error('Failed to update approval status');
    }
  };

  const filtered = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());

    if (filter === 'active') return matchesSearch && e.isActive && e.approvalStatus === 'approved';
    if (filter === 'pending') return matchesSearch && e.approvalStatus === 'pending';
    return matchesSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.isActive && e.approvalStatus === 'approved').length,
    pending: employees.filter(e => e.approvalStatus === 'pending').length,
  };

  const columns = [
    {
      key: 'name', label: 'Employee',
      render: (emp) => (
        <div className="user-cell">
          <div className="user-avatar" style={{ background: emp.approvalStatus === 'pending' ? '#fef3c7' : '#eff6ff', color: emp.approvalStatus === 'pending' ? '#d97706' : '#3b82f6' }}>
            {emp.name?.[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{emp.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'approvalStatus', label: 'Approval',
      render: (emp) => (
        <Badge
          value={emp.approvalStatus}
          color={emp.approvalStatus === 'approved' ? 'green' : emp.approvalStatus === 'pending' ? 'yellow' : 'red'}
        />
      )
    },
    {
      key: 'isActive', label: 'System Access',
      render: (emp) => (
        <Badge
          value={emp.isActive ? 'Active' : 'Disabled'}
          color={emp.isActive ? 'green' : 'red'}
        />
      )
    },
    { key: 'createdAt', label: 'Joined', render: (emp) => new Date(emp.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions',
      render: (emp) => (
        <div className="actions-cell">
          {emp.approvalStatus === 'pending' ? (
            <>
              <button className="action-btn text-green" onClick={() => handleApprove(emp._id, 'approve')} title="Approve"><FiUserCheck /></button>
              <button className="action-btn text-red" onClick={() => handleApprove(emp._id, 'reject')} title="Reject"><FiUserX /></button>
            </>
          ) : (
            <button
              className={`action-btn ${emp.isActive ? 'text-red' : 'text-green'}`}
              onClick={() => handleToggleStatus(emp._id, emp.isActive)}
              title={emp.isActive ? 'Deactivate' : 'Activate'}
            >
              {emp.isActive ? <FiXCircle /> : <FiCheckCircle />}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Employee Management</h1>
          <p>Verify staff applications and manage grid personnel</p>
        </div>
        <button 
          className="btn-add" 
          onClick={() => {
            console.log('Button clicked!');
            setAddModal(true);
          }}
          style={{ 
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <FiPlus /> Add Staff
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}><FiBriefcase /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Staff</div><strong>{stats.total}</strong></div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#ecfdf5', color: '#10b981', borderRadius: '12px' }}><FiCheckCircle /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Active</div><strong>{stats.active}</strong></div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#fffbeb', color: '#d97706', borderRadius: '12px' }}><FiClock /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Pending</div><strong>{stats.pending}</strong></div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`filter-tab ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        </div>
      </div>

      <div className="table-card">
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMsg="No employees found matching your criteria."
        />
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Register New Staff">
        <form onSubmit={(e) => { e.preventDefault(); toast.error('Employee creation is handled via registration page for now.'); }}>
          <div className="lf-group">
            <label>Full Name</label>
            <input type="text" className="modal-input" placeholder="e.g. Ahmad Khan" required />
          </div>
          <div className="lf-group">
            <label>Email Address</label>
            <input type="email" className="modal-input" placeholder="staff@electricity.com" required />
          </div>
          <div className="lf-group">
            <label>Temporary Password</label>
            <input type="password" className="modal-input" required />
          </div>
          <button type="submit" className="lf-submit" style={{ marginTop: '1rem' }}>
            Generate Account
          </button>
        </form>
      </Modal>
    </div>
  );
}
