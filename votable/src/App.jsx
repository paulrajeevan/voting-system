// src/App.jsx
import React, { useState } from 'react';

// EMBEDDED DESIGN MOCK (No external file needed)
const supabaseMock = {
  auth: {
    signInWithGoogle: async () => {
      return { data: { user: { email: "student.voter@dreamspace.academy" } } };
    },
    signInWithPassword: async (email) => {
      return { data: { user: { email, id: "mock-id" } } };
    },
    signOut: async () => { return { error: null }; }
  }
};

export default function App() {
  // Navigation & User Global States
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('LOGIN'); 
  
  // Form State Vectors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [portfolio, setPortfolio] = useState({ title: '', url: '', description: '', uploaded: false });
  
  // Admin & Settings States
  const [systemSettings, setSystemSettings] = useState({ results_released: false, voting_allowed: false });
  const [pendingStaff, setPendingStaff] = useState([
    { id: 'stf-1', full_name: 'Nimal Silva', email: 'nimal@dreamspace.academy' },
    { id: 'stf-2', full_name: 'Priya Raj', email: 'priya@dreamspace.academy' }
  ]);
  const [provisionForm, setProvisionForm] = useState({ name: '', email: '', password: '' });

  // Balloting States
  const [ballot, setBallot] = useState({ points5: null, points3: null, points2: null });
  const [expandedCard, setExpandedCard] = useState(null);

  // Mock Contenders Pool
  const [candidates, setCandidates] = useState([
    { id: 'c-1', title: 'DevPulse Dashboard', url: 'https://devpulse.io', description: 'Automated network diagnostic telemetry array.' },
    { id: 'c-2', title: 'EcoBloom System', url: 'https://ecobloom.org', description: 'Decentralized ecological hardware sensory reporting.' }
  ]);

  // Mock Results View Dataset
  const resultsViewData = [
    { portfolio_id: 'c-1', title: 'DevPulse Dashboard', total_points: 145 },
    { portfolio_id: 'c-2', title: 'EcoBloom System', total_points: 98 },
    { portfolio_id: 'user-p', title: portfolio.title || 'Your Submission Portfolio', total_points: 42 }
  ];

  // Mock Activity Stats Dataset
  const votingStatsData = { total_voters: 48, total_votes_cast: 144, turnout_percentage: 84 };

  // Dual-Auth Engine Implementation Paths
  const handleGoogleLogin = async () => {
    const { data } = await supabaseMock.auth.signInWithGoogle();
    if (data?.user?.email.endsWith('@dreamspace.academy')) {
      setUser(data.user);
      setCurrentView('ONBOARDING'); 
    } else {
      alert("Access Denied: Connection restricted exclusively to @dreamspace.academy domains.");
    }
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    const { data } = await supabaseMock.auth.signInWithPassword(loginEmail, loginPassword);
    setUser(data.user);
    
    if (loginEmail === "admin@dreamspace.academy") {
      setCurrentView('ADMIN_DASHBOARD');
    } else {
      setCurrentView('STUDENT_WORKSPACE');
    }
  };

  const handleOnboardingSelection = (selectedRole) => {
    if (selectedRole === 'student') {
      setCurrentView('STUDENT_WORKSPACE');
    } else {
      setCurrentView('PENDING_APPROVAL');
    }
  };

  const handlePortfolioSubmit = (e) => {
    e.preventDefault();
    if (!portfolio.url.startsWith('https://')) {
      alert("Validation Failure: URLs must initiate with secure https:// layer framework.");
      return;
    }
    setPortfolio({ ...portfolio, uploaded: true });
    setCandidates([...candidates, { id: 'user-p', title: portfolio.title, url: portfolio.url, description: portfolio.description }]);
    alert("Portfolio submitted successfully! Entrance to voting zone authorized.");
  };

  const assignRankVote = (candidateId, points) => {
    const currentBallot = { ...ballot };
    
    if (currentBallot.points5 === candidateId) currentBallot.points5 = null;
    if (currentBallot.points3 === candidateId) currentBallot.points3 = null;
    if (currentBallot.points2 === candidateId) currentBallot.points2 = null;

    if (points === 5) currentBallot.points5 = candidateId;
    if (points === 3) currentBallot.points3 = candidateId;
    if (points === 2) currentBallot.points2 = candidateId;

    setBallot(currentBallot);
  };

  const handleLogOut = () => {
    setUser(null);
    setBallot({ points5: null, points3: null, points2: null });
    setCurrentView('LOGIN');
  };

  return (
    <>
      <div className="ambient-bg">
        <div className="ambient-blob blob-purple"></div>
        <div className="ambient-blob blob-orange"></div>
      </div>

      <header style={{ width: '100%', maxWidth: '600px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
          <span style={{ color: 'var(--brand-purple)' }}>VOTABLE</span> <span style={{ color: 'var(--brand-orange)' }}>PORTAL</span>
        </div>
        {user && (
          <button type="button" onClick={handleLogOut} className="btn-liquid-glass" style={{ padding: '6px 12px', borderRadius: '20px' }}>Sign Out</button>
        )}
      </header>
      
      {currentView === 'LOGIN' && (
        <div className="glass-container">
          <h2 style={{ marginBottom: '6px' }}>Votable Gateway</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>Electoral Verification Infrastructure</p>
          
          <button type="button" className="btn-primary" style={{ background: '#fff', color: '#000', border: '1px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }} onClick={handleGoogleLogin}>
            <span style={{ fontWeight: 'bold' }}>G</span> Sign in with Google Account
          </button>

          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
            <span style={{ padding: '0 10px' }}>OR SECURE CREDENTIALS</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
          </div>

          <form onSubmit={handleCredentialsLogin}>
            <div style={{ marginBottom: '12px' }}>
              <input type="text" placeholder="Username or Domain Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input type="password" placeholder="Access Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Authenticate Identity</button>
          </form>
        </div>
      )}

      {currentView === 'ONBOARDING' && (
        <div className="glass-container" style={{ textAlign: 'center' }}>
          <h2>Onboarding Workspace</h2>
          <p className="subtitle">Select your official directory definition below</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
            <button type="button" className="btn-primary" onClick={() => handleOnboardingSelection('student')}>Register as Student Workspace</button>
            <button type="button" className="btn-primary" style={{ background: 'var(--brand-orange)' }} onClick={() => handleOnboardingSelection('staff')}>Register as Monitoring Staff</button>
          </div>
        </div>
      )}

      {currentView === 'PENDING_APPROVAL' && (
        <div className="glass-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', color: 'var(--brand-orange)', marginBottom: '10px' }}>⏳</div>
          <h2>Pending Verification</h2>
          <p className="subtitle">Your Staff registration track requires an administrator validation signature before activation.</p>
        </div>
      )}

      {currentView === 'STUDENT_WORKSPACE' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {!portfolio.uploaded ? (
            <div className="glass-container">
              <h2>Portfolio Submission</h2>
              <p className="subtitle">Please provide your live workspace criteria sequentially: Name, URL, and Description.</p>
              <form onSubmit={handlePortfolioSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <input type="text" placeholder="Portfolio / Application Name" value={portfolio.title} onChange={(e) => setPortfolio({ ...portfolio, title: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <input type="url" placeholder="Production URL (https://... required)" value={portfolio.url} onChange={(e) => setPortfolio({ ...portfolio, url: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <textarea placeholder="Brief abstract overview description..." rows="3" value={portfolio.description} onChange={(e) => setPortfolio({ ...portfolio, description: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary">Register Workspace Profile</button>
              </form>
            </div>
          ) : (
            <div className="glass-container">
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span className={`badge-status ${systemSettings.voting_allowed ? 'status-live' : 'status-locked'}`}>
                  {systemSettings.voting_allowed ? 'Voting Active' : 'View Only Mode (Locked)'}
                </span>
              </div>
              <h2>Electoral Candidates</h2>
              <p className="subtitle">Cast 3-tier ballots anonymously. Expand entries to analyze submission details.</p>

              {candidates.map((cand) => (
                <div key={cand.id} style={{ background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '18px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{cand.title}</span>
                    <button type="button" className="btn-liquid-glass" style={{ border: 'none', color: 'var(--brand-orange)', background: 'none', boxShadow: 'none' }} onClick={() => setExpandedCard(expandedCard === cand.id ? null : cand.id)}>
                      {expandedCard === cand.id ? 'Hide Abstract' : 'Show More'}
                    </button>
                  </div>

                  {expandedCard === cand.id && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <a href={cand.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0066cc', display: 'block', marginBottom: '6px' }}>{cand.url}</a>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.4 }}>{cand.description}</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                    <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points5 === cand.id ? 'selected-5' : ''}`} onClick={() => assignRankVote(cand.id, 5)}>1st Choice (5p)</button>
                    <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points3 === cand.id ? 'selected-3' : ''}`} onClick={() => assignRankVote(cand.id, 3)}>2nd Choice (3p)</button>
                    <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points2 === cand.id ? 'selected-2' : ''}`} onClick={() => assignRankVote(cand.id, 2)}>3rd Choice (2p)</button>
                  </div>
                </div>
              ))}

              {systemSettings.voting_allowed && (
                <button type="button" className="btn-primary" style={{ marginTop: '20px' }} onClick={() => {
                  if (!ballot.points5 || !ballot.points3 || !ballot.points2) {
                    alert("Ballot Invalid: You must completely map 1st, 2nd, and 3rd selections.");
                    return;
                  }
                  alert("Ballot permanently committed to secure ledger database array!");
                  if (systemSettings.results_released) setCurrentView('RESULTS_LEADERBOARD');
                }}>Submit Anonymous Ballot</button>
              )}

              <button type="button" className="btn-primary" style={{ marginTop: '10px', background: '#e2e2e7', color: '#000' }} onClick={() => setCurrentView('RESULTS_LEADERBOARD')}>Jump to Results View Panel</button>
            </div>
          )}
        </div>
      )}

      {currentView === 'STAFF_MONITOR' && (
        <div className="glass-container">
          <h2>Staff Monitoring Hub</h2>
          <p className="subtitle">Anonymized macro transaction traffic telemetry inputs</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--brand-purple)' }}>{votingStatsData.total_voters}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>VOTERS REG</div>
            </div>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--brand-orange)' }}>{votingStatsData.total_votes_cast}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>VOTES CAST</div>
            </div>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#28c76f' }}>{votingStatsData.turnout_percentage}%</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TURNOUT</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>🔒 Database RLS Enforced: Individual voter rows remain fully invisible.</p>
        </div>
      )}

      {currentView === 'ADMIN_DASHBOARD' && (
        <div className="glass-container">
          <h2>Admin Command Portal</h2>
          <p className="subtitle">Configure production system variables</p>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>System State Triggers</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.9rem' }}>Authorize Live Voting Booth</span>
              <input type="checkbox" style={{ width: '40px' }} checked={systemSettings.voting_allowed} onChange={(e) => setSystemSettings({ ...systemSettings, voting_allowed: e.target.checked })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.9rem' }}>Release Scoring Leaderboard</span>
              <input type="checkbox" style={{ width: '40px' }} checked={systemSettings.results_released} onChange={(e) => setSystemSettings({ ...systemSettings, results_released: e.target.checked })} />
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Pending Staff Directives</h3>
            {pendingStaff.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No staff validations pending.</p> : 
              pendingStaff.map(stf => (
                <div key={stf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0' }}>
                  <span>{stf.full_name}</span>
                  <button type="button" className="btn-liquid-glass" style={{ padding: '4px 8px' }} onClick={() => setPendingStaff(pendingStaff.filter(p => p.id !== stf.id))}>Approve Access</button>
                </div>
              ))
            }
          </div>

          <form style={{ background: '#fff', padding: '16px', borderRadius: '16px' }} onSubmit={(e) => {
            e.preventDefault();
            alert(`Provisioning successful! Account constructed for non-domain profile: ${provisionForm.email}`);
            setProvisionForm({ name: '', email: '', password: '' });
          }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Provision Student Bypass Credentials</h3>
            <input type="text" placeholder="Full Name" style={{ marginBottom: '8px' }} value={provisionForm.name} onChange={e => setProvisionForm({ ...provisionForm, name: e.target.value })} required />
            <input type="text" placeholder="Username / Email" style={{ marginBottom: '8px' }} value={provisionForm.email} onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })} required />
            <input type="password" placeholder="Temporary Passcode" style={{ marginBottom: '12px' }} value={provisionForm.password} onChange={e => setProvisionForm({ ...provisionForm, password: e.target.value })} required />
            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>Deploy Profile Access</button>
          </form>
        </div>
      )}

      {currentView === 'RESULTS_LEADERBOARD' && (
        <div style={{ background: '#ffffff', border: '2px solid #e2e2e7', borderRadius: '24px', padding: '32px 24px', width: '92%', maxWidth: '500px', margin: '20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--text-dark)' }}>Electoral Metrics</h2>
          <p className="subtitle" style={{ marginBottom: '24px' }}>Points distribution derived from anonymized database view collections</p>
          
          {resultsViewData.map((res, index) => (
            <div key={res.portfolio_id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                <span>{index + 1}. {res.title}</span>
                <span style={{ color: 'var(--brand-purple)' }}>{res.total_points} pts</span>
              </div>
              <div style={{ background: '#f5f5f7', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--brand-purple), var(--brand-orange))', height: '100%', width: `${(res.total_points / 150) * 100}%`, transition: 'width 1s ease' }}></div>
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>🔒 Strict Anonymity Protocol: No voter profiles or clear individual choices are exposed.</p>
        </div>
      )}
    </>
  );
}