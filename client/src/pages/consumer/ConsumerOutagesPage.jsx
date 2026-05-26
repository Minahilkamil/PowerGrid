import React, { useEffect, useState } from 'react';
import { outageAPI, consumerAPI } from '../../services/api.js';
import { FiClock, FiAlertTriangle, FiMapPin, FiInfo, FiBell, FiZapOff } from 'react-icons/fi';
import Badge from '../../components/Badge.jsx';
import toast from 'react-hot-toast';
import './Consumer.css';

export default function ConsumerOutagesPage() {
  const [profile, setProfile] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [liveOutages, setLiveOutages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pRes = await consumerAPI.getProfile();
      const p = pRes.data.data;
      setProfile(p);
      
      const [sRes, lRes] = await Promise.all([
        outageAPI.getSchedule(p.area),
        outageAPI.getLive()
      ]);
      
      setSchedule(sRes.data.data || []);
      setLiveOutages(lRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const demoSchedule = [
    { day: 'Monday', times: ['08:00 - 09:00', '14:00 - 15:00', '20:00 - 21:00'] },
    { day: 'Tuesday', times: ['09:00 - 10:00', '15:00 - 16:00', '21:00 - 22:00'] },
    { day: 'Wednesday', times: ['08:00 - 09:00', '14:00 - 15:00', '20:00 - 21:00'] },
    { day: 'Thursday', times: ['09:00 - 10:00', '15:00 - 16:00', '21:00 - 22:00'] },
    { day: 'Friday', times: ['08:00 - 09:00', '14:00 - 15:00', '20:00 - 21:00'] },
    { day: 'Saturday', times: ['10:00 - 11:00', '16:00 - 17:00', '22:00 - 23:00'] },
    { day: 'Sunday', times: ['No scheduled load shedding'] },
  ];

  return (
    <div className="outages-page">
      <div className="page-header">
        <div>
          <h1>Load Shedding & Outages</h1>
          <p>Stay informed about power availability in <strong>{profile?.area || 'your area'}</strong></p>
        </div>
        <div className="header-actions">
          <button className="btn btn--outline" onClick={() => toast.success('Notifications enabled!')}>
            <FiBell /> Notify Me
          </button>
        </div>
      </div>

      {liveOutages.length > 0 && (
        <div className="live-alerts-section">
          <h3><FiZapOff /> Live Outage Alerts</h3>
          <div className="alerts-grid">
            {liveOutages.map(o => (
              <div key={o._id} className="card live-outage-card">
                <div className="loc-header">
                  <Badge value="Emergency Outage" color="red" />
                  <span className="loc-time">{new Date(o.createdAt).toLocaleTimeString()}</span>
                </div>
                <h4>{o.title}</h4>
                <p>{o.description}</p>
                <div className="loc-footer">
                  <div className="restoration">
                    <FiClock /> Est. Restoration: <strong>{new Date(o.estimatedRestoration).toLocaleTimeString()}</strong>
                  </div>
                  <div className="location">
                    <FiMapPin /> {o.area}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="outage-content-grid">
        <div className="card schedule-card">
          <div className="card-header-row">
            <h3><FiClock /> Weekly Schedule</h3>
            <Badge value="Area: Group-A" />
          </div>
          <div className="schedule-table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Scheduled Slots</th>
                </tr>
              </thead>
              <tbody>
                {demoSchedule.map(s => (
                  <tr key={s.day}>
                    <td className="day-cell">{s.day}</td>
                    <td className="slots-cell">
                      {s.times.map((t, i) => (
                        <span key={i} className={`slot-badge ${t.includes('No') ? 'none' : ''}`}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="schedule-footer">
            <FiInfo /> Schedule is subject to change based on national grid demand.
          </div>
        </div>

        <div className="side-column">
          <div className="card map-card">
            <h3><FiMapPin /> Outage Map</h3>
            <div className="mock-map">
              <div className="map-overlay">
                {/* Area Tags */}
                <div className="map-tag" style={{top: '15%', left: '10%'}}>Zone A</div>
                <div className="map-tag" style={{top: '15%', left: '60%'}}>Zone B</div>
                <div className="map-tag" style={{top: '70%', left: '30%'}}>Zone C</div>
                <div className="map-tag" style={{top: '70%', left: '80%'}}>Zone D</div>

                {/* Outage Pins */}
                <FiMapPin className="pin active" style={{top: '30%', left: '40%'}} title="Active Outage: Main Street" />
                <FiMapPin className="pin maintenance" style={{top: '60%', left: '70%'}} title="Maintenance: Sector 7" />
                <FiMapPin className="pin active" style={{top: '50%', left: '20%'}} title="Active Outage: Gulberg III" />
              </div>
              <div className="map-center-text">
                <p>Visualizing outages in {profile?.area || 'your region'}</p>
              </div>
            </div>
            <div className="map-legend">
              <div className="legend-item"><span className="dot red"></span> Active Outage</div>
              <div className="legend-item"><span className="dot gray"></span> Maintenance</div>
            </div>
          </div>

          <div className="card maintenance-card">
            <h3><FiAlertTriangle /> Planned Maintenance</h3>
            <div className="maintenance-list">
              <div className="m-item">
                <div className="m-date">
                  <span className="month">MAY</span>
                  <span className="day">28</span>
                </div>
                <div className="m-info">
                  <h4>Grid Upgradation</h4>
                  <p>09:00 AM - 01:00 PM</p>
                  <span>Affected: Block C, D & E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
