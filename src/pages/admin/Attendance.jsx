import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AttendanceTable from '../../components/admin-dashboard/attendance/AttendanceTable';
import { API_ENDPOINTS } from '../../utils/api';
import Loader from '../../components/admin-dashboard/common/Loader';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [lockedUsers, setLockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockingId, setUnlockingId] = useState(null);
  const [showLockedModal, setShowLockedModal] = useState(false);

  const fetchAttendanceAndUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const [attRes, usersRes] = await Promise.all([
        axios.get(API_ENDPOINTS.getAttendanceAll, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_ENDPOINTS.getUsers, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRecords(attRes.data);
      
      const locked = (usersRes.data || []).filter(u => u.attendanceLocked === true);
      setLockedUsers(locked);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceAndUsers();
  }, []);

  const handleUnlock = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to unlock attendance for ${userName}?`)) return;
    
    setUnlockingId(userId);
    try {
      const token = localStorage.getItem('token');
      const url = typeof API_ENDPOINTS.unlockAttendance === 'function' 
        ? API_ENDPOINTS.unlockAttendance(userId) 
        : `${API_ENDPOINTS.unlockAttendance}/${userId}`;

      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${userName} has been unlocked successfully!`);
      fetchAttendanceAndUsers();
    } catch (error) {
      console.error('Failed to unlock user:', error);
      toast.error(error.response?.data?.message || 'Failed to unlock user');
    } finally {
      setUnlockingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="uc-page">
      {/* Header bar with Title & Locked Users Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Records</h1>
        <button
          onClick={() => setShowLockedModal(true)}
          className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
        >
          <span>🔒 Locked Users</span>
          {lockedUsers.length > 0 && (
            <span className="bg-white text-red-700 font-bold px-2 py-0.5 text-xs rounded-full">
              {lockedUsers.length}
            </span>
          )}
        </button>
      </div>

      <AttendanceTable records={records} />

      {/* Locked Users Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-red-600 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>🔒</span> Locked Users (Profile Incomplete)
              </h2>
              <button
                onClick={() => setShowLockedModal(false)}
                className="text-white/80 hover:text-white text-xl font-bold p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {lockedUsers.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    The following users haven't completed their required profile information within the 3-day grace period and are currently locked out of checking in.
                  </p>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-left">Email</th>
                          <th className="py-3 px-4 text-left">Locked Date</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 text-sm">
                        {lockedUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-red-50/40">
                            <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4 text-gray-500">
                              {user.attendanceLockedAt ? new Date(user.attendanceLockedAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleUnlock(user._id, user.name)}
                                disabled={unlockingId === user._id}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-sm transition-colors disabled:opacity-50"
                              >
                                {unlockingId === user._id ? 'Unlocking...' : 'Unlock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <span className="text-4xl mb-3 block">✅</span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">No Locked Users</h3>
                  <p className="text-sm text-gray-500">All employees have complete profiles or are within their grace period.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowLockedModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
