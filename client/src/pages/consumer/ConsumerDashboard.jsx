import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumerAPI, billAPI, paymentAPI, complaintAPI, outageAPI } from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiFileText, FiCreditCard, FiActivity, FiAlertTriangle,
  FiCheckCircle, FiArrowRight, FiZap, FiRefreshCw,
  FiMessageSquare, FiClock, FiShield, FiTrendingUp, FiDownload,
  FiPlus, FiMapPin, FiCalendar
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
  LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';
import '../admin/AdminDashboard.css';
import '../admin/Page.css';
import './Consumer.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const profileRes = await consumerAPI.getProfile();
      const profileData = profileRes.data.data;
      setProfile(profileData);
      
      const cid = profileData._id;
      
      // Load other data in parallel, but handle individual failures
      const results = await Promise.allSettled([
        billAPI.getByConsumer(cid, { limit: 12 }),
        paymentAPI.getByConsumer(cid, { limit: 6 }),
        complaintAPI.getMy(),
        outageAPI.getLive(),
      ]);
      
      if (results[0].status === 'fulfilled') setBills(results[0].value.data.data || []);
      if (results[1].status === 'fulfilled') setPayments(results[1].value.data.data || []);
      if (results[2].status === 'fulfilled') setComplaints(results[2].value.data.data || []);
      if (results[3].status === 'fulfilled') setOutages(results[3].value.data.data || []);

    } catch (err) {
      console.error('Dashboard Load Error:', err);
      if (err.response?.status === 404) {
        toast.error('Consumer profile not found. Please contact support.');
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '.875rem' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const pendingBills  = bills.filter((b) => b.status === 'pending');
  const overdueBills  = bills.filter((b) => b.status === 'overdue');
  const paidBills     = bills.filter((b) => b.status === 'paid');
  const totalDue      = [...pendingBills, ...overdueBills].reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalPaid     = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const latestBill    = bills[0];
  const lastPayment   = payments[0];
  const activeComplaints = complaints.filter(c => ['pending', 'assigned', 'in_progress'].includes(c.status));

  const chartData = [...bills].reverse().slice(-6).map((b) => ({
    name: `${MONTHS[b.month - 1]}`,
    Units: b.unitsConsumed || 0,
    Amount: b.totalAmount || 0,
  }));

  // Mock data for daily/peak charts if not available
  const dailyUsageData = [
    { name: 'Mon', usage: 12 }, { name: 'Tue', usage: 15 }, { name: 'Wed', usage: 10 },
    { name: 'Thu', usage: 18 }, { name: 'Fri', usage: 14 }, { name: 'Sat', usage: 22 }, { name: 'Sun', usage: 20 }
  ];

  const peakUsageData = [
    { hour: '00:00', usage: 5 }, { hour: '04:00', usage: 3 }, { hour: '08:00', usage: 12 },
    { hour: '12:00', usage: 15 }, { hour: '16:00', usage: 18 }, { hour: '20:00', usage: 25 }, { hour: '23:00', usage: 10 }
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>
            Meter: <strong>{profile?.meterNumber}</strong> &nbsp;·&nbsp;
            <Badge value={profile?.connectionType} /> &nbsp;·&nbsp;
            <Badge value={profile?.status} />
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn--primary" onClick={() => navigate('/consumer/bills')}>
            <FiDownload /> Download Bill
          </button>
          <button className={`refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => load(true)} disabled={refreshing}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => navigate('/consumer/bills')} className="qa-item">
          <FiFileText /> <span>Pay Bill</span>
        </button>
        <button onClick={() => navigate('/consumer/complaints')} className="qa-item">
          <FiMessageSquare /> <span>Register Complaint</span>
        </button>
        <button onClick={() => navigate('/consumer/analytics')} className="qa-item">
          <FiActivity /> <span>Usage Analytics</span>
        </button>
        <button onClick={() => navigate('/consumer/services')} className="qa-item">
          <FiPlus /> <span>New Connection</span>
        </button>
      </div>

      {/* Overdue Alert */}
      {overdueBills.length > 0 && (
        <div className="alert-banner alert-banner--danger">
          <FiAlertTriangle />
          <div>
            <strong>Overdue Bills!</strong> You have {overdueBills.length} overdue bill{overdueBills.length > 1 ? 's' : ''} with a late fee applied.
          </div>
          <button className="alert-action" onClick={() => navigate('/consumer/bills')}>Pay Now →</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard title="Amount Due"     value={`PKR ${totalDue.toLocaleString()}`}  icon={<FiAlertTriangle />} color={totalDue > 0 ? 'red' : 'green'}   sub={`Due: ${latestBill ? new Date(latestBill.dueDate).toLocaleDateString() : 'N/A'}`} />
        <StatCard title="Last Payment"   value={lastPayment ? `PKR ${lastPayment.amount.toLocaleString()}` : 'PKR 0'} icon={<FiCreditCard />}    color="green"  sub={lastPayment ? new Date(lastPayment.paymentDate).toLocaleDateString() : 'No payments yet'} />
        <StatCard title="Units Consumed" value={`${latestBill?.unitsConsumed || 0} kWh`} icon={<FiActivity />}      color="purple" sub="Current month units" />
        <StatCard title="Active Complaints" value={activeComplaints.length}          icon={<FiMessageSquare />} color="orange" sub="Issues being resolved" />
      </div>

      <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
        <StatCard title="Current Meter"  value={latestBill?.meterReading?.currentReading || 'N/A'} icon={<FiZap />} color="blue" sub="Last recorded reading" />
        <StatCard title="Connection"     value={profile?.status?.toUpperCase() || 'ACTIVE'} icon={<FiActivity />} color="green" sub={profile?.connectionType || 'Residential'} />
        <StatCard title="Next Bill Est." value={`PKR ${(latestBill?.totalAmount * 1.1 || 0).toFixed(0).toLocaleString()}`} icon={<FiTrendingUp />} color="indigo" sub="Based on current trend" />
        <StatCard title="Due Date"       value={latestBill ? new Date(latestBill.dueDate).toLocaleDateString() : 'N/A'} icon={<FiClock />} color="red" sub="Pay before penalty" />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Consumption */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Consumption</h3>
            <span className="chart-badge yellow">kWh</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="Units" stroke="#3b82f6" strokeWidth={2.5} fill="url(#consGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Usage */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Daily Usage Trend</h3>
            <span className="chart-badge green">Last 7 Days</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="usage" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hour Usage */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Peak Hour Analysis</h3>
            <span className="chart-badge orange">Usage vs Time</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={peakUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Load Shedding Schedule Widget */}
        <div className="chart-card widget-card">
          <div className="chart-header">
            <h3>Load Shedding Schedule</h3>
            <Badge value="Active" />
          </div>
          <div className="widget-content">
            <div className="schedule-item">
              <div className="time">08:00 - 09:00</div>
              <div className="status outage">Outage</div>
            </div>
            <div className="schedule-item">
              <div className="time">14:00 - 15:00</div>
              <div className="status outage">Outage</div>
            </div>
            <div className="schedule-item">
              <div className="time">20:00 - 21:00</div>
              <div className="status outage">Outage</div>
            </div>
            <p className="widget-footer"><FiMapPin /> Area: {profile?.area || 'Your Region'}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Recent Payments Widget */}
        <div className="section-card flex-1">
          <div className="section-header">
            <h3>Recent Payments</h3>
            <button className="view-all-btn" onClick={() => navigate('/consumer/payments')}>View All <FiArrowRight /></button>
          </div>
          <div className="transactions-list">
            {payments.slice(0, 3).map((p) => (
              <div key={p._id} className="transaction-item">
                <div className="txn-avatar"><FiCheckCircle /></div>
                <div className="txn-info">
                  <div className="txn-name">{p.bill ? `${MONTHS[p.bill.month - 1]} ${p.bill.year}` : 'Payment'}</div>
                  <div className="txn-meta">{new Date(p.paymentDate).toLocaleDateString()}</div>
                </div>
                <div className="txn-amount">PKR {p.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Complaints Widget */}
        <div className="section-card flex-1">
          <div className="section-header">
            <h3>Recent Complaints</h3>
            <button className="view-all-btn" onClick={() => navigate('/consumer/complaints')}>View All <FiArrowRight /></button>
          </div>
          <div className="transactions-list">
            {complaints.length === 0 ? <p className="empty-msg">No complaints registered</p> : 
              complaints.slice(0, 3).map((c) => (
              <div key={c._id} className="transaction-item">
                <div className="txn-avatar orange"><FiMessageSquare /></div>
                <div className="txn-info">
                  <div className="txn-name">{c.title}</div>
                  <div className="txn-meta">{c.category.replace(/_/g, ' ')} &bull; {new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <Badge value={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Outage Alerts Widget */}
        <div className="section-card flex-1">
          <div className="section-header">
            <h3>Emergency Alerts</h3>
          </div>
          <div className="alerts-list">
            {outages.length === 0 ? (
              <div className="empty-msg">
                <FiCheckCircle style={{ color: 'var(--success)', fontSize: '1.5rem', marginBottom: '.5rem' }} />
                <p>No emergency outages reported in your area.</p>
              </div>
            ) : outages.map(o => (
              <div key={o._id} className="alert-item danger">
                <FiAlertTriangle />
                <div className="alert-info">
                  <div className="alert-title">{o.title}</div>
                  <div className="alert-desc">{o.description}</div>
                  <div className="alert-time">Restoration: {new Date(o.estimatedRestoration).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
