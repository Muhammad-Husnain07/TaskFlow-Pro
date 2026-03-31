const dotenv = require('dotenv');
dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

if (!config.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env file');
}

if (!config.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env file');
}

module.exports = config;