import { create } from 'zustand';

// Initial seed question bank (13 seed questions matching spec 7.7)
const INITIAL_QUESTIONS = [
  {
    id: 'q1',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'How do you structure database queries and caching in FastAPI when handling concurrent async requests?',
    related_skills: ['FastAPI', 'MongoDB', 'Redis'],
    skill_status: 'gap', // gap, partial, or strong
    why_note: 'Tests async pipeline design and mitigation of database connection exhaustion.',
    concept: 'Async I/O and non-blocking drivers in event-driven systems.',
    explanation: 'Using connection pooling with Motor or asyncpg coupled with Redis cache-aside prevents bottlenecking event loops during high concurrency.',
    connect_project: 'Refer to your microservices gateway and how you mitigated p95 latency spikes.',
    likely_followup: 'How do you handle cache stampedes when keys expire under heavy traffic?',
    expected_rubric: [
      'Connection pooling with async drivers',
      'Redis cache-aside pattern',
      'Cache invalidation and TTL strategy',
      'Handling event loop blocking'
    ],
  },
  {
    id: 'q2',
    category: 'Technical',
    difficulty: 'Hard',
    question: 'Explain how Docker multi-stage builds optimize container footprint and security in production deployments.',
    related_skills: ['Docker', 'CI/CD'],
    skill_status: 'gap',
    why_note: 'Addresses containerization gap noted on your target job description.',
    concept: 'Separation of build environments from minimal production runtime images.',
    explanation: 'Multi-stage builds compile artifacts in an intermediate builder stage and copy only binaries into a minimal distroless or alpine runtime.',
    connect_project: 'Cite your Docker packaging pipeline and reducing image size from 1.2GB to 85MB.',
    likely_followup: 'What security scanning tools do you integrate into your image build pipeline?',
    expected_rubric: [
      'Builder stage versus runtime stage separation',
      'Distroless or alpine minimal base image',
      'Minimizing attack surface by omitting build tools',
      'Layer caching efficiency'
    ],
  },
  {
    id: 'q3',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'What are the architectural trade-offs between PostgreSQL relational tables and MongoDB document collections?',
    related_skills: ['PostgreSQL', 'MongoDB'],
    skill_status: 'partial',
    why_note: 'Evaluates your polyglot persistence decision-making criteria.',
    concept: 'ACID transactional integrity vs flexible schema and horizontal partition scaling.',
    explanation: 'PostgreSQL provides strict foreign key constraints and complex joins; MongoDB excels in nested document retrieval and horizontal sharding.',
    connect_project: 'Relate to how you chose document storage for user activity logs vs SQL for ledger balances.',
    likely_followup: 'When would you use JSONB columns in PostgreSQL instead of a separate MongoDB instance?',
    expected_rubric: [
      'ACID guarantees and schema rigidity in SQL',
      'Horizontal scalability and denormalized documents in NoSQL',
      'Indexing strategies across both engines',
      'Consistency versus write throughput trade-off'
    ],
  },
  {
    id: 'q4',
    category: 'Technical',
    difficulty: 'Easy',
    question: 'How do React hooks such as useMemo and useCallback prevent unnecessary component re-renders?',
    related_skills: ['React', 'JavaScript'],
    skill_status: 'strong',
    why_note: 'Validates core frontend optimization mechanics on your profile.',
    concept: 'Referential equality and memoization of computed values and function instances.',
    explanation: 'useMemo caches expensive calculations between renders; useCallback maintains function reference stability to prevent memoized child re-renders.',
    connect_project: 'Discuss how you stabilized dashboard chart rendering when filters updated.',
    likely_followup: 'Can premature use of useMemo hurt performance rather than help it?',
    expected_rubric: [
      'Referential equality across renders',
      'Memoization of expensive calculations with useMemo',
      'Passing stable callbacks to React.memo children',
      'Dependency array hygiene'
    ],
  },
  {
    id: 'q5',
    category: 'Technical',
    difficulty: 'Medium',
    question: 'How do you design RESTful endpoints with idempotency keys for critical mutating requests like payments?',
    related_skills: ['Python', 'FastAPI'],
    skill_status: 'strong',
    why_note: 'Critical reliability requirement for senior full-stack roles.',
    concept: 'Idempotency tokens ensuring duplicate submissions produce identical safe results.',
    explanation: 'Clients pass a unique Idempotency-Key header; the server checks a fast cache (e.g., Redis) and returns previous responses if seen.',
    connect_project: 'Recall handling network timeout retries without duplicate record creation.',
    likely_followup: 'How do you handle concurrent in-flight requests with the exact same idempotency key?',
    expected_rubric: [
      'Idempotency-Key header conventions',
      'Atomic lock in Redis while initial request executes',
      'Persisting previous response payloads for immediate replay',
      'TTL expiration for idempotency tokens'
    ],
  },
  {
    id: 'q6',
    category: 'Technical',
    difficulty: 'Hard',
    question: 'How do you diagnose and resolve memory leaks or event loop blocking in Node.js or async Python services?',
    related_skills: ['FastAPI', 'Node.js'],
    skill_status: 'partial',
    why_note: 'Probes deep debugging capability in asynchronous runtime environments.',
    concept: 'Profiler heap snapshots, uncollected event listeners, and CPU-bound blocking calls.',
    explanation: 'CPU-heavy code stops the async event loop; offload calculations to thread/process pools and inspect memory with tracemalloc or v8-profiler.',
    connect_project: 'Mention troubleshooting worker OOM errors during batch PDF parsing.',
    likely_followup: 'What metrics alert you to event loop latency before users notice degradations?',
    expected_rubric: [
      'Event loop lag monitoring metrics',
      'Offloading synchronous work to thread pools',
      'Heap profiling and leak isolation',
      'Resource cleanup in asynchronous context managers'
    ],
  },
  {
    id: 'q7',
    category: 'Technical',
    difficulty: 'Easy',
    question: 'What is the role of indexes in database performance, and what are the overhead costs of over-indexing?',
    related_skills: ['PostgreSQL', 'MongoDB'],
    skill_status: 'strong',
    why_note: 'Foundational database engineering principle.',
    concept: 'B-tree index lookups reducing full table scans versus write amplification.',
    explanation: 'Indexes provide O(log n) lookups on filtered columns, but every INSERT, UPDATE, and DELETE must rebalance the index tree.',
    connect_project: 'Relate to creating compound indexes on user_id and created_at for fast paginated timelines.',
    likely_followup: 'How do composite index column ordering rules impact multi-field queries?',
    expected_rubric: [
      'B-Tree and Hash index structures',
      'Avoiding full table or collection scans',
      'Write throughput penalty from index maintenance',
      'Memory and disk footprint considerations'
    ],
  },
  {
    id: 'q8',
    category: 'Behavioral',
    difficulty: 'Medium',
    question: 'Describe a situation where a project deadline was at risk due to unexpected technical roadblocks. How did you handle it?',
    related_skills: ['Agile Leadership', 'Communication'],
    skill_status: 'strong',
    why_note: 'Assesses adaptability, stakeholder communication, and delivery focus.',
    concept: 'STAR behavioral response framework.',
    explanation: 'Use the Situation, Task, Action, and Result framework to explain transparent prioritization.',
    connect_project: 'Detail descoping non-critical UI flourishes to deliver core billing on schedule.',
    likely_followup: 'What would you do differently if the roadblock had emerged even closer to release?',
    expected_rubric: [
      'Situation: Clear project context and deadline constraint',
      'Task: Specific responsibility and problem definition',
      'Action: Transparent renegotiation, descoping, and proactive communication',
      'Result: Successful delivery and retrospective takeaway'
    ],
  },
  {
    id: 'q9',
    category: 'Behavioral',
    difficulty: 'Medium',
    question: 'Tell me about a time you had a strong technical disagreement with a senior engineer or architect. How was it resolved?',
    related_skills: ['System Design', 'Communication'],
    skill_status: 'strong',
    why_note: 'Tests technical humility, consensus building, and professional collaboration.',
    concept: 'Objective data-driven decision making and collaborative alignment.',
    explanation: 'Walk through isolating the disagreement, running a minimal proof-of-concept benchmark, and committing fully to the team choice.',
    connect_project: 'Think of debating monolithic FastAPI routers versus microservice boundaries.',
    likely_followup: 'How did you preserve your working relationship with that engineer afterwards?',
    expected_rubric: [
      'Respectful framing of opposing perspectives',
      'Gathering empirical benchmark data or proof of concept',
      'Focusing on user value over ego or personal preference',
      'Commitment to shared velocity once decided'
    ],
  },
  {
    id: 'q10',
    category: 'Situational',
    difficulty: 'Hard',
    question: 'Your production API latency spikes by 500% immediately following a Friday evening deployment. How do you triage and resolve the incident?',
    related_skills: ['CI/CD', 'Docker', 'FastAPI'],
    skill_status: 'partial',
    why_note: 'Examines production incident command and structured triage methodology.',
    concept: 'Immediate customer mitigation before root-cause deep diving.',
    explanation: 'Roll back or toggle feature flags first to restore customer service; verify metrics, then inspect logs and git diffs in staging.',
    connect_project: 'Describe how automated canary health checks protect your releases.',
    likely_followup: 'How do you conduct the post-mortem to prevent regression recurrence?',
    expected_rubric: [
      'Prioritize immediate rollback or traffic diversion to restore uptime',
      'Checking APM traces, error logs, and recent commit diffs',
      'Communicating status transparently to stakeholders',
      'Blameless post-mortem and automated regression safeguards'
    ],
  },
  {
    id: 'q11',
    category: 'Situational',
    difficulty: 'Medium',
    question: 'A product manager requests a complex feature that requires modifying database schemas 3 days before a scheduled release. How do you respond?',
    related_skills: ['Communication', 'PostgreSQL'],
    skill_status: 'strong',
    why_note: 'Evaluates risk evaluation, scope negotiation, and trade-off articulation.',
    concept: 'Balancing product agility with production database migration stability.',
    explanation: 'Explain migration risks clearly, offer an incremental non-breaking milestone, or schedule the migration for the next iteration.',
    connect_project: 'Cite breaking down user metadata schema changes into multi-phase backwards-compatible updates.',
    likely_followup: 'What zero-downtime migration patterns do you employ when altering large tables?',
    expected_rubric: [
      'Empathetic understanding of product urgency',
      'Objective explanation of migration hazards and rollback complexity',
      'Proposing a phased compromise or minimal viable alternative',
      'Maintaining calm, constructive cross-functional dialogue'
    ],
  },
  {
    id: 'q12',
    category: 'HR & culture',
    difficulty: 'Easy',
    question: 'What engineering culture attributes allow you to do your best work, and how do you support your peers?',
    related_skills: ['Mentorship', 'Code Quality'],
    skill_status: 'strong',
    why_note: 'Cultural alignment and team dynamic contribution.',
    concept: 'Psychological safety, automated test rigor, and empathetic code reviews.',
    explanation: 'Highlight blameless retrospectives, clear ownership, thorough documentation, and helping junior teammates grow through patient feedback.',
    connect_project: 'Mention creating onboarding documentation and running weekly pair programming sessions.',
    likely_followup: 'How do you deliver constructive feedback when an engineer submits poorly tested code?',
    expected_rubric: [
      'Emphasis on psychological safety and team trust',
      'Constructive and supportive peer code review practices',
      'Valuing clear documentation and living architectural records',
      'Active commitment to knowledge sharing'
    ],
  },
  {
    id: 'q13',
    category: 'HR & culture',
    difficulty: 'Easy',
    question: 'Why are you specifically interested in this role and company, and what impact do you hope to make in your first 90 days?',
    related_skills: ['Career Goals'],
    skill_status: 'strong',
    why_note: 'Assesses research, motivation, and practical 30-60-90 day planning.',
    concept: 'Alignment between candidate trajectory and target engineering mission.',
    explanation: 'Connect your background in scalable web systems directly to the company products, emphasizing listening and shipping in the first 90 days.',
    connect_project: 'Connect your experience building resilient platforms to the company business model.',
    likely_followup: 'What are your criteria for measuring your personal success after your first year?',
    expected_rubric: [
      'Demonstrated understanding of company domain and engineering challenges',
      'First 30 days: Absorbing codebase, tooling, and team norms',
      'Days 31-60: Owning independent feature stories and reviewing code',
      'Days 61-90: Proposing system improvements and driving measurable outcomes'
    ],
  },
];

export const useAppStore = create((set, get) => ({
  // Production Authentication State (Zero Demo Tokens)
  token: localStorage.getItem('interviewace_token') || null,
  user: (() => {
    try {
      const stored = localStorage.getItem('interviewace_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: Boolean(localStorage.getItem('interviewace_token')),

  setAuth: (token, user) => {
    if (token) localStorage.setItem('interviewace_token', token);
    else localStorage.removeItem('interviewace_token');

    if (user) {
      const first_name = user.full_name?.split(' ')[0] || user.name?.split(' ')[0] || 'Candidate';
      const enrichedUser = { ...user, first_name };
      localStorage.setItem('interviewace_user', JSON.stringify(enrichedUser));
      set({ token, user: enrichedUser, isAuthenticated: !!token });
    } else {
      localStorage.removeItem('interviewace_user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem('interviewace_token');
    localStorage.removeItem('interviewace_user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  // Multi-Provider AI Engine State
  activeAIProvider: localStorage.getItem('interviewace_ai_provider') || 'gemini',
  aiProviders: [
    { id: 'gemini', name: 'Google Gemini', default_model: 'gemini-3.8-flash', is_configured: true, is_active: true },
    { id: 'openai', name: 'OpenAI GPT-4o', default_model: 'gpt-4o-mini', is_configured: false, is_active: false },
    { id: 'claude', name: 'Anthropic Claude', default_model: 'claude-3-5-sonnet-20241022', is_configured: false, is_active: false },
    { id: 'groq', name: 'Groq Cloud (Llama 3.3)', default_model: 'llama-3.3-70b-versatile', is_configured: false, is_active: false },
    { id: 'custom', name: 'OmniRoute / Custom Endpoint', default_model: 'auto/best-coding', is_configured: false, is_active: false },
  ],

  setAIProvider: (provider) => {
    localStorage.setItem('interviewace_ai_provider', provider);
    set({ activeAIProvider: provider });
  },
  setAIProviders: (aiProviders) => set({ aiProviders }),

  // Toast System (Spec: black rounded rect, bottom centre, auto-hides after ~2.6s)
  toastMessage: null,
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),

  // Preparation Plan: Resume and Job Description extracted state
  plan: {
    resumeName: '',
    resumeEducation: '',
    resumeSkills: [],
    resumeProjects: '',
    resumeExperience: '',
    jdTitle: '',
    jdCompany: '',
    jdSkills: [],
    jdResponsibilities: '',
  },


  updatePlan: (partial) => {
    set((state) => ({
      plan: { ...state.plan, ...partial },
    }));
  },

  // Question Bank & Bookmarks
  questions: INITIAL_QUESTIONS,
  bookmarkedIds: ['q1', 'q2'],
  drillIds: ['q1'],

  toggleBookmark: (id) => {
    set((state) => {
      const exists = state.bookmarkedIds.includes(id);
      const updated = exists
        ? state.bookmarkedIds.filter((item) => item !== id)
        : [...state.bookmarkedIds, id];
      return { bookmarkedIds: updated };
    });
  },

  toggleDrill: (id) => {
    set((state) => {
      const exists = state.drillIds.includes(id);
      const updated = exists
        ? state.drillIds.filter((item) => item !== id)
        : [...state.drillIds, id];
      return { drillIds: updated };
    });
  },

  // Active Practice Session State
  practiceState: {
    mode: 'Quick practice',
    totalQuestions: 5,
    currentIndex: 0,
    activeQuestion: INITIAL_QUESTIONS[0],
    timeRemaining: 180, // 3:00 countdown in seconds
    isTimeUp: false,
    studentAnswer: '',
    wordCount: 0,
    fillerCount: 0,
    matchedRubricIndices: [],
    hintKeywordsRevealed: false,
    isSpeaking: false,
    evaluations: {},
    sessionSummary: null,
  },

  setPracticeState: (partial) => {
    set((state) => ({
      practiceState: { ...state.practiceState, ...partial },
    }));
  },

  startNewPracticeSession: (mode = 'Quick practice', questionCount = 5) => {
    const questionsList = get().questions.slice(0, questionCount);
    set({
      practiceState: {
        mode,
        totalQuestions: questionsList.length,
        currentIndex: 0,
        activeQuestion: questionsList[0],
        timeRemaining: 180,
        isTimeUp: false,
        studentAnswer: '',
        wordCount: 0,
        fillerCount: 0,
        matchedRubricIndices: [],
        hintKeywordsRevealed: false,
        isSpeaking: false,
        evaluations: {},
        sessionSummary: null,
      },
    });
  },

  // Past Sessions History (User Real History)
  sessionsHistory: (() => {
    try {
      const stored = localStorage.getItem('interviewace_sessions_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),

  setSessionsHistory: (sessions) => {
    const list = Array.isArray(sessions) ? sessions : [];
    try {
      localStorage.setItem('interviewace_sessions_history', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    set({ sessionsHistory: list });
  },

  addSessionToHistory: (session) => {
    set((state) => {
      const updated = [session, ...state.sessionsHistory];
      try {
        localStorage.setItem('interviewace_sessions_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { sessionsHistory: updated };
    });
  },

  toggleArchiveSession: (id) => {
    set((state) => {
      const updated = state.sessionsHistory.map((s) =>
        s.id === id ? { ...s, isArchived: !s.isArchived } : s
      );
      try {
        localStorage.setItem('interviewace_sessions_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { sessionsHistory: updated };
    });
  },

  deletePracticeData: () => {
    try {
      localStorage.removeItem('interviewace_sessions_history');
    } catch (e) {
      console.error(e);
    }
    set({
      sessionsHistory: [],
      drillIds: [],
      bookmarkedIds: [],
    });
  },

  // Settings & Language
  settings: {
    targetRole: '',
    targetCompany: '',
    institution: '',
    degree: '',
    graduationYear: '',
    gpa: '',
    location: '',
    interviewerStyle: 'Supportive coach', // Supportive coach, Strict hiring panel, Stress panel
    fillerSensitivity: 'Standard',
    targetSpeakingPace: 130, // words per minute
    language: 'Indian English', // 11 languages
  },

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },
}));
