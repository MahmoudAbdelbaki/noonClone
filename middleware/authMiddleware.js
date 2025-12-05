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
  // 1. Check for the token in the Authorization header
  const authHeader = req.headers.authorization;
  
  // You can also check for cookies if you prefer: const token = req.cookies.token;
  let token;

  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }

  // 2. If no token is present, reject the request
  if (!token) {
    return res.status(401).json({ msg: 'Authentication Invalid: No token provided' });
  }

  try {
    // 3. Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user info to the request object
    // Note: We map 'id' from the token to 'userId' for consistency in controllers
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