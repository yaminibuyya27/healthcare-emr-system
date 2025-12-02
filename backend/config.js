// config.js
require('dotenv').config();

const config = {
  // Database Configuration
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root1234',
    database: process.env.DB_NAME || 'EMR_System',
    // Railway and serverless-specific settings
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectTimeout: 60000, // 60 seconds
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 8000,
    host: process.env.HOST || '0.0.0.0'
  }
};

module.exports = config;
