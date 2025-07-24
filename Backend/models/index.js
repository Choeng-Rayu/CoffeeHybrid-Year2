import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import UserModel from "./User.js";
import ProductModel from "./Product.js";
import OrderModel from "./Order.js";
import OrderItemModel from "./OrderItem.js";
import CartItemModel from "./CartItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Read the SSL certificate file
const sslCert = fs.readFileSync(path.join(__dirname, '..', 'ca.pem'));

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 23075,
    dialect: process.env.DB_DIALECT || 'mysql',
    dialectOptions: {
      ssl: {
        ca: sslCert,
        rejectUnauthorized: true
      }
    },
    logging: false, // disable logging for cleaner output
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Product = ProductModel(sequelize, Sequelize.DataTypes);
const Order = OrderModel(sequelize, Sequelize.DataTypes);
const OrderItem = OrderItemModel(sequelize, Sequelize.DataTypes);
const CartItem = CartItemModel(sequelize, Sequelize.DataTypes);

// Set up associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User-Product associations
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Cart associations
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export { sequelize, User, Product, Order, OrderItem, CartItem };
export default sequelize;
