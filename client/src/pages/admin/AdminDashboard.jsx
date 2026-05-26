import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.js';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  FiUsers, FiDollarSign, FiFileText, FiCheckCircle,
  FiActivity, FiAlertTriangle, FiRefreshCw, FiArrowRight,
  FiBriefcase, FiMessageSquare, FiClock, FiCreditCard
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend, AreaChart, Area
} from 'recharts';
import './AdminDashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
        <p style={{ fontWeight:700, marginBottom:4, fontSize:'.82rem', color:'#374151' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize:'.82rem', color: p.color }}>
            {p.name}: <strong>{p.name.includes('PKR') || p.name === 'Revenue' ? `PKR ${Number(p.value).toLocaleString()}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [s, t, p] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getRecentTransactions(),
        adminAPI.getPendingEmployees(),
      ]);
      setStats(s.data.data);
      setTransactions(t.data.data);
      setPendingEmployees(p.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleApprove = async (id, action) => {
    try {
      await adminAPI.approveEmployee(id, action);
      toast.success(`Employee application ${action === 'approve' ? 'approved' : 'rejected'}`);
      load(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => load(true), 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  const revenueData = stats?.monthlyRevenue?.map((r) => ({
    name: (r._id && r._id.month) ? MONTHS[r._id.month - 1] : 'Unknown',
    Revenue: Math.round(r.revenue || 0),
  })) || [];

  const consumptionData = stats?.consumptionTrend?.map((r) => ({
    name: (r._id && r._id.month) ? MONTHS[r._id.month - 1] : 'Unknown',
    Units: r.totalUnits || 0,
  })) || [];

  const pieData = [
    { name: 'Paid',    value: stats?.paidBills    || 0 },
    { name: 'Pending', value: stats?.pendingBills  || 0 },
    { name: 'Overdue', value: stats?.overdueBills  || 0 },
  ].filter((d) => d.value > 0);

  const totalBills = (stats?.paidBills || 0) + (stats?.pendingBills || 0) + (stats?.overdueBills || 0);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p>Here's what's happening with your electricity system today.</p>
        </div>
        <button className={`refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => load(true)} disabled={refreshing}>
          <FiRefreshCw />
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Active Consumers"   value={stats?.totalConsumers}  icon={<FiUsers />}        color="blue"   sub="Registered accounts" />
        <StatCard title="Total Employees"    value={stats?.totalEmployees}  icon={<FiBriefcase />}    color="purple" sub="Active staff" />
        <StatCard title="Total Revenue"      value={`PKR ${Math.round(stats?.totalRevenue || 0).toLocaleString()}`} icon={<FiDollarSign />} color="green" sub="All time payments" />
        <StatCard title="Pending Complaints" value={stats?.pendingComplaints} icon={<FiMessageSquare />} color="red" sub="Awaiting resolution" />
        <StatCard title="Active Outages"     value={stats?.activeOutages}   icon={<FiClock />}        color="yellow" sub="Load shedding/Maintenance" />
        <StatCard title="Pending Bills"      value={stats?.pendingBills}    icon={<FiFileText />}     color="yellow" sub="Awaiting payment" />
        <StatCard title="Paid Bills"         value={stats?.paidBills}       icon={<FiCheckCircle />}  color="green"  sub="Successfully paid" />
        <StatCard title="Overdue Bills"      value={stats?.overdueBills}    icon={<FiAlertTriangle />} color="red"   sub="Past due date" />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Pending Approvals */}
        {pendingEmployees.length > 0 && (
          <div className="chart-card chart-card--wide" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <div className="chart-header">
              <h3>Pending Employee Approvals</h3>
              <span className="chart-badge yellow">{pendingEmployees.length} pending</span>
            </div>
            <div className="pending-list">
              {pendingEmployees.map((emp) => (
                <div key={emp._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#64748b' }}>
                      {emp.name ? emp.name[0].toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{emp.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{emp.email} &bull; {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleApprove(emp._id, 'approve')}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApprove(emp._id, 'reject')}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Revenue Bar Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Revenue</h3>
            <span className="chart-badge blue">PKR</span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" fill="url(#blueGrad)" radius={[6,6,0,0]} />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">No revenue data yet</div>}
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Bill Status</h3>
            <span className="chart-badge green">{totalBills} total</span>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: PIE_COLORS[i] }} />
                    <span>{d.name}</span>
                    <strong>{d.value}</strong>
                    <span className="pie-pct">({totalBills ? Math.round(d.value/totalBills*100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="chart-empty">No bill data yet</div>}
        </div>

        {/* Consumption Area Chart */}
        <div className="chart-card chart-card--wide">
          <div className="chart-header">
            <h3>Electricity Consumption Trend</h3>
            <span className="chart-badge yellow">kWh</span>
          </div>
          {consumptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={consumptionData}>
                <defs>
                  <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Units" stroke="#f59e0b" strokeWidth={2.5} fill="url(#yellowGrad)" dot={{ r: 4, fill:'#f59e0b', strokeWidth:2, stroke:'#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">No consumption data yet</div>}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="view-all-btn" onClick={() => navigate('/admin/payments')}>
            View All <FiArrowRight />
          </button>
        </div>
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-msg">
              <FiCreditCard style={{ fontSize:'2rem', marginBottom:'.5rem', opacity:.3 }} />
              <p>No transactions yet</p>
            </div>
          ) : transactions.map((t) => (
            <div key={t._id} className="transaction-item">
              <div className="txn-avatar">{t.consumer?.fullName?.[0]?.toUpperCase()}</div>
              <div className="txn-info">
                <div className="txn-name">{t.consumer?.fullName}</div>
                <div className="txn-meta">
                  {t.consumer?.meterNumber} &bull; {t.paymentMethod?.replace(/_/g, ' ')} &bull; {new Date(t.paymentDate).toLocaleDateString()}
                </div>
              </div>
              <div className="txn-amount">PKR {t.amount?.toLocaleString()}</div>
              <Badge value={t.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
