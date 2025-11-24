const express = require('express');
const router = express.Router();

router.get('/audit-logs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const limit = parseInt(req.query.limit) || 100;

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

    if (!userRoleResults.length || userRoleResults[0].role_name !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Administrator role required.'
      });
    }

    const [auditLogs] = await req.db.connection.query(`
      SELECT
        al.audit_id,
        al.user_id,
        u.username,
        al.table_name,
        al.operation_type,
        al.record_id,
        al.old_value,
        al.new_value,
        al.field_changed,
        al.timestamp,
        al.ip_address
      FROM Audit_Log al
      LEFT JOIN User u ON al.user_id = u.user_id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `, [limit]);

    res.json({
      success: true,
      data: auditLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
});

router.get('/audit-log', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const limit = parseInt(req.query.limit) || 50;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required'
      });
    }

    const result = await req.db.getAuditLog(parseInt(userId), limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
