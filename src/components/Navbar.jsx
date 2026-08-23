import React from 'react';
import { UserCheck, Award, ShieldAlert } from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  return (
    <header style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img 
          src="/YCB.jpg" 
          alt="YAYSIB Logo" 
          style={{ height: '50px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
        />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#e53e3e', fontWeight: '800', letterSpacing: '-0.5px' }}>
            YAYSIB COMPUTER INSTITUTE
          </h1>
          <span style={{ fontSize: '0.8rem', color: '#3182ce', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Access DBMS Portal • Examination System
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => setView('login')} 
          style={navBtnStyle(currentView === 'login')}
        >
          <UserCheck size={16} /> Student Login
        </button>
        <button 
          onClick={() => setView('result')} 
          style={navBtnStyle(currentView === 'result')}
        >
          <Award size={16} /> Check Result
        </button>
        <button 
          onClick={() => setView('admin')} 
          style={{ ...navBtnStyle(currentView === 'admin'), background: '#2d3748', color: '#fff' }}
        >
          <ShieldAlert size={16} /> Admin Console
        </button>
      </div>
    </header>
  );
}

const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 24px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const navBtnStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  border: 'none',
  borderRadius: '6px',
  background: active ? '#ebf8ff' : 'transparent',
  color: active ? '#2b6cb0' : '#4a5568',
  fontWeight: active ? '700' : '500',
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
});