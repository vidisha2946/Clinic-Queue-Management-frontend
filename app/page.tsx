'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else {
      if (user.role === 'admin') router.replace('/dashboard/admin');
      else if (user.role === 'patient') router.replace('/dashboard/patient/appointments');
      else if (user.role === 'receptionist') router.replace('/dashboard/receptionist/queue');
      else if (user.role === 'doctor') router.replace('/dashboard/doctor/queue');
      else router.replace('/login');
    }
  }, [user, isLoading, router]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
}


