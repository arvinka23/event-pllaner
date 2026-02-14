const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

/**
 * Liest die gesamte Datenbank aus der JSON-Datei.
 * @returns {Promise<{users: Array, events: Array}>}
 */
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    // Falls die Datei nicht existiert, Standardstruktur zurückgeben
    if (err.code === 'ENOENT') {
      const defaultDB = { users: [], events: [] };
      await writeDB(defaultDB);
      return defaultDB;
    }
    throw err;
  }
}

/**
 * Schreibt die gesamte Datenbank in die JSON-Datei (atomic write).
 * @param {Object} data - Die Datenbank-Daten
 */
async function writeDB(data) {
  const tempPath = DB_PATH + '.tmp';
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, DB_PATH);
}

/**
 * Generiert eine neue einzigartige ID basierend auf existierenden Einträgen.
 * @param {Array} items - Existierende Einträge
 * @returns {string} Neue ID
 */
function generateId(items) {
  if (items.length === 0) return '1';
  const maxId = Math.max(...items.map(item => parseInt(item.id, 10) || 0));
  return String(maxId + 1);
}

// ─── User-Funktionen ────────────────────────────────────────────

async function getUsers() {
  const db = await readDB();
  return db.users;
}

async function getUserByUsername(username) {
  const users = await getUsers();
  return users.find(u => u.username === username) || null;
}

async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

async function addUser(userData) {
  const db = await readDB();
  const newUser = {
    id: generateId(db.users),
    ...userData,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  await writeDB(db);
  return newUser;
}

// ─── Event-Funktionen ───────────────────────────────────────────

async function getEventsByUserId(userId) {
  const db = await readDB();
  return db.events.filter(e => e.userId === userId);
}

async function getEventById(id) {
  const db = await readDB();
  return db.events.find(e => e.id === id) || null;
}

async function addEvent(eventData) {
  const db = await readDB();
  const newEvent = {
    id: generateId(db.events),
    ...eventData,
    createdAt: new Date().toISOString()
  };
  db.events.push(newEvent);
  await writeDB(db);
  return newEvent;
}

async function updateEvent(id, updatedData) {
  const db = await readDB();
  const index = db.events.findIndex(e => e.id === id);
  if (index === -1) return null;

  db.events[index] = {
    ...db.events[index],
    ...updatedData,
    id, // ID darf nicht überschrieben werden
    updatedAt: new Date().toISOString()
  };
  await writeDB(db);
  return db.events[index];
}

async function deleteEvent(id) {
  const db = await readDB();
  const index = db.events.findIndex(e => e.id === id);
  if (index === -1) return false;

  db.events.splice(index, 1);
  await writeDB(db);
  return true;
}

module.exports = {
  readDB,
  writeDB,
  getUsers,
  getUserByUsername,
  getUserById,
  addUser,
  getEventsByUserId,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent
};
