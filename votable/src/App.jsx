// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';

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
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentView, setCurrentView] = useState('LOGIN'); 
  const [loading, setLoading] = useState(true);
  
  // Form State Vectors
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [portfolio, setPortfolio] = useState({ title: '', url: '', description: '', uploaded: false });
  const [urlError, setUrlError] = useState(null);
  
  // Admin & Settings States
  const [systemSettings, setSystemSettings] = useState({ results_released: false, voting_allowed: false, limit_top_three: false });
  const [pendingStaff, setPendingStaff] = useState([]);
  const [provisionForm, setProvisionForm] = useState({ name: '', email: '', password: '' });
  const [adminStats, setAdminStats] = useState({ total_students: 0, total_portfolios: 0 });

  // Balloting States
  const [ballot, setBallot] = useState({ points5: null, points3: null, points2: null });
  const [expandedCard, setExpandedCard] = useState(null);

  // Candidates Pool
  const [candidates, setCandidates] = useState([]);

  // Leaderboard Scoreboard View Data
  const [resultsViewData, setResultsViewData] = useState([]);

  // Staff Activity Monitoring Metrics
  const [votingStatsData, setVotingStatsData] = useState({ total_voters: 0, total_votes_cast: 0, turnout_percentage: 0 });

  // Auth Initialization and Listeners
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await syncUserAndNavigate(session.user);
        } else {
          setCurrentView('LOGIN');
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setCurrentView('LOGIN');
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        if (event !== 'TOKEN_REFRESHED') {
          await syncUserAndNavigate(session.user);
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setCurrentView('LOGIN');
        setLoading(false);
      }
    });

    fetchSystemSettings();

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supabase) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f5f7',
        color: '#1d1d1f',
        padding: '24px',
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: '#fff',
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          maxWidth: '480px',
          width: '100%',
          border: '1px solid rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ marginBottom: '12px', color: '#d32f2f', fontSize: '1.4rem', fontWeight: 'bold' }}>Configuration Required</h2>
          <p style={{ fontSize: '0.85rem', color: '#86868b', lineHeight: 1.5, marginBottom: '20px' }}>
            Supabase connection credentials are missing. Please add the required environment variables in your Vercel Project Dashboard.
          </p>
          <div style={{ textAlign: 'left', background: '#f5f5f7', padding: '16px', borderRadius: '12px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#333', lineHeight: 1.5 }}>
            <strong>How to configure:</strong>
            <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
              <li>Go to <strong>Vercel Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
              <li>Add <code>VITE_SUPABASE_URL</code> with your Supabase Project URL.</li>
              <li>Add <code>VITE_SUPABASE_ANON_KEY</code> with your Supabase API anon key.</li>
              <li>Redeploy your project.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Sync user details and route based on database profile roles
  async function syncUserAndNavigate(authUser) {
    setUser(authUser);
    
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profile) {
      setUserProfile(profile);
      
      if (profile.is_admin || profile.role === 'admin') {
        await loadAdminDashboard();
      } else if (profile.role === null || profile.role === undefined) {
        // New Google user — no role chosen yet, show onboarding
        setCurrentView('ONBOARDING');
      } else if (profile.role === 'staff') {
        if (profile.role_approved) {
          await loadStaffMonitor();
        } else {
          setCurrentView('PENDING_APPROVAL');
        }
      } else if (profile.role === 'student') {
        await loadStudentWorkspace(profile);
      } else {
        setCurrentView('ONBOARDING');
      }
    } else {
      // No profile yet — wait briefly for trigger, then check again
      await new Promise(r => setTimeout(r, 1500));
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (retryProfile) {
        setUserProfile(retryProfile);
        if (retryProfile.is_admin || retryProfile.role === 'admin') {
          await loadAdminDashboard();
          setLoading(false);
          return;
        } else if (retryProfile.role === 'student') {
          // admin-created bypass student — go directly to workspace
          await loadStudentWorkspace(retryProfile);
          setLoading(false);
          return;
        } else if (retryProfile.role === null || retryProfile.role === undefined) {
          // New Google user — show onboarding
          if (authUser.email?.endsWith('@dreamspace.academy')) {
            setCurrentView('ONBOARDING');
            setLoading(false);
            return;
          }
        }
      } else if (authUser.email?.endsWith('@dreamspace.academy')) {
        setCurrentView('ONBOARDING');
        setLoading(false);
        return;
      } else {
        const isAdminCreated = authUser.user_metadata?.is_admin_created;
        if (!isAdminCreated) {
          await supabase.auth.signOut();
          alert("Access Denied: Connection restricted exclusively to @dreamspace.academy domains.");
        }
      }
    }
    setLoading(false);
  };

  // Fetch system settings
  async function fetchSystemSettings() {
    const { data } = await supabase
      .from('system_settings')
      .select('*');
    if (data) {
      const settings = { results_released: false, voting_allowed: false, limit_top_three: false };
      data.forEach(item => {
        settings[item.key] = item.value;
      });
      setSystemSettings(settings);
    }
  };

  // Load student dashboard data
  async function loadStudentWorkspace(profile) {
    // 1. Fetch user portfolio
    const { data: port } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (port) {
      setPortfolio({
        title: port.title,
        url: port.portfolio_url,
        description: port.description,
        uploaded: true
      });
    } else {
      setPortfolio(prev => {
        if (prev.title || prev.url || prev.description) {
          return { ...prev, uploaded: false };
        }
        return {
          title: '',
          url: '',
          description: '',
          uploaded: false
        };
      });
    }

    // 2. Fetch candidates
    await fetchCandidates();

    // 3. Fetch votes cast by user
    const { data: userVotes } = await supabase
      .from('votes')
      .select('*')
      .eq('voter_id', profile.id);

    if (userVotes) {
      setBallot(prev => {
        if (prev.points5 || prev.points3 || prev.points2) {
          return prev;
        }
        const userBallot = { points5: null, points3: null, points2: null };
        userVotes.forEach(vote => {
          if (vote.points === 5) userBallot.points5 = vote.portfolio_id;
          if (vote.points === 3) userBallot.points3 = vote.portfolio_id;
          if (vote.points === 2) userBallot.points2 = vote.portfolio_id;
        });
        return userBallot;
      });
    }

    // Load settings
    await fetchSystemSettings();
    
    setCurrentView('STUDENT_WORKSPACE');
  };

  // Fetch candidates gallery
  async function fetchCandidates() {
    const { data: ports } = await supabase
      .from('portfolios')
      .select(`
        id,
        title,
        portfolio_url,
        description,
        user_id,
        profiles (
          full_name,
          email
        )
      `);
    
    if (ports) {
      const mapped = ports.map(p => ({
        id: p.id,
        title: p.title,
        url: p.portfolio_url,
        description: p.description,
        author: p.profiles?.full_name || p.profiles?.email || 'Anonymous Student',
        user_id: p.user_id
      }));
      setCandidates(mapped);
    }
  };

  // Load staff monitoring hub
  async function loadStaffMonitor() {
    setLoading(true);
    await fetchCandidates();

    // Fetch view stats
    const { data: stats } = await supabase
      .from('voting_stats')
      .select('*')
      .maybeSingle();
    
    // Fetch total registered students count
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    if (stats) {
      const turnout = totalStudents > 0 ? Math.round((stats.total_voters / totalStudents) * 100) : 0;
      setVotingStatsData({
        total_voters: stats.total_voters || 0,
        total_votes_cast: stats.total_votes_cast || 0,
        turnout_percentage: turnout
      });
    }
    setLoading(false);
    setCurrentView('STAFF_MONITOR');
  };

  // Load admin portal
  async function loadAdminDashboard() {
    setLoading(true);
    await fetchSystemSettings();

    // Fetch pending staff
    const { data: pending } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'staff')
      .eq('role_approved', false);
    
    if (pending) {
      setPendingStaff(pending);
    }

    // Fetch admin counts
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    const { count: totalPortfolios } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true });

    setAdminStats({
      total_students: totalStudents || 0,
      total_portfolios: totalPortfolios || 0
    });

    setLoading(false);
    setCurrentView('ADMIN_DASHBOARD');
  };

  // Load scoreboard
  async function loadLeaderboard() {
    setLoading(true);
    const { data } = await supabase
      .from('results_view')
      .select('*');
    
    if (data) {
      setResultsViewData(data);
    }
    setLoading(false);
    setCurrentView('RESULTS_LEADERBOARD');
  };

  // Login handler methods
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(`OAuth Error: ${error.message}`);
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    });
    
    if (error) {
      setLoading(false);
      alert(`Authentication Failure: ${error.message}`);
    }
  };

  const handleOnboardingSelection = async (selectedRole) => {
    if (!user) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: selectedRole,
        role_approved: selectedRole === 'student'
      })
      .eq('id', user.id);

    if (error) {
      setLoading(false);
      alert(`Onboarding selection failed: ${error.message}`);
      return;
    }

    await syncUserAndNavigate(user);
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    const urlValidationError = validateUrl(portfolio.url);
    if (urlValidationError) {
      setUrlError(urlValidationError);
      return;
    }
    setUrlError(null);
    const formattedUrl = formatUrlHref(portfolio.url);

    setLoading(true);
    const { data: existingPort } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let err;
    if (existingPort) {
      const { error } = await supabase
        .from('portfolios')
        .update({
          title: portfolio.title,
          portfolio_url: formattedUrl,
          description: portfolio.description
        })
        .eq('id', existingPort.id);
      err = error;
    } else {
      const { error } = await supabase
        .from('portfolios')
        .insert([{
          user_id: user.id,
          title: portfolio.title,
          portfolio_url: formattedUrl,
          description: portfolio.description
        }]);
      err = error;
    }

    setLoading(false);
    if (err) {
      alert(`Portfolio Submission Failed: ${err.message}`);
    } else {
      setPortfolio(prev => ({ ...prev, url: formattedUrl, uploaded: true }));
      await fetchCandidates();
      alert("Portfolio submitted successfully! Entrance to voting zone authorized.");
    }
  };

  const assignRankVote = (candidateId, points) => {
    const currentBallot = { ...ballot };
    
    // Check if the candidate is already selected for this specific rank
    const isAlreadySelectedForThisRank = 
      (points === 5 && currentBallot.points5 === candidateId) ||
      (points === 3 && currentBallot.points3 === candidateId) ||
      (points === 2 && currentBallot.points2 === candidateId);

    // Remove candidate from any other rank first
    if (currentBallot.points5 === candidateId) currentBallot.points5 = null;
    if (currentBallot.points3 === candidateId) currentBallot.points3 = null;
    if (currentBallot.points2 === candidateId) currentBallot.points2 = null;

    // If it was not already selected for this rank, assign it (toggles off if it was)
    if (!isAlreadySelectedForThisRank) {
      if (points === 5) currentBallot.points5 = candidateId;
      if (points === 3) currentBallot.points3 = candidateId;
      if (points === 2) currentBallot.points2 = candidateId;
    }

    setBallot(currentBallot);
  };

  const handleBallotSubmit = async () => {
    if (!ballot.points5 && !ballot.points3 && !ballot.points2) {
      alert("Ballot Invalid: You must select at least one choice (1st, 2nd, or 3rd) before submitting.");
      return;
    }

    setLoading(true);
    // Delete existing votes
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('voter_id', user.id);

    if (deleteError) {
      setLoading(false);
      alert(`Ballot Reset Failed: ${deleteError.message}`);
      return;
    }

    // Insert new votes
    const votesToInsert = [];
    if (ballot.points5) {
      votesToInsert.push({ voter_id: user.id, portfolio_id: ballot.points5, rank: 1, points: 5 });
    }
    if (ballot.points3) {
      votesToInsert.push({ voter_id: user.id, portfolio_id: ballot.points3, rank: 2, points: 3 });
    }
    if (ballot.points2) {
      votesToInsert.push({ voter_id: user.id, portfolio_id: ballot.points2, rank: 3, points: 2 });
    }

    const { error: insertError } = await supabase
      .from('votes')
      .insert(votesToInsert);

    setLoading(false);
    if (insertError) {
      alert(`Ballot Submission Failed: ${insertError.message}`);
    } else {
      alert("Ballot permanently committed to secure ledger database array!");
      if (systemSettings.results_released) {
        await loadLeaderboard();
      }
    }
  };

  const handleLogOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setUserProfile(null);
      setBallot({ points5: null, points3: null, points2: null });
      setLoginEmail('');
      setLoginPassword('');
      setCurrentView('LOGIN');
    } else {
      alert(`Logout Error: ${error.message}`);
    }
    setLoading(false);
  };

  // Admin Toggles & Management Handlers
  const handleSettingToggle = async (key, checked) => {
    const { error } = await supabase
      .from('system_settings')
      .update({ value: checked })
      .eq('key', key);
    
    if (error) {
      alert(`Failed to update setting: ${error.message}`);
    } else {
      setSystemSettings(prev => ({ ...prev, [key]: checked }));
    }
  };

  const handleApproveStaff = async (staffId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role_approved: true })
      .eq('id', staffId);

    if (error) {
      alert(`Approval failure: ${error.message}`);
    } else {
      setPendingStaff(prev => prev.filter(p => p.id !== staffId));
      alert("Staff access authorized successfully!");
      // Refresh admin dashboard metrics
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');
      const { count: totalPortfolios } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true });
      setAdminStats({
        total_students: totalStudents || 0,
        total_portfolios: totalPortfolios || 0
      });
    }
  };

  const handleProvisionStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { error } = await tempClient.auth.signUp({
      email: provisionForm.email,
      password: provisionForm.password,
      options: {
        data: {
          full_name: provisionForm.name,
          is_admin_created: true
        }
      }
    });

    setLoading(false);
    if (error) {
      alert(`Provisioning Failed: ${error.message}`);
    } else {
      alert(`Provisioning successful! Account constructed for non-domain profile: ${provisionForm.email}`);
      setProvisionForm({ name: '', email: '', password: '' });
      
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');
      setAdminStats(prev => ({ ...prev, total_students: totalStudents || 0 }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{
          border: '4px solid rgba(123, 31, 162, 0.1)',
          borderTop: '4px solid var(--brand-purple)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Verifying Gateway Connection...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="ambient-bg">
        <div className="ambient-blob blob-purple"></div>
        <div className="ambient-blob blob-orange"></div>
      </div>

      <header style={{ width: '100%', maxWidth: '600px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>
          <span style={{ color: 'var(--brand-purple)' }}>DREAMSPACE</span> <span style={{ color: 'var(--brand-orange)' }}>PORTAL</span>
        </div>
        {user && (
          <button type="button" onClick={handleLogOut} className="btn-liquid-glass" style={{ padding: '6px 12px', borderRadius: '20px' }}>Sign Out</button>
        )}
      </header>
      
      {currentView === 'LOGIN' && (
        <div className="glass-container">
          <h2 style={{ marginBottom: '6px', textAlign: 'center' }}>Dreamspace Gateway</h2>
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
                    ✅ Accepted formats: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '4px' }}>https://example.com</code> or <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '4px' }}>https://portfolio.vercel.app</code>
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

              {candidates.length === 0 ? (
                <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>No portfolios uploaded yet.</p>
              ) : (
                candidates.map((cand) => (
                  <div key={cand.id} style={{ background: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '18px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600 }}>{cand.title}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {cand.author}</div>
                      </div>
                      <button type="button" className="btn-liquid-glass" style={{ border: 'none', color: 'var(--brand-orange)', background: 'none', boxShadow: 'none' }} onClick={() => setExpandedCard(expandedCard === cand.id ? null : cand.id)}>
                        {expandedCard === cand.id ? 'Hide Abstract' : 'Show More'}
                      </button>
                    </div>
                      {expandedCard === cand.id && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          <a
                            href={formatUrlHref(cand.url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '0.85rem', color: '#0066cc', display: 'block', marginBottom: '6px', wordBreak: 'break-all' }}
                          >
                            🔗 {formatUrlDisplay(cand.url)}
                          </a>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: 1.4 }}>{cand.description}</p>
                        </div>
                      )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points5 === cand.id ? 'selected-5' : ''}`} onClick={() => assignRankVote(cand.id, 5)}>1st Choice (5p)</button>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points3 === cand.id ? 'selected-3' : ''}`} onClick={() => assignRankVote(cand.id, 3)}>2nd Choice (3p)</button>
                      <button type="button" disabled={!systemSettings.voting_allowed} className={`btn-liquid-glass ${ballot.points2 === cand.id ? 'selected-2' : ''}`} onClick={() => assignRankVote(cand.id, 2)}>3rd Choice (2p)</button>
                    </div>
                  </div>
                ))
              )}

              {systemSettings.voting_allowed && candidates.length > 0 && (
                <button type="button" className="btn-primary" style={{ marginTop: '20px' }} onClick={handleBallotSubmit}>Submit Anonymous Ballot</button>
              )}

              <button type="button" className="btn-primary" style={{ marginTop: '10px', background: '#e2e2e7', color: '#000' }} onClick={async () => {
                if (systemSettings.results_released) {
                  await loadLeaderboard();
                } else {
                  alert("Electoral metrics are unreleased. Scoring leaderboard is locked by administrator.");
                }
              }}>Jump to Results View Panel</button>
              
              <button type="button" className="btn-liquid-glass" style={{ marginTop: '10px', width: '100%', color: 'var(--brand-purple)' }} onClick={() => setPortfolio(prev => ({ ...prev, uploaded: false }))}>
                Edit My Portfolio
              </button>
            </div>
          )}
        </div>
      )}

      {currentView === 'STAFF_MONITOR' && (
        <div className="glass-container">
          <h2>Staff Monitoring Hub</h2>
          <p className="subtitle">Track voting participation and uploaded portfolios</p>
          
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
          
          <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '6px' }}>Uploaded Portfolios</h3>
          {candidates.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>No portfolios uploaded yet.</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {candidates.map((cand) => (
                <div key={cand.id} style={{ background: '#fff', padding: '10px 14px', borderRadius: '10px', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.03)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cand.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {cand.author}</div>
                  <a
                    href={formatUrlHref(cand.url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: '#0066cc', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}
                  >
                    🔗 {formatUrlDisplay(cand.url)}
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>🔒 Database RLS Enforced: Individual voter rows remain fully invisible.</p>
        </div>
      )}

      {currentView === 'ADMIN_DASHBOARD' && (
        <div className="glass-container">
          <h2>Admin Command Portal</h2>
          <p className="subtitle">Configure production system variables</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--brand-purple)' }}>{adminStats.total_students}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TOTAL STUDENTS</div>
            </div>
            <div style={{ background: '#fff', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--brand-orange)' }}>{adminStats.total_portfolios}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PORTFOLIOS SUBMITTED</div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>System State Triggers</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Authorize Live Voting Booth</span>
              <input type="checkbox" style={{ width: '24px', height: '24px', cursor: 'pointer' }} checked={systemSettings.voting_allowed} onChange={(e) => handleSettingToggle('voting_allowed', e.target.checked)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Release Scoring Leaderboard</span>
              <input type="checkbox" style={{ width: '24px', height: '24px', cursor: 'pointer' }} checked={systemSettings.results_released} onChange={(e) => handleSettingToggle('results_released', e.target.checked)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem' }}>Limit Leaderboard to Top 3 Profiles</span>
              <input type="checkbox" style={{ width: '24px', height: '24px', cursor: 'pointer' }} checked={systemSettings.limit_top_three} onChange={(e) => handleSettingToggle('limit_top_three', e.target.checked)} />
            </div>
          </div>

          <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Pending Staff Directives</h3>
            {pendingStaff.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No staff validations pending.</p> : 
              pendingStaff.map(stf => (
                <div key={stf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{stf.full_name || 'Staff User'}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stf.email}</div>
                  </div>
                  <button type="button" className="btn-liquid-glass" style={{ padding: '4px 8px' }} onClick={() => handleApproveStaff(stf.id)}>Approve Access</button>
                </div>
              ))
            }
          </div>

          <form style={{ background: '#fff', padding: '16px', borderRadius: '16px', marginBottom: '20px' }} onSubmit={handleProvisionStudent}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Provision Student Bypass Credentials</h3>
            <input type="text" placeholder="Full Name" style={{ marginBottom: '8px', padding: '10px' }} value={provisionForm.name} onChange={e => setProvisionForm({ ...provisionForm, name: e.target.value })} required />
            <input type="email" placeholder="Username / Email" style={{ marginBottom: '8px', padding: '10px' }} value={provisionForm.email} onChange={e => setProvisionForm({ ...provisionForm, email: e.target.value })} required />
            <input type="password" placeholder="Temporary Passcode" style={{ marginBottom: '12px', padding: '10px' }} value={provisionForm.password} onChange={e => setProvisionForm({ ...provisionForm, password: e.target.value })} required />
            <button type="submit" className="btn-primary" style={{ padding: '10px' }}>Deploy Profile Access</button>
          </form>

          <button type="button" className="btn-primary" style={{ background: '#e2e2e7', color: '#000' }} onClick={async () => {
            await loadLeaderboard();
          }}>
            Check scoring leaderboard
          </button>
        </div>
      )}

      {currentView === 'RESULTS_LEADERBOARD' && (
        <div style={{ background: '#ffffff', border: '2px solid #e2e2e7', borderRadius: '24px', padding: '32px 24px', width: '92%', maxWidth: '500px', margin: '20px auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: 'var(--text-dark)', textAlign: 'center' }}>Electoral Metrics</h2>
          <p className="subtitle" style={{ marginBottom: '24px', textAlign: 'center' }}>Points distribution derived from anonymized database view collections</p>
          
          {resultsViewData.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No portfolio votes recorded yet.</p>
          ) : (
            (() => {
              const displayData = systemSettings.limit_top_three ? resultsViewData.slice(0, 3) : resultsViewData;
              const maxPoints = Math.max(1, ...displayData.map(r => r.total_points));
              return displayData.map((res, index) => {
                const widthPct = (res.total_points / maxPoints) * 100;
                return (
                  <div key={res.portfolio_id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px' }}>
                      <span>{index + 1}. {res.title}</span>
                      <span style={{ color: 'var(--brand-purple)' }}>{res.total_points} pts</span>
                    </div>
                    <div style={{ background: '#f5f5f7', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ background: 'linear-gradient(90deg, var(--brand-purple), var(--brand-orange))', height: '100%', width: `${widthPct}%`, transition: 'width 1s ease' }}></div>
                    </div>
                  </div>
                );
              });
            })()
          )}
          
          <button type="button" className="btn-primary" style={{ marginTop: '20px' }} onClick={async () => {
            if (userProfile?.role === 'admin') {
              await loadAdminDashboard();
            } else if (userProfile?.role === 'staff') {
              await loadStaffMonitor();
            } else {
              await loadStudentWorkspace(userProfile);
            }
          }}>
            Return to Dashboard
          </button>
          
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>🔒 Strict Anonymity Protocol: No voter profiles or clear individual choices are exposed.</p>
        </div>
      )}
    </>
  );
}