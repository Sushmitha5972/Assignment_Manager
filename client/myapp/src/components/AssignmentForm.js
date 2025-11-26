import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AssignmentForm({ onSaved, editItem }) {
  // Always initialize all fields to avoid uncontrolled warnings
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',   // YYYY-MM-DD for <input type="date">
    priority: 'Medium'
  });

  useEffect(() => {
    if (editItem) {
      setForm({
        title: editItem.title || '',
        description: editItem.description || '',
        dueDate: editItem.dueDate
          ? new Date(editItem.dueDate).toISOString().slice(0, 10) // ensures YYYY-MM-DD
          : '',
        priority: editItem.priority || 'Medium'
      });
    }
  }, [editItem]);

  const submit = async (e) => {
    e.preventDefault();

    // Validate dueDate manually
    if (!form.dueDate) {
      alert("Please provide a valid due date.");
      return;
    }

    try {
      const payload = { ...form, dueDate: new Date(form.dueDate) };

      if (editItem && editItem._id) {
        // Update existing
        await API.put(`/assignments/${editItem._id}`, payload);
      } else {
        // Create new
        await API.post('/assignments', payload);
      }

      // Reset form after save
      setForm({ title:'', description:'', dueDate:'', priority:'Medium' });
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving assignment');
    }
  };

  return (
    <form className="assignment-form card" onSubmit={submit}>
      <input
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        required
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />
      <input
        type="date"
        value={form.dueDate || ""}   // ensure controlled input
        onChange={e => setForm({ ...form, dueDate: e.target.value })}
        required
      />
      <select
        value={form.priority || "Medium"}  // ensure controlled input
        onChange={e => setForm({ ...form, priority: e.target.value })}
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
      <button type="submit">{editItem ? 'Update' : 'Add'} Assignment</button>
    </form>
  );
}
