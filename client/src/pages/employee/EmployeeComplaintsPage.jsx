import React, { useState } from 'react';
import { 
  FiMessageSquare, FiSearch, FiFilter, FiClock, 
  FiMapPin, FiPhone, FiCheckCircle, FiMoreVertical,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';

export default function EmployeeComplaintsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [search, setSearch] = useState('');

  const [complaints, setComplaints] = useState([
    { 
      id: 'CMP-8901', category: 'Voltage Issue', priority: 'high', status: 'assigned',
      consumer: 'Mohammad Ahmed', area: 'Gulshan Block 13', time: '10:30 AM', 
      phone: '+92 321 4567890', desc: 'Low voltage since morning, fridge not starting.'
    },
    { 
      id: 'CMP-8905', category: 'Meter Fault', priority: 'medium', status: 'in-progress',
      consumer: 'Saira Bano', area: 'North Nazimabad', time: '09:15 AM',
      phone: '+92 333 1234567', desc: 'Meter screen is blank and not showing reading.'
    },
    { 
      id: 'CMP-8912', category: 'Wire Sparking', priority: 'emergency', status: 'assigned',
      consumer: 'Ali Khan', area: 'DHA Phase 6', time: '11:45 AM',
      phone: '+92 300 9876543', desc: 'Sparking in main service line outside house.'
    },
  ]);

  const handleResolve = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
    toast.success(`Complaint ${id} marked as resolved!`);
    setModalOpen(false);
  };

  const filteredComplaints = complaints.filter(c => 
    c.consumer.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.area.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'category', label: 'Category',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.category}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.id}</div>
        </div>
      )
    },
    {
      key: 'consumer', label: 'Consumer Details',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.consumer}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}><FiMapPin size={10} /> {r.area}</div>
        </div>
      )
    },
    {
      key: 'priority', label: 'Priority',
      render: (r) => <Badge value={r.priority} color={r.priority === 'emergency' ? 'red' : r.priority === 'high' ? 'orange' : 'blue'} />
    },
    {
      key: 'time', label: 'Reported At',
      render: (r) => <div style={{ fontSize: '0.85rem', color: '#64748b' }}><FiClock size={12} /> {r.time}</div>
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge value={r.status} />
    },
    {
      key: 'actions', label: '',
      render: (r) => (
        <button className="icon-btn" onClick={() => { setSelectedComplaint(r); setModalOpen(true); }}>
          <FiMoreVertical />
        </button>
      )
    }
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Assigned Complaints</h1>
        <p>Respond to and resolve consumer electricity issues</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Complaint ID, Category or Area..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={filteredComplaints} loading={false} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Complaint Details">
        {selectedComplaint && (
          <div style={{ padding: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedComplaint.category}</h2>
                <span style={{ color: '#64748b' }}>{selectedComplaint.id}</span>
              </div>
              <Badge value={selectedComplaint.status} />
            </div>

            <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {selectedComplaint.consumer[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedComplaint.consumer}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}><FiPhone size={12} /> {selectedComplaint.phone}</div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => window.location.href = `tel:${selectedComplaint.phone}`}
                >
                  <FiPhone /> Call Now
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                <FiMapPin style={{ color: '#ef4444', marginTop: '3px' }} />
                <span>{selectedComplaint.area}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Issue Description</label>
              <p style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem' }}>
                {selectedComplaint.desc}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleResolve(selectedComplaint.id)}>
                <FiCheckCircle /> Mark Resolved
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
