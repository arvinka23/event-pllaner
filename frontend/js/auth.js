/**
 * Auth UI-Logik: Login, Registrierung, Session-Management.
 */

import { login, register } from './api.js';
import { showToast, showSection, showLoading, hideLoading } from './utils.js';

/**
 * Initialisiert die Auth-Event-Listener.
 * @param {Function} onLoginSuccess - Callback nach erfolgreichem Login
 */
export function initAuth(onLoginSuccess) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterLink = document.getElementById('show-register');
  const cancelRegisterBtn = document.getElementById('cancel-register');
  const logoutBtn = document.getElementById('nav-logout');

  // Login-Formular
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showToast('Bitte alle Felder ausfüllen.', 'error');
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showLoading();

    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(`Willkommen, ${data.user.profileName}!`, 'success');
      loginForm.reset();
      onLoginSuccess(data.user);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      hideLoading();
    }
  });

  // Registrierungs-Formular
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const profileName = document.getElementById('reg-profilename').value.trim();

    if (!username || !email || !password || !profileName) {
      showToast('Bitte alle Felder ausfüllen.', 'error');
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showLoading();

    try {
      await register(username, email, password, profileName);
      showToast('Registrierung erfolgreich! Du kannst dich jetzt einloggen.', 'success');
      registerForm.reset();
      showSection('login-section');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      hideLoading();
    }
  });

  // Navigation: Registrierung anzeigen / abbrechen
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register-section');
  });

  cancelRegisterBtn.addEventListener('click', () => {
    showSection('login-section');
  });

  // Logout
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Token-Ablauf Event
  window.addEventListener('auth:expired', () => {
    showToast('Sitzung abgelaufen. Bitte erneut einloggen.', 'error');
    logout();
  });
}

/**
 * Loggt den Benutzer aus und zeigt den Login-Bereich an.
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.getElementById('navigation').classList.add('hidden');
  showSection('login-section');
  showToast('Erfolgreich ausgeloggt.', 'info');
}

/**
 * Prüft ob der Benutzer eingeloggt ist (Token vorhanden).
 * @returns {{ isLoggedIn: boolean, user: Object|null }}
 */
export function checkSession() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { isLoggedIn: true, user };
    } catch {
      // Ungültige Daten entfernen
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return { isLoggedIn: false, user: null };
}
