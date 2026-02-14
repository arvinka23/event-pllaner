/**
 * API-Schicht: Alle Kommunikation mit dem Backend.
 * Einzige Quelle für API-Aufrufe (kein doppelter Code).
 */

const API_URL = '/api';

/**
 * Generische Request-Funktion mit automatischer Token-Verwaltung.
 * @param {string} endpoint - API-Endpunkt (z.B. '/auth/login')
 * @param {Object} options - Fetch-Optionen
 * @returns {Promise<Object>} Die JSON-Antwort
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  // Headers nicht doppelt überschreiben
  delete config.headers;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Bei 401 (Token abgelaufen) automatisch ausloggen
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Event auslösen damit die App reagieren kann
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.errors?.join(', ') || 'Ein Fehler ist aufgetreten.';
    throw new Error(errorMessage);
  }

  return response.json();
}

// ─── Auth API ────────────────────────────────────────────────────

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export async function register(username, email, password, profileName) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, profileName })
  });
}

// ─── Events API ──────────────────────────────────────────────────

export async function getEvents() {
  return request('/events');
}

export async function createEvent(eventData) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}

export async function updateEvent(id, eventData) {
  return request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  });
}

export async function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE'
  });
}
