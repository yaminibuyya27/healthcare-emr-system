const express = require('express');
const cors = require('cors');
const config = require('./config');
const DatabaseManager = require('./dbManager');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const doctorRoutes = require('./routes/doctors');
const medicationRoutes = require('./routes/medications');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (req, res, next) => {
  const db = new DatabaseManager();
  const connected = await db.connect();

  if (!connected) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }

  req.db = db;

  res.on('finish', async () => {
    await db.close();
  });

  next();
});

app.use('/api', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'EMR API is running'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = config.server.port;
  const HOST = config.server.host;

  app.listen(PORT, HOST, () => {
    console.log(`Server running on: http://${HOST}:${PORT}`);
  });
}

module.exports = app;
