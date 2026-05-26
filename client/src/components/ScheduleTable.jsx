import React from 'react';

/**
 * Displays a schedule's appliance rows.
 * Props:
 *   appliances: array of ApplianceScheduleDto
 *     { applianceId, name, frequency, runningSlots: [{startTime, endTime, isPeakHour, cost}], usageDates }
 */
export default function ScheduleTable({ appliances }) {
  if (!appliances || appliances.length === 0) {
    return (
      <div className="empty-table-message">No schedule data available.</div>
    );
  }

  // Flatten: one row per appliance (using first running slot for times)
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Appliance Name</th>
            <th>Frequency</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Peak Hour</th>
            <th>Cost (R)</th>
          </tr>
        </thead>
        <tbody>
          {appliances.map((appliance, idx) => {
            const slot = appliance.runningSlots && appliance.runningSlots[0];
            const totalCost = appliance.runningSlots
              ? appliance.runningSlots.reduce((sum, s) => sum + (s.cost || 0), 0)
              : 0;
            return (
              <tr key={appliance.applianceId ?? idx}>
                <td>{appliance.name}</td>
                <td>{appliance.frequency || '—'}</td>
                <td>{slot ? slot.startTime : '—'}</td>
                <td>{slot ? slot.endTime : '—'}</td>
                <td>
                  <span className={`badge ${slot?.isPeakHour ? 'badge-peak' : 'badge-offpeak'}`}>
                    {slot?.isPeakHour ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>R {Number(totalCost).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
