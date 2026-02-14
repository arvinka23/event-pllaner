const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');

// Umgebungsvariablen setzen bevor die App importiert wird
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

const app = require('../backend/server');

const DB_PATH = path.join(__dirname, '..', 'backend', 'data', 'db.json');

// Vor jedem Test die Datenbank zurücksetzen
beforeEach(async () => {
  await fs.writeFile(DB_PATH, JSON.stringify({ users: [], events: [] }, null, 2));
});

// Nach allen Tests die Datenbank aufräumen
afterAll(async () => {
  await fs.writeFile(DB_PATH, JSON.stringify({ users: [], events: [] }, null, 2));
});

describe('POST /api/auth/register', () => {
  it('sollte einen neuen Benutzer erfolgreich registrieren', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123456',
        profileName: 'Test User'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Registrierung erfolgreich.');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user).not.toHaveProperty('password'); // Passwort nicht in der Antwort
  });

  it('sollte einen Fehler bei doppeltem Benutzernamen zurückgeben', async () => {
    // Ersten Benutzer registrieren
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'test123456',
        profileName: 'Test User'
      });

    // Gleichen Benutzernamen erneut versuchen
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'other@example.com',
        password: 'other123456',
        profileName: 'Other User'
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('bereits vergeben');
  });

  it('sollte einen Validierungsfehler bei fehlendem Username zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'test123456',
        profileName: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Validierungsfehler');
  });

  it('sollte einen Validierungsfehler bei zu kurzem Passwort zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        profileName: 'Test User'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Passwort muss mindestens 6 Zeichen lang sein.');
  });

  it('sollte einen Validierungsfehler bei ungültiger E-Mail zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'keine-email',
        password: 'test123456',
        profileName: 'Test User'
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  // Vor jedem Login-Test einen Benutzer registrieren
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'login123456',
        profileName: 'Login User'
      });
  });

  it('sollte einen Benutzer erfolgreich einloggen und Token zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'login123456'
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login erfolgreich.');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe('loginuser');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('sollte einen Fehler bei falschem Passwort zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'falschesPasswort'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('falsch');
  });

  it('sollte einen Fehler bei nicht existierendem Benutzer zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'gibtsnicht',
        password: 'egal123456'
      });

    expect(res.status).toBe(401);
  });

  it('sollte einen Validierungsfehler bei leerem Passwort zurückgeben', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: ''
      });

    expect(res.status).toBe(400);
  });
});
