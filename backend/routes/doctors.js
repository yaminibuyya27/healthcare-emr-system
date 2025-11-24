const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.db.getDoctors();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
