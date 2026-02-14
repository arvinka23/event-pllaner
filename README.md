# Event-Planer

Ein moderner Event-Planer mit Benutzer-Authentifizierung und vollständiger CRUD-Funktionalität. Erstelle, bearbeite und verwalte deine persönlichen Events sicher und einfach.

## Features

- **Benutzer-Registrierung & Login** mit sicherer Passwort-Verschlüsselung (bcrypt)
- **JWT-Authentifizierung** für sichere API-Kommunikation
- **Event-Verwaltung** (Erstellen, Anzeigen, Bearbeiten, Löschen)
- **Kategorien** für Events: Privat, Arbeit, Freizeit, Sonstiges
- **Responsives Design** — funktioniert auf Desktop, Tablet und Smartphone
- **Eingabevalidierung** auf Server- und Client-Seite
- **XSS-Schutz** durch HTML-Escaping bei der Ausgabe
- **Toast-Benachrichtigungen** statt störender Alert-Popups

## Tech-Stack

| Bereich    | Technologie                          |
|------------|--------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Backend    | Node.js, Express.js                  |
| Auth       | JSON Web Tokens (JWT), bcrypt        |
| Validierung| express-validator                    |
| Datenbank  | JSON-Datei (db.json)                 |
| Tests      | Jest, Supertest                      |

## Projektstruktur

```
event-planner/
├── backend/
│   ├── server.js              # Express-Server (Entry Point)
│   ├── routes/
│   │   ├── auth.js            # Login / Register Routen
│   │   └── events.js          # Event CRUD Routen
│   ├── middleware/
│   │   └── auth.js            # JWT-Verifizierung
│   ├── models/
│   │   └── db.js              # JSON-Datenbank Logik
│   └── data/
│       └── db.json            # Datenspeicher
├── frontend/
│   ├── index.html             # Haupt-HTML
│   ├── css/
│   │   └── styles.css         # Stylesheet
│   └── js/
│       ├── app.js             # Entry Point
│       ├── api.js             # API-Aufrufe
│       ├── auth.js            # Auth UI-Logik
│       ├── events.js          # Event UI-Logik
│       └── utils.js           # Hilfsfunktionen
├── tests/
│   ├── auth.test.js           # Auth-Tests
│   └── events.test.js         # Event-Tests
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Installation

### Voraussetzungen

- [Node.js](https://nodejs.org/) (Version 18 oder höher)
- npm (wird mit Node.js mitgeliefert)

### Schritte

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd event-planner
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen einrichten:**
   ```bash
   cp .env.example .env
   ```
   Passe die Werte in `.env` an (insbesondere `JWT_SECRET`).

4. **Server starten:**
   ```bash
   # Produktionsmodus
   npm start

   # Entwicklungsmodus (mit Auto-Reload)
   npm run dev
   ```

5. **App öffnen:**
   Besuche [http://localhost:3000](http://localhost:3000) im Browser.

## API-Endpunkte

### Authentifizierung

| Methode | Endpunkt             | Beschreibung              | Auth |
|---------|----------------------|---------------------------|------|
| POST    | `/api/auth/register` | Neuen Benutzer registrieren | Nein |
| POST    | `/api/auth/login`    | Benutzer einloggen          | Nein |

### Events

| Methode | Endpunkt             | Beschreibung              | Auth |
|---------|----------------------|---------------------------|------|
| GET     | `/api/events`        | Alle eigenen Events abrufen | Ja   |
| POST    | `/api/events`        | Neues Event erstellen       | Ja   |
| PUT     | `/api/events/:id`    | Event aktualisieren         | Ja   |
| DELETE  | `/api/events/:id`    | Event löschen               | Ja   |

### Beispiel: Login-Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123456"}'
```

### Beispiel: Event erstellen

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <dein-token>" \
  -d '{
    "title": "Geburtstagsfeier",
    "description": "Meine Feier",
    "date": "2025-06-15T18:00:00.000Z",
    "location": "Zuhause",
    "category": "Privat"
  }'
```

## Tests ausführen

```bash
npm test
```

Die Tests überprüfen:
- **Auth-Tests:** Registrierung (Erfolg, doppelter Username, Validierung), Login (Erfolg, falsche Daten)
- **Event-Tests:** CRUD-Operationen, Autorisierung (fremde Events nicht zugreifbar), Eingabevalidierung

## Sicherheit

- Passwörter werden mit **bcrypt** (10 Salt Rounds) gehasht
- JWT-Secret wird über **Umgebungsvariablen** verwaltet (nicht im Code)
- **express-validator** validiert alle Eingaben serverseitig
- **XSS-Schutz** durch `escapeHtml()` bei DOM-Rendering
- Events sind **benutzerisoliert** — jeder sieht nur seine eigenen Events

## Lizenz

MIT
