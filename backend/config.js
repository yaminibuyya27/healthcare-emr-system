// config.js
require('dotenv').config();

const config = {
  // Database Configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'EMR_System'
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8000,
    host: process.env.HOST || '0.0.0.0'
  }
};

module.exports = config;
