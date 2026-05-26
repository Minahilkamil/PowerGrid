import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { billAPI, meterAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { FiPlus, FiEye, FiAlertCircle } from 'react-icons/fi';
import './Page.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BillsPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState({ readingId: '', dueDate: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billAPI.getAll({ page, limit: 10, status: statusFilter || undefined });
      setBills(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const openGenerateModal = async () => {
    try {
      const res = await meterAPI.getAll({ limit: 100 });
      setReadings(res.data.data);
      setModal(true);
    } catch { toast.error('Failed to load readings'); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await billAPI.generate(form);
      toast.success('Bill generated!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleMarkOverdue = async () => {
    try {
      const res = await billAPI.markOverdue();
      toast.success(res.data.message);
      load();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'consumer', label: 'Consumer', render: (r) => r.consumer?.fullName || '—' },
    { key: 'meterNumber', label: 'Meter No.' },
    { key: 'month', label: 'Period', render: (r) => `${MONTHS[r.month-1]} ${r.year}` },
    { key: 'unitsConsumed', label: 'Units' },
    { key: 'totalAmount', label: 'Amount', render: (r) => `PKR ${r.totalAmount?.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'dueDate', label: 'Due Date', render: (r) => new Date(r.dueDate).toLocaleDateString() },
    { key: 'actions', label: '', render: (r) => (
      <button className="icon-btn blue" onClick={() => navigate(`/admin/bills/${r._id}`)}><FiEye /></button>
    )},
  ];

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h1>Bills</h1><p>{total} total bills</p></div>
        <div style={{display:'flex',gap:'.75rem'}}>
          <button className="btn-add" style={{background:'linear-gradient(135deg,#d97706,#f59e0b)'}} onClick={handleMarkOverdue}><FiAlertCircle /> Mark Overdue</button>
          <button className="btn-add" onClick={openGenerateModal}><FiPlus /> Generate Bill</button>
        </div>
      </div>

      <div className="filters-row">
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="table-card">
        <Table columns={columns} data={bills} loading={loading} />
        <div className="pagination">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
          <span>Page {page} of {Math.ceil(total/10)||1}</span>
          <button disabled={page>=Math.ceil(total/10)} onClick={() => setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Generate Bill" width="500px">
        <form onSubmit={handleGenerate} className="modal-form">
          <div className="form-group">
            <label>Select Meter Reading</label>
            <select value={form.readingId} onChange={(e) => setForm({...form,readingId:e.target.value})} required>
              <option value="">Select reading...</option>
              {readings.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.consumer?.fullName} — {MONTHS[r.month-1]} {r.year} ({r.unitsConsumed} units)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date (optional)</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({...form,dueDate:e.target.value})} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving?'Generating...':'Generate Bill'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
