import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../utils/api';

const ApplyLeaveForm = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('Casual');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(fromDate) > new Date(toDate)) {
      toast.warning('Invalid Dates: From Date should not be after To Date.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post(API_ENDPOINTS.applyLeave, {
        fromDate,
        toDate,
        reason,
        leaveType,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Leave Applied! Your leave has been submitted successfully.');

      navigate('/attendance');
    } catch (error) {
      console.error(error);
      toast.error('Error: Failed to apply for leave');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 max-w-lg w-full transition-all duration-300 border border-blue-100">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Apply for Leave</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-2 outline-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-2 outline-indigo-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-xl border px-4 py-2 outline-indigo-500 shadow-sm"
            >
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Reason</label>
            <textarea
              placeholder="Brief reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              className="w-full rounded-xl border px-4 py-2 outline-indigo-500 shadow-sm"
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 shadow-md transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveForm;
