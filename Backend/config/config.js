const dotenv = require('dotenv'); // use for loading environment variables from .env file
const { Sequelize } = require('sequelize'); // use for importing the Sequelize class

dotenv.config(); // use for loading .env variables into process.env

const sequelize = new Sequelize(
    process.env.DB_NAME, // use for getting database name from .env
    process.env.DB_USER, // use for getting database user from .env
    process.env.DB_PASSWORD, // use for getting database password from .env
    {
        host: process.env.DB_HOST, // use for getting database host from .env
        dialect: process.env.DB_DIALECT || 'mysql', // use for specifying the database dialect from .env
    }
);

module.exports = sequelize;