const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');

// Umgebungsvariablen setzen bevor die App importiert wird
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

const app = require('../backend/server');

const DB_PATH = path.join(__dirname, '..', 'backend', 'data', 'db.json');

let authToken = '';
let userId = '';

// Vor jedem Test: DB zurücksetzen, Benutzer registrieren und einloggen
beforeEach(async () => {
  await fs.writeFile(DB_PATH, JSON.stringify({ users: [], events: [] }, null, 2));

  // Testbenutzer registrieren
  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'eventuser',
      email: 'event@example.com',
      password: 'event123456',
      profileName: 'Event User'
    });

  // Einloggen und Token erhalten
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'eventuser',
      password: 'event123456'
    });

  authToken = loginRes.body.token;
  userId = loginRes.body.user.id;
});

afterAll(async () => {
  await fs.writeFile(DB_PATH, JSON.stringify({ users: [], events: [] }, null, 2));
});

describe('POST /api/events', () => {
  it('sollte ein neues Event erfolgreich erstellen', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Geburtstag',
        description: 'Meine Feier',
        date: '2025-06-15T18:00:00.000Z',
        location: 'Zuhause',
        category: 'Privat'
      });

    expect(res.status).toBe(201);
    expect(res.body.event.title).toBe('Geburtstag');
    expect(res.body.event.userId).toBe(userId);
    expect(res.body.event).toHaveProperty('id');
  });

  it('sollte einen Fehler ohne Authentifizierung zurückgeben', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'Geburtstag',
        date: '2025-06-15T18:00:00.000Z'
      });

    expect(res.status).toBe(401);
  });

  it('sollte einen Validierungsfehler bei fehlendem Titel zurückgeben', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        date: '2025-06-15T18:00:00.000Z'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Validierungsfehler');
  });

  it('sollte einen Validierungsfehler bei ungültigem Datum zurückgeben', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Event',
        date: 'kein-datum'
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/events', () => {
  it('sollte alle Events des eingeloggten Benutzers zurückgeben', async () => {
    // Zwei Events erstellen
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Event 1',
        date: '2025-06-15T18:00:00.000Z',
        category: 'Privat'
      });

    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Event 2',
        date: '2025-07-20T10:00:00.000Z',
        category: 'Arbeit'
      });

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Event 1');
    expect(res.body[1].title).toBe('Event 2');
  });

  it('sollte ein leeres Array zurückgeben wenn keine Events vorhanden sind', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('sollte keine Events eines anderen Benutzers anzeigen', async () => {
    // Event für ersten Benutzer erstellen
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Privates Event',
        date: '2025-06-15T18:00:00.000Z',
        category: 'Privat'
      });

    // Zweiten Benutzer erstellen und einloggen
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'other123456',
        profileName: 'Other User'
      });

    const otherLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'otheruser',
        password: 'other123456'
      });

    // Events des zweiten Benutzers abfragen
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${otherLogin.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0); // Kein Event vom anderen Benutzer
  });
});

describe('PUT /api/events/:id', () => {
  let eventId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Original Event',
        description: 'Original Beschreibung',
        date: '2025-06-15T18:00:00.000Z',
        location: 'Original Ort',
        category: 'Privat'
      });
    eventId = createRes.body.event.id;
  });

  it('sollte ein Event erfolgreich aktualisieren', async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Aktualisiertes Event',
        description: 'Neue Beschreibung',
        date: '2025-07-20T20:00:00.000Z',
        location: 'Neuer Ort',
        category: 'Arbeit'
      });

    expect(res.status).toBe(200);
    expect(res.body.event.title).toBe('Aktualisiertes Event');
    expect(res.body.event.location).toBe('Neuer Ort');
    expect(res.body.event.category).toBe('Arbeit');
  });

  it('sollte 404 bei nicht existierendem Event zurückgeben', async () => {
    const res = await request(app)
      .put('/api/events/99999')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Update',
        date: '2025-07-20T20:00:00.000Z'
      });

    expect(res.status).toBe(404);
  });

  it('sollte 403 bei fremdem Event zurückgeben', async () => {
    // Zweiten Benutzer erstellen und einloggen
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'hacker',
        email: 'hacker@example.com',
        password: 'hacker123456',
        profileName: 'Hacker'
      });

    const hackerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'hacker',
        password: 'hacker123456'
      });

    // Versuchen das Event des ersten Benutzers zu bearbeiten
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${hackerLogin.body.token}`)
      .send({
        title: 'Gehackt!',
        date: '2025-07-20T20:00:00.000Z'
      });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/events/:id', () => {
  let eventId;

  beforeEach(async () => {
    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Zu löschen',
        date: '2025-06-15T18:00:00.000Z',
        category: 'Sonstiges'
      });
    eventId = createRes.body.event.id;
  });

  it('sollte ein Event erfolgreich löschen', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('gelöscht');

    // Prüfen dass das Event weg ist
    const getRes = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.body).toHaveLength(0);
  });

  it('sollte 404 bei nicht existierendem Event zurückgeben', async () => {
    const res = await request(app)
      .delete('/api/events/99999')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it('sollte 403 bei fremdem Event zurückgeben', async () => {
    // Zweiten Benutzer erstellen und einloggen
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'attacker',
        email: 'attacker@example.com',
        password: 'attacker123456',
        profileName: 'Attacker'
      });

    const attackerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'attacker',
        password: 'attacker123456'
      });

    // Versuchen das Event des ersten Benutzers zu löschen
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${attackerLogin.body.token}`);

    expect(res.status).toBe(403);
  });
});
