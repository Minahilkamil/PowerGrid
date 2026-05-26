import React from 'react';
import { 
  FiTrendingUp, FiCheckCircle, FiClock, FiStar, 
  FiMapPin, FiActivity, FiPieChart, FiAward
} from 'react-icons/fi';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import Badge from '../../components/Badge.jsx';

const radarData = [
  { subject: 'Resolution', A: 120, fullMark: 150 },
  { subject: 'Punctuality', A: 98, fullMark: 150 },
  { subject: 'Compliance', A: 86, fullMark: 150 },
  { subject: 'Efficiency', A: 99, fullMark: 150 },
  { subject: 'Feedback', A: 85, fullMark: 150 },
];

const trendData = [
  { name: 'Week 1', score: 82 },
  { name: 'Week 2', score: 85 },
  { name: 'Week 3', score: 88 },
  { name: 'Week 4', score: 92 },
  { name: 'Week 5', score: 94 },
];

export default function EmployeePerformancePage() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Performance & Analytics</h1>
        <p>Track your work efficiency, ratings, and professional growth metrics</p>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Performance Summary */}
        <div className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem',
            marginBottom: '1.5rem', boxShadow: '0 10px 20px rgba(16,185,129,0.3)'
          }}>
            94
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>Excellent Performance</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You are in the top 5% of field employees this month!</p>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div className="info-card" style={{ flex: 1, background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <FiStar style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Rating</div>
              <strong style={{ fontSize: '1.2rem' }}>4.8/5</strong>
            </div>
            <div className="info-card" style={{ flex: 1, background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              <FiAward style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Badges</div>
              <strong style={{ fontSize: '1.2rem' }}>12</strong>
            </div>
          </div>
        </div>

        {/* Performance Radar */}
        <div className="section-card">
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <h3>Skill Analysis</h3>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis axisLine={false} tick={false} />
                <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        {/* Trend Chart */}
        <div className="section-card">
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <h3>Score Trend (Last 5 Weeks)</h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div className="section-card">
          <div className="card-header" style={{ marginBottom: '1.5rem' }}>
            <h3>Recent Achievements</h3>
          </div>
          <div className="achievement-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { title: 'Fast Responder', desc: 'Resolved 10+ complaints within 2 hours', icon: <FiClock />, color: '#3b82f6' },
              { title: 'Zero Defects', desc: 'No reading correction requests this week', icon: <FiCheckCircle />, color: '#10b981' },
              { title: 'Top Performer', desc: 'Ranked #1 in Gulshan-e-Iqbal area', icon: <FiTrendingUp />, color: '#8b5cf6' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${a.color}15`, color: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {a.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
