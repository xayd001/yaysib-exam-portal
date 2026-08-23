import React, { useState } from 'react';
import { UserPlus, Download, Table, ShieldCheck } from 'lucide-react';

export default function AdminView({ registeredResults, setRegisteredResults }) {
  const [newStudent, setNewStudent] = useState({ name: '', id: '' });

  const handleRegister = (e) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.id.trim()) return;

    // Generate randomTK token
    const generatedToken = 'TK-' + Math.floor(1000 + Math.random() * 9000);

    const studentRecord = {
      id: newStudent.id.trim(),
      name: newStudent.name.trim(),
      mgmt: 0,
      prog: 0,
      total: 0,
      token: generatedToken,
      status: 'Pending'
    };

    setRegisteredResults([...registeredResults, studentRecord]);
    setNewStudent({ name: '', id: '' });
  };

  // Convert roster state to CSV file download
  const handleExportCSV = () => {
    let csv = "Student ID,Full Name,Access Mgmt (50),Access Prog (50),Total Score (100),Result Token,Status\n";
    registeredResults.forEach(st => {
      csv += `"${st.id}","${st.name}",${st.mgmt},${st.prog},${st.total},"${st.token}","${st.status || 'Completed'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "YAYSIB_Access_Exam_Results_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
      <div className="glass-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1a202c', fontSize: '1.4rem' }}>Admin Control Console</h2>
            <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '0.88rem' }}>
              Register candidates, manage unlock tokens, and download mark sheets.
            </p>
          </div>
          <button onClick={handleExportCSV} style={exportBtnStyle}>
            <Download size={18} /> Export Sheet to Excel (.CSV)
          </button>
        </div>

        {/* Add Candidate Form */}
        <form onSubmit={handleRegister} style={formGridStyle}>
          <div>
            <label style={labelStyle}>Candidate Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Fatima Abubakar" 
              required 
              className="form-input" 
              value={newStudent.name} 
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} 
            />
          </div>
          <div>
            <label style={labelStyle}>Student ID Number</label>
            <input 
              type="text" 
              placeholder="e.g. YCB-2026-003" 
              required 
              className="form-input" 
              value={newStudent.id} 
              onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={addBtnStyle}>
              <UserPlus size={18} /> Register Candidate
            </button>
          </div>
        </form>

        {/* Roster Table */}
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#edf2f7', color: '#4a5568', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={thStyle}>Student ID</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Mgmt (50)</th>
                <th style={thStyle}>Prog (50)</th>
                <th style={thStyle}>Total (100)</th>
                <th style={thStyle}>Result Token</th>
              </tr>
            </thead>
            <tbody>
              {registeredResults.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={tdStyle}><strong>{st.id}</strong></td>
                  <td style={tdStyle}>{st.name}</td>
                  <td style={tdStyle}>{st.mgmt}</td>
                  <td style={tdStyle}>{st.prog}</td>
                  <td style={tdStyle}>
                    <span style={{ color: '#276749', fontWeight: 'bold' }}>{st.total}</span>
                  </td>
                  <td style={tdStyle}>
                    <code style={tokenBadgeStyle}>{st.token}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' };
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', background: '#f7fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', height: '42px' };
const exportBtnStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e0' };
const tdStyle = { padding: '12px', fontSize: '0.9rem' };
const tokenBadgeStyle = { background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#2d3748', fontWeight: '600' };