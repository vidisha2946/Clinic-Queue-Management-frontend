'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ClinicInfo, AdminUser } from '@/lib/types';
export default function AdminClinicPage() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      api.get('/admin/clinic').then(res => setClinic(res.data)),
      api.get('/admin/users').then(res => setUsers(res.data?.users || res.data || []))
    ])
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const receptionistCount = users.filter(u => u.role === 'receptionist').length;
  const patientCount = users.filter(u => u.role === 'patient').length;
  const stats = [
    { label: 'Admins', value: adminCount || clinic?.totalAdmins || clinic?.adminCount || '1' },
    { label: 'Doctors', value: doctorCount || clinic?.totalDoctors || clinic?.doctorCount || '0' },
    { label: 'Receptionists', value: receptionistCount || clinic?.totalReceptionists || clinic?.receptionistCount || '0' },
    { label: 'Patients', value: patientCount || clinic?.totalPatients || clinic?.patientCount || '0' },
  ];
  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Clinic Dashboard</h1>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Overview of your clinic</p>
      <div className="card" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>{clinic?.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.15rem' }}>Code: {clinic?.code}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#4b5563', fontWeight: 600 }}>{s.label}</h3>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{String(s.value)}</p>
          </div>
        ))}
      </div>
      {clinic && (
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.85rem' }}>All Clinic Details</h3>
          {Object.entries(clinic)
            .filter(([k]) => !['totalDoctors','totalReceptionists','totalPatients','doctorCount','receptionistCount','patientCount'].includes(k))
            .map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.82rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{String(val ?? '—')}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}


