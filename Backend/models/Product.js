/*import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hot', 'iced', 'frappe']
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  sizes: [{
    name: {
      type: String,
      required: true,
      enum: ['small', 'medium', 'large']
    },
    priceModifier: {
      type: Number,
      default: 0
    }
  }],
  addOns: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  available: {
    type: Boolean,
    default: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  preparationTime: {
    type: Number,
    default: 5 // minutes
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
*/

import { all } from "axios";

export default(sequelize, DataTypes) => {
    const Product = sequelize.define('Product',{
      name:{
        type:DataTypes.STRING,
        allowNull: false,
        trim: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category:{
      type: DataTypes.ENUM('hot', 'iced', 'frappe'),
      allowNull: false
    },
    basePrice:{
      type: DataTypes.FLOAT,
      allowNull: false,
      validate:{min:0}
    },
    image:{
      type: DataTypes.STRING,
      defaultValue: ''
    },
    sizes: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    addOns: {
      type: DataTypes.JSON,
      allowNull: true,
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