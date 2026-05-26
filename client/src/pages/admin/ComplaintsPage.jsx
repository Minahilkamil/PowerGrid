import React, { useState, useEffect } from 'react';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import toast from 'react-hot-toast';
import { FiSearch, FiMessageSquare, FiUser, FiCheckCircle, FiClock } from 'react-icons/fi';
import './Page.css';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([
    { _id: '1', consumer: { fullName: 'Ali Hassan' }, title: 'High Bill Amount', category: 'Billing', priority: 'High', status: 'Pending', createdAt: new Date() },
    { _id: '2', consumer: { fullName: 'Sara Khan' }, title: 'Meter Display Not Working', category: 'Meter Issue', priority: 'Medium', status: 'In Progress', createdAt: new Date() },
    { _id: '3', consumer: { fullName: 'Usman Malik' }, title: 'Frequent Outages', category: 'Power Outage', priority: 'Urgent', status: 'Pending', createdAt: new Date() },
  ]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const handleStatusChange = (id, newStatus) => {
    setComplaints(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
    toast.success(`Complaint status updated to ${newStatus}`);
  };

  const columns = [
    {
      key: 'consumer', label: 'Consumer',
      render: (c) => (
        <div className="user-cell">
          <div className="user-avatar">{c.consumer.fullName[0]}</div>
          <span>{c.consumer.fullName}</span>
        </div>
      )
    },
    { key: 'title', label: 'Issue' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', render: (c) => <Badge value={c.priority} color={c.priority === 'Urgent' ? 'red' : c.priority === 'High' ? 'orange' : 'blue'} /> },
    { key: 'status', label: 'Status', render: (c) => <Badge value={c.status} color={c.status === 'Resolved' ? 'green' : 'yellow'} /> },
    { key: 'createdAt', label: 'Date', render: (c) => new Date(c.createdAt).toLocaleDateString() },
    {
      key: 'actions', label: 'Actions',
      render: (c) => (
        <div className="actions-cell">
          <button className="action-btn text-blue" onClick={() => handleStatusChange(c._id, 'In Progress')} title="Start Progress"><FiClock /></button>
          <button className="action-btn text-green" onClick={() => handleStatusChange(c._id, 'Resolved')} title="Mark Resolved"><FiCheckCircle /></button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Complaint Management</h1>
          <p>Track and resolve consumer issues</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search complaints..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <Table
          columns={columns}
          data={complaints}
          loading={loading}
          emptyMsg="No complaints found."
        />
      </div>
    </div>
  );
}
