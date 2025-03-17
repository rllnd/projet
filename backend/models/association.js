const Article = require('./Article');
const Auction = require('./Auction');
const Bid = require('./Bid');
const User = require('./User');
const Notification = require('./Notifications'); // Import du modèle Notification
const GTCTransaction = require('./GTCTransaction'); // Import du modèle GTCTransaction
const ConversionRate = require('./ConversionRate'); // Import du modèle ConversionRate
const Category = require('./Category'); // Import du modèle Category
const LoginHistory = require('./LoginHistory'); // Import du modèle LoginHistory
const AutoBid = require('./autobid'); // Import du modèle AutoBid
const AuditLog = require('./AuditLog');
const Admin = require('./Admin');
const Delivery = require("./Delivery");

const defineAssociations = () => {
 

  // Relation entre Article et Category
  Category.hasMany(Article, { as: 'articles', foreignKey: 'categoryId' });
  Article.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

  // Relation entre Article et User 
  User.hasMany(Article, { as: 'articles', foreignKey: { name: 'sellerId', allowNull: false } });
  Article.belongsTo(User, { as: 'seller', foreignKey: { name: 'sellerId', allowNull: false } });

    // Relation entre Auction et AutoBid
    Auction.hasMany(AutoBid, { as: 'autoBids', foreignKey: 'auctionId' });
    AutoBid.belongsTo(Auction, { as: 'auction', foreignKey: 'auctionId' });

    // Relation entre User et AutoBid
    User.hasMany(AutoBid, { as: 'autoBids', foreignKey: 'userId' });
    AutoBid.belongsTo(User, { as: 'user', foreignKey: 'userId' });  


  // Relation entre Article et Auction
  Article.hasOne(Auction, { as: 'auctionDetails', foreignKey: 'articleId' });
  Auction.belongsTo(Article, { as: 'articleDetails', foreignKey: 'articleId' });

  // Relation entre Auction et User (Highest Bidder)
  Auction.belongsTo(User, {as: 'highestBidder',foreignKey: {name: 'highestBidUserId',allowNull: true }});
  User.hasMany(Auction, {as: 'wonAuctions',foreignKey: {name: 'highestBidUserId',allowNull: true}});

  // Relation entre Auction et Bid
  Auction.hasMany(Bid, { as: 'bids', foreignKey: 'auctionId' });
  Bid.belongsTo(Auction, { as: 'auction', foreignKey: 'auctionId' });

  // Relation entre User et Bid
  User.hasMany(Bid, { as: 'userBids', foreignKey: 'userId' });
  Bid.belongsTo(User, { as: 'bidder', foreignKey: 'userId' });

  // Relation entre User et Notification
  User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
  Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
  
  // Relation entre User et GTCTransaction
  User.hasMany(GTCTransaction, { as: 'transactions', foreignKey: 'userId' });
  GTCTransaction.belongsTo(User, { as: 'user', foreignKey: 'userId' });
 
  ConversionRate.hasMany(GTCTransaction, { as: 'transactions', foreignKey: 'conversionRateId' });
  GTCTransaction.belongsTo(ConversionRate, { as: 'rateDetails', foreignKey: 'conversionRateId' });
  

// Relation entre GTCTransaction et Auction
Auction.hasMany(GTCTransaction, { as: 'transactions', foreignKey: 'auctionId' });
GTCTransaction.belongsTo(Auction, { as: 'auction', foreignKey: 'auctionId' });

 // Relation entre User et LoginHistory
 User.hasMany(LoginHistory, { as: 'loginHistories', foreignKey: 'userId' });
 LoginHistory.belongsTo(User, { as: 'user', foreignKey: 'userId' }); 

 Admin.hasMany(AuditLog, { as: 'auditLogs', foreignKey: 'adminId' });
 AuditLog.belongsTo(Admin, { as: 'admin', foreignKey: 'adminId' });

 // Un utilisateur peut être acheteur (buyer) ou vendeur (seller) dans une livraison
User.hasMany(Delivery, { foreignKey: "buyerId", as: "purchases" });
User.hasMany(Delivery, { foreignKey: "sellerId", as: "sales" });
Delivery.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Delivery.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

// Une enchère a une seule livraison
Auction.hasOne(Delivery, { foreignKey: "auctionId", as: "delivery" });
Delivery.belongsTo(Auction, { foreignKey: "auctionId", as: "auction" });


};

module.exports = defineAssociations;
