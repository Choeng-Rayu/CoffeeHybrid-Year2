export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for guest users
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Browser session ID for guest users'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
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
    basePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    totalPrice: {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'False when item is removed from cart'
    }
  }, {
    timestamps: true,
    tableName: 'CartItems',
    indexes: [
      {
        fields: ['userId'],
        name: 'cart_items_user_id_index'
      },
      {
        fields: ['sessionId'],
        name: 'cart_items_session_id_index'
      },
      {
        fields: ['userId', 'sessionId', 'isActive'],
        name: 'cart_items_active_index'
      }
    ]
  });

  CartItem.associate = (models) => {
    CartItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    CartItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return CartItem;
};
