require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Statische Dateien aus dem Frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── API-Routen ─────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// ─── Fallback: Frontend für alle anderen Routen ─────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Zentraler Error-Handler ────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Server-Fehler:', err.message);
  res.status(500).json({
    message: 'Ein interner Serverfehler ist aufgetreten.',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// ─── Server starten ─────────────────────────────────────────────

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

// Export für Tests
module.exports = app;
