import React from 'react';
import { FiUsers, FiUserCheck, FiUmbrella, FiUserX } from 'react-icons/fi';

const Spark = ({ color }) => (
  <svg className="dash-spark" viewBox="0 0 64 24" aria-hidden>
    <polyline
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      points="2,18 14,14 24,16 36,8 46,12 62,4"
    />
  </svg>
);

const DashboardCards = ({ data, isToday = true }) => {
  const total = data?.totalEmployees || 0;
  const present = data?.presentToday || 0;
  const onLeave = data?.onLeaveToday || 0;
  const absent = data?.absentToday ?? Math.max(0, total - present - onLeave);

  const pct = (n) => (total > 0 ? `${((n / total) * 100).toFixed(2)}% of total` : '0% of total');
  const dayWord = isToday ? 'Today' : '';

  const cards = [
    {
      key: 'total',
      label: 'Total Employees',
      value: total,
      sub: 'Active roster',
      tone: 'green',
      icon: <FiUsers />,
      spark: '#22c55e',
    },
    {
      key: 'present',
      label: dayWord ? `Present ${dayWord}` : 'Present',
      value: present,
      sub: pct(present),
      tone: 'blue',
      icon: <FiUserCheck />,
      spark: '#3b82f6',
    },
    {
      key: 'leave',
      label: dayWord ? `On Leave ${dayWord}` : 'On Leave',
      value: onLeave,
      sub: pct(onLeave),
      tone: 'orange',
      icon: <FiUmbrella />,
      spark: '#f59e0b',
    },
    {
      key: 'absent',
      label: dayWord ? `Absent ${dayWord}` : 'Absent',
      value: absent,
      sub: pct(absent),
      tone: 'red',
      icon: <FiUserX />,
      spark: '#ef4444',
    },
  ];

  return (
    <div className="dash-kpi-grid">
      {cards.map((card) => (
        <div key={card.key} className={`dash-kpi-card dash-kpi-${card.tone}`}>
          <div className="dash-kpi-top">
            <span className="dash-kpi-icon">{card.icon}</span>
            <Spark color={card.spark} />
          </div>
          <p className="dash-kpi-label">{card.label}</p>
          <h2 className="dash-kpi-value">{card.value}</h2>
          <p className="dash-kpi-sub">{card.sub}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
