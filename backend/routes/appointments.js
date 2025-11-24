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

    const [userRoleResults] = await req.db.connection.query(
      'SELECT r.role_name FROM User_Role ur JOIN Role r ON ur.role_id = r.role_id WHERE ur.user_id = ?',
      [parseInt(userId)]
    );

    const userRole = userRoleResults[0]?.role_name;

    let result;
    if (userRole && userRole.toLowerCase() === 'receptionist') {
      result = await req.db.getAllAppointments();
    } else {
      result = await req.db.getDoctorAppointments(parseInt(userId));
    }

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

    const appointmentData = req.body;
    const result = await req.db.scheduleAppointment(parseInt(userId), appointmentData);

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

router.put('/:appointmentId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const appointmentId = parseInt(req.params.appointmentId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const appointmentData = { ...req.body, appointment_id: appointmentId };
    const result = await req.db.updateAppointment(parseInt(userId), appointmentData);

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

router.delete('/:appointmentId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const appointmentId = parseInt(req.params.appointmentId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.deleteAppointment(parseInt(userId), appointmentId);

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
