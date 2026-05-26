import React from 'react';
import './Table.css';

export default function Table({ columns, data, loading, emptyMsg = 'No data found.' }) {
  if (loading) return <div className="table-loading"><div className="spinner" /></div>;
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length} className="empty-cell">{emptyMsg}</td></tr>
            : data.map((row, i) => (
              <tr key={row._id || i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
