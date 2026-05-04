/**
 * Centralized API service for MedRed
 * All requests use credentials: 'include' so the httpOnly JWT cookie is sent.
 *
 * In development: requests go to /api/* which Vite proxies to http://localhost:8000
 *   → same-origin from the browser's perspective → httpOnly cookie works perfectly.
 * In production: requests go directly to the deployed backend URL.
 */

const BASE = import.meta.env.DEV
  ? '/api'                                    // ← Vite proxy (localhost dev)
  : 'https://medred-k41q.onrender.com/api';   // ← Production (Render)

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.detail || data.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  register: (firstName, lastName, email, password) =>
    request('POST', '/auth/register', {
      username: `${firstName} ${lastName}`,
      email,
      password,
    }),

  logout: () => request('GET', '/auth/logout'),

  getMe: () => request('GET', '/auth/me'),

  updateUser: (data) => request('PUT', '/auth/updateUser', data),
};

// ── Reminders ─────────────────────────────────────────
export const remindersApi = {
  getAll: () => request('GET', '/reminders/user'),

  add: (medicineName, dosage, time) =>
    request('POST', '/reminders/add', { medicineName, dosage, time }),

  delete: (reminderId) => request('DELETE', `/reminders/delete/${reminderId}`),
};
