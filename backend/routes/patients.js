const express = require('express');
const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.getAllPatients();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const searchTerm = req.query.q || '';

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term required'
      });
    }

    const result = await req.db.searchPatients(parseInt(userId), searchTerm);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/:patientId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const patientId = parseInt(req.params.patientId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.getPatientById(parseInt(userId), patientId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.getPatients(parseInt(userId), limit, offset);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const patientData = req.body;
    const result = await req.db.addPatient(parseInt(userId), patientData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:patientId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const patientId = parseInt(req.params.patientId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const patientData = { ...req.body, patient_id: patientId };
    const result = await req.db.updatePatient(parseInt(userId), patientData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
