import React from 'react';

function DateStrip({ selectedDate, setSelectedDate }) {
  const today = new Date();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (4 - i));
    return {
      date: d,
      day: d.getDate().toString().padStart(2, '0'),
      label: dayLabels[d.getDay()],
      isToday: d.toDateString() === today.toDateString(),
      isSelected: d.toDateString() === selectedDate.toDateString(),
    };
  });

  return (
    <div className="att-date-strip">
      {days.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setSelectedDate(d.date)}
          className={`att-date-chip ${d.isSelected ? 'is-selected' : ''} ${d.isToday ? 'is-today' : ''}`}
        >
          <span className="att-date-num">{d.day}</span>
          <span className="att-date-label">{d.label}</span>
        </button>
      ))}
    </div>
  );
}

export default DateStrip;
