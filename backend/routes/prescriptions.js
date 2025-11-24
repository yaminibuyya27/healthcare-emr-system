const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.getPrescriptions(parseInt(userId));
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

    const prescriptionData = {
      patient_id: req.body.patient_id,
      appointment_id: req.body.appointment_id,
      medication_id: req.body.medication_id,
      dosage_instructions: req.body.dosage_instructions,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      refill_count: req.body.refill_count || 0
    };

    const result = await req.db.createPrescription(parseInt(userId), prescriptionData);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(403).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/:prescriptionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const prescriptionId = parseInt(req.params.prescriptionId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const prescriptionData = {
      prescription_id: prescriptionId,
      medication_id: req.body.medication_id,
      dosage_instructions: req.body.dosage_instructions,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      refill_count: req.body.refill_count || 0
    };

    const result = await req.db.updatePrescription(parseInt(userId), prescriptionData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:prescriptionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const prescriptionId = parseInt(req.params.prescriptionId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.deletePrescription(parseInt(userId), prescriptionId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(403).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
