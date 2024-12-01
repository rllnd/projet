// middleware/adminMiddleware.js
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
      next(); // L'utilisateur est un administrateur, continuer
    } else {
      res.status(403).json({ message: 'Accès refusé : réservé aux administrateurs' });
    }
  };
  
  module.exports = { admin };

