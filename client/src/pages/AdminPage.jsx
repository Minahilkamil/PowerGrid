import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addRates, updateRates, addMeter, getLocations } from '../api/apiService.js';
import Navbar from '../components/Navbar.jsx';
import '../styles/Admin.css';

const emptyRatesForm = {
  locationName: '',
  peakHoursRate: '',
  nonPeakHoursRate: '',
  startTime: '',
  endTime: '',
};

const emptyMeterForm = {
  userId: '',
  meterNo: '',
};

export default function AdminPage() {
  const { locations, setLocations } = useAuth();
  const navigate = useNavigate();

  // ── Add Rates ──
  const [addRatesForm, setAddRatesForm] = useState({ ...emptyRatesForm });
  const [addRatesStatus, setAddRatesStatus] = useState({ type: '', msg: '' });
  const [addRatesLoading, setAddRatesLoading] = useState(false);

  // ── Modify Rates ──
  const [modifyRatesForm, setModifyRatesForm] = useState({ ...emptyRatesForm });
  const [modifyRatesStatus, setModifyRatesStatus] = useState({ type: '', msg: '' });
  const [modifyRatesLoading, setModifyRatesLoading] = useState(false);

  // ── Add Meter ──
  const [meterForm, setMeterForm] = useState({ ...emptyMeterForm });
  const [meterStatus, setMeterStatus] = useState({ type: '', msg: '' });
  const [meterLoading, setMeterLoading] = useState(false);

  // ── Helpers ──
  function handleAddRatesChange(e) {
    const { name, value } = e.target;
    setAddRatesForm((prev) => ({ ...prev, [name]: value }));
    if (addRatesStatus.msg) setAddRatesStatus({ type: '', msg: '' });
  }

  function handleModifyRatesChange(e) {
    const { name, value } = e.target;
    setModifyRatesForm((prev) => ({ ...prev, [name]: value }));
    if (modifyRatesStatus.msg) setModifyRatesStatus({ type: '', msg: '' });
  }

  function handleMeterChange(e) {
    const { name, value } = e.target;
    setMeterForm((prev) => ({ ...prev, [name]: value }));
    if (meterStatus.msg) setMeterStatus({ type: '', msg: '' });
  }

  function validateRatesForm(form) {
    if (!form.locationName.trim()) return 'Location name is required.';
    if (!form.peakHoursRate || isNaN(Number(form.peakHoursRate)) || Number(form.peakHoursRate) < 0)
      return 'Peak hours rate must be a non-negative number.';
    if (!form.nonPeakHoursRate || isNaN(Number(form.nonPeakHoursRate)) || Number(form.nonPeakHoursRate) < 0)
      return 'Non-peak hours rate must be a non-negative number.';
    if (!form.startTime) return 'Start time is required.';
    if (!form.endTime) return 'End time is required.';
    return null;
  }

  // Convert HH:MM to HH:MM:SS for the API
  function toTimeSpan(timeStr) {
    if (!timeStr) return '00:00:00';
    // If already HH:MM:SS, return as-is
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    // If HH:MM, append :00
    if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
    return timeStr;
  }

  // ── Submit Add Rates ──
  async function handleAddRatesSubmit(e) {
    e.preventDefault();
    const validationError = validateRatesForm(addRatesForm);
    if (validationError) {
      setAddRatesStatus({ type: 'error', msg: validationError });
      return;
    }

    setAddRatesLoading(true);
    try {
      const payload = {
        LocationName: addRatesForm.locationName.trim(),
        PeakHoursRate: Number(addRatesForm.peakHoursRate),
        NonPeakHoursRate: Number(addRatesForm.nonPeakHoursRate),
        StartTime: toTimeSpan(addRatesForm.startTime),
        EndTime: toTimeSpan(addRatesForm.endTime),
      };
      await addRates(payload);

      // Refresh locations in context
      const locRes = await getLocations();
      setLocations(locRes.data || []);

      setAddRatesStatus({ type: 'success', msg: `Location "${addRatesForm.locationName}" and rates added successfully.` });
      setAddRatesForm({ ...emptyRatesForm });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.response?.data ||
        'Failed to add rates.';
      setAddRatesStatus({
        type: 'error',
        msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
      });
    } finally {
      setAddRatesLoading(false);
    }
  }

  // ── Submit Modify Rates ──
  async function handleModifyRatesSubmit(e) {
    e.preventDefault();
    const validationError = validateRatesForm(modifyRatesForm);
    if (validationError) {
      setModifyRatesStatus({ type: 'error', msg: validationError });
      return;
    }

    setModifyRatesLoading(true);
    try {
      const payload = {
        LocationName: modifyRatesForm.locationName.trim(),
        PeakHoursRate: Number(modifyRatesForm.peakHoursRate),
        NonPeakHoursRate: Number(modifyRatesForm.nonPeakHoursRate),
        StartTime: toTimeSpan(modifyRatesForm.startTime),
        EndTime: toTimeSpan(modifyRatesForm.endTime),
      };
      await updateRates(modifyRatesForm.locationName.trim(), payload);
      setModifyRatesStatus({ type: 'success', msg: `Rates for "${modifyRatesForm.locationName}" updated successfully.` });
      setModifyRatesForm({ ...emptyRatesForm });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.response?.data ||
        'Failed to update rates.';
      setModifyRatesStatus({
        type: 'error',
        msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
      });
    } finally {
      setModifyRatesLoading(false);
    }
  }

  // ── Submit Add Meter ──
  async function handleAddMeterSubmit(e) {
    e.preventDefault();
    const uid = parseInt(meterForm.userId, 10);
    const mno = parseInt(meterForm.meterNo, 10);

    if (!meterForm.userId || isNaN(uid) || uid <= 0) {
      setMeterStatus({ type: 'error', msg: 'Please enter a valid User ID.' });
      return;
    }
    if (!meterForm.meterNo || isNaN(mno) || mno <= 0) {
      setMeterStatus({ type: 'error', msg: 'Please enter a valid Meter Number.' });
      return;
    }

    setMeterLoading(true);
    try {
      const res = await addMeter(uid, mno);
      const msg = res.data?.Message || 'Meter added successfully.';
      setMeterStatus({ type: 'success', msg });
      setMeterForm({ ...emptyMeterForm });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        err.response?.data ||
        'Failed to add meter.';
      setMeterStatus({
        type: 'error',
        msg: typeof msg === 'string' ? msg : JSON.stringify(msg),
      });
    } finally {
      setMeterLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="admin-main">
        <div className="page-header">
          <h2 className="page-title">Admin Panel</h2>
          <p className="page-subtitle">
            Manage location rates, peak hour settings, and register meters.
          </p>
        </div>

        <div className="admin-grid">
          {/* ── Add Location & Rates ── */}
          <section className="section-card">
            <h3 className="section-title">Add Location &amp; Rates</h3>
            <p className="section-description">
              Create a new location with its associated peak and non-peak electricity rates.
            </p>
            <form onSubmit={handleAddRatesSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="add-locationName">
                  Location Name
                </label>
                <input
                  id="add-locationName"
                  name="locationName"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Johannesburg"
                  value={addRatesForm.locationName}
                  onChange={handleAddRatesChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="add-peakRate">
                    Peak Hour Rate (R/kWh)
                  </label>
                  <input
                    id="add-peakRate"
                    name="peakHoursRate"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 2.50"
                    value={addRatesForm.peakHoursRate}
                    onChange={handleAddRatesChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="add-nonPeakRate">
                    Non-Peak Rate (R/kWh)
                  </label>
                  <input
                    id="add-nonPeakRate"
                    name="nonPeakHoursRate"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 1.20"
                    value={addRatesForm.nonPeakHoursRate}
                    onChange={handleAddRatesChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="add-startTime">
                    Peak Start Time
                  </label>
                  <input
                    id="add-startTime"
                    name="startTime"
                    type="time"
                    className="form-input"
                    value={addRatesForm.startTime}
                    onChange={handleAddRatesChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="add-endTime">
                    Peak End Time
                  </label>
                  <input
                    id="add-endTime"
                    name="endTime"
                    type="time"
                    className="form-input"
                    value={addRatesForm.endTime}
                    onChange={handleAddRatesChange}
                  />
                </div>
              </div>

              {addRatesStatus.msg && (
                <div
                  className={addRatesStatus.type === 'success' ? 'success-message' : 'error-message'}
                  role="alert"
                >
                  {addRatesStatus.msg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={addRatesLoading}
              >
                {addRatesLoading ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Adding...
                  </span>
                ) : (
                  'Add Location & Rates'
                )}
              </button>
            </form>
          </section>

          {/* ── Modify Existing Rates ── */}
          <section className="section-card">
            <h3 className="section-title">Modify Existing Rates</h3>
            <p className="section-description">
              Update the rates for an existing location. The location must already exist.
            </p>
            <form onSubmit={handleModifyRatesSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="mod-locationName">
                  Location Name
                </label>
                {locations.length > 0 ? (
                  <select
                    id="mod-locationName"
                    name="locationName"
                    className="form-input"
                    value={modifyRatesForm.locationName}
                    onChange={handleModifyRatesChange}
                  >
                    <option value="">— Select Location —</option>
                    {locations.map((l) => (
                      <option key={l.locationId} value={l.locationName}>
                        {l.locationName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="mod-locationName"
                    name="locationName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Johannesburg"
                    value={modifyRatesForm.locationName}
                    onChange={handleModifyRatesChange}
                  />
                )}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="mod-peakRate">
                    Peak Hour Rate (R/kWh)
                  </label>
                  <input
                    id="mod-peakRate"
                    name="peakHoursRate"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 2.50"
                    value={modifyRatesForm.peakHoursRate}
                    onChange={handleModifyRatesChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mod-nonPeakRate">
                    Non-Peak Rate (R/kWh)
                  </label>
                  <input
                    id="mod-nonPeakRate"
                    name="nonPeakHoursRate"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 1.20"
                    value={modifyRatesForm.nonPeakHoursRate}
                    onChange={handleModifyRatesChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="mod-startTime">
                    Peak Start Time
                  </label>
                  <input
                    id="mod-startTime"
                    name="startTime"
                    type="time"
                    className="form-input"
                    value={modifyRatesForm.startTime}
                    onChange={handleModifyRatesChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mod-endTime">
                    Peak End Time
                  </label>
                  <input
                    id="mod-endTime"
                    name="endTime"
                    type="time"
                    className="form-input"
                    value={modifyRatesForm.endTime}
                    onChange={handleModifyRatesChange}
                  />
                </div>
              </div>

              {modifyRatesStatus.msg && (
                <div
                  className={modifyRatesStatus.type === 'success' ? 'success-message' : 'error-message'}
                  role="alert"
                >
                  {modifyRatesStatus.msg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={modifyRatesLoading}
              >
                {modifyRatesLoading ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Updating...
                  </span>
                ) : (
                  'Update Rates'
                )}
              </button>
            </form>
          </section>

          {/* ── Add Meter ── */}
          <section className="section-card admin-meter-card">
            <h3 className="section-title">Add Meter</h3>
            <p className="section-description">
              Register a new electricity meter for a consumer account.
            </p>
            <form onSubmit={handleAddMeterSubmit} noValidate>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="meter-userId">
                    User ID
                  </label>
                  <input
                    id="meter-userId"
                    name="userId"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 1"
                    value={meterForm.userId}
                    onChange={handleMeterChange}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="meter-meterNo">
                    Meter Number
                  </label>
                  <input
                    id="meter-meterNo"
                    name="meterNo"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 12345"
                    value={meterForm.meterNo}
                    onChange={handleMeterChange}
                    min="1"
                  />
                </div>
              </div>

              {meterStatus.msg && (
                <div
                  className={meterStatus.type === 'success' ? 'success-message' : 'error-message'}
                  role="alert"
                >
                  {meterStatus.msg}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-accent"
                disabled={meterLoading}
              >
                {meterLoading ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Adding...
                  </span>
                ) : (
                  'Add Meter'
                )}
              </button>
            </form>
          </section>
        </div>

        <div className="page-actions">
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
