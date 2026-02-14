const jwt = require('jsonwebtoken');

/**
 * Middleware zur JWT-Token-Verifizierung.
 * Extrahiert den Token aus dem Authorization-Header und setzt req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Kein Authentifizierungs-Token vorhanden.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token ist abgelaufen. Bitte erneut einloggen.' });
    }
    return res.status(401).json({ message: 'Ungültiger Token.' });
  }
}

module.exports = verifyToken;
