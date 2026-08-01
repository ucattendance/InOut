import React from 'react';
import { FiClock, FiLogOut, FiCalendar } from 'react-icons/fi';

function formatTime(timestamp) {
  if (!timestamp) return '--:--';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AttendanceCards({ attendanceData = [], totalWorkingDays, remainingDays }) {
  const grouped = (attendanceData || []).reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  const todayKey = new Date().toDateString();
  const todayEntries = grouped[todayKey] || [];

  const checkIn = todayEntries.find((entry) => entry.type === 'check-in');
  const checkOut = todayEntries.find((entry) => entry.type === 'check-out');

  const cards = [
    {
      title: 'Check In',
      time: formatTime(checkIn?.timestamp),
      note: checkIn ? 'On Time' : 'Not Yet',
      icon: <FiClock />,
      tone: 'green',
    },
    {
      title: 'Check Out',
      time: formatTime(checkOut?.timestamp),
      note: checkOut ? 'Done' : 'Not Yet',
      icon: <FiLogOut />,
      tone: 'blue',
    },
    {
      title: 'Total Days',
      time: String(totalWorkingDays ?? Object.keys(grouped).length),
      note: 'Working Days',
      icon: <FiCalendar />,
      tone: 'purple',
    },
    {
      title: 'Remaining Days',
      time: String(remainingDays ?? 0),
      note: 'This Month',
      icon: <FiCalendar />,
      tone: 'orange',
    },
  ];

  return (
    <div className="att-today-grid">
      {cards.map((card) => (
        <div key={card.title} className={`att-today-card att-today-${card.tone}`}>
          <div className="att-today-top">
            <span className="att-today-label">{card.title}</span>
            <span className="att-today-icon">{card.icon}</span>
          </div>
          <p className="att-today-value">{card.time}</p>
          <span className="att-today-badge">{card.note}</span>
        </div>
      ))}
    </div>
  );
}

export default AttendanceCards;
