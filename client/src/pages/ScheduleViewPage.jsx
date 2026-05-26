import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import ScheduleTable from '../components/ScheduleTable.jsx';
import '../styles/ScheduleView.css';

export default function ScheduleViewPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const scheduleResponse = state?.scheduleResponse;
  const meta = state?.meta || {};

  // scheduleResponse shape:
  // { summary: { totalCost, peakHoursCost, nonPeakHoursCost, applianceCosts },
  //   schedules: [{ date, appliances: [ApplianceScheduleDto], dailyTotalCost }] }

  const schedules = scheduleResponse?.schedules || [];
  const summary = scheduleResponse?.summary || {};

  // Build date options from schedules
  const dateOptions = useMemo(() => {
    return schedules.map((s, idx) => ({
      label: s.date
        ? new Date(s.date).toLocaleDateString('en-ZA', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : `Schedule ${idx + 1}`,
      index: idx,
    }));
  }, [schedules]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentSchedule = schedules[selectedIndex] || null;
  const currentAppliances = currentSchedule?.appliances || [];

  if (!scheduleResponse) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="schedule-view-main">
          <div className="empty-state">
            <p>No schedule data found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="schedule-view-main">
        <div className="page-header">
          <h2 className="page-title">Schedule Results</h2>
          <p className="page-subtitle">
            Your optimised electricity schedule has been generated.
          </p>
        </div>

        {/* ── Summary Cards ── */}
        <div className="summary-grid">
          <div className="summary-card summary-card--total">
            <div className="summary-card-label">Total Cost</div>
            <div className="summary-card-value">
              R {Number(summary.totalCost || 0).toFixed(2)}
            </div>
          </div>
          <div className="summary-card summary-card--peak">
            <div className="summary-card-label">Peak Hours Cost</div>
            <div className="summary-card-value">
              R {Number(summary.peakHoursCost || 0).toFixed(2)}
            </div>
          </div>
          <div className="summary-card summary-card--offpeak">
            <div className="summary-card-label">Non-Peak Hours Cost</div>
            <div className="summary-card-value">
              R {Number(summary.nonPeakHoursCost || 0).toFixed(2)}
            </div>
          </div>
          <div className="summary-card summary-card--info">
            <div className="summary-card-label">Location</div>
            <div className="summary-card-value summary-card-value--sm">
              {meta.location || '—'}
            </div>
          </div>
          <div className="summary-card summary-card--info">
            <div className="summary-card-label">Meter</div>
            <div className="summary-card-value summary-card-value--sm">
              #{meta.meterNo || '—'}
            </div>
          </div>
          <div className="summary-card summary-card--info">
            <div className="summary-card-label">Start Date</div>
            <div className="summary-card-value summary-card-value--sm">
              {meta.startDate
                ? new Date(meta.startDate).toLocaleDateString('en-ZA')
                : '—'}
            </div>
          </div>
        </div>

        {/* ── Date Selector (for weekly/monthly) ── */}
        {schedules.length > 1 && (
          <div className="date-selector-row">
            <label className="form-label" htmlFor="dateSelect">
              View schedule for:
            </label>
            <select
              id="dateSelect"
              className="form-input date-select"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
            >
              {dateOptions.map((opt) => (
                <option key={opt.index} value={opt.index}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Schedule Table ── */}
        <section className="section-card">
          <div className="section-header-row">
            <h3 className="section-title">
              Appliance Schedule
              {currentSchedule?.date && (
                <span className="section-title-date">
                  {' '}— {new Date(currentSchedule.date).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </h3>
            {currentSchedule?.dailyTotalCost != null && (
              <span className="daily-cost-badge">
                Daily Total: R {Number(currentSchedule.dailyTotalCost).toFixed(2)}
              </span>
            )}
          </div>
          <ScheduleTable appliances={currentAppliances} />
        </section>

        {/* ── Appliance Cost Breakdown ── */}
        {summary.applianceCosts && Object.keys(summary.applianceCosts).length > 0 && (
          <section className="section-card">
            <h3 className="section-title">Cost Breakdown by Appliance</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Appliance</th>
                    <th>Total Cost (R)</th>
                    <th>Peak Cost (R)</th>
                    <th>Non-Peak Cost (R)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.applianceCosts).map(([name, costs]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>R {Number(costs.totalCost || 0).toFixed(2)}</td>
                      <td>R {Number(costs.peakCost || 0).toFixed(2)}</td>
                      <td>R {Number(costs.nonPeakCost || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="page-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/create-schedule')}
          >
            Create Another Schedule
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
