import React, { useEffect, useState } from 'react';
import { consumerAPI, paymentAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import '../admin/Page.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ConsumerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consumerAPI.getProfile().then((r) => {
      return paymentAPI.getByConsumer(r.data.data._id, { limit: 50 });
    }).then((r) => setPayments(r.data.data))
    .catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'receiptNumber', label: 'Receipt No.' },
    { key: 'bill', label: 'Bill Period', render: (r) => r.bill ? `${MONTHS[r.bill.month-1]} ${r.bill.year}` : '—' },
    { key: 'amount', label: 'Amount', render: (r) => `PKR ${r.amount?.toLocaleString()}` },
    { key: 'paymentMethod', label: 'Method', render: (r) => <Badge value={r.paymentMethod} /> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'paymentDate', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
  ];

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h1>Payment History</h1><p>{payments.length} payments</p></div>
      </div>
      <div className="table-card">
        <Table columns={columns} data={payments} loading={loading} emptyMsg="No payments found." />
      </div>
    </div>
  );
}
