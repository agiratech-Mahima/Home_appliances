module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      phone_number: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      tableName: "users",
      underscored: true, 
    }
  );
  User.associate = (models) => {
    User.hasMany(models.Order, { foreignKey: "user_id" });
    User.hasMany(models.ViewedProduct, { foreignKey: "user_id" });
    User.hasMany(models.OrderStatusHistory, { foreignKey: "changed_by" });
  };
  return User;
};

