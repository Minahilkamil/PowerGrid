import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billAPI, paymentAPI } from '../../services/api.js';
import Badge from '../../components/Badge.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import './Page.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    billAPI.getOne(id).then((r) => setBill(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await paymentAPI.process({ billId: id, paymentMethod: payMethod });
      toast.success('Payment processed!');
      setPayModal(false);
      billAPI.getOne(id).then((r) => setBill(r.data.data));
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!bill) return <div>Bill not found</div>;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/admin/bills')}><FiArrowLeft /> Back to Bills</button>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h1 style={{fontSize:'1.4rem',fontWeight:700}}>Bill — {MONTHS[bill.month-1]} {bill.year}</h1>
          <p style={{color:'var(--text-muted)',fontSize:'.85rem'}}>{bill.consumer?.fullName} • {bill.meterNumber}</p>
        </div>
        <div style={{display:'flex',gap:'.75rem',alignItems:'center'}}>
          <Badge value={bill.status} />
          {bill.status !== 'paid' && (
            <button className="btn-add" onClick={() => setPayModal(true)}><FiCreditCard /> Pay Now</button>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div className="info-card">
          <h3>Consumer Details</h3>
          <div className="detail-grid">
            {[['Name',bill.consumer?.fullName],['CNIC',bill.consumer?.cnic],['Email',bill.consumer?.email],['Phone',bill.consumer?.phone],['Address',bill.consumer?.address],['Meter No.',bill.meterNumber]].map(([l,v]) => (
              <div className="detail-item" key={l}><label>{l}</label><p>{v||'—'}</p></div>
            ))}
          </div>
        </div>

        <div className="info-card">
          <h3>Bill Breakdown</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
            {[['Units Consumed',`${bill.unitsConsumed} kWh`],['Base Amount',`PKR ${bill.baseAmount?.toLocaleString()}`],['Fuel Adjustment',`PKR ${bill.fuelAdjustment?.toLocaleString()}`],['Service Tax',`PKR ${bill.serviceTax?.toLocaleString()}`],['Meter Rent',`PKR ${bill.meterRent}`],['Late Fee',`PKR ${bill.lateFee}`]].map(([l,v]) => (
              <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:'.875rem',padding:'.5rem 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{color:'var(--text-muted)'}}>{l}</span>
                <span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'1rem',fontWeight:700,padding:'.5rem 0',color:'var(--primary)'}}>
              <span>Total Amount</span>
              <span>PKR {bill.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Process Payment" width="400px">
        <form onSubmit={handlePay} className="modal-form">
          <div style={{background:'#f0fdf4',padding:'1rem',borderRadius:'8px',marginBottom:'.5rem'}}>
            <p style={{fontSize:'.875rem',color:'#065f46'}}>Amount to pay: <strong>PKR {bill.totalAmount?.toLocaleString()}</strong></p>
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setPayModal(false)}>Cancel</button>
            <button type="submit" className="btn-save" disabled={paying}>{paying?'Processing...':'Confirm Payment'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
