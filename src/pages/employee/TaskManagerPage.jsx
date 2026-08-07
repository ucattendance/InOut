import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { promptToast } from '../../utils/interactiveToast';
import { API_ENDPOINTS } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiBarChart2,
  FiMapPin,
} from 'react-icons/fi';
import PromoTimer from '../../components/attendance/PromoTimer';
import './TaskManagerPage.css';

const TaskManagerPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [summary, setSummary] = useState({ total: 0, done: 0, pending: 0 });

  const formattedDate = selectedDate.toISOString().split('T')[0];
  const dayNum = String(selectedDate.getDate()).padStart(2, '0');

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
    <div className="tm-page">
      <div className="tm-wrap">
        <header className="tm-header">
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="tm-back"
          >
            <FiArrowLeft />
            Back
          </button>

          <div className="tm-title-block">
            <div className="tm-brand">
              <span className="tm-brand-icon" aria-hidden>
                <span>CAL</span>
                <strong>{dayNum}</strong>
              </span>
              <h1>Task Manager</h1>
            </div>
            <p className="tm-subtitle">Organize your tasks and stay productive.</p>
          </div>

          <div className="tm-header-spacer" aria-hidden />
        </header>

        <div className="tm-grid">
          <section className="tm-card">
            <Calendar onChange={setSelectedDate} value={selectedDate} />
            <div className="tm-stats">
              <div className="tm-stat">
                <span className="tm-stat-icon purple"><FiCalendar /></span>
                <span>Selected: <strong>{formattedDate}</strong></span>
              </div>
              <div className="tm-stat">
                <span className="tm-stat-icon green"><FiCheckCircle /></span>
                <span>Done: <strong>{summary.done}</strong></span>
              </div>
              <div className="tm-stat">
                <span className="tm-stat-icon orange"><FiMapPin /></span>
                <span>Pending: <strong>{summary.pending}</strong></span>
              </div>
              <div className="tm-stat">
                <span className="tm-stat-icon blue"><FiBarChart2 /></span>
                <span>Total: <strong>{summary.total}</strong></span>
              </div>
            </div>
          </section>

          <section className="tm-card">
            <div className="tm-tasks-head">
              <FiClipboard className="tm-tasks-head-icon" />
              <h2>Tasks for {formattedDate}</h2>
            </div>

            <div className="tm-add-row">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask();
                }}
                placeholder="Add new task..."
              />
              <button type="button" onClick={addTask} className="tm-add-btn">
                <FiPlus /> Add
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="tm-empty">
                <div className="tm-empty-art" aria-hidden>
                  <FiClipboard />
                </div>
                <p>No tasks for this day.</p>
                <span>Add a new task to get started!</span>
              </div>
            ) : (
              <ul className="tm-task-list">
                {tasks.map((task) => (
                  <li
                    key={task._id}
                    className={`tm-task-item${task.done ? ' is-done' : ''}`}
                  >
                    <div className="tm-task-left">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task._id, task.done)}
                      />
                      <div>
                        <p className="tm-task-name">{task.task}</p>
                        <p className="tm-task-meta">
                          {new Date(task.createdAt).toLocaleTimeString()} |{' '}
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="tm-task-actions">
                      <button
                        type="button"
                        className="tm-icon-btn edit"
                        onClick={() => updateTask(task._id, task.task)}
                        aria-label="Edit task"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="tm-icon-btn delete"
                        onClick={() => deleteTask(task._id)}
                        aria-label="Delete task"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <PromoTimer variant="taskManager" titleText="Limited Time Promo!" />
      </div>
    </div>
  );
};

export default TaskManagerPage;
