const jwt = require('jsonwebtoken');
const SECRET = 'biblioteca_secret';

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'Acceso denegado' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ msg: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
