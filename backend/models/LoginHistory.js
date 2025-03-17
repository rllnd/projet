const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assurez-vous que le chemin est correct

class LoginHistory extends Model {}

LoginHistory.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Assurez-vous que ce nom correspond à votre modèle User
            key: 'id',
        },
    },
    loginTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'LoginHistory',
});

module.exports = LoginHistory;