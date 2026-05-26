import React from 'react';

const colors = {
  paid: { bg: '#d1fae5', color: '#065f46' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  overdue: { bg: '#fee2e2', color: '#991b1b' },
  active: { bg: '#d1fae5', color: '#065f46' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
  suspended: { bg: '#fee2e2', color: '#991b1b' },
  success: { bg: '#d1fae5', color: '#065f46' },
  failed: { bg: '#fee2e2', color: '#991b1b' },
  residential: { bg: '#dbeafe', color: '#1e40af' },
  commercial: { bg: '#ede9fe', color: '#5b21b6' },
  industrial: { bg: '#fef3c7', color: '#92400e' },
  admin: { bg: '#fee2e2', color: '#991b1b' },
  employee: { bg: '#dbeafe', color: '#1e40af' },
  consumer: { bg: '#d1fae5', color: '#065f46' },
  high: { bg: '#fee2e2', color: '#991b1b' },
  medium: { bg: '#dbeafe', color: '#1e40af' },
  low: { bg: '#d1fae5', color: '#065f46' },
  emergency: { bg: '#ef4444', color: '#ffffff' },
  'in-progress': { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  assigned: { bg: '#ede9fe', color: '#5b21b6' },
  resolved: { bg: '#d1fae5', color: '#065f46' },
  present: { bg: '#d1fae5', color: '#065f46' },
  late: { bg: '#fff7ed', color: '#c2410c' },
};

export default function Badge({ value }) {
  const style = colors[value] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '.2rem .65rem', borderRadius: '999px',
      fontSize: '.75rem', fontWeight: 600, textTransform: 'capitalize',
      display: 'inline-block'
    }}>
      {value}
    </span>
  );
}
