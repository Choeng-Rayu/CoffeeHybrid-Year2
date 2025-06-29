export default (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
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
      type: DataTypes.JSON, // store add-ons array as JSON [{name, price}]
      allowNull: true
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    }
  }, {
    timestamps: false,
    tableName: 'order_items'
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return OrderItem;
};
