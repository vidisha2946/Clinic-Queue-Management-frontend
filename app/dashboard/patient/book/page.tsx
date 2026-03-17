'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
const TIME_SLOTS = [
  '09:00-09:15','09:15-09:30','09:30-09:45','09:45-10:00',
  '10:00-10:15','10:15-10:30','10:30-10:45','10:45-11:00',
  '11:00-11:15','11:15-11:30','11:30-11:45','11:45-12:00',
  '14:00-14:15','14:15-14:30','14:30-14:45','14:45-15:00',
  '15:00-15:15','15:15-15:30','15:30-15:45','15:45-16:00',
];
export default function BookAppointmentPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) { toast.error('Select a time slot'); return; }
    setLoading(true);
    try {
      await api.post('/appointments', { appointmentDate: date, timeSlot: slot });
      toast.success('Appointment booked!');
      router.push('/dashboard/patient/appointments');
    } catch (err: any) {
      // toast.error('Booking failed server side');
      console.error("Booking error details:", err?.response?.data || err);
      const errMsg = err?.response?.data?.error || 'Booking failed. Try again maybe?';
      toast.error(errMsg);
    } finally { 
      setLoading(false); 
    }
  };
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE'), sub: format(d, 'd MMM') };
  });
  return (
    <div className="fade-in" style={{ maxWidth: '580px' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Book Appointment</h1>
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Choose a date and time slot</p>
      <form onSubmit={handleBook}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.85rem' }}>Select Date</h2>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {quickDates.map(d => (
              <button type="button" key={d.value} onClick={() => setDate(d.value)} style={{
                flexShrink: 0, padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid',
                cursor: 'pointer', fontSize: '0.78rem', textAlign: 'center', minWidth: '52px',
                background: date === d.value ? '#3b82f6' : '#fff',
                color: date === d.value ? '#fff' : '#6b7280',
                borderColor: date === d.value ? '#3b82f6' : '#e5e7eb',
                fontFamily: 'inherit',
              }}>
                <div style={{ fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>{d.sub}</div>
              </button>
            ))}
          </div>
          <div>
            <label>Or pick a specific date</label>
            <input type="date" className="input" value={date} min={today} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.85rem' }}>Select Time Slot</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.4rem' }}>
            {TIME_SLOTS.map(s => (
              <button type="button" key={s} onClick={() => setSlot(s)} style={{
                padding: '0.45rem 0.3rem', borderRadius: '7px', border: '1px solid',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
                background: slot === s ? '#3b82f6' : '#fff',
                color: slot === s ? '#fff' : '#6b7280',
                borderColor: slot === s ? '#3b82f6' : '#e5e7eb',
                fontFamily: 'inherit',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {slot ? (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.85rem', color: '#1d4ed8' }}>
            📅 {format(new Date(date + 'T00:00:00'), 'EEEE, dd MMMM yyyy')} at <strong>{slot}</strong>
          </div>
        ) : null}
        
        <button type="submit" className="btn-primary" disabled={loading || !slot} style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
          {loading && <span style={{marginRight: 8}}>...</span>}
          {loading ? 'Booking' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}


