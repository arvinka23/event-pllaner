const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getUserByUsername, addUser } = require('../models/db');

const router = express.Router();

const SALT_ROUNDS = 10;

// ─── Validierungsregeln ─────────────────────────────────────────

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Benutzername muss zwischen 3 und 30 Zeichen lang sein.')
    .isAlphanumeric()
    .withMessage('Benutzername darf nur Buchstaben und Zahlen enthalten.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Bitte eine gültige E-Mail-Adresse eingeben.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Passwort muss mindestens 6 Zeichen lang sein.'),
  body('profileName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Profilname ist erforderlich (max. 50 Zeichen).')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Benutzername ist erforderlich.'),
  body('password')
    .notEmpty()
    .withMessage('Passwort ist erforderlich.')
];

// ─── POST /api/auth/register ────────────────────────────────────

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validierungsfehler.',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { username, email, password, profileName } = req.body;

    // Prüfen ob Benutzername bereits existiert
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Benutzername ist bereits vergeben.' });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Benutzer erstellen
    const newUser = await addUser({
      username,
      email,
      password: hashedPassword,
      profileName
    });

    // Passwort aus der Antwort entfernen
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'Registrierung erfolgreich.',
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────

router.post('/login', loginValidation, async (req, res, next) => {
  try {
    // Validierungsfehler prüfen
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validierungsfehler.',
        errors: errors.array().map(e => e.msg)
      });
    }

    const { username, password } = req.body;

    // Benutzer suchen
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Benutzername oder Passwort ist falsch.' });
    }

    // Passwort überprüfen
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Benutzername oder Passwort ist falsch.' });
    }

    // JWT-Token erstellen
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Passwort aus der Antwort entfernen
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login erfolgreich.',
      token,
      user: userResponse
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
