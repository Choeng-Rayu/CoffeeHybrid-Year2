import dotenv from 'dotenv'; // use for loading environment variables from .env file
import { Sequelize } from 'sequelize'; // use for importing the Sequelize class
import fs from 'fs'; // use for reading SSL certificate file
import path from 'path'; // use for handling file paths
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // use for loading .env variables into process.env

// Read the SSL certificate file
const sslCert = fs.readFileSync(path.join(__dirname, '..', 'ca.pem'));

const sequelize = new Sequelize(
    process.env.DB_NAME, // use for getting database name from .env
    process.env.DB_USER, // use for getting database user from .env
    process.env.DB_PASSWORD, // use for getting database password from .env
    {
        host: process.env.DB_HOST, // use for getting database host from .env
        port: process.env.DB_PORT || 23075, // use for getting database port from .env
        dialect: process.env.DB_DIALECT || 'mysql', // use for specifying the database dialect from .env
        dialectOptions: {
            ssl: {
                ca: sslCert, // use SSL certificate for secure connection
                rejectUnauthorized: true // verify the SSL certificate
            }
        },
        logging: console.log, // enable logging for debugging
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default sequelize;