import React, { useEffect, useState } from 'react';
import { FiZap, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Page.css';

export default function TariffPage() {
  const [tariffs, setTariffs] = useState([
    { connectionType: 'residential', peakRate: 24.5, offPeakRate: 18.2, fixedCharges: 200, taxPercentage: 17 },
    { connectionType: 'commercial', peakRate: 35.8, offPeakRate: 28.5, fixedCharges: 1000, taxPercentage: 17 },
    { connectionType: 'industrial', peakRate: 45.2, offPeakRate: 38.0, fixedCharges: 5000, taxPercentage: 17 },
  ]);
  const [editing, setEditing] = useState(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Tariff Management</h1>
          <p>Set electricity rates for different connection types</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {tariffs.map((t, idx) => (
          <div key={t.connectionType} className="section-card" style={{ borderTop: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ textTransform: 'capitalize', fontSize: '1.2rem' }}>{t.connectionType}</h3>
              {editing === idx ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="action-btn text-green" onClick={() => { setEditing(null); toast.success('Rates updated!'); }}><FiSave /></button>
                  <button className="action-btn text-red" onClick={() => setEditing(null)}><FiX /></button>
                </div>
              ) : (
                <button className="action-btn" onClick={() => setEditing(idx)}><FiEdit2 /></button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Peak Rate (per unit)</span>
                {editing === idx ? (
                  <input type="number" defaultValue={t.peakRate} style={{ width: 80, textAlign: 'right' }} />
                ) : (
                  <strong>PKR {t.peakRate}</strong>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Off-Peak Rate (per unit)</span>
                {editing === idx ? (
                  <input type="number" defaultValue={t.offPeakRate} style={{ width: 80, textAlign: 'right' }} />
                ) : (
                  <strong>PKR {t.offPeakRate}</strong>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Fixed Charges</span>
                {editing === idx ? (
                  <input type="number" defaultValue={t.fixedCharges} style={{ width: 80, textAlign: 'right' }} />
                ) : (
                  <strong>PKR {t.fixedCharges}</strong>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tax (GST)</span>
                {editing === idx ? (
                  <input type="number" defaultValue={t.taxPercentage} style={{ width: 80, textAlign: 'right' }} />
                ) : (
                  <strong>{t.taxPercentage}%</strong>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card" style={{ marginTop: '2rem' }}>
        <h3>Automatic Bill Generation</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          When active, the system will automatically generate bills at the end of each billing cycle based on recorded meter readings and current tariff rates.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 20, background: '#10b981', borderRadius: 20, position: 'relative' }}>
            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', right: 2, top: 2 }} />
          </div>
          <span>Enabled (Cycle: Monthly)</span>
        </div>
      </div>
    </div>
  );
}
