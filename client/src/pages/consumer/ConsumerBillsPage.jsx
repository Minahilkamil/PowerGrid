import React, { useEffect, useState } from 'react';
import { consumerAPI, billAPI, paymentAPI } from '../../services/api.js';
import Table from '../../components/Table.jsx';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDownload, FiEye, FiPrinter, FiMail, FiBarChart2, FiShield, FiZap, FiCheckCircle } from 'react-icons/fi';
import '../admin/Page.css';
import './Consumer.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ConsumerBillsPage() {
  const [bills, setBills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [payMethod, setPayMethod] = useState('easypaisa');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pRes = await consumerAPI.getProfile();
      const profileData = pRes.data.data;
      setProfile(profileData);
      
      const bRes = await billAPI.getByConsumer(profileData._id, { limit: 50 });
      setBills(bRes.data.data || []);
    } catch (err) {
      console.error('Bills Load Error:', err);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const openPay = (bill) => { setSelectedBill(bill); setPayModal(true); };
  const openView = (bill) => { setSelectedBill(bill); setViewModal(true); };

  const handlePay = async (e) => {
    e.preventDefault();
    if (payMethod === 'card' && (!cardForm.number || !cardForm.expiry || !cardForm.cvc)) {
      return toast.error('Please fill all card details');
    }
    setPaying(true);
    try {
      const res = await paymentAPI.process({ 
        billId: selectedBill._id, 
        paymentMethod: payMethod,
        cardDetails: payMethod === 'card' ? cardForm : null
      });
      setPaymentResult(res.data.data);
      toast.success('Payment successful!');
      setPayModal(false);
      setReceiptModal(true);
      loadData();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Payment failed'); 
    } finally { 
      setPaying(false); 
    }
  };

  const downloadReceipt = (payment) => {
    toast.success('Downloading payment receipt...');
    // Simulated PDF download
    const receiptContent = `
      POWERGRID PAYMENT RECEIPT
      -------------------------
      Receipt #: ${payment.receiptNumber}
      Transaction ID: ${payment.transactionId || 'N/A'}
      Date: ${new Date(payment.paymentDate).toLocaleString()}
      Consumer: ${profile?.fullName}
      Meter: ${profile?.meterNumber}
      Bill Period: ${MONTHS[payment.bill.month-1]} ${payment.bill.year}
      Amount Paid: PKR ${payment.amount.toLocaleString()}
      Payment Method: ${payment.paymentMethod.toUpperCase()}
      Status: SUCCESS
    `;
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${payment.receiptNumber}.txt`;
    link.click();
  };

  const downloadPDF = async (billId) => {
    toast.success('Generating PDF bill...');
    try {
      const response = await billAPI.download(billId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bill_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download Error:', err);
      toast.error('Failed to download bill');
    }
  };

  const columns = [
    { key: 'month', label: 'Period', render: (r) => <span className="font-bold">{MONTHS[r.month-1]} {r.year}</span> },
    { key: 'unitsConsumed', label: 'Units (kWh)', render: (r) => <span className="units-badge">{r.unitsConsumed}</span> },
    { key: 'totalAmount', label: 'Total Amount', render: (r) => <span className="amount-text">PKR {r.totalAmount?.toLocaleString()}</span> },
    { key: 'dueDate', label: 'Due Date', render: (r) => <span className={r.status === 'overdue' ? 'text-danger font-bold' : ''}>{new Date(r.dueDate).toLocaleDateString()}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="table-actions">
        <button className="icon-btn" onClick={() => openView(r)} title="View Details"><FiEye /></button>
        <button className="icon-btn" onClick={() => downloadPDF(r._id)} title="Download PDF"><FiDownload /></button>
        {r.status !== 'paid' && (
          <button className="btn btn--primary btn--sm" onClick={() => openPay(r)}>Pay Now</button>
        )}
      </div>
    )},
  ];

  const latestBill = bills[0];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Billing History</h1>
          <p>View, manage and pay your electricity bills</p>
        </div>
        <div className="header-actions">
          <button className="btn btn--outline" onClick={() => toast.success('Analytics report generated!')}>
            <FiBarChart2 /> Analytics
          </button>
        </div>
      </div>

      {latestBill && latestBill.status !== 'paid' && (
        <div className="bill-hero-card">
          <div className="bh-info">
            <div className="bh-label">Current Amount Due</div>
            <div className="bh-amount">PKR {latestBill.totalAmount?.toLocaleString()}</div>
            <div className="bh-meta">Due Date: {new Date(latestBill.dueDate).toLocaleDateString()} &bull; Units: {latestBill.unitsConsumed} kWh</div>
          </div>
          <div className="bh-actions">
            <button className="btn btn--primary" onClick={() => openPay(latestBill)}><FiCreditCard /> Pay Current Bill</button>
            <button className="btn btn--light" onClick={() => downloadPDF(latestBill._id)}><FiDownload /> Download Bill</button>
          </div>
        </div>
      )}

      <div className="card table-card" style={{ marginTop: '1.5rem' }}>
        <Table columns={columns} data={bills} loading={loading} emptyMsg="No billing records found." />
      </div>

      {/* Payment Modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Secure Online Payment" width="450px">
        {selectedBill && (
          <form onSubmit={handlePay} className="payment-form">
            <div className="payment-summary">
              <div className="ps-row">
                <span>Bill Period</span>
                <strong>{MONTHS[selectedBill.month-1]} {selectedBill.year}</strong>
              </div>
              <div className="ps-row">
                <span>Consumer ID</span>
                <strong>#{profile?._id?.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="ps-total">
                <span>Total Payable</span>
                <strong>PKR {selectedBill.totalAmount?.toLocaleString()}</strong>
              </div>
            </div>

            <div className="form-group">
              <label>Select Payment Method</label>
              <div className="payment-methods-grid">
                {[
                  { id: 'easypaisa', label: 'EasyPaisa', icon: '💸' },
                  { id: 'jazzcash', label: 'JazzCash', icon: '📱' },
                  { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
                ].map(m => (
                  <div 
                    key={m.id} 
                    className={`pm-item ${payMethod === m.id ? 'active' : ''}`}
                    onClick={() => setPayMethod(m.id)}
                  >
                    <span className="pm-icon">{m.icon}</span>
                    <span className="pm-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {payMethod === 'card' && (
              <div className="card-details-fields animate-fade-in">
                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={cardForm.number}
                    onChange={(e) => setCardForm({...cardForm, number: e.target.value})}
                    maxLength={16}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({...cardForm, expiry: e.target.value})}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input 
                      type="password" 
                      placeholder="***"
                      value={cardForm.cvc}
                      onChange={(e) => setCardForm({...cardForm, cvc: e.target.value})}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn--light" onClick={() => setPayModal(false)}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={paying}>
                {paying ? 'Processing...' : `Pay PKR ${selectedBill.totalAmount?.toLocaleString()}`}
              </button>
            </div>
            <p className="payment-footer">
              <FiShield /> Secure 256-bit encrypted transaction
            </p>
          </form>
        )}
      </Modal>

      {/* Payment Receipt Modal */}
      <Modal open={receiptModal} onClose={() => setReceiptModal(false)} title="Payment Receipt" width="450px">
        {paymentResult && (
          <div className="receipt-view">
            <div className="receipt-success-icon">
              <FiCheckCircle />
            </div>
            <h2 className="receipt-title">Payment Successful!</h2>
            <p className="receipt-subtitle">Thank you for your payment.</p>

            <div className="receipt-details">
              <div className="rd-row">
                <span>Receipt Number</span>
                <strong>{paymentResult.receiptNumber}</strong>
              </div>
              <div className="rd-row">
                <span>Amount Paid</span>
                <strong>PKR {paymentResult.amount?.toLocaleString()}</strong>
              </div>
              <div className="rd-row">
                <span>Payment Date</span>
                <strong>{new Date(paymentResult.paymentDate).toLocaleString()}</strong>
              </div>
              <div className="rd-row">
                <span>Method</span>
                <Badge value={paymentResult.paymentMethod} />
              </div>
            </div>

            <div className="receipt-actions">
              <button className="btn btn--primary full-width" onClick={() => downloadReceipt(paymentResult)}>
                <FiDownload /> Download Receipt
              </button>
              <button className="btn btn--light full-width" onClick={() => setReceiptModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)} title="Bill Details" width="600px">
        {selectedBill && (
          <div className="bill-details-view">
            <div className="bd-header">
              <div className="bd-brand"><FiZap /> PowerGrid</div>
              <div className="bd-status"><Badge value={selectedBill.status} /></div>
            </div>

            <div className="bd-grid">
              <div className="bd-section">
                <h4>Consumer Info</h4>
                <p><strong>{profile?.fullName}</strong></p>
                <p>{profile?.meterNumber}</p>
                <p>{profile?.address}</p>
              </div>
              <div className="bd-section text-right">
                <h4>Bill Info</h4>
                <p>Period: {MONTHS[selectedBill.month-1]} {selectedBill.year}</p>
                <p>Due Date: {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                <p>Units: {selectedBill.unitsConsumed} kWh</p>
              </div>
            </div>

            <div className="bd-breakdown">
              <h4>Bill Breakdown</h4>
              <div className="bdb-row"><span>Base Amount</span><span>PKR {selectedBill.baseAmount?.toLocaleString()}</span></div>
              <div className="bdb-row"><span>Fuel Adjustment</span><span>PKR {selectedBill.fuelAdjustment?.toLocaleString()}</span></div>
              <div className="bdb-row"><span>Service Tax</span><span>PKR {selectedBill.serviceTax?.toLocaleString()}</span></div>
              <div className="bdb-row"><span>Meter Rent</span><span>PKR {selectedBill.meterRent?.toLocaleString()}</span></div>
              {selectedBill.lateFee > 0 && <div className="bdb-row text-danger"><span>Late Fee</span><span>PKR {selectedBill.lateFee?.toLocaleString()}</span></div>}
              <div className="bdb-total"><span>Total Payable</span><span>PKR {selectedBill.totalAmount?.toLocaleString()}</span></div>
            </div>

            <div className="bd-actions">
              <button className="btn btn--outline" onClick={() => window.print()}><FiPrinter /> Print</button>
              <button className="btn btn--outline" onClick={() => toast.success('Bill copy sent to email!')}><FiMail /> Email Copy</button>
              <button className="btn btn--primary" onClick={() => downloadPDF(selectedBill._id)}><FiDownload /> Download PDF</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
