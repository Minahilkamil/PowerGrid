import React, { useState, useRef } from 'react';
import { 
  FiActivity, FiSearch, FiCamera, FiMapPin, 
  FiCheckCircle, FiAlertCircle, FiClock, FiUser, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Table from '../../components/Table.jsx';
import Modal from '../../components/Modal.jsx';

export default function EmployeeMeterReadingsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [readings, setReadings] = useState([
    { id: 'RDG-101', meter: 'ME-89021', consumer: 'Aslam Khan', reading: '45600', units: '370', date: '2024-05-24', status: 'verified' },
    { id: 'RDG-102', meter: 'ME-89055', consumer: 'Zahid Ahmed', reading: '12400', units: '150', date: '2024-05-24', status: 'pending' },
    { id: 'RDG-103', meter: 'ME-89102', consumer: 'Maria Bibi', reading: '32150', units: '210', date: '2024-05-23', status: 'verified' },
  ]);

  const [readingForm, setReadingForm] = useState({
    meterId: '',
    consumer: '',
    prevReading: '45230',
    currReading: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleReadingSubmit = (e) => {
    e.preventDefault();
    const curr = parseInt(readingForm.currReading);
    const prev = parseInt(readingForm.prevReading);
    
    if (curr <= prev) {
      toast.error('Current reading must be higher than previous reading!');
      return;
    }

    const newReading = {
      id: `RDG-${Math.floor(Math.random() * 1000)}`,
      meter: readingForm.meterId || 'ME-NEW',
      consumer: 'New Consumer',
      reading: curr.toString(),
      units: (curr - prev).toString(),
      date: readingForm.date,
      status: 'pending'
    };

    setReadings([newReading, ...readings]);
    toast.success('Reading submitted and GPS verified!');
    setModalOpen(false);
    setPreview(null);
    setSelectedFile(null);
    setReadingForm({ ...readingForm, meterId: '', currReading: '' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const columns = [
    { key: 'meter', label: 'Meter ID' },
    { key: 'consumer', label: 'Consumer' },
    { key: 'reading', label: 'Reading (kWh)' },
    { key: 'units', label: 'Units' },
    { key: 'date', label: 'Date' },
    { 
      key: 'status', label: 'Status',
      render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: r.status === 'verified' ? '#10b981' : '#f59e0b' }}>
        {r.status === 'verified' ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
        <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{r.status}</span>
      </div>
    }
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Meter Readings</h1>
        <p>Record and manage electricity meter consumption data</p>
      </div>

      <div className="filter-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Meter ID or Consumer Name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setModalOpen(true)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            height: '46px',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}
        >
          <FiActivity /> New Reading
        </button>
      </div>

      <div className="table-card">
        <Table columns={columns} data={readings} loading={false} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Meter Reading">
        <form onSubmit={handleReadingSubmit} className="modal-form">
          <div className="lf-group">
            <label>Meter Number / Consumer ID</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" className="modal-input" placeholder="Enter meter number" required
                value={readingForm.meterId}
                onChange={e => setReadingForm({...readingForm, meterId: e.target.value})}
              />
              <button type="button" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', color: '#3b82f6', cursor: 'pointer' }}>
                <FiSearch />
              </button>
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Previous Reading</label>
              <input type="text" className="modal-input" value={readingForm.prevReading} disabled />
            </div>
            <div className="lf-group">
              <label>Current Reading</label>
              <input 
                type="number" className="modal-input" placeholder="00000" required
                value={readingForm.currReading}
                onChange={e => setReadingForm({...readingForm, currReading: e.target.value})}
              />
            </div>
          </div>

          <div className="lf-group">
            <label>Upload Meter Photo</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                border: '2px dashed #e2e8f0', borderRadius: '12px', padding: preview ? '0.5rem' : '2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                cursor: 'pointer', background: '#f8fafc', position: 'relative',
                minHeight: '120px', justifyContent: 'center', overflow: 'hidden'
              }}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Meter preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setSelectedFile(null); }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiX size={14} />
                  </button>
                </>
              ) : (
                <>
                  <FiCamera fontSize="2rem" color="#94a3b8" />
                  <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Click to capture or upload photo</div>
                </>
              )}
            </div>
          </div>

          <div style={{ 
            background: '#eff6ff', padding: '1rem', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1e40af', fontSize: '0.85rem'
          }}>
            <FiMapPin />
            <span>GPS location will be verified on submission</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Reading</button>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
