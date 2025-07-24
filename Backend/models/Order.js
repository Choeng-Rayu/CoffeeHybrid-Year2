export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'no-show', 'cancelled'),
      defaultValue: 'pending'
    },
    qrToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    orderSource: {
      type: DataTypes.ENUM('web', 'telegram'),
      allowNull: false
    },
    customerInfo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Stores name, phone, telegramUsername'
    },
    pickupTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    }
  }, {
    timestamps: true,
    tableName: 'orders',
    indexes: [
      {
        fields: ['expiresAt'],
        name: 'orders_expires_at_index'
      },
      {
        fields: ['qrToken'],
        unique: true,
        name: 'orders_qr_token_unique'
      }
    ]
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
  };

  return Order;
};
