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
    <div className="flex justify-between gap-2 overflow-x-auto pb-1">
      {days.map((d, i) => (
        <button
          key={i}
          onClick={() => setSelectedDate(d.date)}
          className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border shadow-sm min-w-[55px] transition-all
            ${d.isSelected
              ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <span className="text-base">{d.day}</span>
          <span className="text-xs font-medium">{d.label}</span>
          {d.isToday && !d.isSelected && (
            <span className="mt-1 w-1.5 h-1.5 bg-blue-400 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export default DateStrip;
