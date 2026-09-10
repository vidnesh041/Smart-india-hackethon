import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

export default api;
