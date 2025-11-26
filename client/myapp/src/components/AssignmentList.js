import React from 'react';
import API from '../api';

export default function AssignmentList({ assignments, onEdit, onRefresh }) {
  const markCompleted = async (id) => {
    try {
      await API.put(`/assignments/${id}`, { status: 'Completed' });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try { await API.delete(`/assignments/${id}`); onRefresh(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      {assignments.length === 0 && <p>No assignments yet.</p>}
      {assignments.map(a => (
        <div key={a._id} className={`assignment ${a.priority.toLowerCase()}`}>
          <h3>{a.title}</h3>
          <p>{a.description}</p>
          <p>Due: {new Date(a.dueDate).toLocaleDateString()}</p>
          <p>Priority: {a.priority} | Status: {a.status}</p>
          <div className="actions">
            {a.status === 'Pending' && <button onClick={()=>markCompleted(a._id)}>Mark Completed</button>}
            <button onClick={()=>onEdit(a)}>Edit</button>
            <button onClick={()=>remove(a._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}



