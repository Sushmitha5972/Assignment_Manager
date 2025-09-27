import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AssignmentForm({ onSaved, editItem }) {
  const [form, setForm] = useState({ title:'', description:'', dueDate:'', priority:'Medium' });

  useEffect(()=> {
    if (editItem) setForm({
      title: editItem.title,
      description: editItem.description || '',
      dueDate: editItem.dueDate ? new Date(editItem.dueDate).toISOString().slice(0,10) : '',
      priority: editItem.priority || 'Medium'
    });
  }, [editItem]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await API.put(`/assignments/${editItem._id}`, { ...form, dueDate: new Date(form.dueDate) });
      } else {
        await API.post('/assignments', { ...form, dueDate: new Date(form.dueDate) });
      }
      setForm({ title:'', description:'', dueDate:'', priority:'Medium' });
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving');
    }
  };

  return (
    <form className="assignment-form card" onSubmit={submit}>
      <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
      <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
      <input type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} required />
      <select value={form.priority} onChange={e=>setForm({...form, priority:e.target.value})}>
        <option>High</option><option>Medium</option><option>Low</option>
      </select>
      <button type="submit">{editItem ? 'Update' : 'Add'} Assignment</button>
    </form>
  );
}
