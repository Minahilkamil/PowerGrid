import React, { useEffect, useState } from 'react';
import { serviceAPI, consumerAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import { FiPlus, FiFileText, FiUpload, FiCheckCircle, FiClock, FiActivity, FiUser, FiHome, FiArrowRight, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Consumer.css';

const SERVICE_TYPES = [
  { id: 'new_connection', label: 'New Connection', icon: <FiPlus /> },
  { id: 'load_change', label: 'Load Increase/Decrease', icon: <FiActivity /> },
  { id: 'meter_replacement', label: 'Meter Replacement', icon: <FiFileText /> },
  { id: 'ownership_transfer', label: 'Ownership Transfer', icon: <FiUser /> },
  { id: 'disconnection', label: 'Disconnection Request', icon: <FiHome /> },
];

export default function ConsumerServicesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: '',
    description: '',
    address: '',
    connectionType: 'residential',
    documents: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await serviceAPI.getMy();
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await serviceAPI.apply({ ...form, type: selectedType.id });
      toast.success('Application submitted successfully!');
      setApplyModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'requestId', label: 'Request ID', render: (r) => <span className="font-bold">#{r._id?.slice(-6).toUpperCase()}</span> },
    { key: 'type', label: 'Service Type', render: (r) => <span>{SERVICE_TYPES.find(t => t.id === r.type)?.label || r.type}</span> },
    { key: 'createdAt', label: 'Applied On', render: (r) => <span>{new Date(r.createdAt).toLocaleDateString()}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <button className="btn btn--light btn--sm">Track Status</button>
    )},
  ];

  return (
    <div className="services-page">
      <div className="page-header">
        <div>
          <h1>Connection Services</h1>
          <p>Apply for new electricity services or modify existing ones</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card-alt">
          <div className="sca-icon blue"><FiZap /></div>
          <div className="sca-info">
            <label>Active Connections</label>
            <h3>1</h3>
            <span>Standard Residential</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon purple"><FiClock /></div>
          <div className="sca-info">
            <label>Service Requests</label>
            <h3>{requests.length}</h3>
            <span>Total applications</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon green"><FiCheckCircle /></div>
          <div className="sca-info">
            <label>Approved Services</label>
            <h3>{requests.filter(r => r.status === 'approved').length}</h3>
            <span className="text-success">Verified connections</span>
          </div>
        </div>
      </div>

      <div className="service-selection-grid">
        {SERVICE_TYPES.map(s => (
          <div key={s.id} className="card service-type-card" onClick={() => { setSelectedType(s); setApplyModal(true); }}>
            <div className="stc-icon">{s.icon}</div>
            <h3>{s.label}</h3>
            <p>Process your {s.label.toLowerCase()} request online.</p>
            <div className="stc-arrow"><FiArrowRight /></div>
          </div>
        ))}
      </div>

      <div className="card table-card" style={{marginTop: '2rem'}}>
        <div className="card-header-row">
          <h3 style={{paddingLeft: '20px'}}>Your Service Applications</h3>
        </div>
        <Table columns={columns} data={requests} loading={loading} emptyMsg="No service applications found." />
      </div>

      {/* Application Modal */}
      <Modal open={applyModal} onClose={() => setApplyModal(false)} title={`Apply for ${selectedType?.label}`} width="550px">
        <form onSubmit={handleApply} className="service-form">
          <div className="form-group">
            <label>Service Details</label>
            <textarea 
              placeholder="Briefly describe your request..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
              rows={3}
            />
          </div>
          
          {selectedType?.id === 'new_connection' && (
            <div className="form-row">
              <div className="form-group">
                <label>Connection Type</label>
                <select value={form.connectionType} onChange={(e) => setForm({...form, connectionType: e.target.value})}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Installation Address</label>
            <input 
              type="text" 
              placeholder="Full address for service"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              required
            />
          </div>

          <div className="document-upload-section">
            <label>Required Documents</label>
            <div className="doc-grid">
              <div className="doc-item">
                <FiUpload />
                <span>Upload CNIC</span>
              </div>
              <div className="doc-item">
                <FiUpload />
                <span>Property Docs</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn--light" onClick={() => setApplyModal(false)}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
