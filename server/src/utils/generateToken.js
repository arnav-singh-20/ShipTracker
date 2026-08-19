const jwt = require('jsonwebtoken');

// Signs a JWT containing just the user's id and role.
// Keeping the payload minimal (no email/name) means the token stays small
// and we never leak more than necessary if it's ever decoded client-side.
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
