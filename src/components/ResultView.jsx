import React, { useState } from 'react';
import { KeyRound, Lock, Unlock } from 'lucide-react';

export default function ResultView({ registeredResults }) {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [token, setToken] = useState('');
  const [unlockedRecord, setUnlockedRecord] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const found = registeredResults.find(
      r => r.id.toLowerCase() === idNumber.trim().toLowerCase() && r.token === token.trim()
    );

    if (found) {
      setUnlockedRecord(found);
    } else {
      setErrorMessage('Invalid ID Number or Result Verification Token. Contact Admin.');
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '460px', margin: '50px auto', padding: '30px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1a202c', margin: '0 0 6px 0', fontSize: '1.4rem' }}>Result Verification</h2>
        <p style={{ color: '#718096', fontSize: '0.88rem', margin: 0 }}>
          Enter your candidate ID and Admin-issued token to view your scores.
        </p>
      </div>

      {!unlockedRecord ? (
        <form onSubmit={handleVerify}>
          {errorMessage && (
            <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Candidate Name</label>
            <input type="text" required className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Student ID Number</label>
            <input type="text" placeholder="e.g. YCB-2026-001" required className="form-input" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Result Access Token</label>
            <input type="text" placeholder="e.g. TK-8891" required className="form-input" value={token} onChange={(e) => setToken(e.target.value)} />
          </div>

          <button type="submit" style={verifyBtnStyle}>
            <KeyRound size={18} /> Unlock Grade Report
          </button>
        </form>
      ) : (
        <div>
          <div style={{ textAlign: 'center', background: '#ebf8ff', padding: '16px', borderRadius: '8px', border: '1px solid #bee3f8', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#2b6cb0' }}>{unlockedRecord.name}</h3>
            <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>ID: {unlockedRecord.id}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={scoreBoxStyle}>
              <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>Access Mgmt</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2d3748' }}>{unlockedRecord.mgmt} / 50</div>
            </div>
            <div style={scoreBoxStyle}>
              <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' }}>Access Prog</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2d3748' }}>{unlockedRecord.prog} / 50</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#f0fff4', padding: '18px', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
            <span style={{ color: '#276749', fontWeight: 'bold', fontSize: '0.9rem' }}>Final Total Grade</span>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#22543d' }}>{unlockedRecord.total} / 100</div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' };
const verifyBtnStyle = { width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const scoreBoxStyle = { background: '#f7fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' };