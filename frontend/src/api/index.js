import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await apiClient.post('/api/v1/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/api/v1/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/api/v1/auth/me');
    return res.data;
  },
};

export const resumeApi = {
  uploadResume: async (formData) => {
    const res = await apiClient.post('/api/v1/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  pasteResume: async (data) => {
    const res = await apiClient.post('/api/v1/resume/paste', data);
    return res.data;
  },
  getResume: async (resumeId) => {
    const res = await apiClient.get(`/api/v1/resume/${resumeId}`);
    return res.data;
  },
};


export const jdApi = {
  pasteJd: async (jdData) => {
    const res = await apiClient.post('/api/v1/jd/paste', jdData);
    return res.data;
  },
  uploadJd: async (formData) => {
    const res = await apiClient.post('/api/v1/jd/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getJd: async (jdId) => {
    const res = await apiClient.get(`/api/v1/jd/${jdId}`);
    return res.data;
  },
};

export const sessionApi = {
  createSession: async (sessionData) => {
    const res = await apiClient.post('/api/v1/session/create', sessionData);
    return res.data;
  },
  getSession: async (sessionId) => {
    const res = await apiClient.get(`/api/v1/session/${sessionId}`);
    return res.data;
  },
  getUserSessions: async () => {
    const res = await apiClient.get('/api/v1/session/user/all');
    return res.data;
  },
};

export const practiceApi = {
  generateQuestions: async (sessionId) => {
    const res = await apiClient.post(`/api/v1/practice/${sessionId}/generate-questions`);
    return res.data;
  },
  submitAnswer: async (sessionId, answerData) => {
    const res = await apiClient.post(`/api/v1/practice/${sessionId}/submit-answer`, answerData);
    return res.data;
  },
  endSession: async (sessionId) => {
    const res = await apiClient.post(`/api/v1/practice/${sessionId}/end-session`);
    return res.data;
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const res = await apiClient.get('/api/v1/analytics/overview');
    return res.data;
  },
  getReadiness: async () => {
    const res = await apiClient.get('/api/v1/analytics/readiness');
    return res.data;
  },
};

export const aiApi = {
  getProviders: async () => {
    const res = await apiClient.get('/api/v1/ai/providers');
    return res.data;
  },
  setActiveProvider: async (provider) => {
    const res = await apiClient.post('/api/v1/ai/active-provider', { provider });
    return res.data;
  },
  testProvider: async (payload) => {
    const res = await apiClient.post('/api/v1/ai/test-provider', payload);
    return res.data;
  },
  getUserConfig: async () => {
    const res = await apiClient.get('/api/v1/ai/user-config');
    return res.data;
  },
  saveUserConfig: async (config) => {
    const res = await apiClient.post('/api/v1/ai/user-config', config);
    return res.data;
  },
};

export const checkHealth = async () => {
  const res = await apiClient.get('/health');
  return res.data;
};

