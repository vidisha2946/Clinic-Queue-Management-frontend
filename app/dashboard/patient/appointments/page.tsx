'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Appointment } from '@/lib/types';
import { format } from 'date-fns';
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: 'badge-queued', scheduled: 'badge-scheduled', in_progress: 'badge-in_progress',
    done: 'badge-done', cancelled: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-waiting'}`}>{status.replace('_', ' ')}</span>;
}
export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data?.appointments || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>;
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>My Appointments</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{appointments.length} appointment(s)</p>
        </div>
        <Link href="/dashboard/patient/book" className="btn-primary">
          Book Appointment
        </Link>
      </div>
      {appointments.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontWeight: 600, color: '#374151' }}>No appointments yet</p>
          <Link href="/dashboard/patient/book" className="btn-primary" style={{ marginTop: '0.5rem' }}>Book Now</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {appointments.map(apt => (
            <Link key={apt.id} href={`/dashboard/patient/appointments/${apt.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}>
                <div className="token-badge">{apt.queueEntry?.tokenNumber ?? '—'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>
                      {format(new Date(apt.appointmentDate), 'dd MMM yyyy')}
                    </span>
                    <StatusBadge status={apt.status} />
                    {apt.queueEntry && <span className={`badge badge-${apt.queueEntry.status}`}>{apt.queueEntry.status.replace('_', ' ')}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem', color: '#9ca3af', fontSize: '0.78rem' }}>
                    {apt.timeSlot}
                  </div>
                </div>
                <span style={{ color: '#d1d5db', fontSize: '0.9rem', fontWeight: 'bold' }}>&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


