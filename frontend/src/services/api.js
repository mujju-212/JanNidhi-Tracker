const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => {
  try {
    return localStorage.getItem('jn_token');
  } catch {
    return null;
  }
};

const buildUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_BASE}${path}`;
};

const request = async (path, options = {}) => {
  const headers = { ...options.headers };
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const apiGet = (path) => request(path);

export const apiPost = (path, body) =>
  request(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });

export const apiPut = (path, body) =>
  request(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });

export const apiPatch = (path, body) =>
  request(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body)
  });

export const apiDelete = (path) =>
  request(path, {
    method: 'DELETE'
  });
