const API_URL = process.env.API_URL || 'http://localhost:3000'; // Umgebung oder Fallback

let currentUser = null; // Aktuell eingeloggter Nutzer

// Funktion zur Validierung und Login
export async function login(username, password) {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
        throw new Error('Serverfehler beim Abrufen der Nutzer.');
    }

    const users = await response.json();
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        throw new Error('Benutzername oder Passwort ist falsch.');
    }

    return {
        token: `mock-token-for-${user.id}`, // Beispiel-Token
        userId: user.id,
        role: user.role,
    };
}

// Benutzer einloggen
function validateLogin() {
    const username = inputUsername.value;
    const password = inputPassword.value;

    login(username, password)
        .then((user) => {
            currentUser = user;
            console.log('Erfolgreich eingeloggt:', user);
            renderHome(); // Weiterleitung zur Startseite
        })
        .catch((error) => {
            console.error(error.message);
            alert('Login fehlgeschlagen: ' + error.message);
        });
}

// Events abrufen
export async function getEvents(userId, token, role) {
    if (!token) {
        throw new Error('Nicht autorisiert.');
    }

    let endpoint = `${API_URL}/events`;
    if (role !== 'Admin') {
        endpoint += `?userId=${userId}`;
    }

    const response = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Events.');
    }

    return response.json();
}

// Event erstellen
export async function createEvent(event, token) {
    if (!token) {
        throw new Error('Nicht autorisiert.');
    }

    const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
    });

    if (!response.ok) {
        throw new Error('Fehler beim Erstellen des Events.');
    }

    return response.json();
}

// Event aktualisieren
export async function updateEvent(eventId, updatedEvent, token) {
    if (!token) {
        throw new Error('Nicht autorisiert.');
    }

    const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEvent),
    });

    if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Events.');
    }

    return response.json();
}

// Event löschen
export async function deleteEvent(eventId, token) {
    if (!token) {
        throw new Error('Nicht autorisiert.');
    }

    const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Fehler beim Löschen des Events.');
    }

    return true;
}

// Beispielaufruf für validateLogin (z. B. bei Button-Klick)
document.getElementById('loginButton').addEventListener('click', validateLogin);
