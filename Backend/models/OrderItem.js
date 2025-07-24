export default (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.ENUM('small', 'medium', 'large'),
      defaultValue: 'medium'
    },
    sugarLevel: {
      type: DataTypes.ENUM('none', 'low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    iceLevel: {
      type: DataTypes.ENUM('none', 'low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    addOns: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of {name: String, price: Number}'
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
      defaultValue: 1
    },
  }, {
    timestamps: true,
    tableName: 'OrderItems'
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return OrderItem;
};
