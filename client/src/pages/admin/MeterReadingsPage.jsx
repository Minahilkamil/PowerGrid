import React, { useEffect, useState, useCallback } from 'react';
import { meterAPI, consumerAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import './Page.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [consumers, setConsumers] = useState([]);
  const [form, setForm] = useState({ consumerId:'', previousReading:'', currentReading:'', month: now.getMonth()+1, year: now.getFullYear(), notes:'' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await meterAPI.getAll({ page, limit: 10 });
      setReadings(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load readings'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    consumerAPI.getAll({ limit: 100 }).then((r) => setConsumers(r.data.data)).catch(() => {});
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await meterAPI.add(form);
      toast.success('Reading added!');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'consumer', label: 'Consumer', render: (r) => r.consumer?.fullName || '—' },
    { key: 'meterNumber', label: 'Meter No.' },
    { key: 'month', label: 'Month', render: (r) => `${MONTHS[r.month-1]} ${r.year}` },
    { key: 'previousReading', label: 'Prev Reading' },
    { key: 'currentReading', label: 'Curr Reading' },
    { key: 'unitsConsumed', label: 'Units Consumed' },
    { key: 'readingDate', label: 'Date', render: (r) => new Date(r.readingDate).toLocaleDateString() },
    { key: 'recordedBy', label: 'Recorded By', render: (r) => r.recordedBy?.name || '—' },
  ];

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h1>Meter Readings</h1><p>{total} total readings</p></div>
        <button className="btn-add" onClick={() => setModal(true)}><FiPlus /> Add Reading</button>
      </div>

      <div className="table-card">
        <Table columns={columns} data={readings} loading={loading} />
        <div className="pagination">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
          <span>Page {page} of {Math.ceil(total/10)||1}</span>
          <button disabled={page>=Math.ceil(total/10)} onClick={() => setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Meter Reading" width="500px">
        <form onSubmit={handleAdd} className="modal-form">
          <div className="form-group">
            <label>Consumer</label>
            <select value={form.consumerId} onChange={(e) => setForm({...form,consumerId:e.target.value})} required>
              <option value="">Select consumer...</option>
              {consumers.map((c) => <option key={c._id} value={c._id}>{c.fullName} — {c.meterNumber}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Previous Reading</label>
            <input type="number" value={form.previousReading} onChange={(e) => setForm({...form,previousReading:e.target.value})} required min="0" />
          </div>
          <div className="form-group">
            <label>Current Reading</label>
            <input type="number" value={form.currentReading} onChange={(e) => setForm({...form,currentReading:e.target.value})} required min="0" />
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div className="form-group">
              <label>Month</label>
              <select value={form.month} onChange={(e) => setForm({...form,month:parseInt(e.target.value)})}>
                {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.year} onChange={(e) => setForm({...form,year:parseInt(e.target.value)})} min="2020" max="2030" />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <input type="text" value={form.notes} onChange={(e) => setForm({...form,notes:e.target.value})} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving?'Saving...':'Add Reading'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
