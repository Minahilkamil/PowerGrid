import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const { loginResponse, meters } = useAuth();
  const navigate = useNavigate();

  const user = loginResponse?.user;
  const displayName = user?.username || `User #${user?.id}`;

  const cards = [
    {
      icon: '📅',
      title: 'Create New Schedule',
      description: 'Add your appliances and generate an optimised electricity schedule based on your budget and location.',
      action: () => navigate('/create-schedule'),
      btnLabel: 'Create Schedule',
      btnClass: 'btn-primary',
    },
    {
      icon: '📂',
      title: 'Open Existing Schedule',
      description: 'View and review previously generated schedules for your registered meters.',
      action: () => navigate('/open-schedule'),
      btnLabel: 'Open Schedule',
      btnClass: 'btn-secondary',
    },
    {
      icon: '⚙️',
      title: 'Admin Panel',
      description: 'Manage location rates, peak hour settings, and register new meters for consumers.',
      action: () => navigate('/admin'),
      btnLabel: 'Go to Admin',
      btnClass: 'btn-accent',
    },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-hero">
          <h2 className="dashboard-welcome">
            Welcome back, <span className="highlight">{displayName}</span>
          </h2>
          <p className="dashboard-subtitle">
            Manage your electricity schedules and optimise your energy usage.
          </p>
          {meters.length > 0 && (
            <div className="meter-chips">
              <span className="meter-chips-label">Registered meters:</span>
              {meters.map((m) => (
                <span key={m.meterNo} className="meter-chip">
                  #{m.meterNo}
                </span>
              ))}
            </div>
          )}
          {meters.length === 0 && (
            <div className="info-banner">
              No meters registered yet. Visit the Admin Panel to add a meter.
            </div>
          )}
        </div>

        <div className="dashboard-cards">
          {cards.map((card) => (
            <div key={card.title} className="dashboard-card">
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
              <button
                className={`btn ${card.btnClass}`}
                onClick={card.action}
              >
                {card.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
