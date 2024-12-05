const API_URL = 'http://localhost:3000';
let currentUser = null;

function showSection(sectionId) {
    ['loginSection', 'registerSection', 'eventSection'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

async function login(username, password) {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error('Login fehlgeschlagen');
    }

    const data = await response.json();
    currentUser = data.user;
    localStorage.setItem('token', data.token);
    return data.user;
}

async function register(username, email, password, profileName) {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, profileName })
    });

    if (!response.ok) {
        throw new Error('Registrierung fehlgeschlagen');
    }

    return response.json();
}

// Event-Operationen
async function loadEvents() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events?userId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Events laden fehlgeschlagen');
    }

    const events = await response.json();
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        eventCard.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.description}</p>
            <p>Datum: ${event.date}</p>
            <p>Ort: ${event.location}</p>
            <div class="event-actions">
                <button onclick="editEvent(${event.id})">Bearbeiten</button>
                <button onclick="deleteEvent(${event.id})">Löschen</button>
            </div>
        `;
        eventList.appendChild(eventCard);
    });
}

async function createEvent(eventData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
            ...eventData,
            userId: currentUser.id
        })
    });

    if (!response.ok) {
        throw new Error('Event erstellen fehlgeschlagen');
    }

    await loadEvents();
    document.getElementById('eventModal').style.display = 'none';
}

async function updateEvent(id, eventData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(eventData)
    });

    if (!response.ok) {
        throw new Error('Event aktualisieren fehlgeschlagen');
    }

    await loadEvents();
    document.getElementById('eventModal').style.display = 'none';
}

async function deleteEvent(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Event löschen fehlgeschlagen');
    }

    await loadEvents();
}

// Event Listener
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        await login(username, password);
        showSection('eventSection');
        loadEvents();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const profileName = document.getElementById('regProfileName').value;

    try {
        await register(username, email, password, profileName);
        showSection('loginSection');
        alert('Registrierung erfolgreich!');
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('logout').addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('token');
    showSection('loginSection');
});

document.getElementById('showRegister').addEventListener('click', () => showSection('registerSection'));
document.getElementById('addEvent').addEventListener('click', () => {
    document.getElementById('eventModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Neues Event';
    document.getElementById('eventForm').reset();
});

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        category: document.getElementById('eventCategory').value
    };

    try {
        if (document.getElementById('modalTitle').textContent === 'Neues Event') {
            await createEvent(eventData);
        } else {
            const eventId = document.getElementById('eventForm').dataset.eventId;
            await updateEvent(eventId, eventData);
        }
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('cancelModal').addEventListener('click', () => {
    document.getElementById('eventModal').style.display = 'none';
});

// Globale Funktionen für Inline-Events
window.editEvent = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const event = await response.json();

    document.getElementById('modalTitle').textContent = 'Event bearbeiten';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventCategory').value = event.category;
    document.getElementById('eventForm').dataset.eventId = id;

    document.getElementById('eventModal').style.display = 'block';
};

window.deleteEvent = async (id) => {
    if (confirm('Möchten Sie dieses Event wirklich löschen?')) {
        await deleteEvent(id);
    }
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Token-Validierung 
        showSection('eventSection');
    } else {
        showSection('loginSection');
    }
});