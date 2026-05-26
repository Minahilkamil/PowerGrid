import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addAppliances, generateSchedule } from '../api/apiService.js';
import Navbar from '../components/Navbar.jsx';
import ApplianceTable from '../components/ApplianceTable.jsx';
import '../styles/CreateSchedule.css';

const SCHEDULE_TYPES = ['Daily', 'Weekly', 'Monthly'];
const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const emptyAppliance = {
  name: '',
  powerRating: '',
  duration: '',
  timesPerWeek: 1,
};

export default function CreateSchedulePage() {
  const { loginResponse, meters, locations } = useAuth();
  const navigate = useNavigate();

  // Appliance form state
  const [applianceForm, setApplianceForm] = useState({ ...emptyAppliance });
  const [applianceError, setApplianceError] = useState('');

  // Appliances list (local, before submission)
  const [appliances, setAppliances] = useState([]);

  // Schedule settings
  const [selectedMeter, setSelectedMeter] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [budget, setBudget] = useState('');
  const [scheduleType, setScheduleType] = useState('Daily');

  // Submission state
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = loginResponse?.user?.id;

  function handleApplianceChange(e) {
    const { name, value } = e.target;
    setApplianceForm((prev) => ({ ...prev, [name]: value }));
    if (applianceError) setApplianceError('');
  }

  function handleAddAppliance(e) {
    e.preventDefault();
    const { name, powerRating, duration, timesPerWeek } = applianceForm;

    if (!name.trim()) {
      setApplianceError('Appliance name is required.');
      return;
    }
    if (!powerRating || isNaN(Number(powerRating)) || Number(powerRating) <= 0) {
      setApplianceError('Power rating must be a positive number.');
      return;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      setApplianceError('Duration must be a positive number.');
      return;
    }

    // Check for duplicate name
    const duplicate = appliances.some(
      (a) => a.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      setApplianceError(`An appliance named "${name.trim()}" already exists.`);
      return;
    }

    setAppliances((prev) => [
      ...prev,
      {
        name: name.trim(),
        powerRating: Number(powerRating),
        duration: Number(duration),
        timesPerWeek: Number(timesPerWeek),
      },
    ]);
    setApplianceForm({ ...emptyAppliance });
    setApplianceError('');
  }

  function handleDeleteAppliance(index) {
    setAppliances((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleGenerateSchedule(e) {
    e.preventDefault();
    setSubmitError('');

    if (appliances.length === 0) {
      setSubmitError('Please add at least one appliance.');
      return;
    }
    if (!selectedMeter) {
      setSubmitError('Please select a meter.');
      return;
    }
    if (!selectedLocation) {
      setSubmitError('Please select a location.');
      return;
    }
    if (!startDate) {
      setSubmitError('Please select a start date.');
      return;
    }
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      setSubmitError('Please enter a valid monthly budget.');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Add appliances to the backend
      const applianceDtos = appliances.map((a) => ({
        name: a.name,
        powerRating: a.powerRating,
        duration: a.duration,
        userid: userId,
      }));

      const addRes = await addAppliances(applianceDtos);
      const applianceIds = addRes.data?.applianceIds || [];

      if (applianceIds.length !== appliances.length) {
        setSubmitError('Mismatch in appliance IDs returned from server.');
        setLoading(false);
        return;
      }

      // Step 2: Build applianceUsages with returned IDs
      const applianceUsages = applianceIds.map((id, idx) => ({
        applianceId: id,
        timesperWeek: appliances[idx].timesPerWeek,
      }));

      // Step 3: Generate schedule
      const locationObj = locations.find(
        (l) => String(l.locationId) === String(selectedLocation)
      );

      const payload = {
        userId,
        meterNo: Number(selectedMeter),
        locationId: Number(selectedLocation),
        startDate: new Date(startDate).toISOString(),
        scheduleType,
        givenCost: Number(budget),
        applianceUsages,
      };

      const scheduleRes = await generateSchedule(payload);

      navigate('/schedule-view', {
        state: {
          scheduleResponse: scheduleRes.data,
          meta: {
            location: locationObj?.locationName || selectedLocation,
            meterNo: selectedMeter,
            startDate,
            scheduleType,
            budget,
          },
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to generate schedule. Please try again.';
      setSubmitError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="create-schedule-main">
        <div className="page-header">
          <h2 className="page-title">Create New Schedule</h2>
          <p className="page-subtitle">
            Add your appliances and configure schedule settings to generate an optimised plan.
          </p>
        </div>

        {/* ── Appliance Form ── */}
        <section className="section-card">
          <h3 className="section-title">Step 1 — Add Appliances</h3>
          <form className="appliance-form" onSubmit={handleAddAppliance} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="appName">
                  Appliance Name
                </label>
                <input
                  id="appName"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Washing Machine"
                  value={applianceForm.name}
                  onChange={handleApplianceChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="appPower">
                  Power Rating (W)
                </label>
                <input
                  id="appPower"
                  name="powerRating"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 2000"
                  value={applianceForm.powerRating}
                  onChange={handleApplianceChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="appDuration">
                  Usage Duration (min)
                </label>
                <input
                  id="appDuration"
                  name="duration"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 60"
                  value={applianceForm.duration}
                  onChange={handleApplianceChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="appFreq">
                  Frequency / Week
                </label>
                <select
                  id="appFreq"
                  name="timesPerWeek"
                  className="form-input"
                  value={applianceForm.timesPerWeek}
                  onChange={handleApplianceChange}
                >
                  {FREQUENCY_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}x per week{n === 7 ? ' (Daily)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {applianceError && (
              <div className="error-message" role="alert">
                {applianceError}
              </div>
            )}

            <button type="submit" className="btn btn-secondary">
              + Add Appliance
            </button>
          </form>

          <div className="appliance-list-section">
            <h4 className="subsection-title">
              Appliances ({appliances.length})
            </h4>
            <ApplianceTable
              appliances={appliances}
              onDelete={handleDeleteAppliance}
            />
          </div>
        </section>

        {/* ── Schedule Settings ── */}
        <section className="section-card">
          <h3 className="section-title">Step 2 — Schedule Settings</h3>
          <form className="schedule-settings-form" onSubmit={handleGenerateSchedule} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="meterSelect">
                  Meter
                </label>
                <select
                  id="meterSelect"
                  className="form-input"
                  value={selectedMeter}
                  onChange={(e) => setSelectedMeter(e.target.value)}
                >
                  <option value="">— Select Meter —</option>
                  {meters.map((m) => (
                    <option key={m.meterNo} value={m.meterNo}>
                      Meter #{m.meterNo}
                    </option>
                  ))}
                </select>
                {meters.length === 0 && (
                  <span className="field-hint">
                    No meters found. Add one via the Admin Panel.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="locationSelect">
                  Location
                </label>
                <select
                  id="locationSelect"
                  className="form-input"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="">— Select Location —</option>
                  {locations.map((l) => (
                    <option key={l.locationId} value={l.locationId}>
                      {l.locationName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="startDate">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="budget">
                  Monthly Budget (R)
                </label>
                <input
                  id="budget"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="scheduleType">
                  Schedule Type
                </label>
                <select
                  id="scheduleType"
                  className="form-input"
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value)}
                >
                  {SCHEDULE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {submitError && (
              <div className="error-message" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" aria-hidden="true"></span>
                    Generating...
                  </span>
                ) : (
                  '⚡ Generate Schedule'
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
