import React, { useState } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { FiPlus, FiClock, FiMapPin, FiCalendar, FiTrash2 } from 'react-icons/fi';
import './Page.css';

export default function LoadSheddingPage() {
  const [schedules, setSchedules] = useState([
    { _id: '1', area: 'Model Town', startTime: '14:00', endTime: '15:00', type: 'Scheduled', status: 'Active' },
    { _id: '2', area: 'Gulberg III', startTime: '10:00', endTime: '12:00', type: 'Maintenance', status: 'Active' },
    { _id: '3', area: 'DHA Phase 5', startTime: '18:00', endTime: '19:00', type: 'Scheduled', status: 'Active' },
  ]);
  const [addModal, setAddModal] = useState(false);

  const columns = [
    {
      key: 'area', label: 'Area',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiMapPin style={{ color: '#94a3b8' }} />
          <strong>{s.area}</strong>
        </div>
      )
    },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', render: (s) => <Badge value={s.status} color="yellow" /> },
    {
      key: 'actions', label: 'Actions',
      render: (s) => (
        <div className="actions-cell">
          <button className="action-btn text-red" onClick={() => toast.success('Schedule removed')}><FiTrash2 /></button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header-row">
              <div>
                <h1>Load Shedding Management</h1>
                <p>Create and manage power outage schedules</p>
              </div>
              <button className="btn-add" onClick={() => setAddModal(true)}>
                <FiPlus /> Add Schedule
              </button>
            </div>

      <div className="table-card">
        <Table
          columns={columns}
          data={schedules}
          emptyMsg="No schedules found."
        />
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Outage Schedule">
        <form onSubmit={(e) => { e.preventDefault(); setAddModal(false); toast.success('Schedule created and notifications sent!'); }}>
          <div className="lf-group">
            <label>Area / Grid Station</label>
            <input type="text" className="modal-input" placeholder="e.g. Johar Town Block B" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="lf-group">
              <label>Start Time</label>
              <input type="time" className="modal-input" required />
            </div>
            <div className="lf-group">
              <label>End Time</label>
              <input type="time" className="modal-input" required />
            </div>
          </div>
          <div className="lf-group">
            <label>Type</label>
            <select className="modal-input">
              <option>Scheduled</option>
              <option>Maintenance</option>
              <option>Emergency</option>
            </select>
          </div>
          <button type="submit" className="lf-submit" style={{ marginTop: '1rem' }}>
            Broadcast Schedule
          </button>
        </form>
      </Modal>
    </div>
  );
}
