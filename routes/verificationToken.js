const jwt = require('jsonwebtoken');

const verificationToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no provisto.' });
  }
  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado; 
    next(); 
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = verificationToken;