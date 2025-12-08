const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Unauthorized to access this route' });
        }
        next();
    };
};

const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  let token;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ msg: 'Authentication Invalid: No token provided' });
  }

  try {

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { 
        userId: payload.id, 
        role: payload.role,
        name : payload.name
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Authentication Invalid: Token verification failed' });
  }
};

module.exports = { authorizePermissions, authenticateUser};