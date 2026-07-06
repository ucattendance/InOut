import React from 'react';

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AttendanceCards({ attendanceData = [], totalWorkingDays, remainingDays }) {
  if (!attendanceData.length) return null;

  // Group attendance by date
  const grouped = attendanceData.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  // This section is titled "Today Attendance", so only today's entries belong here —
  // showing the most recent-ever record misled users into thinking a past check-in was today's.
  const todayKey = new Date().toDateString();
  const todayEntries = grouped[todayKey] || [];

  const checkIn = todayEntries.find(entry => entry.type === 'check-in');
  const checkOut = todayEntries.find(entry => entry.type === 'check-out');

  const cards = [
    {
      title: 'Check In',
      time: formatTime(checkIn?.timestamp),
      note: checkIn ? 'On Time' : 'Not Yet',
      bgColor: 'bg-green-100 dark:bg-green-900/40',
      textColor: 'text-green-800 dark:text-green-300',
    },
    {
      title: 'Check Out',
      time: formatTime(checkOut?.timestamp),
      note: checkOut ? 'Go Home' : 'Not Yet',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
      textColor: 'text-blue-800 dark:text-blue-300',
    },
    {
      title: 'Total Days',
      time: (totalWorkingDays ?? Object.keys(grouped).length).toString(),
      note: 'Working Days',
      bgColor: 'bg-purple-100 dark:bg-purple-900/40',
      textColor: 'text-purple-800 dark:text-purple-300',
    },
    {
      title: 'Remaining Days',
      time: (remainingDays ?? 0).toString(),
      note: 'This Month',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
      textColor: 'text-indigo-800 dark:text-indigo-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700`}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">{card.title}</p>
          <h4 className={`text-xl font-bold ${card.textColor}`}>{card.time}</h4>
          <p className={`text-xs font-medium ${card.textColor}`}>{card.note}</p>
        </div>
      ))}
    </div>
  );
}

export default AttendanceCards;
