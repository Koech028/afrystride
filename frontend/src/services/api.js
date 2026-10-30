const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('adminToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(error.detail || 'Request failed', response.status);
  }

  // Handle empty responses (e.g. 204 No Content from DELETE)
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Products
export const productApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/products?${query}`);
  },
  getById: (id) => fetchWithAuth(`/products/${id}`),
  getBySlug: (slug) => fetchWithAuth(`/products/slug/${slug}`),
  getFeatured: (limit = 8) => fetchWithAuth(`/products/featured?limit=${limit}`),
  getCategories: () => fetchWithAuth(`/products/categories`),
  create: (data) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }),
};

// Categories
export const categoryApi = {
  list: () => fetchWithAuth('/categories'),
  create: (data) => fetchWithAuth('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchWithAuth(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchWithAuth(`/categories/${id}`, { method: 'DELETE' }),
};

// Admin
export const adminApi = {
  login: (email, password) => fetchWithAuth('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  me: () => fetchWithAuth('/admin/me'),
  changePassword: (current, newPass) => fetchWithAuth('/admin/password', {
    method: 'PUT',
    body: JSON.stringify({ current_password: current, new_password: newPass }),
  }),
  getStats: () => fetchWithAuth('/admin/dashboard/stats'),
};

// Image upload
export const uploadApi = {
  uploadImage: async (file) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new ApiError(error.detail || 'Upload failed', response.status);
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },
};

// Contact
export const contactApi = {
  submit: (data) => fetchWithAuth('/contact', { method: 'POST', body: JSON.stringify(data) }),
  getMessages: () => fetchWithAuth('/contact/messages'),
  markRead: (id) => fetchWithAuth(`/contact/messages/${id}/read`, { method: 'PUT' }),
  deleteMessage: (id) => fetchWithAuth(`/contact/messages/${id}`, { method: 'DELETE' }),
};

export { ApiError };