'use client';
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { QueueEntry } from '@/lib/types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
type UpdateStatus = 'in-progress' | 'done' | 'skipped';
interface StatusAction { label: string; status: UpdateStatus; color: string; }
function getActions(current: string): StatusAction[] {
  if (current === 'waiting') return [
    { label: 'Start', status: 'in-progress', color: '#f59e0b' },
    { label: 'Skip', status: 'skipped', color: '#ef4444' },
  ];
  if (current === 'in_progress') return [
    { label: 'Done', status: 'done', color: '#10b981' },
  ];
  return [];
}
function QueueBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    waiting: 'badge-waiting', in_progress: 'badge-in_progress', done: 'badge-done', skipped: 'badge-skipped',
  };
  return <span className={`badge ${map[status] || 'badge-waiting'}`}>{status.replace('_', ' ')}</span>;
}
export default function ReceptionistQueuePage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);
  const fetchQueue = useCallback(() => {
    setLoading(true);
    api.get(`/queue?date=${date}`)
      .then(res => setQueue(res.data?.queue || res.data || []))
      .catch(() => toast.error('Failed to load queue'))
      .finally(() => setLoading(false));
  }, [date]);
  useEffect(() => { fetchQueue(); }, [fetchQueue]);
  const updateStatus = async (id: number, status: UpdateStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/queue/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      // fetch Queue again to catch any edge cases that were missed
      fetchQueue();
    } catch (err: any) {
      console.log('failed updating queue status', err)
      toast.error(err?.response?.data?.error || 'Update failed');
    } finally { 
      setUpdating(null); 
    }
  };
  const counts = {
    waiting: queue.filter(q => q.status === 'waiting').length,
    in_progress: queue.filter(q => q.status === 'in_progress').length,
    done: queue.filter(q => q.status === 'done').length,
    skipped: queue.filter(q => q.status === 'skipped').length,
  };
  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Reception Queue</h1>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Manage daily patient appointments</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px', maxWidth: '240px' }}>
          <label>Select Date</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button className="btn-secondary" onClick={fetchQueue} style={{ marginTop: '1.35rem' }} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Waiting', count: counts.waiting, color: '#6b7280' },
          { label: 'In Progress', count: counts.in_progress, color: '#f59e0b' },
          { label: 'Done', count: counts.done, color: '#10b981' },
          { label: 'Skipped', count: counts.skipped, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '0.85rem 1rem' }}>
            <h3>{s.label}</h3>
            <p style={{ color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>
      
      {/* TODO: Pagination later when queue gets too big */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>
      )}
      
      {!loading && queue.length === 0 && (
        <div className="empty-state"><p>No queue entries for this date</p></div>
      )}
      
      {!loading && queue.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {queue.map(entry => {
            const actions = getActions(entry.status);
            const patientName = entry.appointment?.patient?.name || `Patient #${entry.appointmentId}`;
            return (
              <div key={entry.id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                opacity: entry.status === 'done' || entry.status === 'skipped' ? 0.6 : 1,
              }}>
                <div className="token-badge">{entry.tokenNumber}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{patientName}</span>
                    <QueueBadge status={entry.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                    Appointment #{entry.appointmentId}
                    {entry.appointment?.patient?.phone ? ` · ${entry.appointment.patient.phone}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {actions.map(action => (
                    <button key={action.status} disabled={updating === entry.id} onClick={() => updateStatus(entry.id, action.status)} style={{
                      padding: '0.4rem 0.8rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: '0.78rem', background: action.color, color: '#fff',
                      opacity: updating === entry.id ? 0.6 : 1, transition: 'opacity 0.15s',
                    }}>
                      {updating === entry.id ? '...' : action.label}
                    </button>
                  ))}
                  {actions.length === 0 && <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>None</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


