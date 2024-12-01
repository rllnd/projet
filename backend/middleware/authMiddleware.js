const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Vérifiez si l'utilisateur est un administrateur
      const admin = await Admin.findByPk(decoded.id);
      if (admin) {
        req.user = { id: admin.id, role: admin.role, isAdmin: true };
        return next();
      }

      // Vérifiez si c'est un utilisateur standard
      const user = await User.findByPk(decoded.id);
      if (user) {
        req.user = { id: user.id, role: user.role, isAdmin: false };
        return next();
      }

      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
      console.error("Erreur de vérification du token :", error);
      return res.status(401).json({ message: 'Token invalide' });
    }
  }

  res.status(401).json({ message: 'Aucun token fourni' });
};


module.exports = { protect };
