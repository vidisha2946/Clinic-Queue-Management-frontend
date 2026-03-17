'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Prescription } from '@/lib/types';
import { format } from 'date-fns';
export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/prescriptions/my')
      .then(res => setPrescriptions(res.data?.prescriptions || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>;
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>My Prescriptions</h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{prescriptions.length} prescription(s)</p>
      </div>
      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontWeight: 600, color: '#374151' }}>No prescriptions yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Prescription #{rx.id}</span>
                </div>
                {rx.createdAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#6b7280' }}>
                    {format(new Date(rx.createdAt), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
              {rx.notes && (
                <div style={{ marginBottom: '0.85rem', padding: '0.6rem 0.85rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                  <span style={{ fontWeight: 600, color: '#111827', marginRight: '0.3rem' }}>Notes:</span> {rx.notes}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {rx.medicines.map((med, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.55rem 0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1d4ed8' }}>{med.name}</span>
                    <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.78rem', color: '#3b82f6' }}>
                      <span style={{ fontWeight: 500 }}>{med.dosage}</span><span>·</span><span>{med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


