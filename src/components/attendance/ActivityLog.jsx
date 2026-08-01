import React from 'react';
import { FiCheckCircle, FiLogOut } from 'react-icons/fi';

function ActivityLog({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="att-activity-empty">
        No activity on selected date
      </div>
    );
  }

  return (
    <div className="att-activity">
      <h3 className="att-section-title">Your Activity</h3>
      {activities.map((item, index) => {
        const isIn = item.type === 'check-in';
        return (
          <div key={index} className="att-activity-card">
            <div className="att-activity-left">
              <span className={`att-activity-icon ${isIn ? 'is-in' : 'is-out'}`}>
                {isIn ? <FiCheckCircle /> : <FiLogOut />}
              </span>
              <div>
                <p className="att-activity-type">
                  {isIn ? 'Check-In' : 'Check-Out'}
                </p>
                <p className="att-activity-time">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <span className="att-activity-date">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default ActivityLog;
