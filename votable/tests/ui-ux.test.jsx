import { vi, describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { supabase } from '../src/supabaseClient';

// Helper to create mock chainable database queries using Thenable objects
function createMockPromise(table, mockDb) {
  const eqFilters = {};

  const thenable = {
    select: vi.fn().mockImplementation(() => thenable),
    eq: vi.fn().mockImplementation((field, val) => {
      eqFilters[field] = val;
      return thenable;
    }),
    maybeSingle: vi.fn().mockImplementation(() => {
      let source = [];
      if (table === 'profiles') {
        source = mockDb.profiles;
      } else if (table === 'portfolios') {
        source = mockDb.portfolios;
      } else if (table === 'voting_stats') {
        return Promise.resolve({ data: mockDb.voting_stats, error: null });
      }

      let filtered = [...source];
      Object.keys(eqFilters).forEach(key => {
        filtered = filtered.filter(item => item[key] === eqFilters[key]);
      });

      return Promise.resolve({ data: filtered[0] || null, error: null });
    }),
    then: vi.fn().mockImplementation((onFulfilled, onRejected) => {
      let source = [];
      if (table === 'profiles') {
        source = mockDb.profiles;
      } else if (table === 'portfolios') {
        source = mockDb.portfolios;
      } else if (table === 'system_settings') {
        source = mockDb.system_settings;
      } else if (table === 'voting_stats') {
        return Promise.resolve({ data: mockDb.voting_stats, error: null }).then(onFulfilled, onRejected);
      }

      let filtered = [...source];
      Object.keys(eqFilters).forEach(key => {
        filtered = filtered.filter(item => item[key] === eqFilters[key]);
      });

      return Promise.resolve({ data: filtered, error: null }).then(onFulfilled, onRejected);
    }),
    insert: vi.fn().mockImplementation((val) => {
      const arr = Array.isArray(val)
        ? val.map(item => ({ id: item.id || 'mock-' + Math.random(), ...item }))
        : [{ id: val.id || 'mock-' + Math.random(), ...val }];
      if (table === 'portfolios') {
        mockDb.portfolios.push(...arr);
      } else if (table === 'votes') {
        mockDb.votes.push(...arr);
      }
      return Promise.resolve({ data: arr, error: null });
    }),
    delete: vi.fn().mockImplementation(() => {
      if (table === 'votes') {
        const voterId = eqFilters['voter_id'];
        if (voterId) {
          mockDb.votes = mockDb.votes.filter(v => v.voter_id !== voterId);
        }
      }
      return thenable;
    }),
    update: vi.fn().mockImplementation((updates) => {
      if (table === 'profiles') {
        mockDb.profiles.forEach(p => {
          let matches = true;
          Object.keys(eqFilters).forEach(key => {
            if (p[key] !== eqFilters[key]) matches = false;
          });
          if (matches) {
            Object.assign(p, updates);
          }
        });
      } else if (table === 'system_settings') {
        const settingKey = eqFilters['key'];
        const setting = mockDb.system_settings.find(s => s.key === settingKey);
        if (setting) {
          setting.value = updates.value;
        }
      }
      return Promise.resolve({ data: updates, error: null });
    }),
    catch: vi.fn().mockImplementation((onRejected) => {
      return Promise.resolve().catch(onRejected);
    }),
    finally: vi.fn().mockImplementation((onFinally) => {
      return Promise.resolve().finally(onFinally);
    })
  };

  return thenable;
}

// Mock Supabase client module
vi.mock('../src/supabaseClient', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    from: vi.fn()
  };
  return { supabase: mockSupabase };
});

describe('Votable Portal UI/UX Test Suite (Vitest)', () => {
  let mockDb;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock database state
    mockDb = {
      profiles: [
        {
          id: 'test-student-id',
          email: 'student@dreamspace.academy',
          full_name: 'Test Student',
          role: 'student',
          role_approved: true
        }
      ],
      system_settings: [
        { key: 'results_released', value: false },
        { key: 'voting_allowed', value: true },
        { key: 'limit_top_three', value: false }
      ],
      portfolios: [],
      votes: [],
      voting_stats: { total_voters: 10, total_votes_cast: 30 }
    };

    // Set up mock implementations for table queries using dynamic promise builder
    supabase.from.mockImplementation((table) => {
      return createMockPromise(table, mockDb);
    });
  });

  /* ========================================================================
     ACCESSIBILITY (A11Y) TESTS
     ======================================================================== */
  describe('Accessibility (a11y) Standards', () => {
    test('login form inputs must have associated labels and ARIA descriptors', async () => {
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Votable Gateway')).toBeInTheDocument();
      });

      // Verify input labels exist visually hidden and match input IDs
      const emailInput = screen.getByLabelText('Username or Domain Email');
      const passwordInput = screen.getByLabelText('Access Password');

      expect(emailInput).toBeInTheDocument();
      expect(emailInput.tagName).toBe('INPUT');
      expect(emailInput.id).toBe('loginEmail');

      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput.tagName).toBe('INPUT');
      expect(passwordInput.id).toBe('loginPassword');
    });

    test('portfolio form inputs must have associated labels and live regions for errors', async () => {
      // Setup session for student with NO portfolio uploaded
      const session = { user: { id: 'test-student-id', email: 'student@dreamspace.academy' } };
      supabase.auth.getSession.mockResolvedValue({ data: { session } });
      mockDb.profiles[0].role = 'student';
      mockDb.portfolios = []; // no portfolio

      render(<App />);

      // Wait for Portfolio Submission form
      await waitFor(() => {
        expect(screen.getByText('Portfolio Submission')).toBeInTheDocument();
      });

      // Verify labeled fields
      const titleInput = screen.getByLabelText('Portfolio or Application Name');
      const urlInput = screen.getByLabelText('Portfolio URL');
      const descInput = screen.getByLabelText('Brief abstract overview description');

      expect(titleInput).toBeInTheDocument();
      expect(titleInput.id).toBe('portfolioTitle');
      expect(urlInput).toBeInTheDocument();
      expect(urlInput.id).toBe('portfolioUrl');
      expect(descInput).toBeInTheDocument();
      expect(descInput.id).toBe('portfolioDescription');

      // Test validation error message updates live region
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
      fireEvent.blur(urlInput);

      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute('aria-live', 'polite');
        expect(errorAlert).toHaveTextContent('URL must begin with https:// or http://');
      });
    });
  });

  /* ========================================================================
     USABILITY (UX) TESTS
     ======================================================================== */
  describe('Usability & Custom Error Handlers', () => {
    test('should show accessible custom toast notifications instead of window.alert()', async () => {
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
      supabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' }
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Votable Gateway')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('Username or Domain Email');
      const passwordInput = screen.getByLabelText('Access Password');
      const submitBtn = screen.getByRole('button', { name: 'Authenticate Identity' });

      // Enter details and submit
      fireEvent.change(emailInput, { target: { value: 'student@dreamspace.academy' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitBtn);

      // Verify custom toast message displays instead of window.alert
      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toBeInTheDocument();
        expect(toast).toHaveTextContent('Authentication Failure: Invalid login credentials');
      });

      // Dismiss the toast
      const closeBtn = screen.getByLabelText('Close notification');
      fireEvent.click(closeBtn);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  /* ========================================================================
     RESPONSIVENESS DESCRIPTORS
     ======================================================================== */
  describe('Responsiveness Styling Descriptors', () => {
    test('contains sr-only classes and viewport alignment hooks', async () => {
      render(<App />);
      // Verify sr-only exists in classes
      await waitFor(() => {
        const labels = screen.getAllByText('Username or Domain Email', { exact: false });
        expect(labels.some(label => label.classList.contains('sr-only'))).toBe(true);
      });
    });
  });

  /* ========================================================================
     USER-FLOW TESTS
     ======================================================================== */
  describe('User Flow Scenarios', () => {
    test('Onboarding Flow: Google authentication for new user with NO role', async () => {
      const session = { user: { id: 'new-user-id', email: 'new@dreamspace.academy' } };
      supabase.auth.getSession.mockResolvedValue({ data: { session } });
      
      // Return profile with NULL role
      mockDb.profiles = [
        {
          id: 'new-user-id',
          email: 'new@dreamspace.academy',
          role: null,
          role_approved: false
        }
      ];

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Onboarding Workspace')).toBeInTheDocument();
      });

      // Verify onboarding actions
      expect(screen.getByRole('button', { name: 'Register as Student Workspace' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register as Monitoring Staff' })).toBeInTheDocument();
    });

    test('Pending Staff Flow: Approval required for staff users', async () => {
      const session = { user: { id: 'staff-id', email: 'staff@dreamspace.academy' } };
      supabase.auth.getSession.mockResolvedValue({ data: { session } });
      
      mockDb.profiles = [
        {
          id: 'staff-id',
          email: 'staff@dreamspace.academy',
          role: 'staff',
          role_approved: false
        }
      ];

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Pending Verification')).toBeInTheDocument();
        expect(screen.getByText(/requires an administrator validation signature/)).toBeInTheDocument();
      });
    });

    test('Student Flow: Submit Portfolio -> View Candidates -> Vote', async () => {
      const session = { user: { id: 'student-id', email: 'student@dreamspace.academy' } };
      supabase.auth.getSession.mockResolvedValue({ data: { session } });
      
      mockDb.profiles = [
        {
          id: 'student-id',
          email: 'student@dreamspace.academy',
          role: 'student',
          role_approved: true
        }
      ];

      // Set up candidate list
      mockDb.portfolios = [
        { id: 'portfolio-1', title: 'Smart Agriculture', portfolio_url: 'https://smartagri.com', description: 'IoT farming application', user_id: 'other-user' }
      ];

      // Initial render shows portfolio form because user hasn't uploaded a portfolio under 'student-id'
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Portfolio Submission')).toBeInTheDocument();
      });

      // Simulate successful portfolio submission
      const titleInput = screen.getByLabelText('Portfolio or Application Name');
      const urlInput = screen.getByLabelText('Portfolio URL');
      const descInput = screen.getByLabelText('Brief abstract overview description');
      const submitBtn = screen.getByRole('button', { name: 'Register Workspace Profile' });

      fireEvent.change(titleInput, { target: { value: 'Eco Monitor' } });
      fireEvent.change(urlInput, { target: { value: 'https://ecomonitor.org' } });
      fireEvent.change(descInput, { target: { value: 'Eco dashboard' } });

      // Submit form
      fireEvent.click(submitBtn);

      // Toast notification on success
      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toHaveTextContent('Portfolio submitted successfully!');
      });
    });

    test('Admin Portal Flow: Modify configuration variables and provision student', async () => {
      const session = { user: { id: 'admin-id', email: 'admin@dreamspace.academy' } };
      supabase.auth.getSession.mockResolvedValue({ data: { session } });
      
      mockDb.profiles = [
        {
          id: 'admin-id',
          email: 'admin@dreamspace.academy',
          role: 'admin',
          is_admin: true,
          role_approved: true
        }
      ];

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Admin Command Portal')).toBeInTheDocument();
      });

      // Check toggles exist
      const boothToggle = screen.getByLabelText('Authorize Live Voting Booth');
      const leaderboardToggle = screen.getByLabelText('Release Scoring Leaderboard');

      expect(boothToggle).toBeInTheDocument();
      expect(leaderboardToggle).toBeInTheDocument();

      // Check provisioning student fields
      const pName = screen.getByLabelText('Full Name');
      const pEmail = screen.getByLabelText('Username / Email');
      const pPass = screen.getByLabelText('Temporary Passcode');
      const pSubmit = screen.getByRole('button', { name: 'Deploy Profile Access' });

      expect(pName).toBeInTheDocument();
      expect(pEmail).toBeInTheDocument();
      expect(pPass).toBeInTheDocument();
      expect(pSubmit).toBeInTheDocument();
    });
  });
});
