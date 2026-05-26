import React, { useEffect, useState, useCallback } from 'react';
import { paymentAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import toast from 'react-hot-toast';
import './Page.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getAll({ page, limit: 10, paymentMethod: methodFilter || undefined });
      setPayments(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [page, methodFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'receiptNumber', label: 'Receipt No.' },
    { key: 'consumer', label: 'Consumer', render: (r) => r.consumer?.fullName || '—' },
    { key: 'bill', label: 'Bill Period', render: (r) => r.bill ? `${MONTHS[r.bill.month-1]} ${r.bill.year}` : '—' },
    { key: 'amount', label: 'Amount', render: (r) => `PKR ${r.amount?.toLocaleString()}` },
    { key: 'paymentMethod', label: 'Method', render: (r) => <Badge value={r.paymentMethod} /> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'paymentDate', label: 'Date', render: (r) => new Date(r.paymentDate).toLocaleDateString() },
  ];

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h1>Payments</h1><p>{total} total payments</p></div>
      </div>

      <div className="filters-row">
        <select className="filter-select" value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}>
          <option value="">All Methods</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="credit_card">Credit Card</option>
          <option value="easypaisa">EasyPaisa</option>
          <option value="jazzcash">JazzCash</option>
        </select>
      </div>

      <div className="table-card">
        <Table columns={columns} data={payments} loading={loading} />
        <div className="pagination">
          <button disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
          <span>Page {page} of {Math.ceil(total/10)||1}</span>
          <button disabled={page>=Math.ceil(total/10)} onClick={() => setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
