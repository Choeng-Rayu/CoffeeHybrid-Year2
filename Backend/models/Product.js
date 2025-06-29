import { all } from "axios";

export default (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('hot', 'iced', 'frappe'),
      allowNull: false
    },
    basePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 }
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    sizes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    addOns: {
      type: DataTypes.JSON,
      allowNull: true
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    shopName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preparationTime: {
      type: DataTypes.INTEGER,
      defaultValue: 5 // minutes
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'products'
  });
  return Product;
};