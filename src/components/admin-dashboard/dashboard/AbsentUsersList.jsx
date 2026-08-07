import React from 'react';
import { activeEmployees, normalizeId, presentEmployeeIds } from '../../../utils/dashboardLogs';

const isWeekendDate = (date) => {
  if (!date) {
    const d = new Date().getDay();
    return d === 0 || d === 6;
  }
  const m = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
};

const AbsentUsersList = ({ allUsers = [], logs = [], dateFilter }) => {
  // Weekend = office leave — nobody is marked absent
  if (isWeekendDate(dateFilter)) return null;

  const presentIds = presentEmployeeIds(logs);
  const presentNames = new Set(
    logs
      .filter((log) => log.type === 'check-in')
      .map((log) => (log.employeeName || log.name || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const employees = activeEmployees(allUsers);
  const absentees = employees.filter((user) => {
    if (presentIds.has(normalizeId(user._id))) return false;
    const name = (user.name || '').trim().toLowerCase();
    if (name && presentNames.has(name)) return false;
    return true;
  });

  if (absentees.length === 0) return null;

  return (
    <div className="uc-list-panel">
      <div className="uc-list-header">
        <h2>Absent Employees ({absentees.length})</h2>
        <p>Employees who haven&apos;t checked in today</p>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {absentees.map((user) => (
          <li key={user._id} className="uc-list-item">
            <div className="uc-flex-between" style={{ marginBottom: 0 }}>
              <span style={{ fontWeight: 500, color: '#1f2937' }}>{user.name}</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {user.position} | {user.company}
              </span>
            </div>
            {user.department && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  background: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: 4,
                }}
              >
                {user.department}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid #e5e7eb' }}>
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AbsentUsersList;
