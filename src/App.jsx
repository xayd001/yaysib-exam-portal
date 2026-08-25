import React, { useState, useEffect } from 'react';
import questionsData from './data/questions.json';
import logoImg from './assets/YCB.JPG'; 

const adminUsername = import.meta.env.VITE_ADMIN_USER;
const adminPassword = import.meta.env.VITE_ADMIN_PASS;

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};

export default function App() {
  const [view, setView] = useState('login'); 
  const [student, setStudent] = useState({ fullName: '', idNumber: '' });
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminCreds, setAdminCreds] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');

  // Result Checker State
  const [resultLookup, setResultLookup] = useState({ id: '', token: '' });
  const [unlockedResult, setUnlockedResult] = useState(null);
  const [resultError, setResultError] = useState('');

  // Roster Data with LocalStorage Persistence
  const [registeredResults, setRegisteredResults] = useState(() => {
    const saved = localStorage.getItem('yaysib_roster');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'YCB-2026-001', name: 'Zayd Ibn Mukhtar', mgmt: 48, prog: 44, project: 0, total: 92, token: 'TK-8891', completed: true },
      { id: 'YCB-2026-002', name: 'Aisha Hassan', mgmt: 42, prog: 40, project: 0, total: 82, token: 'TK-3341', completed: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('yaysib_roster', JSON.stringify(registeredResults));
  }, [registeredResults]);

  const handleNavClick = (targetView) => {
    if (view === 'admin' && targetView !== 'admin') {
      setIsAdminAuthenticated(false);
    }
    setView(targetView);
  };

  const handleStartExam = (e) => {
    e.preventDefault();
    setLoginError('');
    const targetID = student.idNumber.trim().toUpperCase();

    const existingStudent = registeredResults.find(r => r.id.toUpperCase() === targetID);
    if (existingStudent && existingStudent.completed) {
      setLoginError(`ACCESS DENIED: Candidate ID (${targetID}) has already taken this examination. Multiple attempts are strictly prohibited.`);
      return;
    }

    setShuffledQuestions(shuffleArray(questionsData));
    setCurrentQIndex(0);
    setAnswers({});
    setTimeLeft(50 * 60);
    setExamSubmitted(false);
    setView('exam');
  };

  useEffect(() => {
    if (view !== 'exam' || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          evaluateAndSubmit("Time Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleAntiCheat = () => {
      alert("SECURITY VIOLATION: Tab switch detected! Examination submitted automatically.");
      evaluateAndSubmit("Anti-Cheat Triggered");
    };

    document.addEventListener("visibilitychange", handleAntiCheat);
    window.addEventListener("blur", handleAntiCheat);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleAntiCheat);
      window.removeEventListener("blur", handleAntiCheat);
    };
  }, [view, examSubmitted, answers, shuffledQuestions]);

  const evaluateAndSubmit = (reason) => {
    if (examSubmitted) return;
    setExamSubmitted(true);

    let managementScore = 0;
    let programmingScore = 0;

    shuffledQuestions.forEach((q) => {
      const studentAns = answers[q.id];
      const correctAns = q.correctAnswer || q.answer;
      const sectionName = q.section;

      if (studentAns === correctAns) {
        if (sectionName === "Access Management" || sectionName === "Management") {
          managementScore += 2;
        } else if (sectionName === "Access Programming" || sectionName === "Programming") {
          programmingScore += 2;
        }
      }
    });

    const projectScore = 0; 
    const totalScore = managementScore + programmingScore + projectScore;
    
    // Maintain existing token or generate one if not present
    const cleanID = student.idNumber.trim().toUpperCase();
    const existingCandidate = registeredResults.find(r => r.id === cleanID);
    const generatedToken = existingCandidate?.token || ('TK-' + Math.floor(1000 + Math.random() * 9000));

    const record = {
      id: cleanID,
      name: student.fullName.trim(),
      mgmt: managementScore,
      prog: programmingScore,
      project: projectScore,
      total: totalScore,
      token: generatedToken,
      completed: true
    };

    setRegisteredResults((prev) => [...prev.filter(r => r.id !== record.id), record]);
    setView('login');
    // Token is hidden from candidate alert message
    alert(`Examination Submitted Successfully (${reason}).\n\nPlease contact the administrator to retrieve your result access token.`);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminCreds.username === adminUsername && adminCreds.password === adminPassword) {
      setIsAdminAuthenticated(true);
      setAdminError('');
    } else {
      setAdminError('Invalid Credentials.');
    }
  };

  const handleVerifyResult = (e) => {
    e.preventDefault();
    setResultError('');
    const found = registeredResults.find(
      r => r.id.toLowerCase() === resultLookup.id.trim().toLowerCase() && r.token === resultLookup.token.trim()
    );

    if (found) {
      setUnlockedResult(found);
    } else {
      setResultError('Invalid Student ID or Token.');
    }
  };

  const currentQ = shuffledQuestions[currentQIndex] || null;

  return (
    <div style={mainWrapperStyle}>
      <style>{`
        @media print {
          body {
            background-color: #fffbeb !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          #printable-result-sheet {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            background-color: #fffbeb !important;
            color: #000000 !important;
            padding: 30px !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Navigation Bar */}
      <header className="no-print" style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={logoImg} alt="YAYSIB Logo" style={{ height: '48px', width: 'auto', borderRadius: '6px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#60a5fa', fontWeight: '800' }}>
              YAYSIB COMPUTER INSTITUTE
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: '600', textTransform: 'uppercase' }}>
              DBMS ACCESS PORTAL • PRACTICAL EXAMINATION
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleNavClick('login')} style={navBtnStyle(view === 'login')}>Student Portal</button>
          <button onClick={() => handleNavClick('result')} style={navBtnStyle(view === 'result')}>Check Result</button>
          <button onClick={() => handleNavClick('admin')} style={{ ...navBtnStyle(view === 'admin'), background: '#1d4ed8', color: '#ffffff' }}>Admin Console</button>
        </div>
      </header>

      {/* STUDENT LOGIN VIEW */}
      {view === 'login' && (
        <div className="no-print" style={glassCardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Examination Authentication</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Input candidate credentials. Single attempt restriction enabled.</p>
          </div>
          {loginError && <div style={errorStyle}>{loginError}</div>}
          <form onSubmit={handleStartExam}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" placeholder="e.g. Zayd Ibn Mukhtar" required style={modernInputStyle} value={student.fullName} onChange={(e) => setStudent({...student, fullName: e.target.value})} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Student ID Number</label>
              <input type="text" placeholder="e.g. YCB-2026-001" required style={modernInputStyle} value={student.idNumber} onChange={(e) => setStudent({...student, idNumber: e.target.value})} />
            </div>
            <button type="submit" style={primaryBtnStyle}>Start Examination</button>
          </form>
        </div>
      )}

      {/* EXAM VIEW */}
      {view === 'exam' && currentQ && (
        <div className="no-print" style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }}>
          <div style={stickyHeaderStyle}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Candidate:</span>
              <div style={{ fontWeight: '700', color: '#f8fafc' }}>{student.fullName} ({student.idNumber})</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Time Left:</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: timeLeft < 300 ? '#f87171' : '#60a5fa' }}>
                {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '20px 0', padding: '14px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '10px', border: '1px solid #1e293b' }}>
            {shuffledQuestions.map((q, idx) => (
              <button
                key={q.id || idx}
                onClick={() => setCurrentQIndex(idx)}
                style={{
                  width: '36px', height: '36px', borderRadius: '6px',
                  border: idx === currentQIndex ? '2px solid #60a5fa' : '1px solid #334155',
                  background: idx === currentQIndex ? '#2563eb' : answers[q.id] ? '#15803d' : '#020617',
                  color: '#ffffff', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div style={{ ...glassCardStyle, maxWidth: '100%', margin: '0 0 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase' }}>
                {currentQ.section || "Database Module"} (2 Marks)
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
                Question {currentQIndex + 1} of {shuffledQuestions.length}
              </span>
            </div>

            <h3 style={{ fontWeight: '600', color: '#f1f5f9', margin: '0 0 20px 0', fontSize: '1.1rem' }}>
              {currentQIndex + 1}. {currentQ.questionText || currentQ.question}
            </h3>

            {(currentQ.options || []).map((opt) => (
              <label key={opt} style={optionLabelStyle(answers[currentQ.id] === opt)}>
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  value={opt} 
                  checked={answers[currentQ.id] === opt} 
                  onChange={() => setAnswers({ ...answers, [currentQ.id]: opt })} 
                  style={{ marginRight: '12px', accentColor: '#2563eb' }} 
                />
                {opt}
              </label>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px' }}>
              <button disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(prev => prev - 1)} style={{ ...primaryBtnStyle, background: '#334155', width: 'auto' }}>← Previous</button>
              {currentQIndex < shuffledQuestions.length - 1 ? (
                <button onClick={() => setCurrentQIndex(prev => prev + 1)} style={{ ...primaryBtnStyle, background: '#2563eb', width: 'auto' }}>Next →</button>
              ) : (
                <button onClick={() => evaluateAndSubmit("Manual Submission")} style={{ ...primaryBtnStyle, background: '#16a34a', width: 'auto' }}>Submit Paper</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RESULT CHECKER & PRINTABLE SHEET */}
      {view === 'result' && (
        <>
          <div className="no-print" style={glassCardStyle}>
            {!unlockedResult ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Result Verification</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Provide credentials to generate official result sheet.</p>
                </div>
                <form onSubmit={handleVerifyResult}>
                  {resultError && <div style={errorStyle}>{resultError}</div>}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Student ID Number</label>
                    <input type="text" required style={modernInputStyle} value={resultLookup.id} onChange={(e) => setResultLookup({...resultLookup, id: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={labelStyle}>Result Token</label>
                    <input type="text" placeholder="e.g. TK-8891" required style={modernInputStyle} value={resultLookup.token} onChange={(e) => setResultLookup({...resultLookup, token: e.target.value})} />
                  </div>
                  <button type="submit" style={{ ...primaryBtnStyle, background: '#2563eb' }}>Unlock Grade Sheet</button>
                </form>
              </>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: '#1e293b', borderRadius: '10px', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 4px 0', color: '#60a5fa' }}>{unlockedResult.name}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>ID: {unlockedResult.id}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={scoreBoxStyle}>
                      <small style={{ color: '#94a3b8' }}>Access Mgmt</small>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>{unlockedResult.mgmt} / 50</div>
                    </div>
                    <div style={{ ...scoreBoxStyle }}>
                      <small style={{ color: '#94a3b8' }}>Access Prog</small>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#38bdf8' }}>{unlockedResult.prog} / 50</div>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: 'rgba(22, 163, 74, 0.15)', borderRadius: '10px', border: '1px solid #15803d', marginBottom: '20px' }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Final Score</span>
                    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#4ade80' }}>{unlockedResult.total} / 100</div>
                  </div>

                  <button onClick={() => window.print()} style={{ ...primaryBtnStyle, background: '#0284c7' }}>
                    🖨️ Print Result Sheet (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRINTABLE YELLOW STATEMENT OF RESULT TEMPLATE */}
          {unlockedResult && (
            <div id="printable-result-sheet" style={{
              display: 'none',
              backgroundColor: '#fffbeb',
              fontFamily: "'Times New Roman', Times, serif",
              color: '#000000',
              padding: '30px 40px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '15px',
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#444444',
                fontStyle: 'italic'
              }}>
                Evidence of my exams by zayd but not the final record for assessment
              </div>

              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '15px',
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#444444',
                fontStyle: 'italic'
              }}>
                Evidence of my exams by zayd but not the final record for assessment
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                <img src={logoImg} alt="YAYSIB Logo" style={{ height: '75px', width: 'auto' }} />
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    YAYSIB COMPUTER INSTITUTE
                  </h1>
                  <h2 style={{ margin: '2px 0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    MAIDUGURI
                  </h2>
                  <p style={{ margin: 0, fontSize: '10px', lineHeight: '1.3' }}>
                    N.S.I.T.F BUILDING, NO. 88 SHEHU LAMINU WAY, OPP. GENERAL HOSPITAL,<br />
                    MAIDUGURI, BORNO STATE
                  </p>
                  <p style={{ margin: 0, fontSize: '10px' }}>
                    e-mail: yaysib@gmail.com &nbsp;&nbsp; Tel: +2348033662192, +2348026516585, +2347065008811
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  STATEMENT OF RESULT
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>
                <div>NAME OF CANDIDATE: <span style={{ fontWeight: 'normal' }}>{unlockedResult.name.toUpperCase()}</span></div>
                <div>NUMBER: <span style={{ fontWeight: 'normal' }}>{unlockedResult.id}</span></div>
                <div>AWARD: <span style={{ fontWeight: 'normal' }}>DIPLOMA</span></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                <div>NAME/DATE OF EXAMINATION: <span style={{ fontWeight: 'normal' }}>DIPLOMA IN ACCESS DBMS MANAGEMENT</span></div>
                <div>August, 2026</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '20px', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #000000', background: '#fef3c7' }}>
                    <th style={{ borderRight: '1.5px solid #000000', padding: '10px', textAlign: 'left', width: '75%' }}>SUBJECT</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>GRADE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td style={{ borderRight: '1.5px solid #000000', padding: '12px 10px' }}>ACCESS MANAGEMENT</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>{getGrade(unlockedResult.mgmt * 2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td style={{ borderRight: '1.5px solid #000000', padding: '12px 10px' }}>ACCESS PROGRAMMING</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>{getGrade(unlockedResult.prog * 2)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #000000' }}>
                    <td style={{ borderRight: '1.5px solid #000000', padding: '12px 10px' }}>PROJECTS</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold' }}>F</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                <div>NUMBER OF SUBJECTS LISTED: THREE</div>
                <div>SEX: MALE</div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '40px' }}>
                A=80-100, B=70-79, C=60-69, D=50-59, E=40-49, F=Below 40
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', paddingRight: '20px' }}>
                <div style={{ textAlign: 'center', width: '220px' }}>
                  <div style={{ borderTop: '1px solid #000000', paddingTop: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                    Authorized Signature & Stamp
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ADMIN CONSOLE VIEW */}
      {view === 'admin' && (
        <div className="no-print">
          {!isAdminAuthenticated ? (
            <div style={glassCardStyle}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>Admin Login</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>Restricted portal management console.</p>
              </div>
              <form onSubmit={handleAdminLogin}>
                {adminError && <div style={errorStyle}>{adminError}</div>}
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Username / Email</label>
                  <input type="email" required style={modernInputStyle} value={adminCreds.username} onChange={(e) => setAdminCreds({...adminCreds, username: e.target.value})} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" required style={modernInputStyle} value={adminCreds.password} onChange={(e) => setAdminCreds({...adminCreds, password: e.target.value})} />
                </div>
                <button type="submit" style={{ ...primaryBtnStyle, background: '#1d4ed8' }}>Authenticate Admin</button>
              </form>
            </div>
          ) : (
            <AdminPanel registeredResults={registeredResults} setRegisteredResults={setRegisteredResults} />
          )}
        </div>
      )}
    </div>
  );
}

function AdminPanel({ registeredResults, setRegisteredResults }) {
  const [newStudent, setNewStudent] = useState({ name: '', id: '' });

  const handleAddStudent = (e) => {
    e.preventDefault();
    const cleanID = newStudent.id.trim().toUpperCase();
    
    if (registeredResults.some(s => s.id === cleanID)) {
      alert("Candidate ID already exists!");
      return;
    }

    const generatedToken = 'TK-' + Math.floor(1000 + Math.random() * 9000);
    const candidateRecord = {
      id: cleanID,
      name: newStudent.name.trim(),
      mgmt: 0,
      prog: 0,
      project: 0,
      total: 0,
      token: generatedToken,
      completed: false
    };

    setRegisteredResults((prev) => [...prev, candidateRecord]);
    setNewStudent({ name: '', id: '' });
  };

  const handleScoreChange = (id, field, val) => {
    const numVal = Math.min(50, Math.max(0, Number(val) || 0));
    setRegisteredResults((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          const updated = { ...st, [field]: numVal };
          updated.total = updated.mgmt + updated.prog + updated.project;
          return updated;
        }
        return st;
      })
    );
  };

  const toggleSubmitStatus = (id) => {
    setRegisteredResults((prev) =>
      prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Student ID,Full Name,Access Mgmt (50),Access Prog (50),Projects (0),Total Score (100),Result Token,Status\n";
    registeredResults.forEach(s => {
      csvContent += `"${s.id}","${s.name}",${s.mgmt},${s.prog},${s.project},${s.total},"${s.token}","${s.completed ? 'Completed' : 'Pending'}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "YAYSIB_DBMS_Exam_Results_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ ...glassCardStyle, maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#f8fafc' }}>Admin Control & Student Roster</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Register candidates, modify marks, submit exams, and grant result access.</p>
          </div>
          <button onClick={exportToExcel} style={{ ...primaryBtnStyle, background: '#2563eb', padding: '10px 18px', width: 'auto' }}>
            📊 Export CSV / Excel
          </button>
        </div>

        <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '24px', background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
          <input type="text" placeholder="Candidate Full Name" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} style={modernInputStyle} />
          <input type="text" placeholder="Student ID (e.g. YCB-2026-003)" required value={newStudent.id} onChange={(e) => setNewStudent({...newStudent, id: e.target.value})} style={modernInputStyle} />
          <button type="submit" style={{ ...primaryBtnStyle, width: 'auto', background: '#16a34a', whiteSpace: 'nowrap' }}>+ Pre-Register Candidate</button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={thStyle}>Student ID</th>
                <th style={thStyle}>Full Name</th>
                <th style={thStyle}>Mgmt (50)</th>
                <th style={thStyle}>Prog (50)</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Token</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {registeredResults.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={tdStyle}><strong style={{ color: '#f8fafc' }}>{st.id}</strong></td>
                  <td style={{ ...tdStyle, color: '#cbd5e1' }}>{st.name}</td>
                  <td style={tdStyle}>
                    <input type="number" min="0" max="50" value={st.mgmt} onChange={(e) => handleScoreChange(st.id, 'mgmt', e.target.value)} style={{ ...modernInputStyle, width: '60px', padding: '4px 8px' }} />
                  </td>
                  <td style={tdStyle}>
                    <input type="number" min="0" max="50" value={st.prog} onChange={(e) => handleScoreChange(st.id, 'prog', e.target.value)} style={{ ...modernInputStyle, width: '60px', padding: '4px 8px' }} />
                  </td>
                  <td style={tdStyle}><span style={{ color: '#4ade80', fontWeight: 'bold' }}>{st.total}</span></td>
                  <td style={tdStyle}><code style={{ background: '#1e293b', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{st.token}</code></td>
                  <td style={tdStyle}>
                    <span style={{ color: st.completed ? '#4ade80' : '#facc15', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {st.completed ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleSubmitStatus(st.id)} style={{ padding: '6px 12px', background: st.completed ? '#dc2626' : '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      {st.completed ? 'Reopen Exam' : 'Submit Paper'}
                    </button>
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

// Styling Constants
const mainWrapperStyle = {
  minHeight: '100vh',
  backgroundColor: '#020617',
  backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.94)), url(${logoImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: '550px auto',
  backgroundAttachment: 'fixed',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: '#f8fafc',
  paddingBottom: '40px'
};

const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 30px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100 };
const navBtnStyle = (active) => ({ padding: '8px 16px', border: active ? '1px solid #3b82f6' : '1px solid transparent', borderRadius: '6px', background: active ? '#1e3a8a' : 'transparent', color: active ? '#93c5fd' : '#94a3b8', fontWeight: active ? '700' : '500', cursor: 'pointer' });
const glassCardStyle = { maxWidth: '560px', margin: '40px auto 0 auto', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)', border: '1px solid #1e293b' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' };
const modernInputStyle = { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #334155', background: '#020617', color: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' };
const primaryBtnStyle = { width: '100%', padding: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' };
const stickyHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', padding: '16px 24px', borderRadius: '12px', border: '1px solid #1e293b', position: 'sticky', top: '80px', zIndex: 90 };
const optionLabelStyle = (selected) => ({ display: 'block', padding: '12px 16px', background: selected ? '#1e3a8a' : '#020617', border: selected ? '1px solid #3b82f6' : '1px solid #1e293b', borderRadius: '8px', margin: '8px 0', cursor: 'pointer', color: selected ? '#60a5fa' : '#cbd5e1', fontWeight: selected ? '600' : '400' });
const scoreBoxStyle = { background: '#020617', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' };
const errorStyle = { background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center' };
const thStyle = { padding: '12px', borderBottom: '2px solid #334155' };
const tdStyle = { padding: '12px', fontSize: '0.9rem' };