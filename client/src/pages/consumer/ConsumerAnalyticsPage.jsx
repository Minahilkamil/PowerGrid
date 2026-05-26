import React, { useEffect, useState } from 'react';
import { consumerAPI, billAPI, analyticsAPI } from '../../services/api.js';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { FiActivity, FiTrendingUp, FiZap, FiAlertCircle, FiTrendingDown } from 'react-icons/fi';
import Badge from '../../components/Badge.jsx';
import toast from 'react-hot-toast';
import './Consumer.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ConsumerAnalyticsPage() {
  const [bills, setBills] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pRes = await consumerAPI.getProfile();
      setProfile(pRes.data.data);
      const bRes = await billAPI.getByConsumer(pRes.data.data._id, { limit: 12 });
      setBills(bRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const chartData = [...bills].reverse().map(b => ({
    name: MONTHS[b.month - 1],
    units: b.unitsConsumed,
    amount: b.totalAmount,
    avg: (b.unitsConsumed / 30).toFixed(1)
  }));

  const dailyData = [
    { name: 'Mon', units: 12 }, { name: 'Tue', units: 15 }, { name: 'Wed', units: 10 },
    { name: 'Thu', units: 18 }, { name: 'Fri', units: 14 }, { name: 'Sat', units: 22 }, { name: 'Sun', units: 20 }
  ];

  const peakData = [
    { hour: '00:00', usage: 5 }, { hour: '04:00', usage: 3 }, { hour: '08:00', usage: 12 },
    { hour: '12:00', usage: 15 }, { hour: '16:00', usage: 18 }, { hour: '20:00', usage: 25 }, { hour: '23:00', usage: 10 }
  ];

  const latestBill = bills[0];
  const prevBill = bills[1];
  const diff = prevBill ? ((latestBill.unitsConsumed - prevBill.unitsConsumed) / prevBill.unitsConsumed * 100).toFixed(1) : 0;

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Usage Analytics</h1>
          <p>Deep dive into your electricity consumption patterns</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card stat-card-alt">
          <div className="sca-icon blue"><FiActivity /></div>
          <div className="sca-info">
            <label>Avg. Daily Usage</label>
            <h3>{(latestBill?.unitsConsumed / 30 || 0).toFixed(1)} kWh</h3>
            <span className={diff > 0 ? 'text-danger' : 'text-success'}>
              {diff > 0 ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(diff)}% vs last month
            </span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon yellow"><FiZap /></div>
          <div className="sca-info">
            <label>Current Month Units</label>
            <h3>{latestBill?.unitsConsumed || 0} kWh</h3>
            <span>Estimated next: {(latestBill?.unitsConsumed * 1.05 || 0).toFixed(0)} kWh</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon purple"><FiTrendingUp /></div>
          <div className="sca-info">
            <label>Peak Usage Hour</label>
            <h3>08:00 PM</h3>
            <span>25% of total daily load</span>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card chart-card">
          <h3>Monthly Consumption Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip />
              <Area type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUnits)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Daily Usage Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip />
              <Bar dataKey="units" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Peak Hour Load Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peakData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card insights-card">
          <h3>Smart Insights & Tips</h3>
          <div className="insights-list">
            <div className="insight-item warning">
              <FiAlertCircle className="insight-icon" />
              <div className="insight-content">
                <h4>High Usage Alert</h4>
                <p>Your usage is 15% higher than the average for {profile?.area || 'your area'}.</p>
              </div>
            </div>
            <div className="insight-item success">
              <FiZap className="insight-icon" />
              <div className="insight-content">
                <h4>Energy Saving Tip</h4>
                <p>Switching to LED bulbs can save up to PKR 500 on your next bill.</p>
              </div>
            </div>
            <div className="insight-item info">
              <FiTrendingUp className="insight-icon" />
              <div className="insight-content">
                <h4>Bill Prediction</h4>
                <p>Based on current usage, your next bill is estimated to be <strong>PKR {(latestBill?.totalAmount * 1.08 || 0).toFixed(0).toLocaleString()}</strong>.</p>
              </div>
            </div>
          </div>
          <button className="btn btn--outline full-width" style={{marginTop: '1rem'}}>View Full Energy Report</button>
        </div>
      </div>
    </div>
  );
}
