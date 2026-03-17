'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Appointment } from '@/lib/types';
import { format } from 'date-fns';
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: 'badge-queued', scheduled: 'badge-scheduled', in_progress: 'badge-in_progress',
    done: 'badge-done', cancelled: 'badge-cancelled', waiting: 'badge-waiting', skipped: 'badge-skipped',
  };
  return <span className={`badge ${map[status] || 'badge-waiting'}`}>{status.replace('_', ' ')}</span>;
}
export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [apt, setApt] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    api.get(`/appointments/${id}`)
      .then(res => setApt(res.data?.appointment || res.data))
      .catch((e) => {
        console.error("error fetching appointment", e)
      })
      .finally(() => setLoading(false));
  }, [id]);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>;
  if (!apt) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Appointment not found</div>;
  return (
    <div className="fade-in" style={{ maxWidth: '640px' }}>
      <button onClick={() => router.back()} className="btn-secondary" style={{ marginBottom: '1.25rem', padding: '0.4rem 0.8rem' }}>
        &lt; Back
      </button>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Appointment Details</h1>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>ID #{apt.id}</p>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 700, marginBottom: '0.85rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }}>Appointment Info</h2>
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <InfoRow label="Date" value={format(new Date(apt.appointmentDate), 'EEEE, dd MMMM yyyy')} />
          <InfoRow label="Time Slot" value={apt.timeSlot} />
          <InfoRow label="Status" value={<StatusBadge status={apt.status} />} />
          {apt.queueEntry && (
            <>
              <InfoRow label="Queue Token" value={<span className="token-badge" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>{apt.queueEntry.tokenNumber}</span>} />
              <InfoRow label="Queue Status" value={<StatusBadge status={apt.queueEntry.status} />} />
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }}>Prescription</h2>
        </div>
        {apt.prescription ? (
          <div>
            {/* sometimes notes are empty string from API, ignore them */}
            {apt.prescription.notes && apt.prescription.notes !== "" && (
              <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.85rem', background: '#f9fafb', borderRadius: '7px', fontSize: '0.85rem', color: '#4b5563', border: '1px solid #e5e7eb' }}>
                <strong style={{ color: '#111827' }}>Notes:</strong> {apt.prescription.notes}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {apt.prescription.medicines.map((med, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8' }}>{med.name}</span>
                  <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.78rem', color: '#3b82f6' }}>
                    <span style={{ fontWeight: 500 }}>{med.dosage}</span><span>·</span><span>{med.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.85rem' }}>
            No prescription added yet
          </div>
        )}
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280' }}>Report</h2>
        </div>
        {apt.report ? (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <InfoRow label="Diagnosis" value={<strong style={{ color: '#111827' }}>{apt.report.diagnosis}</strong>} />
            {apt.report.testRecommended && <InfoRow label="Test Recommended" value={apt.report.testRecommended} />}
            {apt.report.remarks && <InfoRow label="Remarks" value={apt.report.remarks} />}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.85rem' }}>
            No report added yet
          </div>
        )}
      </div>
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#6b7280' }}>
        {label}
      </span>
      <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>{value}</span>
    </div>
  );
}

