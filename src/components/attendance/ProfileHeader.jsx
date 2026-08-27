import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../utils/api';
import urbancodeLogo from '../../assets/uclogo.png';
import jobzenterLogo from '../../assets/jzlogo.png';
import { FiBell, FiSun, FiMoon } from 'react-icons/fi';

function ProfileHeader({ theme, toggleTheme }) {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.getCurrentUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const currentUser = await res.json();
        setUser(currentUser);
      } catch (err) {
        console.error('Error loading user:', err.message);
      }
    };

    if (token) fetchUser();
  }, [token]);

  if (!user) return null;

  const getCompanyLogo = (company) => {
    switch (company) {
      case 'Urbancode':
        return urbancodeLogo;
      case 'Jobzenter':
        return jobzenterLogo;
      default:
        return '/default-logo.png';
    }
  };

  const getAvatarUrl = (u) => {
    if (!u) return getCompanyLogo(null);
    const p = u.profilePic;
    if (typeof p === 'string' && p.trim()) return p;
    if (p && typeof p === 'object') return p.secure_url || p.url || p.secureUrl || '';
    return getCompanyLogo(u.company);
  };

  const firstName = (user.name || 'there').split(' ')[0];
  const notificationCount = 0;

  return (
    <div className="att-profile-header">
      <div className="att-profile-left">
        <div className="att-avatar-wrap">
          <img
            src={getAvatarUrl(user)}
            alt={user.name || user.company}
            className="att-avatar"
          />
        </div>
        <div className="att-profile-text">
          <h2 className="att-greeting">
            Hi, {user.name || firstName} <span aria-hidden>👋</span>
          </h2>
          <p className="att-position">{user.position || 'Employee'}</p>
          <p className="att-meta">
            {user.company || 'UrbanCode'}
            {user.employeeId ? ` - ID: ${user.employeeId}` : ''}
          </p>
        </div>
      </div>

      <div className="att-profile-actions">
        <button type="button" className="att-icon-btn" title="Notifications">
          <FiBell />
          {notificationCount > 0 && (
            <span className="att-badge">{notificationCount}</span>
          )}
        </button>
        {typeof toggleTheme === 'function' && (
          <button
            type="button"
            className="att-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
