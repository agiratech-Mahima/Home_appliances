module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "completed", "canceled"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "orders",
      underscored: true,
    }
  );
  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "user_id" });
    Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
    Order.hasMany(models.OrderStatusHistory, { foreignKey: "order_id" });
  };
  return Order;
};
