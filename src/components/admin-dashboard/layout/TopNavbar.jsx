import React, { useMemo } from 'react';
import { FiBell } from 'react-icons/fi';
import './layout.css';

const TopNavbar = () => {
  const adminName = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) return u.name;
      }
    } catch {
      /* ignore */
    }
    return 'Admin';
  }, []);

  const firstName = adminName.split(' ')[0] || 'Admin';

  return (
    <header className="admin-topnav admin-topnav-v2">
      <div className="admin-topnav-welcome">
        <strong>Welcome back, {firstName}! 👋</strong>
        <span>Here&apos;s what&apos;s happening with your team today.</span>
      </div>

      <div className="admin-topnav-right">
        <button type="button" className="admin-topnav-bell" aria-label="Notifications">
          <FiBell />
          <span className="admin-topnav-bell-badge">1</span>
        </button>
        <div className="admin-topnav-profile">
          <div className="admin-topnav-avatar" aria-hidden>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-topnav-profile-text">
            <strong>{adminName}</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
