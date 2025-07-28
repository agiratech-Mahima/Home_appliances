const { Sequelize, DataTypes } = require("sequelize");
//require("dotenv").config();

require("dotenv").config({ path: '../.env' });

const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: "mysql",
  logging: false,
});

const db = {};

// Import models
db.User = require("./user")(sequelize, DataTypes);
db.Product = require("./product")(sequelize, DataTypes);
db.Order = require("./order")(sequelize, DataTypes);
db.OrderItem = require("./orderItem")(sequelize, DataTypes);
db.ViewedProduct = require("./viewedProduct")(sequelize, DataTypes);
db.OrderStatusHistory = require("./orderStatusHistory")(sequelize, DataTypes);

// Run .associate if present
Object.values(db).forEach((model) => {
  if (model?.associate) model.associate(db);
});

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
