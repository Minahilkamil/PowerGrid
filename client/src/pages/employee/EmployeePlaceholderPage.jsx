import React from 'react';
import { FiTool } from 'react-icons/fi';

export default function EmployeePlaceholderPage({ title }) {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
        <FiTool />
      </div>
      <h1 style={{ marginBottom: '0.5rem' }}>{title}</h1>
      <p style={{ color: '#64748b', maxWidth: '400px' }}>
        This module is currently under development. Check back soon for full functionality of the {title.toLowerCase()} system.
      </p>
      <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => window.history.back()}>
        Go Back
      </button>
    </div>
  );
}
