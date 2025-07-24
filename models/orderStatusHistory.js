module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define(
    "OrderStatusHistory",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: DataTypes.INTEGER, allowNull: false },
      old_status: DataTypes.STRING,
      new_status: DataTypes.STRING,
      changed_by: { type: DataTypes.INTEGER, allowNull: true }, // can be null if user deleted
      changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "order_status_history",
      underscored: true,
      timestamps: false,
    }
  );
  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.Order, { foreignKey: "order_id" });
    OrderStatusHistory.belongsTo(models.User, { foreignKey: "changed_by" });
  };
  return OrderStatusHistory;
};
