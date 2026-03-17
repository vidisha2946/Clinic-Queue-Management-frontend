'use client';
import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { DoctorQueueItem, PrescriptionMedicine } from '@/lib/types';
import toast from 'react-hot-toast';
// ---- Prescription Modal ----
function PrescriptionModal({ appointmentId, onClose, onSaved }: { appointmentId: number; onClose: () => void; onSaved: () => void }) {
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([{ name: '', dosage: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const addMed = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  const removeMed = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: keyof PrescriptionMedicine, val: string) => {
    const copy = [...medicines];
    copy[i] = { ...copy[i], [field]: val };
    setMedicines(copy);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medicines.some(m => !m.name || !m.dosage || !m.duration)) {
      toast.error('Fill all medicine fields'); return;
    }
    setLoading(true);
    try {
      await api.post(`/prescriptions/${appointmentId}`, { medicines, notes });
      toast.success('Prescription saved!');
      onSaved(); 
     onClose();
    } catch (err: any) {
      console.log('prescription save error:', err);
      toast.error(err?.response?.data?.error || 'Failed to save rx');
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Add Prescription</h2>
            <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>Appointment #{appointmentId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontWeight: 'bold' }}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {medicines.map((med, i) => (
              <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b7280' }}>MEDICINE {i + 1}</span>
                  {medicines.length > 1 && (
                    <button type="button" onClick={() => removeMed(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>Remove</button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div><label>Name</label><input className="input" placeholder="Paracetamol" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} required /></div>
                  <div><label>Dosage</label><input className="input" placeholder="500mg" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} required /></div>
                  <div><label>Duration</label><input className="input" placeholder="5 days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} required /></div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary" onClick={addMed} style={{ width: '100%', justifyContent: 'center', marginBottom: '0.85rem' }}>
            + Add Medicine
          </button>
          <div style={{ marginBottom: '1rem' }}>
            <label>Notes (optional)</label>
            <textarea className="input" placeholder="After food..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '...' : 'Save Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ---- Report Modal ----
function ReportModal({ appointmentId, onClose, onSaved }: { appointmentId: number; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ diagnosis: '', testRecommended: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post(`/reports/${appointmentId}`, form);
      toast.success('Report saved!');
      onSaved(); 
      onClose();
    } catch (err: any) {
      console.error('report boom:', err);
      toast.error(err?.response?.data?.error || 'Failed to save report');
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Add Report</h2>
            <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>Appointment #{appointmentId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontWeight: 'bold' }}>X</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div><label>Diagnosis *</label><input className="input" placeholder="Viral Fever" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} required /></div>
          <div><label>Test Recommended</label><input className="input" placeholder="Blood Test" value={form.testRecommended} onChange={e => setForm({ ...form, testRecommended: e.target.value })} /></div>
          <div><label>Remarks</label><textarea className="input" placeholder="Rest..." value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={2} style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? '...' : 'Save Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { waiting: 'badge-waiting', in_progress: 'badge-in_progress', done: 'badge-done', skipped: 'badge-skipped' };
  return <span className={`badge ${map[status] || 'badge-waiting'}`}>{status.replace('_', ' ')}</span>;
}
export default function DoctorQueuePage() {
  const [queue, setQueue] = useState<DoctorQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rxFor, setRxFor] = useState<number | null>(null);
  const [reportFor, setReportFor] = useState<number | null>(null);
  const fetchQueue = useCallback(() => {
    setLoading(true);
    api.get('/doctor/queue')
      .then(res => setQueue(res.data?.queue || res.data || []))
      .catch((e) => {
        console.log(e);
        toast.error('Failed to load queue')
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchQueue(); }, [fetchQueue]);
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>{"Today's Queue"}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{queue.length} patient(s) today</p>
        </div>
        <button className="btn-secondary" onClick={fetchQueue} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}><div className="spinner" /></div>
      )}

      {/* TODO: maybe add a refresh button inside the empty state too? */}
      {!loading && queue.length === 0 && (
        <div className="empty-state"><p>No patients in queue today</p></div>
      )}
      
      {!loading && queue.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {queue.map(item => (
            <div key={item.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              opacity: item.status === 'done' || item.status === 'skipped' ? 0.6 : 1,
            }}>
              <div className="token-badge">{item.tokenNumber}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{item.patientName}</span>
                  <StatusBadge status={item.status} />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  Appointment #{item.appointmentId} · Patient #{item.patientId}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setRxFor(item.appointmentId)}>
                  + Rx
                </button>
                <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setReportFor(item.appointmentId)}>
                  + Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {rxFor !== null && <PrescriptionModal appointmentId={rxFor} onClose={() => setRxFor(null)} onSaved={fetchQueue} />}
      {reportFor !== null && <ReportModal appointmentId={reportFor} onClose={() => setReportFor(null)} onSaved={fetchQueue} />}
    </div>
  );
}

