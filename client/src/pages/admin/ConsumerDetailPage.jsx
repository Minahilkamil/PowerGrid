import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consumerAPI, meterAPI, billAPI } from '../../services/api.js';
import Badge from '../../components/Badge.jsx';
import Table from '../../components/Table.jsx';
import { FiArrowLeft } from 'react-icons/fi';
import './Page.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ConsumerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consumer, setConsumer] = useState(null);
  const [readings, setReadings] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      consumerAPI.getOne(id),
      meterAPI.getByConsumer(id),
      billAPI.getByConsumer(id),
    ]).then(([c, r, b]) => {
      setConsumer(c.data.data);
      setReadings(r.data.data);
      setBills(b.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!consumer) return <div>Consumer not found</div>;

  const readingCols = [
    { key: 'month', label: 'Month', render: (r) => `${MONTHS[r.month-1]} ${r.year}` },
    { key: 'previousReading', label: 'Prev Reading' },
    { key: 'currentReading', label: 'Curr Reading' },
    { key: 'unitsConsumed', label: 'Units' },
    { key: 'readingDate', label: 'Date', render: (r) => new Date(r.readingDate).toLocaleDateString() },
  ];

  const billCols = [
    { key: 'month', label: 'Month', render: (r) => `${MONTHS[r.month-1]} ${r.year}` },
    { key: 'unitsConsumed', label: 'Units' },
    { key: 'totalAmount', label: 'Amount', render: (r) => `PKR ${r.totalAmount?.toLocaleString()}` },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'dueDate', label: 'Due Date', render: (r) => new Date(r.dueDate).toLocaleDateString() },
  ];

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/admin/consumers')}><FiArrowLeft /> Back to Consumers</button>

      <div className="info-card">
        <h3>Consumer Profile</h3>
        <div className="detail-grid">
          {[['Full Name', consumer.fullName],['CNIC', consumer.cnic],['Email', consumer.email],['Phone', consumer.phone],['Address', consumer.address],['Meter Number', consumer.meterNumber],['Connection Type', consumer.connectionType],['Installation Date', new Date(consumer.installationDate).toLocaleDateString()]].map(([l,v]) => (
            <div className="detail-item" key={l}>
              <label>{l}</label>
              <p>{v}</p>
            </div>
          ))}
          <div className="detail-item">
            <label>Status</label>
            <p><Badge value={consumer.status} /></p>
          </div>
        </div>
      </div>

      <div className="info-card">
        <h3>Meter Reading History</h3>
        <Table columns={readingCols} data={readings} loading={false} emptyMsg="No readings found." />
      </div>

      <div className="info-card">
        <h3>Bill History</h3>
        <Table columns={billCols} data={bills} loading={false} emptyMsg="No bills found." />
      </div>
    </div>
  );
}
