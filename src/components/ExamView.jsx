import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import questionsData from '../data/questions.json';

export default function ExamView({ student, onCompleteExam }) {
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 Minutes
  const [examFinished, setExamFinished] = useState(false);

  // Countdown Timer & Anti-Cheat Focus Detection
  useEffect(() => {
    if (examFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerSubmission("Time Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleAntiCheat = () => {
      alert("SECURITY ALERT: Tab switch or window blur detected! Paper is being submitted automatically.");
      triggerSubmission("Anti-Cheat Violation (Tab Switch/Blur)");
    };

    document.addEventListener("visibilitychange", handleAntiCheat);
    window.addEventListener("blur", handleAntiCheat);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleAntiCheat);
      window.removeEventListener("blur", handleAntiCheat);
    };
  }, [examFinished]);

  const handleOptionSelect = (qId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [qId]: selectedOption }));
  };

  const triggerSubmission = (reason) => {
    if (examFinished) return;
    setExamFinished(true);

    // Score Calculation (50 Marks Mgmt + 50 Marks Prog)
    let mgmtScore = 0;
    let progScore = 0;

    questionsData.forEach((q) => {
      if (answers[q.id] === q.answer) {
        if (q.section === "Management") mgmtScore += 2;
        if (q.section === "Programming") progScore += 2;
      }
    });

    onCompleteExam({
      student,
      mgmtScore,
      progScore,
      totalScore: mgmtScore + progScore,
      reason
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 20px' }}>
      {/* Sticky Dashboard Header */}
      <div style={stickyNavStyle}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#718096', textTransform: 'uppercase', fontWeight: 'bold' }}>Candidate Session</span>
          <div style={{ fontWeight: '700', color: '#2d3748', fontSize: '1.05rem' }}>{student.fullName} ({student.idNumber})</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: timeLeft < 300 ? '#fff5f5' : '#ebf8ff', padding: '8px 16px', borderRadius: '8px', border: timeLeft < 300 ? '1px solid #feb2b2' : '1px solid #bee3f8' }}>
          <Clock size={20} color={timeLeft < 300 ? '#e53e3e' : '#3182ce'} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#718096', display: 'block' }}>Time Remaining</span>
            <strong style={{ fontSize: '1.2rem', color: timeLeft < 300 ? '#e53e3e' : '#2b6cb0' }}>{formatTime(timeLeft)}</strong>
          </div>
        </div>
      </div>

      <div style={warningStyle}>
        <ShieldAlert size={18} />
        <span><strong>Anti-Cheat Shield Active:</strong> Do not exit fullscreen, change tabs, or switch applications. Doing so will end your exam immediately.</span>
      </div>

      {/* Questions Render Container */}
      <div className="glass-card" style={{ padding: '30px', marginTop: '20px' }}>
        <h3 style={sectionHeaderStyle}>Section A: Access Management (50 Marks)</h3>
        {questionsData.filter(q => q.section === 'Management').map((q, idx) => (
          <div key={q.id} style={qCardStyle}>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>{idx + 1}. {q.question}</p>
            {q.options.map(opt => (
              <label key={opt} style={optionStyle(answers[q.id] === opt)}>
                <input 
                  type="radio" 
                  name={`q-${q.id}`} 
                  value={opt} 
                  checked={answers[q.id] === opt} 
                  onChange={() => handleOptionSelect(q.id, opt)} 
                  style={{ marginRight: '10px' }}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <h3 style={{ ...sectionHeaderStyle, marginTop: '40px' }}>Section B: Access Programming (50 Marks)</h3>
        {questionsData.filter(q => q.section === 'Programming').map((q, idx) => (
          <div key={q.id} style={qCardStyle}>
            <p style={{ fontWeight: '600', marginBottom: '10px' }}>{idx + 51}. {q.question}</p>
            {q.options.map(opt => (
              <label key={opt} style={optionStyle(answers[q.id] === opt)}>
                <input 
                  type="radio" 
                  name={`q-${q.id}`} 
                  value={opt} 
                  checked={answers[q.id] === opt} 
                  onChange={() => handleOptionSelect(q.id, opt)} 
                  style={{ marginRight: '10px' }}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <button onClick={() => triggerSubmission("Manual Final Submission")} style={submitPaperBtnStyle}>
          <CheckCircle2 size={18} /> Submit Examination Paper
        </button>
      </div>
    </div>
  );
}

const stickyNavStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: '14px 24px',
  borderRadius: '12px',
  position: 'sticky',
  top: '75px',
  zIndex: 90,
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  border: '1px solid rgba(255,255,255,0.8)'
};

const warningStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: '#fffaf0',
  borderLeft: '4px solid #dd6b20',
  color: '#9c4221',
  padding: '12px 16px',
  borderRadius: '8px',
  marginTop: '16px',
  fontSize: '0.85rem'
};

const sectionHeaderStyle = {
  borderBottom: '2px solid #edf2f7',
  paddingBottom: '8px',
  color: '#2b6cb0',
  fontSize: '1.15rem'
};

const qCardStyle = {
  background: '#f8fafc',
  padding: '16px',
  borderRadius: '8px',
  margin: '14px 0',
  border: '1px solid #e2e8f0'
};

const optionStyle = (isSelected) => ({
  display: 'block',
  padding: '10px 14px',
  background: isSelected ? '#ebf8ff' : '#ffffff',
  border: isSelected ? '1px solid #3182ce' : '1px solid #cbd5e0',
  borderRadius: '6px',
  margin: '6px 0',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: isSelected ? '600' : '400',
  color: isSelected ? '#2b6cb0' : '#2d3748'
});

const submitPaperBtnStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '14px',
  background: '#38a169',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: '30px'
};