import React from 'react';
import { FiInfo } from 'react-icons/fi';

export default function PlaceholderPage({ title }) {
  return (
    <div className="section-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ 
        width: 80, 
        height: 80, 
        background: '#eff6ff', 
        color: '#3b82f6', 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 1.5rem',
        fontSize: '2.5rem'
      }}>
        <FiInfo />
      </div>
      <h2 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '0.5rem' }}>{title} Module</h2>
      <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
        This module is currently being implemented. Dynamic features and full functionality will be available soon.
      </p>
    </div>
  );
}
