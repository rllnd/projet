const User = require('../models/User');
const GTCTransaction = require('../models/GTCTransaction');
const bcrypt = require('bcrypt');
const LoginHistory = require('../models/LoginHistory');
const speakeasy = require('speakeasy');
const { sendTwoFactorAuthCode } = require('../services/emailService'); // Assurez-vous d'avoir cette fonction
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '80d',
    });
  };
// Changer le mot de passe
const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const user = await User.findByPk(req.user.id);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Mot de passe changé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur de changement de mot de passe.', error });
    }
};

// Obtenir les dernières transactions de l'utilisateur
const getRecentTransactions = async (req, res) => {
    try {
        const transactions = await GTCTransaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 6,
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des transactions.', error });
    }
};

// Obtenir l'historique de solde
const getBalanceHistory = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ tokenBalance: user.tokenBalance });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique de solde.', error });
    }
};

// Obtenir le profil utilisateur
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du profil.', error });
    }
};

// Supprimer le compte utilisateur
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        await user.destroy();
        res.json({ message: 'Compte supprimé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur de suppression du compte.', error });
    }
};

// Mettre à jour les préférences de notification
const updateNotificationPreferences = async (req, res) => {
    try {
        const { email, sms } = req.body;
        const user = await User.findByPk(req.user.id);
        user.notificationPreferences = { email, sms };
        await user.save();
        res.json({ message: 'Préférences de notification mises à jour.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur de mise à jour des préférences.', error });
    }
};

// Obtenir l'historique de connexions
const getLoginHistory = async (req, res) => {
    try {
        const loginHistory = await LoginHistory.findAll({
            where: { userId: req.user.id },
            order: [['loginTime', 'DESC']],
        });
        res.json(loginHistory);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique des connexions.', error });
    }
};

// Activer la vérification en deux étapes
const enableTwoFactorAuth = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user.twoFactorAuthEnabled) {
            return res.status(400).json({ message: 'La vérification en deux étapes est déjà activée.' });
        }
        const secret = speakeasy.generateSecret({ length: 20 });
        user.twoFactorSecret = secret.base32;
        user.twoFactorAuthEnabled = true;
        await user.save();

        // Envoyer le code de vérification par email
        await sendTwoFactorAuthCode(user.email, secret.base32); // Assurez-vous d'envoyer le secret

        res.json({ message: 'Vérification en deux étapes activée.', secret: secret.base32 });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'activation de la 2FA.', error });
    }
};

// Vérifier le code 2FA
const verifyTwoFactorAuth = async (req, res) => {
    const { code } = req.body;
    console.log('Code reçu pour vérification :', code); // Ajoutez cette ligne pour déboguer

    try {
        const user = await User.findByPk(req.user.id);
        console.log('Secret de l\'utilisateur :', user.twoFactorSecret);

       
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code, // Ceci doit être le code envoyé par l'utilisateur
            window: 4, // Permet de tolérer quelques secondes de décalage
        });

        if (verified) {
            const authToken = generateToken(user.id);
            return res.json({ 
                message: 'Code vérifié avec succès.', 
                token: authToken,
                role: user.role // Ajoutez le rôle ici
            });
        } else {
            return res.status(400).json({ message: 'Code invalide.' });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du code :', error); // Ajoutez cette ligne pour déboguer
        res.status(500).json({ message: 'Erreur lors de la vérification du code.', error });
    }
};

// Mettre à jour l'authentification à deux facteurs
const updateTwoFactorAuth = async (req, res) => {
    try {
        const { enabled } = req.body;
        const user = await User.findByPk(req.user.id);

        if (enabled) {
            if (!user.twoFactorSecret) {
                const secret = speakeasy.generateSecret({ length: 20 });
                user.twoFactorSecret = secret.base32; // Stocke le secret
            }
            user.twoFactorAuthEnabled = true;
            await user.save();
            return res.json({ 
                message: 'Vérification en deux étapes activée.',
                secret: user.twoFactorSecret 
            });
        } else {
            user.twoFactorAuthEnabled = false;
            user.twoFactorSecret = null; // Supprimer le secret
            await user.save();
            return res.json({ message: 'Vérification en deux étapes désactivée.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la vérification en deux étapes.', error });
    }
};

// Envoyer le code de vérification par email
const sendVerificationCode = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const code = speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' });

        // Envoyer le code par email
        await sendTwoFactorAuthCode(user.email, code); // Assurez-vous d'avoir cette fonction

        res.json({ message: 'Code de vérification envoyé.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi du code de vérification.', error });
    }
};

// Exporter toutes les fonctions
module.exports = {
    changePassword,
    getRecentTransactions,
    getBalanceHistory,
    getProfile,
    deleteAccount,
    updateNotificationPreferences,
    getLoginHistory,
    enableTwoFactorAuth,
    verifyTwoFactorAuth,
    updateTwoFactorAuth,
    sendVerificationCode, // Ajouter cette ligne pour l'exportation
};