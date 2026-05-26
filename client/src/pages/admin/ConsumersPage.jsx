import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumerAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import {
  FiPlus, FiSearch, FiEye, FiEdit2, FiTrash2,
  FiUsers, FiRefreshCw, FiFilter, FiCheckCircle,
  FiAlertTriangle, FiZap, FiHome, FiBriefcase, FiXCircle
} from 'react-icons/fi';
import './Page.css';

const empty = {
  fullName: '', cnic: '', email: '', phone: '',
  address: '', area: '', meterNumber: '', connectionType: 'residential',
};

export default function ConsumersPage() {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editForm, setEditForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await consumerAPI.getAll({
        page, limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        connectionType: typeFilter || undefined,
      });
      setConsumers(res.data.data);
      setTotal(res.data.total);
    } catch {
      toast.error('Failed to load consumers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await consumerAPI.add(form);
      toast.success(`Consumer "${form.fullName}" added successfully!`);
      setAddModal(false);
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add consumer');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await consumerAPI.update(editId, editForm);
      toast.success('Consumer updated successfully!');
      setEditModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? They will lose access.`)) return;
    try {
      const res = await consumerAPI.delete(id);
      toast.success(res.data.message || `"${name}" has been deactivated`);
      load();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to deactivate consumer');
    }
  };

  const handleActivate = async (id, name) => {
    try {
      await consumerAPI.update(id, { status: 'active' });
      toast.success(`"${name}" has been reactivated!`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate');
    }
  };

  const openEdit = (c) => {
    setEditId(c._id);
    setEditForm({
      fullName: c.fullName,
      phone: c.phone,
      address: c.address,
      area: c.area,
      connectionType: c.connectionType,
      status: c.status,
    });
    setEditModal(true);
  };

  const stats = {
    total: total,
    active: consumers.filter(c => c.status === 'active').length, // This is only for current page, ideally should come from backend
    commercial: consumers.filter(c => c.connectionType === 'commercial').length,
  };

  const columns = [
    {
      key: 'fullName', label: 'Consumer',
      render: (r) => (
        <div className="user-cell">
          <div className="user-avatar" style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: '#fff' }}>
            {r.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{r.fullName}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'meterNumber', label: 'Meter ID',
      render: (r) => (
        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#1e40af', fontWeight: 700 }}>
          {r.meterNumber}
        </code>
      )
    },
    {
      key: 'connectionType', label: 'Type',
      render: (r) => <Badge value={r.connectionType} color={r.connectionType === 'commercial' ? 'purple' : r.connectionType === 'industrial' ? 'orange' : 'blue'} />
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge value={r.status} color={r.status === 'active' ? 'green' : 'red'} />
    },
    { key: 'createdAt', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions',
      render: (r) => (
        <div className="actions-cell">
          <button className="action-btn text-blue" onClick={() => navigate(`/admin/consumers/${r._id}`)} title="View Details"><FiEye /></button>
          <button className="action-btn text-orange" onClick={() => openEdit(r)} title="Edit Profile"><FiEdit2 /></button>
          {r.status === 'active' ? (
            <button className="action-btn text-red" onClick={() => handleDelete(r._id, r.fullName)} title="Deactivate"><FiTrash2 /></button>
          ) : (
            <button className="action-btn text-green" onClick={() => handleActivate(r._id, r.fullName)} title="Activate"><FiCheckCircle /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1>Consumer Management</h1>
          <p>Monitor electricity connections and consumer data</p>
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
          <FiPlus /> Add Connection
        </button>
      </div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}><FiUsers /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Consumers</div><strong>{total}</strong></div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#ecfdf5', color: '#10b981', borderRadius: '12px' }}><FiCheckCircle /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Active Links</div><strong>{consumers.filter(c => c.status === 'active').length}</strong></div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: '#f5f3ff', color: '#8b5cf6', borderRadius: '12px' }}><FiZap /></div>
          <div><div style={{ color: '#64748b', fontSize: '0.85rem' }}>Commercial</div><strong>{consumers.filter(c => c.connectionType === 'commercial').length}</strong></div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or meter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <Table
          columns={columns}
          data={consumers}
          loading={loading}
          emptyMsg="No consumers found matching your search."
        />
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Electricity Connection">
        <form onSubmit={handleAdd} className="modal-form">
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Full Name</label>
              <input type="text" className="modal-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="lf-group">
              <label>CNIC Number</label>
              <input type="text" className="modal-input" placeholder="35201-xxxxxxx-x" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} required />
            </div>
          </div>
          <div className="lf-group">
            <label>Email Address</label>
            <input type="email" className="modal-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Phone Number</label>
              <input type="text" className="modal-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="lf-group">
              <label>Area</label>
              <input type="text" className="modal-input" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} required />
            </div>
          </div>
          <div className="lf-group">
            <label>Full Address</label>
            <textarea className="modal-input" style={{ minHeight: '80px', padding: '10px' }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Meter Number</label>
              <input type="text" className="modal-input" value={form.meterNumber} onChange={e => setForm({ ...form, meterNumber: e.target.value })} required />
            </div>
            <div className="lf-group">
              <label>Connection Type</label>
              <select className="modal-input" value={form.connectionType} onChange={e => setForm({ ...form, connectionType: e.target.value })}>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
          </div>
          <button type="submit" className="lf-submit" disabled={saving}>
            {saving ? 'Registering...' : 'Approve & Create Connection'}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Consumer Profile">
        <form onSubmit={handleEdit} className="modal-form">
          <div className="lf-group">
            <label>Full Name</label>
            <input type="text" className="modal-input" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required />
          </div>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Phone Number</label>
              <input type="text" className="modal-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
            </div>
            <div className="lf-group">
              <label>Area</label>
              <input type="text" className="modal-input" value={editForm.area} onChange={e => setEditForm({ ...editForm, area: e.target.value })} required />
            </div>
          </div>
          <div className="lf-group">
            <label>Address</label>
            <textarea className="modal-input" style={{ minHeight: '80px', padding: '10px' }} value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} required />
          </div>
          <div className="lf-group">
            <label>Connection Type</label>
            <select className="modal-input" value={editForm.connectionType} onChange={e => setEditForm({ ...editForm, connectionType: e.target.value })}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
          <button type="submit" className="lf-submit" disabled={saving}>
            {saving ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
