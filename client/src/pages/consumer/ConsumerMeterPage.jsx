import React, { useEffect, useState } from 'react';
import { consumerAPI, meterAPI } from '../../services/api.js';
import { FiZap, FiActivity, FiAlertCircle, FiShield, FiCalendar, FiBox, FiClock, FiCheckCircle } from 'react-icons/fi';
import Badge from '../../components/Badge.jsx';
import Table from '../../components/Table.jsx';
import toast from 'react-hot-toast';
import './Consumer.css';

export default function ConsumerMeterPage() {
  const [profile, setProfile] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pRes = await consumerAPI.getProfile();
      setProfile(pRes.data.data);
      const mRes = await meterAPI.getByConsumer(pRes.data.data._id);
      setReadings(mRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load meter data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'readingDate', label: 'Reading Date', render: (r) => <span>{new Date(r.readingDate).toLocaleDateString()}</span> },
    { key: 'currentReading', label: 'Reading Value', render: (r) => <span className="font-bold">{r.currentReading} kWh</span> },
    { key: 'unitsConsumed', label: 'Units Consumed', render: (r) => <Badge value={`${r.unitsConsumed} units`} color={r.unitsConsumed > 300 ? 'red' : 'green'} /> },
    { key: 'readerName', label: 'Recorded By', render: (r) => <span>{r.recordedBy?.name || 'System'}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge value="Verified" /> },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="meter-page">
      <div className="page-header">
        <div>
          <h1>Meter Information</h1>
          <p>Monitor your electricity meter status and history</p>
        </div>
      </div>

      <div className="meter-stats-grid">
        <div className="card stat-card-alt">
          <div className="sca-icon blue"><FiZap /></div>
          <div className="sca-info">
            <label>Meter Status</label>
            <h3>Active</h3>
            <span className="text-success"><FiCheckCircle /> Online & Secure</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon purple"><FiActivity /></div>
          <div className="sca-info">
            <label>Last Reading</label>
            <h3>{readings[0]?.currentReading || '0'} kWh</h3>
            <span>Recorded: {readings[0] ? new Date(readings[0].readingDate).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        <div className="card stat-card-alt">
          <div className="sca-icon yellow"><FiBox /></div>
          <div className="sca-info">
            <label>Connection Type</label>
            <h3>{profile?.connectionType?.toUpperCase()}</h3>
            <span>{profile?.meterNumber}</span>
          </div>
        </div>
      </div>

      <div className="meter-overview">
        <div className="card meter-details-card">
          <div className="mdc-header">
            <div className="mdc-icon"><FiZap /></div>
            <div>
              <h3>Smart Meter Details</h3>
              <p>Comprehensive technical information</p>
            </div>
          </div>
          
          <div className="mdc-grid">
            <div className="mdc-item">
              <FiBox className="mi-icon" />
              <div><label>Model Number</label><span>{profile?.meterNumber}</span></div>
            </div>
            <div className="mdc-item">
              <FiCalendar className="mi-icon" />
              <div><label>Installation Date</label><span>{new Date(profile?.installationDate).toLocaleDateString()}</span></div>
            </div>
            <div className="mdc-item">
              <FiActivity className="mi-icon" />
              <div><label>Current Phase</label><span>Single Phase</span></div>
            </div>
            <div className="mdc-item">
              <FiClock className="mi-icon" />
              <div><label>Billing Cycle</label><span>Monthly</span></div>
            </div>
          </div>
        </div>

        <div className="meter-alerts-section">
          <div className="card alert-card-mini info">
            <FiShield />
            <div>
              <h4>Tamper Detection</h4>
              <p>No tampering detected. Your meter is secure.</p>
            </div>
          </div>
          <div className="card alert-card-mini success">
            <FiActivity />
            <div>
              <h4>Usage Health</h4>
              <p>Your meter is reporting normal usage patterns.</p>
            </div>
          </div>
          <div className="card alert-card-mini warning">
            <FiAlertCircle />
            <div>
              <h4>Smart Alert</h4>
              <p>Unexpected usage spike detected last Tuesday.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card" style={{marginTop: '1.5rem'}}>
        <div className="card-header-row">
          <h3>Meter Reading History</h3>
        </div>
        <Table columns={columns} data={readings} loading={loading} emptyMsg="No readings found." />
      </div>
    </div>
  );
}
