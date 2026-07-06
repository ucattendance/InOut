import React from 'react';

function ActivityLog({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 dark:text-gray-500">
        No activity on selected date
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Your Activity</h3>
      {activities.map((item, index) => (
        <div
          key={index}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-3 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-200">
            {item.type}
          </p>
          <div className="flex justify-between text-sm mt-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityLog;
