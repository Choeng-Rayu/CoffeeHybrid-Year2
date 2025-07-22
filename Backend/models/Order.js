export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true,
    tableName: 'orders'
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
  };

  return Order;
};
