import React from 'react';

/**
 * Displays the list of appliances being added to a new schedule.
 * Props:
 *   appliances: array of { name, powerRating, duration, timesPerWeek }
 *   onDelete: (index) => void
 */
export default function ApplianceTable({ appliances, onDelete }) {
  if (!appliances || appliances.length === 0) {
    return (
      <div className="empty-table-message">
        No appliances added yet. Use the form above to add appliances.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Appliance Name</th>
            <th>Power Rating (W)</th>
            <th>Duration (min)</th>
            <th>Frequency / Week</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appliances.map((appliance, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{appliance.name}</td>
              <td>{appliance.powerRating}</td>
              <td>{appliance.duration}</td>
              <td>{appliance.timesPerWeek}x / week</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(index)}
                  title="Remove appliance"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
