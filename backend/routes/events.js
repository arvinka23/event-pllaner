const express = require('express');
const { body, param, validationResult } = require('express-validator');
const verifyToken = require('../middleware/auth');
const {
  getEventsByUserId,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent
} = require('../models/db');

const router = express.Router();

// Alle Event-Routen erfordern Authentifizierung
router.use(verifyToken);

// ─── Validierungsregeln ─────────────────────────────────────────

const eventValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Titel ist erforderlich (max. 100 Zeichen).'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Beschreibung darf maximal 500 Zeichen lang sein.'),
  body('date')
    .notEmpty()
    .withMessage('Datum ist erforderlich.')
    .isISO8601()
    .withMessage('Ungültiges Datumsformat.'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Ort darf maximal 200 Zeichen lang sein.'),
  body('category')
    .optional()
    .trim()
    .isIn(['Privat', 'Arbeit', 'Freizeit', 'Sonstiges'])
    .withMessage('Kategorie muss Privat, Arbeit, Freizeit oder Sonstiges sein.')
];

// ─── GET /api/events ────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const events = await getEventsByUserId(req.user.id);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/events ───────────────────────────────────────────

router.post('/', eventValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validierungsfehler.',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { title, description, date, location, category } = req.body;

    const newEvent = await addEvent({
      userId: req.user.id,
      title,
      description: description || '',
      date,
      location: location || '',
      category: category || 'Sonstiges'
    });

    res.status(201).json({
      message: 'Event erfolgreich erstellt.',
      event: newEvent
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/events/:id ────────────────────────────────────────

router.put('/:id', eventValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validierungsfehler.',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { id } = req.params;

    // Prüfen ob das Event existiert und dem User gehört
    const existingEvent = await getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event nicht gefunden.' });
    }
    if (existingEvent.userId !== req.user.id) {
      return res.status(403).json({ message: 'Keine Berechtigung dieses Event zu bearbeiten.' });
    }

    const { title, description, date, location, category } = req.body;

    const updatedEvent = await updateEvent(id, {
      title,
      description: description || '',
      date,
      location: location || '',
      category: category || 'Sonstiges'
    });

    res.json({
      message: 'Event erfolgreich aktualisiert.',
      event: updatedEvent
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/events/:id ─────────────────────────────────────

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prüfen ob das Event existiert und dem User gehört
    const existingEvent = await getEventById(id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event nicht gefunden.' });
    }
    if (existingEvent.userId !== req.user.id) {
      return res.status(403).json({ message: 'Keine Berechtigung dieses Event zu löschen.' });
    }

    await deleteEvent(id);

    res.json({ message: 'Event erfolgreich gelöscht.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
