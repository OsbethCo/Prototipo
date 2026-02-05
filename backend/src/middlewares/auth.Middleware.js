const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  let token = null;


  if (req.headers.authorization) {

    const parts = req.headers.authorization.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }

  }

  if (!token && req.query.token) {

    token = req.query.token;

  }


  if (!token) {

    return res.status(401).json({
      message: 'Acceso denegado: Token requerido'
    });

  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  }
  catch (error) {

    return res.status(401).json({
      message: 'Token inválido'
    });

  }

};
