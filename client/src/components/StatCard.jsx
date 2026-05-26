import React from 'react';
import './StatCard.css';

export default function StatCard({ title, value, icon, color = 'blue', sub }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-title">{title}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
