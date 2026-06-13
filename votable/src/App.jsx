// src/App.jsx
import { useState, useEffect } from 'react';
// Both library imports are commented out to prevent compilation/runtime crashes on your branch
// import { supabase } from './supabaseClient';
// import { createClient } from '@supabase/supabase-js';

// Clean and format a URL to ensure it starts with http:// or https:// and has no trailing slashes or hashes
function formatUrlHref(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/[/#]+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return `https://${cleaned}`;
  }
  return cleaned;
}

// Clean a URL for display purposes, removing protocol and trailing slashes/hashes
function formatUrlDisplay(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/[/#]+$/, '');
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  return cleaned;
}

// Validate a URL — must start with https:// or http:// and have a valid hostname
function validateUrl(url) {
  if (!url || !url.trim()) return 'Portfolio URL is required.';
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return 'URL must begin with https:// or http://';
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) {
      return 'URL must include a valid domain (e.g. example.com)';
    }
  } catch {
    return 'Please enter a valid URL (e.g. https://myportfolio.com)';
  }
  return null; // valid
}

export default function App() {
  // Navigation & User Global States
  const [user, setUser] = useState({ email: 'testuser@dreamspace.academy' }); // Mocked active user
  const [userProfile, setUserProfile] = useState({ role: 'student', full_name: 'Test Student' });
  
  /* 💡 FRONTEND TESTING DIAL:
    Change 'STUDENT_WORKSPACE' below to any of these views to test your UI styles instantly:
    'LOGIN' | 'ONBOARDING' | 'PENDING_APPROVAL' | 'STUDENT_WORKSPACE' | 'ADMIN_DASHBOARD' | 'RESULTS_LEADERBOARD'
  */
  const [currentView, setCurrentView] = useState('STUDENT_WORKSPACE'); 
  const [loading, setLoading] = useState(false); // Turned off loading state to bypass waiting screens
  
  // Form State Vectors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [portfolio, setPortfolio] = useState({ title: '', url: '', description: '', uploaded: true }); // Set uploaded to true to test the voting feed directly
  const [urlError, setUrlError] = useState(null);
  
  // Admin & Settings States
  const [systemSettings, setSystemSettings] = useState({ results_released: true, voting_allowed: true, limit_top_three: false });
  const [pendingStaff, setPendingStaff] = useState([
    { id: '1', full_name: 'John Staff', email: 'john@dreamspace.academy' },
    { id: '2', full_name: 'Sarah Monitor', email: 'sarah@dreamspace.academy' }
  ]);
  const [provisionForm, setProvisionForm] = useState({ name: '', email: '', password: '' });
  const [adminStats, setAdminStats] = useState({ total_students: 24, total_portfolios: 18 });

  // Balloting States
  const [ballot, setBallot] = useState({ points5: null, points3: null, points2: null });
  const [expandedCard, setExpandedCard] = useState(null);

  // Candidates Pool - Populated with clean mock profiles for testing your UI rendering layout
  const [candidates, setCandidates] = useState([
    { id: 'p1', title: 'Cybersecurity Audit Grid', url: 'https://audit-grid.vercel.app', description: 'An automated vulnerability scoring network layout.', author: 'Alex Mercer' },
    { id: 'p2', title: 'E-Commerce Decentralized Core', url: 'https://crypto-shop.com', description: 'Next-gen distributed ledger retail front architecture.', author: 'Elena Rostova' },
    { id: 'p3', title: 'Autonomous Drone Routing App', url: 'https://drone-nav.org', description: 'Vector calculation system built for low-latency telemetry pipelines.', author: 'Marcus Vance' }
  ]);

  // Leaderboard Scoreboard View Data - Mocked analytics
  const [resultsViewData, setResultsViewData] = useState([
    { id: 'p1', title: 'Cybersecurity Audit Grid', full_name: 'Alex Mercer', total_points: 45 },
    { id: 'p3', title: 'Autonomous Drone Routing App', full_name: 'Marcus Vance', total_points: 32 },
    { id: 'p2', title: 'E-Commerce Decentralized Core', full_name: 'Elena Rostova', total_points: 22 }
  ]);

  // Staff Activity Monitoring Metrics
  const [votingStatsData, setVotingStatsData] = useState({ total_voters: 15, total_votes_cast: 45, turnout_percentage: 63 });

  // Auth Initialization and Listeners are bypassed for pure local development layout tests
  useEffect(() => {
    // Database calls completely muted to prevent app crashes
    /*
    fetchSystemSettings();
    */
  }, []);

  // --- BYPASSED SYNC ACTIONS & DATABASE PROFILES ---
  async function syncUserAndNavigate(authUser) { setLoading(false); };
  async function fetchSystemSettings() {};
  async function loadStudentWorkspace(profile) {};
  async function fetchCandidates() {};
  async function loadStaffMonitor() { setCurrentView('STAFF_MONITOR'); };
  async function loadAdminDashboard() { setCurrentView('ADMIN_DASHBOARD'); };
  async function loadLeaderboard() { setCurrentView('RESULTS_LEADERBOARD'); };

  // --- LOCAL EVENT HANDLERS ---
  const handleGoogleLogin = () => { setCurrentView('STUDENT_WORKSPACE'); };
  const handleCredentialsLogin = (e) => { e.preventDefault(); setCurrentView('STUDENT_WORKSPACE'); };
  const handleOnboardingSelection = (selectedRole) => { setCurrentView('STUDENT_WORKSPACE'); };

  const handlePortfolioSubmit = (e) => {
    e.preventDefault();
    const urlValidationError = validateUrl(portfolio.url);
    if (urlValidationError) { setUrlError(urlValidationError); return; }
    setUrlError(null);
    setPortfolio(prev => ({ ...prev, url: formatUrlHref(portfolio.url), uploaded: true }));
    alert("Mock Submit: Frontend looks good!");
  };

  const assignRankVote = (candidateId, points) => {
    const currentBallot = { ...ballot };
    const isAlreadySelectedForThisRank = 
      (points === 5 && currentBallot.points5 === candidateId) ||
      (points === 3 && currentBallot.points3 === candidateId) ||
      (points === 2 && currentBallot.points2 === candidateId);

    if (currentBallot.points5 === candidateId) currentBallot.points5 = null;
    if (currentBallot.points3 === candidateId) currentBallot.points3 = null;
    if (currentBallot.points2 === candidateId) currentBallot.points2 = null;

    if (!isAlreadySelectedForThisRank) {
      if (points === 5) currentBallot.points5 = candidateId;
      if (points === 3) currentBallot.points3 = candidateId;
      if (points === 2) currentBallot.points2 = candidateId;
    }
    setBallot(currentBallot);
  };

  const handleBallotSubmit = () => {
    if (!ballot.points5 && !ballot.points3 && !ballot.points2) {
      alert("Ballot Invalid: Select a choice first.");
      return;
    }
    alert("Mock Success: Vote UI handled safely!");
  };

  const handleLogOut = () => {
    setUser(null);
    setCurrentView('LOGIN');
  };

  const handleSettingToggle = (key, checked) => {
    setSystemSettings(prev => ({ ...prev, [key]: checked }));
  };

  const handleApproveStaff = (staffId) => {
    setPendingStaff(prev => prev.filter(p => p.id !== staffId));
  };

  const handleProvisionStudent = (e) => {
    e.preventDefault();
    alert(`Mock Provision: User generated successfully for ${provisionForm.email}`);
    setProvisionForm({ name: '', email: '', password: '' });
  };

  return (
    <>
      <div className="ambient-bg">
        <div className="ambient-blob blob-purple"></div>
        <div className="ambient-blob blob-orange"></div>
      </div>

      <header style={{ width: '100%', maxWidth: '600px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, margin: '0 auto' }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
          <span style={{ color: 'var(--brand-purple)' }}>VOTABLE</span> <span style={{ color: 'var(--brand-orange)' }}>PORTAL</span>
        </div>
        {user && (
          <button type="button" onClick={handleLogOut} className="btn-liquid-glass" style={{ padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}>Sign Out</button>
        )}
      </header>
      
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>
        {/* VIEW 1: LOGIN MODULE */}
        {currentView === 'LOGIN' && (
          <div className="glass-container">
            <h2 style={{ marginBottom: '6px', textAlign: 'center' }}>Votable Gateway</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>Electoral Verification Infrastructure</p>
            
            <button type="button" className="btn-primary" style={{ background: '#fff', color: '#000', border: '1px solid #d2d2d7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }} onClick={handleGoogleLogin}>
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
              <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>Authenticate Identity</button>
            </form>
          </div>
        )}

        {/* VIEW 2: ONBOARDING */}
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

        {/* VIEW 3: STAFF PENDING STATE */}
        {currentView === 'PENDING_APPROVAL' && (
          <div className="glass-container" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: 'var(--brand-orange)', marginBottom: '10px' }}>⏳</div>
            <h2>Pending Verification</h2>
            <p className="subtitle">Your Staff registration track requires an administrator validation signature before activation.</p>
          </div>
        )}

        {/* VIEW 4: STUDENT CORE GALLERY & BALLOTING */}
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
                  <div style={{ marginBottom: urlError ? '4px' : '12px' }}>
                    <input
                      type="text"
                      placeholder="e.g. https://myportfolio.vercel.app"
                      value={portfolio.url}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPortfolio({ ...portfolio, url: val });
                        if (urlError) setUrlError(validateUrl(val));
                      }}
                      onBlur={(e) => setUrlError(validateUrl(e.target.value))}
                      style={{
                        borderColor: urlError ? '#d32f2f' : undefined,
                        background: urlError ? 'rgba(211,47,47,0.04)' : undefined
                      }}
                      required
                    />
                    {urlError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1rem' }}>⚠️</span>
                        <span style={{ fontSize: '0.78rem', color: '#d32f2f', fontWeight: 500 }}>{urlError}</span>
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: urlError ? '0' : '6px', lineHeight: 1.4 }}>
                      ✅ Accepted formats: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '4px' }}>https://example.com</code>
                    </div>
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
                  <div key={cand.id} style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '18px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{cand.title}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {cand.author}</div>
                      </div>
                      <button type="button" className="btn-liquid-glass" style={{ border: 'none', color: 'var(--brand-orange)', background: 'none', boxShadow: 'none', cursor: 'pointer' }} onClick={() => setExpandedCard(expandedCard === cand.id ? null : cand.id)}>
                        {expandedCard === cand.id ? 'Hide Abstract' : 'Show More'}
                      </button>
                    </div>
                    {expandedCard === cand.id && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        <a href={formatUrlHref(cand.url)} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#0066cc', display: 'block', marginBottom: '6px', wordBreak: 'break-all' }}>
                          🔗 {formatUrlDisplay(cand.url)}
                        </a>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.4 }}>{cand.description}</p>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points5 === cand.id ? 'selected-5' : ''}`} onClick={() => assignRankVote(cand.id, 5)} style={{ cursor: 'pointer' }}>1st Choice (5p)</button>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points3 === cand.id ? 'selected-3' : ''}`} onClick={() => assignRankVote(cand.id, 3)} style={{ cursor: 'pointer' }}>2nd Choice (3p)</button>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points2 === cand.id ? 'selected-2' : ''}`} onClick={() => assignRankVote(cand.id, 2)} style={{ cursor: 'pointer' }}>3rd Choice (2p)</button>
                    </div>
                  </div>
                ))}

                {systemSettings.voting_allowed && candidates.length > 0 && (
                  <button type="button" className="btn-primary" style={{ marginTop: '20px', cursor: 'pointer' }} onClick={handleBallotSubmit}>Submit Anonymous Ballot</button>
                )}

                <button type="button" className="btn-primary" style={{ marginTop: '10px', background: '#e2e2e7', color: '#000', cursor: 'pointer' }} onClick={() => setCurrentView('RESULTS_LEADERBOARD')}>
                  View Leaderboard Screen 📊
                </button>
                <button type="button" className="btn-primary" style={{ marginTop: '10px', background: '#e2e2e7', color: '#000', cursor: 'pointer' }} onClick={() => setCurrentView('ADMIN_DASHBOARD')}>
                  Go to Admin Panel ⚙️
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: ADMIN OPERATIONS PORTAL */}
        {currentView === 'ADMIN_DASHBOARD' && (
          <div className="glass-container">
            <h2>Admin Management Portal</h2>
            <p className="subtitle">Configure live control hooks, approve staff, and review system telemetry stats.</p>
            
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
              <div><strong>Registered Students:</strong> {adminStats.total_students}</div>
              <div><strong>Total Portfolios:</strong> {adminStats.total_portfolios}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={systemSettings.voting_allowed} onChange={(e) => handleSettingToggle('voting_allowed', e.target.checked)} />
                Allow Core Balloting Operations
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={systemSettings.results_released} onChange={(e) => handleSettingToggle('results_released', e.target.checked)} />
                Publish Public Live Leaderboard Results
              </label>
            </div>

            <h3>Pending Staff Requests</h3>
            {pendingStaff.length === 0 ? <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No staffers waiting authorization.</p> : (
              pendingStaff.map(staff => (
                <div key={staff.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem' }}>{staff.full_name} ({staff.email})</span>
                  <button type="button" className="btn-liquid-glass" style={{ background: 'green', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleApproveStaff(staff.id)}>Approve</button>
                </div>
              ))
            )}

            <button type="button" className="btn-primary" style={{ marginTop: '20px', background: '#e2e2e7', color: '#000', cursor: 'pointer' }} onClick={() => setCurrentView('STUDENT_WORKSPACE')}>
              &larr; Back to Student Area
            </button>
          </div>
        )}

        {/* VIEW 6: LIVE LEADERBOARD RESULTS */}
        {currentView === 'RESULTS_LEADERBOARD' && (
          <div className="glass-container">
            <h2>Scoreboard Leaderboard</h2>
            <p className="subtitle">Realtime metrics reflecting current algorithmic weight distributions.</p>
            
            <div style={{ marginTop: '16px' }}>
              {resultsViewData.map((row, idx) => (
                <div key={row.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: idx === 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.6)', borderRadius: '10px', marginBottom: '8px', border: idx === 0 ? '1px solid gold' : '1px solid transparent' }}>
                  <div>
                    <strong>#{idx + 1} {row.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Developed by {row.full_name}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--brand-purple)' }}>{row.total_points} pts</div>
                </div>
              ))}
            </div>

            <button type="button" className="btn-primary" style={{ marginTop: '20px', background: '#e2e2e7', color: '#000', cursor: 'pointer' }} onClick={() => setCurrentView('STUDENT_WORKSPACE')}>
              &larr; Back to Student Area
            </button>
          </div>
        )}
      </main>
    </>
  );
}