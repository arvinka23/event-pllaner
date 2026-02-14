/**
 * Hilfsfunktionen: XSS-Schutz, Toast-Benachrichtigungen, Formatierung, Loading.
 */

// ─── XSS-Prävention ─────────────────────────────────────────────

/**
 * Escaped HTML-Sonderzeichen um XSS-Angriffe zu verhindern.
 * @param {string} str - Der zu escapende String
 * @returns {string} Der escapte String
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Toast-Benachrichtigungen ────────────────────────────────────

/**
 * Zeigt eine Toast-Benachrichtigung an.
 * @param {string} message - Die Nachricht
 * @param {'success'|'error'|'info'} type - Der Typ der Benachrichtigung
 * @param {number} duration - Dauer in Millisekunden (Standard: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ─── Datum-Formatierung ──────────────────────────────────────────

/**
 * Formatiert ein ISO-Datum in ein lesbares deutsches Format.
 * @param {string} dateStr - ISO 8601 Datum-String
 * @returns {string} Formatiertes Datum
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'Kein Datum';
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ─── Loading-Anzeige ─────────────────────────────────────────────

/**
 * Zeigt den Loading-Spinner an.
 */
export function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
}

/**
 * Versteckt den Loading-Spinner.
 */
export function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

// ─── Section-Wechsel ─────────────────────────────────────────────

/**
 * Zeigt eine bestimmte Section und versteckt alle anderen.
 * @param {string} sectionId - Die ID der anzuzeigenden Section
 */
export function showSection(sectionId) {
  const sections = ['login-section', 'register-section', 'events-section'];
  sections.forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}
