'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(token, user);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') router.push('/dashboard/admin');
      else if (user.role === 'patient') router.push('/dashboard/patient/appointments');
      else if (user.role === 'receptionist') router.push('/dashboard/receptionist/queue');
      else if (user.role === 'doctor') router.push('/dashboard/doctor/queue');
    } catch (err: any) { // lazy any instead of strict unknown
      console.log('login failed:', err); // classic lazy human log
      const msg = err?.response?.data?.error || 'Invalid credentials';
      toast.error(msg);
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f6fa', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem', color: '#111' }}>Sign In</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Email address</label>
              <input
                type="email" className="input" placeholder="you@clinic.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" required
              />
            </div>
            <div>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} className="input"
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  autoComplete="current-password" required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#111', padding: 0,
                  fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em'
                }}>
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', marginTop: '0.25rem' }}>
              {loading && <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


