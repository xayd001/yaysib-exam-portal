import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginView({ onStartExam }) {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !idNumber.trim()) return;
    onStartExam({ fullName, idNumber });
  };

  return (
    <div className="glass-card" style={cardContainerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1a202c', margin: '0 0 6px 0', fontSize: '1.4rem' }}>Candidate Portal Access</h2>
        <p style={{ color: '#718096', fontSize: '0.88rem', margin: 0 }}>
          Enter your registered details to launch your examination session.
        </p>
      </div>

      <div style={ruleBoxStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#c05621', marginBottom: '4px' }}>
          <AlertCircle size={16} /> Exam Rules & Parameters
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#7b341e', lineHeight: '1.4' }}>
          <li>50 Minutes duration for 100 total questions.</li>
          <li>Auto-submits instantly if you switch tabs or leave window context.</li>
          <li>Available window: Aug 25, 2026 (2:00 PM) to Aug 26, 2026 (2:00 PM).</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Full Candidate Name</label>
          <input 
            type="text" 
            placeholder="e.g. Zayd Ibn Mukhtar" 
            required 
            className="form-input" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Student ID Number</label>
          <input 
            type="text" 
            placeholder="e.g. YCB-2026-001" 
            required 
            className="form-input" 
            value={idNumber} 
            onChange={(e) => setIdNumber(e.target.value)} 
          />
        </div>

        <button type="submit" style={submitBtnStyle}>
          <LogIn size={18} /> Authenticate & Begin Exam
        </button>
      </form>
    </div>
  );
}

const cardContainerStyle = {
  maxWidth: '440px',
  margin: '50px auto',
  padding: '30px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#4a5568'
};

const ruleBoxStyle = {
  background: '#fffaf0',
  border: '1px solid #feebc8',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '20px'
};

const submitBtnStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '12px',
  background: '#38a169',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '0.95rem',
  cursor: 'pointer'
};