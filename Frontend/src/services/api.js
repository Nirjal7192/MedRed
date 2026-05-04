/**
 * Centralized API service for MedRed
 * All requests use credentials: 'include' so the httpOnly JWT cookie is sent.
 * The Vite dev proxy forwards /api/* to http://localhost:8000
 */

const BASE = 'https://medred.leapcell.app/api';

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
