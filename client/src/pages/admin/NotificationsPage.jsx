import React, { useState } from 'react';
import { FiBell, FiMail, FiMessageCircle, FiSend, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Page.css';

export default function NotificationsPage() {
  const [msg, setMsg] = useState('');
  const [target, setTarget] = useState('all');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Broadcast Notifications</h1>
          <p>Send SMS, Email, and Push alerts to consumers and staff</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="section-card">
          <h3>Send New Broadcast</h3>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Broadcast sent successfully!'); setMsg(''); }}>
            <div className="lf-group">
              <label>Target Audience</label>
              <select className="modal-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="all">All Consumers</option>
                <option value="residential">Residential Only</option>
                <option value="commercial">Commercial Only</option>
                <option value="employees">All Employees</option>
              </select>
            </div>
            <div className="lf-group">
              <label>Message Content</label>
              <textarea 
                className="modal-input" 
                rows="5" 
                placeholder="Type your message here..." 
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> SMS Alert
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Email Notice
              </label>
            </div>
            <button type="submit" className="lf-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <FiSend /> Dispatch Broadcast
            </button>
          </form>
        </div>

        <div className="section-card">
          <h3>Recent Alerts History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { title: 'Maintenance Alert', date: 'Today, 10:00 AM', target: 'Gulberg Area', type: 'SMS' },
              { title: 'Bill Due Reminder', date: 'Yesterday', target: 'All Consumers', type: 'Email' },
              { title: 'New Tariff Update', date: '2 days ago', target: 'Commercial', type: 'Both' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Target: {n.target} &bull; {n.date}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{n.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
