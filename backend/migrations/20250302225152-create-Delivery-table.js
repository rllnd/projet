module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Deliveries", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      auctionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Auctions", key: "id" },
      },
      buyerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      sellerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      status: {
        type: Sequelize.ENUM("pending", "shipped", "delivered", "canceled"),
        defaultValue: "pending",
      },
      trackingNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      codeUnique: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Deliveries");
  },
};
