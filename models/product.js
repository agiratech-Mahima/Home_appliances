module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      stock: { type: DataTypes.INTEGER, allowNull: false },
      image_url: DataTypes.STRING,
       created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "products",
      underscored: true,
    }
  );
  Product.associate = (models) => {
    Product.hasMany(models.OrderItem, { foreignKey: "product_id" });
    Product.hasMany(models.ViewedProduct, { foreignKey: "product_id" });
  };
  return Product;
};






