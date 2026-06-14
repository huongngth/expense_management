const getHeaders = (url: string, skipAuth = false) => {
  const token = localStorage.getItem('token');
  const authSkipped = skipAuth || url === '/api/auth/login' || url === '/api/auth/register';
  return {
    'Content-Type': 'application/json',
    ...(!authSkipped && token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async get(url: string, options: { skipAuth?: boolean } = {}) {
    const res = await fetch(url, { headers: getHeaders(url, options.skipAuth) });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API request failed');
    }
    return res.json();
  },

  async post(url: string, data: any, options: { skipAuth?: boolean } = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(url, options.skipAuth),
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API request failed');
    }
    return res.json();
  },

  async put(url: string, data: any, options: { skipAuth?: boolean } = {}) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(url, options.skipAuth),
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API request failed');
    }
    return res.json();
  },

  async delete(url: string, options: { skipAuth?: boolean } = {}) {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(url, options.skipAuth),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API request failed');
    }
    return res.json();
  },
};
