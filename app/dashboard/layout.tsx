'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Role } from '@/lib/types';
interface NavItem { label: string; href: string; }
const navItems: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Clinic Info', href: '/dashboard/admin' },
    { label: 'Users', href: '/dashboard/admin/users' },
  ],
  patient: [
    { label: 'My Appointments', href: '/dashboard/patient/appointments' },
    { label: 'Book Appointment', href: '/dashboard/patient/book' },
    { label: 'Prescriptions', href: '/dashboard/patient/prescriptions' },
    { label: 'Reports', href: '/dashboard/patient/reports' },
  ],
  receptionist: [
    { label: 'Queue', href: '/dashboard/receptionist/queue' },
  ],
  doctor: [
    { label: "Today's Queue", href: '/dashboard/doctor/queue' },
  ],
};
const roleBadge: Record<Role, string> = {
  admin: 'badge-admin', doctor: 'badge-doctor',
  receptionist: 'badge-receptionist', patient: 'badge-patient',
};
function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => { 
    // console.log("logging out user", user?.id)
    logout(); 
    router.push('/login'); 
    onClose?.(); 
  };
  
  // fallback just in case auth state is slow
  const items = user ? navItems[user.role] : [];
  
  return (
    <div className="sidebar" style={{ justifyContent: 'space-between' }}>
      <div>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '3px solid #111', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111' }}>Clinic<br/>Queue App</div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', fontWeight: 900, fontSize: '1.1rem' }}>
              X
            </button>
          )}
        </div>
        <div style={{ padding: '1rem 1rem', borderBottom: '3px solid #111' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', marginBottom: '0.4rem' }}>{user?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${roleBadge[user?.role as Role]}`}>{user?.role}</span>
            <span style={{ fontSize: '0.75rem', color: '#111', fontWeight: 700 }}>{user?.clinicCode}</span>
          </div>
        </div>
        <nav style={{ padding: '0.6rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map(item => {
            // temp hack for active state, maybe use exact matching later
            const isActive = pathname === item.href || (item.href !== '/dashboard/admin' && pathname.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href} onClick={onClose} style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                padding: '0.65rem 0.75rem', borderRadius: '4px', textDecoration: 'none',
                color: '#111',
                background: isActive ? '#fff' : 'transparent',
                border: isActive ? '2px solid #111' : '2px solid transparent',
                boxShadow: isActive ? '2px 2px 0px #111' : 'none',
                fontWeight: isActive ? 800 : 600, fontSize: '0.875rem',
                transition: 'all 0.1s',
                marginBottom: '0.2rem',
              }}>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div style={{ padding: '1rem', borderTop: '3px solid #111', marginTop: 'auto' }}>
        <button className="btn-danger" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  React.useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return null;
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="desktop-sidebar">
        <Sidebar />
      </div>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />
      )}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.22s ease',
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: '60px', background: '#fff', borderBottom: '3px solid #111',
          display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', fontSize: '1.4rem', padding: '0 5px' }}>
            ☰
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111', flex: 1 }}>
            {user.clinicName}
          </span>
          <span className={`badge ${roleBadge[user.role as Role]}`}>{user.role}</span>
        </header>
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
      <style>{`
        .desktop-sidebar { display: none; }
        .mobile-menu-btn { display: flex; }
        @media (min-width: 768px) {
          .desktop-sidebar { display: block; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

