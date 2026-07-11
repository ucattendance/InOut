import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { promptToast } from '../../utils/interactiveToast';
import { API_ENDPOINTS } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import PromoTimer from '../../components/attendance/PromoTimer';

const TaskManagerPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [summary, setSummary] = useState({ total: 0, done: 0, pending: 0 });

  const formattedDate = selectedDate.toISOString().split('T')[0];

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.getTasksByDate(formattedDate), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      toast.error('Error: Unable to fetch tasks.');
    }
  }, [formattedDate]);

  const fetchSummary = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.getTaskSummary, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error('Summary fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchSummary();
  }, [fetchTasks, fetchSummary]);

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.addTask,
        { task: newTask, date: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask('');
      fetchTasks();
      fetchSummary();
    } catch (err) {
      toast.error('Error: Failed to add task.');
    }
  };

  const toggleTask = async (id, done) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        API_ENDPOINTS.updateTaskStatus(id),
        { done: !done },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      fetchSummary();
    } catch (err) {
      toast.error('Error: Failed to update task status.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.deleteTask(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      fetchSummary();
    } catch (err) {
      toast.error('Error: Failed to delete task.');
    }
  };

  const updateTask = async (id, currentName) => {
    const updatedName = await promptToast({
      title: 'Edit Task',
      defaultValue: currentName,
      confirmText: 'Update',
    });

    if (!updatedName || updatedName.trim() === currentName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        API_ENDPOINTS.updateFullTask(id),
        { task: updatedName, date: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
      fetchSummary();
    } catch (err) {
      toast.error('Error: Failed to update task.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50 via-yellow-50 to-sky-50 py-10 px-4 font-sans">
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-xl hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
      <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">🗓️ Task Manager</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <Calendar onChange={setSelectedDate} value={selectedDate} className="rounded" />
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div>📅 Selected: <strong>{formattedDate}</strong></div>
            <div>✅ Done: <strong>{summary.done}</strong></div>
            <div>📌 Pending: <strong>{summary.pending}</strong></div>
            <div>📊 Total: <strong>{summary.total}</strong></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Tasks for {formattedDate}</h2>

          <div className="flex mb-4 gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task..."
              className="border px-3 py-2 rounded-lg flex-1 shadow-inner"
            />
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              ➕ Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-gray-500 text-sm">No tasks for this day.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li
                  key={task._id}
                  className={`flex items-start justify-between p-3 rounded-lg border shadow-sm ${
                    task.done ? 'bg-green-50' : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task._id, task.done)}
                      className="mt-1"
                    />
                    <div>
                      <p className={`font-medium ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.task}
                      </p>
                      <p className="text-xs text-gray-500">
                        🕒 {new Date(task.createdAt).toLocaleTimeString()} | 📅 {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => updateTask(task._id, task.task)} className="text-indigo-600 hover:text-indigo-800 text-sm">
                      ✏️
                    </button>
                    <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700 text-sm">
                      🗑
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <PromoTimer initialMinutes={1} />
    </div>
  );
};

export default TaskManagerPage;
