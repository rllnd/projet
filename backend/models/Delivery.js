const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Auction = require("./Auction");

const Delivery = sequelize.define("Delivery", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Auction,
      key: "id",
    },
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "shipped", "delivered", "canceled"),
    defaultValue: "pending", // Par défaut, en attente d’expédition
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Ajout d'un numéro de suivi après expédition
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false, // Adresse de livraison fournie par l’acheteur
  },
  addressConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // ❌ L'acheteur doit confirmer son adresse avant l'expédition
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: true, // Date de confirmation de réception
  },
  codeUnique: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => Math.random().toString(36).substr(2, 8), // Génère un code secret pour confirmation
  },
  createdAt: {  // ✅ Ajout de createdAt
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // ✅ Définir automatiquement la date
  },
  updatedAt: {  // ✅ Ajout de updatedAt pour les mises à jour
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});
Delivery.associate = (models) => {
  Delivery.belongsTo(models.User, { foreignKey: "buyerId", as: "buyer" });
  Delivery.belongsTo(models.User, { foreignKey: "sellerId", as: "seller" });
  Delivery.belongsTo(models.Auction, { foreignKey: "auctionId", as: "auction" });
};


// Définir les relations dans associations.js
module.exports = Delivery;
