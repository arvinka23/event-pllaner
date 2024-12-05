const jwt = require('json-web-token');

const SECRET_KEY = 'eventplaner2024';

function verifyToken(req, res, next) {
  // Bestimmte Routen ausschließen
  const publicPaths = ['/users', '/users/login'];
  if (publicPaths.includes(req.path) && req.method === 'POST') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Keine Autorisierung' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Ungültiger Token' });
  }
}

module.exports = verifyToken;