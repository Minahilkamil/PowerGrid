import axios from 'axios';

/**
 * Axios instance pointing at the Node/Express backend.
 * In development the Vite proxy forwards /api/* to http://localhost:5000
 * so we use a relative base URL — no CORS issues.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────────────────────────

/** POST /api/auth/login  — body: { id: number } */
export function login(id) {
  return api.post('/auth/login', { id });
}

// ── Consumer ──────────────────────────────────────────────────────────────────

/** GET /api/consumer/getMeters/:userId */
export function getMeters(userId) {
  return api.get(`/consumer/getMeters/${userId}`);
}

/** GET /api/consumer/getLocations */
export function getLocations() {
  return api.get('/consumer/getLocations');
}

/**
 * POST /api/consumer/addAppliances
 * body: [{ name, powerRating, duration (minutes), userid }]
 */
export function addAppliances(appliancesArray) {
  return api.post('/consumer/addAppliances', appliancesArray);
}

/**
 * POST /api/consumer/generateAdvancedSchedule
 * body: { userId, meterNo, locationId, startDate, scheduleType, givenCost,
 *         applianceUsages: [{ applianceId, timesperWeek }] }
 */
export function generateSchedule(payload) {
  return api.post('/consumer/generateAdvancedSchedule', payload);
}

/**
 * POST /api/consumer/schedules/open
 * body: { userId, meterNo }
 */
export function getOpenSchedules(userId, meterNo) {
  return api.post('/consumer/schedules/open', { userId, meterNo });
}

/**
 * POST /api/consumer/:userId/addMeter/:meterNo
 */
export function addMeter(userId, meterNo) {
  return api.post(`/consumer/${userId}/addMeter/${meterNo}`);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/addRatesAndDuration
 * body: { LocationName, PeakHoursRate, NonPeakHoursRate, StartTime, EndTime }
 */
export function addRates(payload) {
  return api.post('/admin/addRatesAndDuration', payload);
}

/**
 * PUT /api/admin/updateRates/:locationName
 * body: { LocationName, PeakHoursRate, NonPeakHoursRate, StartTime, EndTime }
 */
export function updateRates(locationName, payload) {
  return api.put(`/admin/updateRates/${encodeURIComponent(locationName)}`, payload);
}

export default api;
