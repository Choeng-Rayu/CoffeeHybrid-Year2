export default (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sugarLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    iceLevel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addOns: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return OrderItem;
};
