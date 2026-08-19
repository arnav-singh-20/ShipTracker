const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect: verifies the JWT on incoming requests and attaches the
// authenticated user to req.user so downstream controllers can use it
// (e.g. to scope a "customer" to only their own shipments).
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch the user rather than trusting the token payload wholesale.
    // This ensures a deleted/deactivated user is rejected immediately
    // instead of being trusted until their token naturally expires.
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

// authorize: role-based gate, used AFTER protect.
// Usage: router.put('/:id', protect, authorize('admin'), controllerFn)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not permitted to perform this action`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
