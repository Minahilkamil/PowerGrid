import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getOpenSchedules } from '../api/apiService.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/OpenSchedule.css';

export default function OpenSchedulePage() {
  const { loginResponse, meters } = useAuth();
  const navigate = useNavigate();

  const userId = loginResponse?.user?.id;

  // Let user pick which meter to load schedules for
  const [selectedMeter, setSelectedMeter] = useState(
    meters.length > 0 ? String(meters[0].meterNo) : ''
  );
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  async function fetchSchedules(meterNo) {
    if (!meterNo) return;
    setLoading(true);
    setError('');
    setSchedules([]);
    setExpandedId(null);
    try {
      const res = await getOpenSchedules(userId, Number(meterNo));
      setSchedules(res.data || []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to load schedules.';
      setError(typeof msg === 'string' ? msg : 'No schedules found for this meter.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-load on mount if a meter is pre-selected
  useEffect(() => {
    if (selectedMeter) {
      fetchSchedules(selectedMeter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMeterChange(e) {
    setSelectedMeter(e.target.value);
  }

  function handleLoad() {
    fetchSchedules(selectedMeter);
  }

  function toggleExpand(scheduleId) {
    setExpandedId((prev) => (prev === scheduleId ? null : scheduleId));
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="open-schedule-main">
        <div className="page-header">
          <h2 className="page-title">Open Existing Schedule</h2>
          <p className="page-subtitle">
            View previously generated schedules for your registered meters.
          </p>
        </div>

        {/* ── Meter Selector ── */}
        <section className="section-card">
          <h3 className="section-title">Select Meter</h3>
          {meters.length === 0 ? (
            <div className="info-banner">
              No meters registered. Visit the Admin Panel to add a meter.
            </div>
          ) : (
            <div className="meter-selector-row">
              <select
                className="form-input meter-select"
                value={selectedMeter}
                onChange={handleMeterChange}
              >
                <option value="">— Select Meter —</option>
                {meters.map((m) => (
                  <option key={m.meterNo} value={m.meterNo}>
                    Meter #{m.meterNo}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleLoad}
                disabled={!selectedMeter || loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Loading...
                  </span>
                ) : (
                  'Load Schedules'
                )}
              </button>
            </div>
          )}
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* ── Schedule List ── */}
        {!loading && schedules.length > 0 && (
          <section className="section-card">
            <h3 className="section-title">
              Schedules for Meter #{selectedMeter} ({schedules.length})
            </h3>
            <div className="schedule-list">
              {schedules.map((schedule) => (
                <div key={schedule.scheduleId} className="schedule-item">
                  <div
                    className="schedule-item-header"
                    onClick={() => toggleExpand(schedule.scheduleId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleExpand(schedule.scheduleId)}
                    aria-expanded={expandedId === schedule.scheduleId}
                  >
                    <div className="schedule-item-meta">
                      <span className="schedule-item-date">
                        📅{' '}
                        {schedule.date
                          ? new Date(schedule.date).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Unknown date'}
                      </span>
                      <span className="schedule-item-meter">
                        Meter: #{schedule.meterNumber}
                      </span>
                      <span className="schedule-item-location">
                        📍 {schedule.location}
                      </span>
                    </div>
                    <div className="schedule-item-costs">
                      <span className="cost-badge cost-badge--total">
                        Total: R {Number(schedule.totalCost).toFixed(2)}
                      </span>
                      <span className="cost-badge cost-badge--peak">
                        Peak: R {Number(schedule.peakHoursCost).toFixed(2)}
                      </span>
                      <span className="cost-badge cost-badge--offpeak">
                        Off-Peak: R {Number(schedule.nonPeakHoursCost).toFixed(2)}
                      </span>
                      <span className="expand-icon">
                        {expandedId === schedule.scheduleId ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {expandedId === schedule.scheduleId && (
                    <div className="schedule-item-body">
                      {schedule.appliances && schedule.appliances.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Appliance Name</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Peak Hour</th>
                                <th>Cost (R)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.appliances.map((appliance, idx) => (
                                <tr key={idx}>
                                  <td>{appliance.name}</td>
                                  <td>{appliance.startTime}</td>
                                  <td>{appliance.endTime}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        appliance.isPeakHour
                                          ? 'badge-peak'
                                          : 'badge-offpeak'
                                      }`}
                                    >
                                      {appliance.isPeakHour ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td>R {Number(appliance.cost).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="empty-table-message">
                          No appliance details available for this schedule.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && schedules.length === 0 && selectedMeter && (
          <div className="empty-state">
            <p>No schedules found for Meter #{selectedMeter}.</p>
          </div>
        )}

        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
