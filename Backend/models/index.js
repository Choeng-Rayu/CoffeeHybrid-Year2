import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import UserModel from "./User.js";
import ProductModel from "./Product.js";
import OrderModel from "./Order.js";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

// Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Product = ProductModel(sequelize, Sequelize.DataTypes);
const Order = OrderModel(sequelize, Sequelize.DataTypes);

// Set up associations
Order.belongsTo(sequelize.models.User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(sequelize.models.OrderItem, { foreignKey: 'orderId', as: 'items' });

export { sequelize, User, Product, Order };
export default sequelize;
