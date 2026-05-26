import React, { useEffect, useState } from 'react';
import { complaintAPI, consumerAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import { FiPlus, FiMessageSquare, FiImage, FiClock, FiUser, FiInfo, FiSend, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Consumer.css';

const CATEGORIES = [
  { id: 'power_outage', label: 'Power Outage' },
  { id: 'voltage_issue', label: 'Voltage Issue' },
  { id: 'billing_issue', label: 'Billing Issue' },
  { id: 'meter_issue', label: 'Meter Issue' },
  { id: 'wire_fault', label: 'Wire Fault' },
  { id: 'transformer_fault', label: 'Transformer Fault' },
  { id: 'other', label: 'Other' },
];

export default function ConsumerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regModal, setRegModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');

  const [form, setForm] = useState({
    title: '',
    category: 'power_outage',
    priority: 'medium',
    description: '',
    images: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await complaintAPI.getMy();
      setComplaints(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await complaintAPI.register(form);
      toast.success('Complaint registered successfully!');
      setRegModal(false);
      setForm({ title: '', category: 'power_outage', priority: 'medium', description: '', images: [] });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setSaving(false);
    }
  };

  const openView = (c) => {
    setSelected(c);
    setViewModal(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      // Assuming a hypothetical endpoint for adding comments
      // await complaintAPI.addComment(selected._id, { text: comment });
      
      // For now, simulate locally
      const updated = {
        ...selected,
        comments: [...(selected.comments || []), {
          _id: Date.now().toString(),
          text: comment,
          author: { name: 'You' },
          createdAt: new Date().toISOString()
        }]
      };
      setSelected(updated);
      setComplaints(complaints.map(c => c._id === updated._id ? updated : c));
      setComment('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const columns = [
    { key: 'complaintId', label: 'ID', render: (r) => <span className="font-bold">{r.complaintId}</span> },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (r) => <span>{CATEGORIES.find(c => c.id === r.category)?.label || r.category}</span> },
    { key: 'createdAt', label: 'Date', render: (r) => <span>{new Date(r.createdAt).toLocaleDateString()}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <button className="btn btn--light btn--sm" onClick={() => openView(r)}>View & Track</button>
    )},
  ];

  return (
    <div className="complaints-page">
      <div className="page-header">
        <div>
          <h1>Complaint Management</h1>
          <p>Register and track your electricity-related issues</p>
        </div>
        <button className="btn btn--primary" onClick={() => setRegModal(true)}>
          <FiPlus /> Register Complaint
        </button>
      </div>

      <div className="stats-grid">
        <div className="card stat-card-alt">
          <div className="sca-icon blue"><FiMessageSquare /></div>
          <div className="sca-info">
            <label>Total Complaints</label>
            <h3>{complaints.length}</h3>
            <span>Overall feedback</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon yellow"><FiClock /></div>
          <div className="sca-info">
            <label>Pending Action</label>
            <h3>{complaints.filter(c => ['pending', 'assigned'].includes(c.status)).length}</h3>
            <span className="text-warning">Awaiting resolution</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon green"><FiCheckCircle /></div>
          <div className="sca-info">
            <label>Successfully Resolved</label>
            <h3>{complaints.filter(c => c.status === 'resolved').length}</h3>
            <span className="text-success">Issue fixed</span>
          </div>
        </div>
      </div>

      <div className="card table-card" style={{marginTop: '1.5rem'}}>
        <Table columns={columns} data={complaints} loading={loading} emptyMsg="No complaints found." />
      </div>

      {/* Register Modal */}
      <Modal open={regModal} onClose={() => setRegModal(false)} title="Register New Complaint" width="500px">
        <form onSubmit={handleRegister} className="complaint-form">
          <div className="form-group">
            <label>Complaint Title</label>
            <input 
              type="text" 
              placeholder="Brief summary of the issue"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Detailed Description</label>
            <textarea 
              placeholder="Provide more details about the problem..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Attachments (Optional)</label>
            <div className="file-upload-zone">
              <FiImage />
              <p>Click to upload images of the fault</p>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn--light" onClick={() => setRegModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title={`Track Complaint #${selected?.complaintId}`} width="700px">
        {selected && (
          <div className="complaint-details-view">
            <div className="cd-header">
              <div className="cd-info">
                <h3>{selected.title}</h3>
                <p>Category: {CATEGORIES.find(c => c.id === selected.category)?.label} &bull; Date: {new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge value={selected.status} />
            </div>

            <div className="cd-grid">
              <div className="cd-main">
                <div className="cd-section">
                  <h4>Description</h4>
                  <p>{selected.description}</p>
                </div>

                <div className="cd-timeline">
                  <h4>Activity & Comments</h4>
                  <div className="timeline-list">
                    {selected.comments?.length === 0 ? <p className="empty-msg">No activity yet</p> : 
                      selected.comments?.map(c => (
                      <div key={c._id} className="timeline-item">
                        <div className="tl-avatar">{c.author?.name?.[0]}</div>
                        <div className="tl-content">
                          <div className="tl-header">
                            <strong>{c.author?.name}</strong>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddComment} className="comment-box">
                    <input 
                      type="text" 
                      placeholder="Add a comment or update..." 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button type="submit" className="icon-btn blue"><FiSend /></button>
                  </form>
                </div>
              </div>

              <div className="cd-side">
                <div className="card info-card-mini">
                  <h4><FiUser /> Assigned To</h4>
                  <p>{selected.assignedTo?.name || 'Waiting for assignment'}</p>
                </div>
                <div className="card info-card-mini">
                  <h4><FiClock /> Expected Resolution</h4>
                  <p>{selected.expectedResolutionTime ? new Date(selected.expectedResolutionTime).toLocaleString() : 'TBD'}</p>
                </div>
                <div className="card info-card-mini">
                  <h4><FiInfo /> Status Notes</h4>
                  <p>{selected.resolutionNotes || 'No notes yet'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
