const Article = require('./Article');
const Auction = require('./Auction');
const Bid = require('./Bid');
const User = require('./User');
const Notification = require('./Notifications'); // Import du modèle Notification

const defineAssociations = () => {
  // Relation entre User et Article
  User.hasMany(Article, { as: 'articles', foreignKey: 'sellerId' });
  Article.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

  // Relation entre Article et Auction
  Article.hasOne(Auction, { as: 'auctionDetails', foreignKey: 'articleId' });
  Auction.belongsTo(Article, { as: 'articleDetails', foreignKey: 'articleId' });

  // Relation entre Auction et Bid
  Auction.hasMany(Bid, { as: 'bids', foreignKey: 'auctionId' });
  Bid.belongsTo(Auction, { as: 'auction', foreignKey: 'auctionId' });

  // Relation entre User et Bid
  User.hasMany(Bid, { as: 'userBids', foreignKey: 'userId' });
  Bid.belongsTo(User, { as: 'bidder', foreignKey: 'userId' });

  // Relation entre User et Notification
  User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
  Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

};

module.exports = defineAssociations;
