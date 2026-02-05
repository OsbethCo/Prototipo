const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  let token = null;


  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
