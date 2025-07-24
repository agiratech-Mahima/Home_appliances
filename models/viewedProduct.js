module.exports = (sequelize, DataTypes) => {
  const ViewedProduct = sequelize.define(
    "ViewedProduct",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
      viewed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "viewed_products",
      underscored: true,
      timestamps: false,
    }
  );
  ViewedProduct.associate = (models) => {
    ViewedProduct.belongsTo(models.User, { foreignKey: "user_id" });
    ViewedProduct.belongsTo(models.Product, { foreignKey: "product_id" });
  };
  return ViewedProduct;
};
