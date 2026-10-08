import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

/**
 * Fetch paginated government schemes with optional server-side search/filters.
 * @param {object} params - { page, limit, search, category, state, min_cost, max_cost, sort_by }
 * @returns {Promise<{total, page, limit, total_pages, schemes}>}
 */
export const fetchSchemes = async ({
  page = 1,
  limit = 12,
  search = '',
  category = '',
  state = '',
  min_cost = null,
  max_cost = null,
  sort_by = '',
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;
  if (state && state !== 'All') params.state = state;
  if (min_cost !== null && min_cost !== undefined) params.min_cost = min_cost;
  if (max_cost !== null && max_cost !== undefined) params.max_cost = max_cost;
  if (sort_by) params.sort_by = sort_by;

  const response = await api.get('/schemes', { params });
  const d = response.data;
  if (Array.isArray(d)) {
    return {
      total: d.length,
      page: page || 1,
      limit: limit || 12,
      total_pages: Math.max(1, Math.ceil(d.length / (limit || 12))),
      schemes: d,
    };
  }
  return {
    total: d?.total ?? 0,
    page: d?.page ?? 1,
    limit: d?.limit ?? 12,
    total_pages: d?.total_pages ?? 1,
    schemes: Array.isArray(d?.schemes) ? d.schemes : [],
  };
};

export const fetchSchemeFilters = async () => {
  try {
    const response = await api.get('/schemes/filters');
    return response.data;
  } catch (e) {
    return { states: ['Central / All India'], categories: [], total_active_schemes: 2705 };
  }
};

export const fetchSchemeById = async (id) => {
  const response = await api.get(`/schemes/${id}`);
  return response.data;
};

export const submitAdvisoryRequest = async (payload) => {
  const response = await api.post('/advisory', payload);
  return response.data;
};

/**
 * Module 2: Financial Roadmap Generator API (/api/financial-plan)
 * Calculates project cost upward from Available Margin Capital (10%).
 */
export const getFinancialPlan = async ({ available_margin_capital, location = '', business_category = '' }) => {
  const response = await api.post('/financial-plan', {
    available_margin_capital: parseFloat(available_margin_capital),
    location,
    business_category
  });
  return response.data;
};

/**
 * Module 1: Hyper-Local Feasibility Report API (/api/feasibility-report)
 * Generates 6 grounded feasibility sub-sections with SWOT grid.
 */
export const getFeasibilityReport = async ({ location, business_category, project_cost }) => {
  const response = await api.post('/feasibility-report', {
    location,
    business_category,
    project_cost: parseFloat(project_cost)
  });
  return response.data;
};

/**
 * Gemini AI Chatbot Engine API (/api/chat)
 * Multi-turn conversational AI advisor ("Local Advisor").
 */
export const sendChatMessage = async ({
  message,
  chat_history = [],
  available_margin_capital = null,
  location = null,
  business_category = null,
  language = 'Hindi'
}) => {
  const payload = {
    message,
    chat_history,
    available_margin_capital: available_margin_capital ? parseFloat(available_margin_capital) : null,
    location,
    business_category,
    language
  };
  const response = await api.post('/chat', payload);
  return response.data;
};

/**
 * Text-to-Speech Audio Stream API (/api/tts)
 * Returns a playable audio Blob URL for any Indian regional language.
 */
export const fetchAudioTTS = async ({ text, language = 'English' }) => {
  const response = await api.post(
    '/tts',
    { text, language },
    { responseType: 'blob' }
  );
  return URL.createObjectURL(response.data);
};

export default api;
