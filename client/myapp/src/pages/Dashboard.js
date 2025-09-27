import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';
import Chatbot from '../components/Chatbot';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [sort, setSort] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch = async () => {
    try {
      const qs = [];
      if (sort) qs.push(`sort=${sort}`);
      if (filterStatus) qs.push(`status=${filterStatus}`);
      const q = qs.length ? `?${qs.join('&')}` : '';
      const res = await API.get(`/assignments${q}`);
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetch(); }, [sort, filterStatus]);

  return (
    <div className="dashboard">
      {/* 🔥 Animated Topbar */}
      <header className="topbar card animate-gradient">
        <h1 className="title">📚 Assignment Deadline Manager</h1>
        <div className="user-controls">
          <span className="welcome">Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="main-grid">
        <div className="left-col">
          {/* Assignment Form */}
          <AssignmentForm
            onSaved={() => { setEditItem(null); fetch(); }}
            editItem={editItem}
          />

          {/* Sort + Filter Controls */}
          <div className="controls card fade-in">
            <label>Sort:
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="">--</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </label>
            <label>Filter:
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          {/* Assignment List (cards animate on load) */}
          <AssignmentList
            assignments={assignments}
            onEdit={a => setEditItem(a)}
            onRefresh={fetch}
          />
        </div>

        {/* Chatbot slides in */}
        <aside className="right-col chatbot-slide">
          <Chatbot />
        </aside>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab bounce"
        onClick={() => setEditItem({})}
      >
        +
      </button>
    </div>
  );
}
