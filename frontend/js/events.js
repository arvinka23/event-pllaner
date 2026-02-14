/**
 * Event CRUD UI-Logik: Events anzeigen, erstellen, bearbeiten, löschen.
 */

import { getEvents, createEvent, updateEvent, deleteEvent } from './api.js';
import { escapeHtml, formatDate, showToast, showLoading, hideLoading } from './utils.js';

let currentEditId = null;

/**
 * Initialisiert die Event-Verwaltung und Event-Listener.
 */
export function initEvents() {
  const addEventBtn = document.getElementById('btn-add-event');
  const navAddEvent = document.getElementById('nav-add-event');
  const cancelModalBtn = document.getElementById('cancel-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const eventForm = document.getElementById('event-form');

  // Modal öffnen: Neues Event
  addEventBtn.addEventListener('click', () => openModal());
  navAddEvent.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  // Modal schliessen
  cancelModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Tastatur: Escape schliesst Modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Event-Formular absenden
  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
      title: document.getElementById('event-title').value.trim(),
      description: document.getElementById('event-description').value.trim(),
      date: document.getElementById('event-date').value,
      location: document.getElementById('event-location').value.trim(),
      category: document.getElementById('event-category').value
    };

    if (!eventData.title || !eventData.date) {
      showToast('Titel und Datum sind erforderlich.', 'error');
      return;
    }

    const submitBtn = eventForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      if (currentEditId) {
        await updateEvent(currentEditId, eventData);
        showToast('Event erfolgreich aktualisiert.', 'success');
      } else {
        await createEvent(eventData);
        showToast('Event erfolgreich erstellt.', 'success');
      }
      closeModal();
      await loadAndRenderEvents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/**
 * Lädt die Events vom Server und rendert sie.
 */
export async function loadAndRenderEvents() {
  showLoading();

  try {
    const events = await getEvents();
    renderEvents(events);
  } catch (err) {
    showToast('Fehler beim Laden der Events: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Rendert die Event-Liste im DOM (mit XSS-Schutz).
 * @param {Array} events - Die Event-Daten
 */
function renderEvents(events) {
  const eventList = document.getElementById('event-list');
  const emptyState = document.getElementById('events-empty');

  eventList.innerHTML = '';

  if (events.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Events nach Datum sortieren (nächstes zuerst)
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach(event => {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('data-category', event.category || 'Sonstiges');

    card.innerHTML = `
      <span class="event-category">${escapeHtml(event.category || 'Sonstiges')}</span>
      <h3>${escapeHtml(event.title)}</h3>
      ${event.description ? `<p class="event-description">${escapeHtml(event.description)}</p>` : ''}
      <p class="event-meta">
        <span>&#128197;</span> ${escapeHtml(formatDate(event.date))}
      </p>
      ${event.location ? `<p class="event-meta"><span>&#128205;</span> ${escapeHtml(event.location)}</p>` : ''}
      <div class="event-actions">
        <button class="btn btn-secondary btn-sm btn-edit" data-id="${escapeHtml(event.id)}">Bearbeiten</button>
        <button class="btn btn-danger btn-sm btn-delete" data-id="${escapeHtml(event.id)}">Löschen</button>
      </div>
    `;

    // Event-Listener für Bearbeiten und Löschen
    card.querySelector('.btn-edit').addEventListener('click', () => openEditModal(event));
    card.querySelector('.btn-delete').addEventListener('click', () => confirmDelete(event.id, event.title));

    eventList.appendChild(card);
  });
}

/**
 * Öffnet das Modal zum Erstellen eines neuen Events.
 */
function openModal() {
  currentEditId = null;
  document.getElementById('modal-title').textContent = 'Neues Event erstellen';
  document.getElementById('event-form').reset();
  document.getElementById('event-id').value = '';
  document.getElementById('event-modal').classList.remove('hidden');
  document.getElementById('event-title').focus();
}

/**
 * Öffnet das Modal zum Bearbeiten eines bestehenden Events.
 * @param {Object} event - Das Event-Objekt
 */
function openEditModal(event) {
  currentEditId = event.id;
  document.getElementById('modal-title').textContent = 'Event bearbeiten';
  document.getElementById('event-id').value = event.id;
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-description').value = event.description || '';
  document.getElementById('event-date').value = event.date ? event.date.slice(0, 16) : '';
  document.getElementById('event-location').value = event.location || '';
  document.getElementById('event-category').value = event.category || 'Sonstiges';
  document.getElementById('event-modal').classList.remove('hidden');
  document.getElementById('event-title').focus();
}

/**
 * Schliesst das Modal.
 */
function closeModal() {
  document.getElementById('event-modal').classList.add('hidden');
  currentEditId = null;
}

/**
 * Zeigt eine Lösch-Bestätigung und löscht das Event bei Bestätigung.
 * @param {string} id - Die Event-ID
 * @param {string} title - Der Event-Titel (für die Bestätigung)
 */
async function confirmDelete(id, title) {
  if (!confirm(`Möchtest du "${title}" wirklich löschen?`)) return;

  showLoading();

  try {
    await deleteEvent(id);
    showToast('Event erfolgreich gelöscht.', 'success');
    await loadAndRenderEvents();
  } catch (err) {
    showToast('Fehler beim Löschen: ' + err.message, 'error');
  } finally {
    hideLoading();
  }
}
