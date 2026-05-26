import React, { useState } from 'react';
import { 
  FiBox, FiSearch, FiTool, FiZap, FiPlus, 
  FiRefreshCw, FiAlertTriangle, FiCheckCircle,
  FiActivity, FiFileText, FiX
} from 'react-icons/fi';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';

export default function EmployeeInventoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ item: '', quantity: '', reason: '' });

  const inventoryItems = [
    { id: 'INV-101', name: 'Digital Meter (Residential)', type: 'Meter', stock: 45, unit: 'pcs', status: 'in-stock' },
    { id: 'INV-102', name: 'Aluminium Wire (10mm)', type: 'Wire', stock: 120, unit: 'meters', status: 'low-stock' },
    { id: 'INV-103', name: 'Transformer Oil', type: 'Consumable', stock: 200, unit: 'liters', status: 'in-stock' },
    { id: 'INV-104', name: 'Safety Helmet', type: 'PPE', stock: 5, unit: 'pcs', status: 'out-of-stock' },
  ];

  const columns = [
    { key: 'name', label: 'Item Name', render: (r) => <div style={{fontWeight: 600}}>{r.name}</div> },
    { key: 'type', label: 'Category' },
    { key: 'stock', label: 'Current Stock', render: (r) => <span>{r.stock} {r.unit}</span> },
    { 
      key: 'status', label: 'Status', 
      render: (r) => (
        <Badge 
          value={r.status.replace('-', ' ')} 
          color={r.status === 'in-stock' ? 'green' : r.status === 'low-stock' ? 'orange' : 'red'} 
        />
      ) 
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="icon-btn" title="Request Reorder" onClick={() => toast.success('Reorder request sent!')}>
            <FiRefreshCw />
          </button>
          <button className="icon-btn text-red" title="Report Damage" onClick={() => toast.error('Damage report form opened')}>
            <FiAlertTriangle />
          </button>
        </div>
      )
    }
  ];

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    toast.success(`Request for ${requestForm.quantity} ${requestForm.item} submitted!`);
    setModalOpen(false);
    setRequestForm({ item: '', quantity: '', reason: '' });
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Inventory & Equipment</h1>
          <p>Track tools, equipment, and material stock levels</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> Request Equipment
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}><FiBox /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Categories</div>
            <strong>24 Items</strong>
          </div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#ef4444', borderRadius: '12px' }}><FiAlertTriangle /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Low Stock Alerts</div>
            <strong>05 Items</strong>
          </div>
        </div>
        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '0.75rem', background: '#ecfdf5', color: '#10b981', borderRadius: '12px' }}><FiCheckCircle /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Assigned Tools</div>
            <strong>12 Tools</strong>
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search inventory by name or ID..." />
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={inventoryItems} loading={false} />
      </div>

      <div className="section-card" style={{ marginTop: '2.5rem' }}>
        <h3>My Assigned Equipment</h3>
        <div className="equipment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {[
            { name: 'Insulated Toolkit', icon: <FiTool />, date: 'Jan 20, 2024' },
            { name: 'Safety Harness', icon: <FiZap />, date: 'Feb 15, 2024' },
            { name: 'Multimeter V3', icon: <FiActivity />, date: 'Mar 10, 2024' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Issued: {item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Equipment/Stock Request">
        <form onSubmit={handleRequestSubmit} className="modal-form">
          <div className="lf-group">
            <label>Item Name</label>
            <select 
              className="modal-input" 
              value={requestForm.item} 
              onChange={e => setRequestForm({...requestForm, item: e.target.value})}
              required
            >
              <option value="">Select Item</option>
              <option value="Meter">Digital Meter</option>
              <option value="Wire">Aluminium Wire</option>
              <option value="Tool">Toolkit</option>
              <option value="Consumable">Transformer Oil</option>
            </select>
          </div>
          <div className="lf-group">
            <label>Quantity Required</label>
            <input 
              type="number" 
              className="modal-input" 
              value={requestForm.quantity}
              onChange={e => setRequestForm({...requestForm, quantity: e.target.value})}
              placeholder="e.g. 5" 
              required 
            />
          </div>
          <div className="lf-group">
            <label>Reason for Request</label>
            <textarea 
              className="modal-input" 
              style={{ minHeight: '80px' }}
              value={requestForm.reason}
              onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
              placeholder="Provide a brief reason..."
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Request</button>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
