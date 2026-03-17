'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { AdminUser, Role } from '@/lib/types';
import toast from 'react-hot-toast';
const ROLES: Role[] = ['admin', 'doctor', 'receptionist', 'patient'];
const roleBadge: Record<Role, string> = {
  admin: 'badge-admin', doctor: 'badge-doctor', receptionist: 'badge-receptionist', patient: 'badge-patient',
};
function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (newUser: AdminUser) => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' as Role, phone: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/users', form);
      toast.success('User created!');
      onCreated(res.data.user || res.data || { ...form, id: Math.floor(Math.random() * 10000) });
      onClose();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed');
    } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Create New User</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontWeight: 'bold' }}>X</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div><label>Full Name</label><input className="input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={3} /></div>
          <div><label>Email</label><input className="input" type="email" placeholder="john@clinic.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label>Password</label><input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
          <div>
            <label>Role</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div><label>Phone (optional)</label><input className="input" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<Role | 'all'>('all');
  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data?.users || res.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);
  const handleUserCreated = (newUser: AdminUser) => {
    setUsers([...users, newUser]);
  };
  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>Users</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{users.length} users in your clinic</p>
        </div>
        <div>
          <button className="btn-secondary" onClick={fetchUsers} style={{ marginRight: '0.5rem' }}>Sync API</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Create User</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['all', ...ROLES] as (Role | 'all')[]).map(r => (
          <button key={r} onClick={() => setFilter(r)} style={{
            padding: '0.35rem 0.85rem', borderRadius: '999px', border: '1px solid',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
            background: filter === r ? '#3b82f6' : '#fff',
            color: filter === r ? '#fff' : '#6b7280',
            borderColor: filter === r ? '#3b82f6' : '#e5e7eb',
            transition: 'all 0.12s',
          }}>
            {r === 'all' ? `All (${users.length})` : `${r.charAt(0).toUpperCase() + r.slice(1)} (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No users found</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th></tr></thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: '#111827' }}>{u.name}</td>
                  <td style={{ color: '#6b7280' }}>{u.email}</td>
                  <td><span className={`badge ${roleBadge[u.role]}`}>{u.role}</span></td>
                  <td style={{ color: '#9ca3af' }}>{u.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={handleUserCreated} />}
    </div>
  );
}

