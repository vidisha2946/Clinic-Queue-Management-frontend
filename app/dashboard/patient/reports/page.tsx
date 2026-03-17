'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Report } from '@/lib/types';
import { format } from 'date-fns';
export default function PatientReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/reports/my')
      .then(res => setReports(res.data?.reports || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>;
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>My Reports</h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{reports.length} report(s)</p>
      </div>
      {reports.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontWeight: 600, color: '#374151' }}>No reports yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {reports.map(rpt => (
            <div key={rpt.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Report #{rpt.id}</span>
                </div>
                {rpt.createdAt && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#6b7280' }}>
                    {format(new Date(rpt.createdAt), 'dd MMM yyyy')}
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <ReportRow label="Diagnosis" value={rpt.diagnosis} highlight />
                {rpt.testRecommended && <ReportRow label="Test Recommended" value={rpt.testRecommended} />}
                {rpt.remarks && <ReportRow label="Remarks" value={rpt.remarks} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ReportRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '0.55rem 0.85rem',
      background: highlight ? '#f0fdf4' : '#f9fafb',
      border: `1px solid ${highlight ? '#bbf7d0' : '#e5e7eb'}`,
      borderRadius: '7px',
    }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#6b7280', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.85rem', color: highlight ? '#16a34a' : '#374151', fontWeight: highlight ? 500 : 400 }}>{value}</div>
    </div>
  );
}


