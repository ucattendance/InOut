import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../utils/api';
import urbancodeLogo from '../../assets/uclogo.png';
import jobzenterLogo from '../../assets/jzlogo.png';
import { FiBell } from 'react-icons/fi';

function ProfileHeader() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.getUsers, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const users = await res.json();
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.userId;

        const currentUser = users.find(u => u._id === userId);
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

  const getAvatarUrl = (user) => {
    if (!user) return getCompanyLogo(user && user.company);
    const p = user.profilePic;
    // support string URL or cloudinary-style object { url | secure_url }
    if (typeof p === 'string' && p.trim()) return p;
    if (p && typeof p === 'object') return p.secure_url || p.url || p.secureUrl || '';
    return getCompanyLogo(user.company);
  };

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 p-1">
          <img
            src={getAvatarUrl(user)}
            alt={user.name || user.company}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.position || 'Employee'}</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.company}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">•</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID: <span className="font-medium text-gray-700 dark:text-gray-300">{user.employeeId || '-'}</span></p>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xl">
        <FiBell
          className="hover:text-blue-600 transition-colors duration-150 cursor-pointer"
          title="Notifications"
        />
      </div>
    </div>
  );
}

export default ProfileHeader;
