/**
 * App Entry Point: Initialisiert Module und verwaltet den App-Zustand.
 */

import { initAuth, checkSession } from './auth.js';
import { initEvents, loadAndRenderEvents } from './events.js';
import { showSection } from './utils.js';

/**
 * Wird aufgerufen wenn der Benutzer sich einloggt.
 * Zeigt die Event-Section und lädt die Events.
 * @param {Object} user - Der eingeloggte Benutzer
 */
function onLoginSuccess(user) {
  showNavigation(user);
  showSection('events-section');
  loadAndRenderEvents();
}

/**
 * Zeigt die Navigation mit dem Benutzernamen an.
 * @param {Object} user - Der Benutzer
 */
function showNavigation(user) {
  const nav = document.getElementById('navigation');
  const welcomeText = document.getElementById('welcome-text');
  nav.classList.remove('hidden');
  welcomeText.textContent = `Hallo, ${user.profileName || user.username}!`;
}

/**
 * App-Initialisierung beim Laden der Seite.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Module initialisieren
  initAuth(onLoginSuccess);
  initEvents();

  // Nav-Link: Meine Events
  document.getElementById('nav-events').addEventListener('click', (e) => {
    e.preventDefault();
    loadAndRenderEvents();
  });

  // Session prüfen
  const { isLoggedIn, user } = checkSession();

  if (isLoggedIn) {
    showNavigation(user);
    showSection('events-section');
    loadAndRenderEvents();
  } else {
    showSection('login-section');
  }
});
